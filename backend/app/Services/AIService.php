<?php

namespace App\Services;

use App\Models\BloodInventory;
use App\Models\BloodRequest;
use App\Models\Campaign;
use App\Models\User;
use App\Models\BloodBank;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * AIService — Brain of the RTBMS AI Assistant
 *
 * Responsibilities:
 *  1. Build a context-aware system prompt from live DB state
 *  2. Maintain per-session conversation history
 *  3. Stream GPT-4o tokens back via Server-Sent Events
 *  4. Detect intent and inject structured data into context
 */
class AIService
{
    private const MODEL        = 'gpt-4o';
    private const MAX_TOKENS   = 600;
    private const CACHE_TTL    = 30; // seconds for live DB context
    private const HISTORY_TTL  = 900; // 15 minutes per session

    // ── Public API ──────────────────────────────────────────────────────────

    /**
     * Stream a response to the client via SSE.
     * Yields data: {"token": "..."}\n\n chunks.
     */
    public function streamResponse(string $message, string $sessionId, ?User $user = null): \Generator
    {
        try {
            $history = $this->getHistory($sessionId);
            $systemPrompt = $this->buildSystemPrompt($message, $user);

            $contents = [];
            foreach ($history as $msg) {
                $contents[] = [
                    'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $msg['content']]]
                ];
            }
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $message]]
            ];

            $payload = [
                'systemInstruction' => [
                    'parts' => [['text' => $systemPrompt]]
                ],
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.5,
                    'maxOutputTokens' => self::MAX_TOKENS,
                ]
            ];

            $apiKey = trim(env('GEMINI_API_KEY', ''));
            if (!$apiKey) {
                throw new \Exception('GEMINI_API_KEY is not set');
            }

            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key={$apiKey}";

            $opts = [
                'http' => [
                    'method'  => 'POST',
                    'header'  => "Content-Type: application/json\r\n",
                    'content' => json_encode($payload),
                    'timeout' => 30
                ]
            ];
            $context = stream_context_create($opts);
            $stream = fopen($url, 'r', false, $context);

            if (!$stream) {
                throw new \Exception("Failed to open stream to Gemini API");
            }

            $fullResponse = '';

            while (!feof($stream)) {
                $line = fgets($stream);
                if ($line !== false && str_starts_with($line, 'data: ')) {
                    $jsonString = substr($line, 6);
                    if (trim($jsonString) === '[DONE]') continue;

                    $json = json_decode($jsonString, true);
                    if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                        $token = $json['candidates'][0]['content']['parts'][0]['text'];
                        $fullResponse .= $token;
                        yield "data: " . json_encode(['token' => $token]) . "\n\n";
                    }
                }
            }
            fclose($stream);

            // Store assistant response in history
            $history[] = ['role' => 'user',      'content' => $message];
            $history[] = ['role' => 'assistant',  'content' => $fullResponse];
            $this->saveHistory($sessionId, $history);

            yield "data: " . json_encode(['done' => true]) . "\n\n";

        } catch (\Exception $e) {
            Log::error('AIService stream error', ['error' => $e->getMessage()]);
            yield "data: " . json_encode(['error' => 'AI service unavailable. Please try again.']) . "\n\n";
        }
    }

    /**
     * Non-streaming response (for programmatic use).
     */
    public function getResponse(string $message, string $sessionId, ?User $user = null): string
    {
        try {
            $systemPrompt = $this->buildSystemPrompt($message, $user);

            $payload = [
                'systemInstruction' => [
                    'parts' => [['text' => $systemPrompt]]
                ],
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $message]]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => self::MAX_TOKENS,
                ]
            ];

            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) return '';

            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";

            $response = Http::post($url, $payload);
            $json = $response->json();

            return $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
        } catch (\Exception $e) {
            Log::error('AIService getResponse error', ['error' => $e->getMessage()]);
            return '';
        }
    }

    // ── System Prompt Builder ───────────────────────────────────────────────

    private function buildSystemPrompt(string $message, ?User $user): string
    {
        $liveContext = $this->getLiveContext($message, $user);
        $userContext = $user ? $this->getUserContext($user) : 'Unauthenticated user.';

        return <<<PROMPT
You are RTBMS AI, the intelligent assistant for RTBMS — India's Real-Time Blood Management System.

You have real-time access to the RTBMS database. Your job is to help donors, hospitals, and blood bank staff with blood availability, donation eligibility, emergency requests, campaigns, and platform analytics.

**Current Platform State (live data):**
{$liveContext}

**User Context:**
{$userContext}

**Guidelines:**
- Answer concisely and precisely. This is a medical platform — accuracy matters.
- Use **bold** for critical data (blood groups, unit counts, distances).
- Format lists with bullet points or numbered lists when helpful.
- Use Markdown tables when comparing data across multiple blood groups or locations.
- If asked about emergencies, always highlight critical needs first.
- If you don't have data to answer, say so clearly rather than guessing.
- Never fabricate blood unit counts, distances, or donor information.
- Always end actionable responses with a clear next step the user can take.
- Respond in English. Keep responses under 300 words unless a table or list requires more.
PROMPT;
    }

    // ── Live Database Context ───────────────────────────────────────────────

    private function getLiveContext(string $message, ?User $user): string
    {
        $lower = strtolower($message);
        $role  = $user->role ?? 'guest';

        // Cache the expensive DB queries for 30 seconds
        return Cache::remember("ai_context_{$role}_{$this->hashMessage($message)}", self::CACHE_TTL, function () use ($lower, $role) {
            $parts = [];

            if ($role === 'admin') {
                $parts[] = $this->getDetailedInventory();
                $parts[] = $this->getDetailedDonorStats();
                $parts[] = $this->getActiveEmergencies();
                $parts[] = $this->getUpcomingCampaigns();
                $parts[] = $this->getBloodBankList();
            } elseif ($role === 'hospital') {
                $parts[] = $this->getInventorySummary();
                $parts[] = $this->getActiveEmergencies();
                $parts[] = $this->getBloodBankList();
            } elseif ($role === 'donor') {
                $parts[] = $this->getInventorySummary();
                $parts[] = $this->getUpcomingCampaigns();
                $parts[] = $this->getActiveEmergencies();
            } else {
                $parts[] = $this->getInventorySummary();

                if (str_contains($lower, 'emergency') || str_contains($lower, 'urgent') || str_contains($lower, 'critical')) {
                    $parts[] = $this->getActiveEmergencies();
                }

                if (str_contains($lower, 'campaign') || str_contains($lower, 'blood drive') || str_contains($lower, 'event')) {
                    $parts[] = $this->getUpcomingCampaigns();
                }

                if (str_contains($lower, 'donor') || str_contains($lower, 'eligible')) {
                    $parts[] = $this->getDonorStats();
                }

                if (str_contains($lower, 'bank') || str_contains($lower, 'nearest') || str_contains($lower, 'location')) {
                    $parts[] = $this->getBloodBankList();
                }
            }

            return implode("\n\n", array_filter($parts));
        });
    }

    private function getInventorySummary(): string
    {
        try {
            $inventory = BloodInventory::all()->groupBy('blood_group');
            $lines = ["**Blood Inventory (all banks combined):**"];

            foreach (['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as $group) {
                $items  = $inventory->get($group, collect());
                $total  = $items->sum('units_available');
                $status = $total === 0 ? '🚫 OUT' : ($total < 5 ? '🚨 Critical' : ($total < 15 ? '⚠️ Low' : '✅ OK'));
                $lines[] = "- {$group}: {$total} units — {$status}";
            }

            return implode("\n", $lines);
        } catch (\Exception) {
            return "Inventory data: Currently unavailable (DB connecting).";
        }
    }

    private function getDetailedInventory(): string
    {
        try {
            $banks = BloodBank::active()->limit(10)->get();
            if ($banks->isEmpty()) return $this->getInventorySummary();

            $lines = ["**Detailed Blood Inventory (Per Bank):**"];
            foreach ($banks as $bank) {
                $inventory = BloodInventory::where('blood_bank_id', $bank->id)->get();
                $summary = [];
                foreach (['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as $g) {
                    $units = $inventory->where('blood_group', $g)->sum('units_available');
                    if ($units > 0) $summary[] = "{$g}: {$units}u";
                }
                $invStr = empty($summary) ? "No stock" : implode(", ", $summary);
                $lines[] = "- **{$bank->name}**: {$invStr}";
            }
            return implode("\n", $lines);
        } catch (\Exception) {
            return $this->getInventorySummary();
        }
    }

    private function getDetailedDonorStats(): string
    {
        try {
            $total     = User::donors()->count();
            $available = User::donors()->available()->count();
            $lines = ["**Detailed Donor Stats:** {$total} total, {$available} available today."];
            
            $topDonors = User::donors()->latest()->limit(5)->get();
            if ($topDonors->isNotEmpty()) {
                $lines[] = "\n**Recent Registered Donors (Admin view):**";
                foreach ($topDonors as $d) {
                    $group = $d->blood_group ?? 'Unknown';
                    $city = $d->city ?? 'Unknown city';
                    $lines[] = "- {$d->name} ({$group}) · {$city}";
                }
            }
            return implode("\n", $lines);
        } catch (\Exception) {
            return $this->getDonorStats();
        }
    }

    private function getActiveEmergencies(): string
    {
        try {
            $emergencies = BloodRequest::emergency()->pending()->latest()->limit(5)->get();

            if ($emergencies->isEmpty()) {
                return "**Active Emergencies:** None at this time.";
            }

            $lines = ["**Active Critical Emergencies:**"];
            foreach ($emergencies as $req) {
                $ago    = $req->created_at->diffForHumans();
                $lines[] = "- {$req->blood_group} · {$req->units_needed}u · {$req->hospital_name}, {$req->hospital_city} · {$ago}";
            }
            return implode("\n", $lines);
        } catch (\Exception) {
            return '';
        }
    }

    private function getUpcomingCampaigns(): string
    {
        try {
            $campaigns = Campaign::upcoming()->limit(3)->get();
            if ($campaigns->isEmpty()) return "**Upcoming Campaigns:** None scheduled.";

            $lines = ["**Upcoming Blood Drives:**"];
            foreach ($campaigns as $c) {
                $lines[] = "- {$c->name} · {$c->city} · {$c->starts_at->format('M d')} · {$c->slotsRemaining()} slots left";
            }
            return implode("\n", $lines);
        } catch (\Exception) {
            return '';
        }
    }

    private function getDonorStats(): string
    {
        try {
            $total     = User::donors()->count();
            $available = User::donors()->available()->count();
            return "**Donor Stats:** {$total} registered donors · {$available} available to donate today.";
        } catch (\Exception) {
            return '';
        }
    }

    private function getBloodBankList(): string
    {
        try {
            $banks = BloodBank::active()->limit(5)->get();
            if ($banks->isEmpty()) return '';

            $lines = ["**Partner Blood Banks:**"];
            foreach ($banks as $bank) {
                $lines[] = "- {$bank->name} · {$bank->city} · " . ($bank->hours['is_24hr'] ? '24/7' : "{$bank->hours['open']}–{$bank->hours['close']}");
            }
            return implode("\n", $lines);
        } catch (\Exception) {
            return '';
        }
    }

    // ── User Context ────────────────────────────────────────────────────────

    private function getUserContext(User $user): string
    {
        $context = "User: {$user->name} · Role: {$user->role} · City: {$user->city}";

        if ($user->role === 'donor' && $user->blood_group) {
            $eligible = $user->isEligibleToDonate();
            $daysLeft = $user->daysUntilEligible();
            $context .= "\nBlood Group: {$user->blood_group}";
            $context .= "\nDonation Eligibility: " . ($eligible ? "Eligible now ✅" : "Not eligible — {$daysLeft} days remaining ⏳");
            $context .= "\nTotal Donations: " . $user->donations()->completed()->count();
        }

        return $context;
    }

    // ── Session History ─────────────────────────────────────────────────────

    private function getHistory(string $sessionId): array
    {
        $history = Cache::get("chat_history_{$sessionId}", []);
        // Keep last 10 exchanges (20 messages) to stay within token limits
        return array_slice($history, -20);
    }

    private function saveHistory(string $sessionId, array $history): void
    {
        Cache::put("chat_history_{$sessionId}", $history, self::HISTORY_TTL);
    }

    private function hashMessage(string $message): string
    {
        // Group similar queries to share cached context
        $lower = strtolower($message);
        foreach (['emergency', 'campaign', 'donor', 'bank', 'inventory'] as $key) {
            if (str_contains($lower, $key)) return $key;
        }
        return 'general';
    }
}
