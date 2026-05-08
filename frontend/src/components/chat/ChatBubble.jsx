import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * ChatBubble — individual message bubble with markdown-lite rendering and reactions
 */
export function ChatBubble({ message, isLatest = false }) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAI = message.role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={`flex gap-2.5 group ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      {isAI && (
        <div className="w-7 h-7 rounded-full bg-electric-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] ${isAI ? '' : 'items-end'}`}>
        {/* Bubble */}
        <div className={isAI ? 'chat-bubble-ai px-4 py-3' : 'chat-bubble-user px-4 py-3'}>
          {message._streaming && !message.text ? (
            /* Typing dots */
            <div className="flex items-center gap-1.5 py-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-electric-400"
                  style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
              <style>{`@keyframes typingDot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
            </div>
          ) : (
            <MarkdownRenderer text={message.text} streaming={message._streaming} />
          )}
        </div>

        {/* Actions — only show for AI after streaming completes */}
        {isAI && !message._streaming && message.text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
              aria-label="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => setReaction('up')}
              className={`p-1 rounded transition-colors ${reaction === 'up' ? 'text-green-400' : 'text-white/25 hover:text-white/50'}`}
              aria-label="Helpful"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => setReaction('down')}
              className={`p-1 rounded transition-colors ${reaction === 'down' ? 'text-red-400' : 'text-white/25 hover:text-white/50'}`}
              aria-label="Not helpful"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-white/20 px-1">
          {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * MarkdownRenderer — lightweight markdown rendering for AI responses
 * Supports: **bold**, bullet lists, numbered lists, inline code, tables
 */
function MarkdownRenderer({ text, streaming = false }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  let tableBuffer = [];

  while (i < lines.length) {
    const line = lines[i];

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      tableBuffer.push(line);
      i++;
      continue;
    } else if (tableBuffer.length > 0) {
      elements.push(<MarkdownTable key={`table_${i}`} lines={tableBuffer} />);
      tableBuffer = [];
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const m = lines[i].match(/^\d+\.\s(.+)/);
        listItems.push(<li key={i} className="text-sm text-white/80 leading-relaxed"><InlineMarkdown text={m[1]} /></li>);
        i++;
      }
      elements.push(<ol key={`ol_${i}`} className="list-decimal list-outside ml-4 space-y-1 my-2">{listItems}</ol>);
      continue;
    }

    // Bullet list
    if (line.match(/^[-•*]\s/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^[-•*]\s/)) {
        const m = lines[i].match(/^[-•*]\s(.+)/);
        listItems.push(<li key={i} className="text-sm text-white/80 leading-relaxed"><InlineMarkdown text={m?.[1] || ''} /></li>);
        i++;
      }
      elements.push(<ul key={`ul_${i}`} className="list-disc list-outside ml-4 space-y-1 my-2">{listItems}</ul>);
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-sm text-white/80 leading-relaxed">
        <InlineMarkdown text={line} />
      </p>
    );
    i++;
  }

  // Flush any remaining table
  if (tableBuffer.length > 0) {
    elements.push(<MarkdownTable key="table_end" lines={tableBuffer} />);
  }

  return (
    <div className="space-y-1.5">
      {elements}
      {streaming && (
        <span className="inline-block w-0.5 h-4 bg-electric-400 ml-0.5 align-middle animate-pulse" />
      )}
    </div>
  );
}

function InlineMarkdown({ text }) {
  if (!text) return null;
  // Process **bold**, `code`, emoji
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-white/10 rounded px-1 py-0.5 text-xs font-mono text-electric-300">{part.slice(1, -1)}</code>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MarkdownTable({ lines }) {
  const [header, separator, ...rows] = lines;
  const headerCells = header.split('|').filter(Boolean).map((c) => c.trim());
  const rowData = rows.map((r) => r.split('|').filter(Boolean).map((c) => c.trim()));

  return (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-xs text-white/75 border-collapse">
        <thead>
          <tr>
            {headerCells.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 bg-white/5 border border-white/8 font-semibold text-white/90">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData.map((row, ri) => (
            <tr key={ri} className="hover:bg-white/3 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 border border-white/6"><InlineMarkdown text={cell} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
