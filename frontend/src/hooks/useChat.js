import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'ai',
    text: "Hi! I'm RTBMS AI, powered by GPT-4o. I have real-time access to blood inventory, donor data, and hospital records.\n\nHow can I help you today?",
    timestamp: new Date(),
  },
];

const PAGE_SUGGESTIONS = {
  '/dashboard':           ['Show blood inventory summary', 'Any emergencies active?', 'Top donors this week'],
  '/dashboard/search':    ['Find O- blood in Delhi', 'Nearest blood bank to me', 'Show AB+ availability'],
  '/dashboard/emergency': ['What are active emergencies?', 'How do I respond to an emergency?', 'Critical needs right now'],
  '/dashboard/donors':    ['Am I eligible to donate?', 'When can I donate again?', 'My donation history'],
  '/dashboard/inventory': ['Low stock alerts today', 'Which blood groups are critical?', 'Predict shortage next week'],
  '/dashboard/analytics': ['Donation trend last month', 'Which city has most demand?', 'O- shortage analysis'],
  default: ['Find O- blood in Delhi', 'Am I eligible to donate?', 'Nearest blood bank', 'Active emergencies'],
};

/**
 * useChat — manages chat session, messages, streaming, and history
 */
export function useChat({ apiBase = '/api/v1', sessionId = null } = {}) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [isStreaming, setIsStreaming]   = useState(false);
  const [error, setError]       = useState(null);
  const [currentSid] = useState(sessionId || `session_${Date.now()}`);
  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}_${Math.random()}`, timestamp: new Date(), ...msg }]);
  }, []);

  const updateLastAiMessage = useCallback((textChunk, replace = false) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'ai' && last._streaming) {
        return [
          ...prev.slice(0, -1),
          { ...last, text: replace ? textChunk : last.text + textChunk },
        ];
      }
      return prev;
    });
  }, []);

  const sendMessage = useCallback(async (text = input.trim()) => {
    if (!text || loading) return;

    // Add user message
    addMessage({ role: 'user', text });
    setInput('');
    setLoading(true);
    setIsStreaming(true);
    setError(null);

    // Placeholder AI streaming message
    const aiMsgId = `ai_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: 'ai', text: '', _streaming: true, timestamp: new Date() },
    ]);

    try {
      // Try real API first, fall back to simulated streaming
      const controller = new AbortController();
      abortRef.current = controller;

      let responded = false;

      try {
        const token = useAuthStore.getState().token;
        const headers = { 'Content-Type': 'application/json', Accept: 'text/event-stream' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: text, session_id: currentSid }),
          signal: controller.signal,
        });

        if (res.ok && res.body) {
          responded = true;
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Parse SSE: data: {...}\n\n
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const json = JSON.parse(line.slice(6));
                  if (json.token) {
                    accumulated += json.token;
                    updateLastAiMessage(json.token);
                  }
                  if (json.done) break;
                } catch {}
              }
            }
          }
        }
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') return;
        // API not available — use simulation
      }

      if (!responded) {
        // Simulate streaming response for demo
        await simulateStreaming(text, updateLastAiMessage);
      }

      // Mark streaming complete
      setMessages((prev) => prev.map((m) =>
        m.id === aiMsgId ? { ...m, _streaming: false } : m
      ));

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Something went wrong. Please try again.');
        setMessages((prev) => prev.filter((m) => m._streaming !== true));
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  }, [input, loading, addMessage, updateLastAiMessage, currentSid, apiBase]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setMessages((prev) => prev.map((m) => m._streaming ? { ...m, _streaming: false } : m));
    setLoading(false);
    setIsStreaming(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
  }, []);

  const getSuggestions = useCallback((pathname = '/') => {
    return PAGE_SUGGESTIONS[pathname] || PAGE_SUGGESTIONS.default;
  }, []);

  return {
    messages,
    input, setInput,
    loading, isStreaming,
    error,
    messagesEndRef,
    sendMessage,
    stopStreaming,
    clearChat,
    getSuggestions,
  };
}

