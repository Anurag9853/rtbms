<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

/**
 * ChatController — handles AI assistant requests
 * Routes:
 *   POST /api/v1/chat          → stream response
 *   GET  /api/v1/chat/history  → session history
 *   DELETE /api/v1/chat/history → clear session
 */
class ChatController extends Controller
{
    public function __construct(private AIService $ai) {}

    /**
     * POST /api/v1/chat
     * Streams AI response via Server-Sent Events.
     */
    public function stream(Request $request): Response
    {
        $request->validate([
            'message'    => 'required|string|max:1000',
            'session_id' => 'nullable|string|max:64',
        ]);

        $message   = $request->string('message')->trim()->toString();
        $sessionId = $request->input('session_id', Str::uuid()->toString());
        $user      = $request->user('sanctum'); // null for unauthenticated preview

        $generator = $this->ai->streamResponse($message, $sessionId, $user);

        return response()->stream(function () use ($generator) {
            foreach ($generator as $chunk) {
                echo $chunk;
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type'                => 'text/event-stream',
            'Cache-Control'               => 'no-cache',
            'X-Accel-Buffering'           => 'no',
            'Access-Control-Allow-Origin' => config('app.frontend_url', '*'),
        ]);
    }

    /**
     * GET /api/v1/chat/suggestions
     * Returns context-aware suggestion chips based on role and page.
     */
    public function suggestions(Request $request): \Illuminate\Http\JsonResponse
    {
        $page = $request->query('page', 'dashboard');
        $role = optional($request->user())->role ?? 'guest';

        $suggestions = match (true) {
            str_contains($page, 'emergency') => [
                'What emergencies are active right now?',
                'Am I a match for any critical requests?',
                'How do I respond to an emergency?',
            ],
            str_contains($page, 'search')    => [
                'Find O- blood in Delhi',
                'Nearest blood bank with AB+',
                'Which banks are open 24/7?',
            ],
            str_contains($page, 'inventory') => [
                'Which blood groups are critically low?',
                'Predict shortage next week',
                'Generate low-stock alert report',
            ],
            $role === 'donor'                => [
                'Am I eligible to donate today?',
                'When can I next donate?',
                'Upcoming drives near me',
            ],
            $role === 'hospital'             => [
                'Submit an emergency blood request',
                'Check availability for surgery tomorrow',
                'Which banks can fulfill AB- needs?',
            ],
            default                          => [
                'Find O- blood in Delhi',
                'Am I eligible to donate?',
                'Show active emergencies',
                'Nearest blood bank to me',
            ],
        };

        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * DELETE /api/v1/chat/history
     * Clears session history.
     */
    public function clearHistory(Request $request): \Illuminate\Http\JsonResponse
    {
        $sessionId = $request->input('session_id');
        if ($sessionId) {
            cache()->forget("chat_history_{$sessionId}");
        }
        return response()->json(['message' => 'Chat history cleared.']);
    }
}
