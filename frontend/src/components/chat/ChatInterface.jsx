import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, X, Maximize2, Minimize2, Send, Square,
  RotateCcw, ChevronDown
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { ChatBubble } from './ChatBubble';
import { SuggestionChips } from './SuggestionChips';
import { VoiceInput } from './VoiceInput';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * ChatInterface — full-featured AI chat window
 * Can operate as a floating bubble, a panel, or fullscreen
 */
export function ChatInterface({ onClose, defaultExpanded = false }) {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollAreaRef = useRef(null);

  const {
    messages,
    input, setInput,
    loading, isStreaming,
    error,
    messagesEndRef,
    sendMessage,
    stopStreaming,
    clearChat,
    getSuggestions,
  } = useChat({ apiBase: API_BASE });

  const suggestions = getSuggestions(location.pathname);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesEndRef]);

  const containerClass = isFullscreen
    ? 'fixed inset-4 z-[100] flex flex-col'
    : 'flex flex-col';

  return (
    <div
      className={`${containerClass} glass-card rounded-2xl overflow-hidden border border-electric-600/20`}
      style={{ boxShadow: '0 0 40px rgba(37,99,235,0.15), 0 8px 32px rgba(0,0,0,0.6)' }}
    >
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-white/2 flex-shrink-0">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-electric-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-base-800" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white leading-none">RTBMS AI</p>
          <p className="text-xs text-electric-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
            Gemini 2.5 Flash · Online
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen((p) => !p)}
            className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all hidden md:flex"
            aria-label={isFullscreen ? 'Minimize' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Area ──────────────────────────────── */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
        style={{ minHeight: isFullscreen ? 'auto' : '320px', maxHeight: isFullscreen ? 'auto' : '420px' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isLatest={i === messages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-400 text-center py-2 px-4 bg-red-500/10 rounded-lg border border-red-500/20"
          >
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Scroll to bottom button ─────────────────────── */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-4 w-8 h-8 glass rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Suggestion Chips ───────────────────────────── */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex-shrink-0">
          <p className="text-xs text-white/30 mb-2 font-medium">Suggested questions</p>
          <SuggestionChips
            suggestions={suggestions}
            onSelect={(s) => sendMessage(s)}
            compact
          />
        </div>
      )}

      {/* ── Input Area ─────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
        {isStreaming && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-electric-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-electric-400 rounded-full animate-pulse" />
              AI is responding...
            </p>
            <button
              onClick={stopStreaming}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <Square className="w-3 h-3" /> Stop
            </button>
          </div>
        )}

        <div className={`flex items-end gap-2 bg-white/4 rounded-xl border transition-all ${
          loading ? 'border-electric-600/30' : 'border-white/10 focus-within:border-electric-600/30'
        }`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about blood availability, donors, emergencies..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none resize-none px-3 py-2.5 max-h-32 min-h-[42px]"
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            }}
            aria-label="Chat input"
            disabled={loading}
          />
          <div className="flex items-center gap-1 pr-2 pb-2 flex-shrink-0">
            <VoiceInput onTranscript={(t) => setInput(t)} />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-electric-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-electric-500 text-white rounded-lg flex items-center justify-center transition-all"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-white/20 mt-2 text-center">
          AI may make errors. Verify critical medical info with staff.
        </p>
      </div>
    </div>
  );
}