// ── Simulated streaming for demo (when backend unavailable) ────────────────

const DEMO_RESPONSES = {
  'o-':         "I found **4 active sources** for O- blood right now:\n\n1. **AIIMS Blood Bank, Delhi** — 8 units · 2.4 km\n2. **Sir Ganga Ram Hospital** — 3 units · 5.1 km · ⚠ Low Stock\n3. **Fortis Vasant Kunj** — 2 units · 12.3 km · 🚨 Critical\n4. **Max Super Specialty** — 5 units · 14.7 km\n\nShall I send an emergency request to AIIMS?",
  'eligible':   "Based on standard donation guidelines, you're eligible to donate blood if:\n\n✅ **Age**: 18–65 years\n✅ **Weight**: At least 50 kg\n✅ **Hemoglobin**: ≥12.5 g/dL\n✅ **Last donation**: More than 90 days ago\n✅ **No active infections or illnesses**\n\nYour last recorded donation was **Feb 15, 2026**, making you eligible from **May 16, 2026**.\n\nWould you like to register for an upcoming blood drive?",
  'emergency':  "There are currently **3 active emergency requests**:\n\n🚨 **ICU Patient #4** — O- · Max Hospital, Delhi · 2m ago\n🚨 **Trauma Case** — AB- · AIIMS, Delhi · 5m ago\n⚠️ **Surgery Case** — A- · Fortis, Gurgaon · 12m ago\n\nAs an eligible O+ donor, you're compatible with O+ and A+ requests. Tap **I Can Help** on the emergency feed to respond.",
  'nearest':    "Based on your registered location (Delhi), the nearest blood banks are:\n\n📍 **AIIMS Blood Bank** — 2.4 km · Open 24/7\n📍 **Sir Ganga Ram** — 5.1 km · Open 8am–8pm\n📍 **Safdarjung Hospital** — 6.3 km · Open 24/7\n\nWould you like directions to AIIMS Blood Bank? I can open Google Maps with the route pre-filled.",
  'inventory':  "Current blood inventory summary across all connected banks:\n\n| Group | Units | Status |\n|-------|-------|--------|\n| O+ | 45 | ✅ Available |\n| A+ | 24 | ✅ Available |\n| B+ | 18 | ✅ Available |\n| AB+ | 12 | ✅ Available |\n| A- | 6 | ⚠️ Low |\n| B- | 4 | ⚠️ Low |\n| O- | 3 | 🚨 Critical |\n| AB- | 1 | 🚨 Critical |\n\n**O- and AB- are critically low!** Shall I send shortage alerts to registered donors of these groups?",
  default:      "⚠️ **Offline Demo Mode**\n\nI couldn't reach the RTBMS live backend server. I am currently running in simulated demo mode.\n\nIn demo mode, I can simulate responses for:\n- `O-` or `inventory`\n- `eligible` or `donate`\n- `emergency` or `urgent`\n- `nearest` or `near me`\n\nPlease start your backend server to access the live AI.",
};

async function simulateStreaming(userText, updateFn) {
  const lower = userText.toLowerCase();
  let response = DEMO_RESPONSES.default;

  if (lower.includes('o-') || lower.includes('o negative')) response = DEMO_RESPONSES['o-'];
  else if (lower.includes('eligible') || lower.includes('donate') || lower.includes('can i')) response = DEMO_RESPONSES.eligible;
  else if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('critical')) response = DEMO_RESPONSES.emergency;
  else if (lower.includes('nearest') || lower.includes('near me') || lower.includes('close')) response = DEMO_RESPONSES.nearest;
  else if (lower.includes('inventory') || lower.includes('stock') || lower.includes('units')) response = DEMO_RESPONSES.inventory;

  // Stream character by character (faster for demo)
  const words = response.split(' ');
  for (const word of words) {
    await new Promise((r) => setTimeout(r, 25 + Math.random() * 20));
    updateFn(word + ' ');
  }
}
