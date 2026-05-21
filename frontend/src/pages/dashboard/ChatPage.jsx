import { motion } from 'framer-motion';
import { ChatInterface } from '../../components/chat/ChatInterface';

/**
 * Full-page AI chat dashboard — route: /dashboard/chat
 */
export function ChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-white mb-0.5">AI Assistant</h1>
        <p className="text-sm text-white/40">
          Powered by Gemini 2.5 Flash · Real-time blood database access · Streaming responses
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-0"
      >
        <ChatInterface />
      </motion.div>
    </div>
  );
}
