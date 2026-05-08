import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ThumbsUp, Copy, Mic, Maximize2, X } from 'lucide-react';
import { TypingAnimation } from '../ui/TypingAnimation';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const DEMO_MESSAGES = [
  { role: 'user', text: 'Is O- blood available in Delhi?' },
  {
    role: 'ai',
    text: 'Yes! I found **3 verified sources** for O- blood in Delhi right now:\n\n1. **AIIMS Blood Bank** — 8 units available · 2.4 km from CP\n2. **Sir Ganga Ram Hospital** — 3 units · 5.1 km\n3. **Fortis Vasant Kunj** — 2 units · 12.3 km\n\nWould you like me to send an emergency request to the nearest one?',
  },
];

const suggestions = [
  'Find O- blood in Delhi',
  'Am I eligible to donate?',
  'Nearest blood bank',
  'Emergency request status',
  'Blood drives this week',
];

export function AIChatbotShowcase() {
  const [inputVal, setInputVal] = useState('');

  return (
    <section id="ai-assistant" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-base-950" />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.1)}
          >
            <motion.span variants={fadeInUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-electric-400 bg-electric-400/10 border border-electric-400/20 rounded-full px-4 py-1.5 mb-4">
              AI Assistant
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-h1 font-black text-white mb-6">
              Ask anything.{' '}
              <span className="gradient-text">Get instant answers.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/55 leading-relaxed mb-8">
              Our GPT-4o powered assistant queries your live database. Ask about blood availability, donor eligibility, request status, or nearby blood banks — all in plain English.
            </motion.p>

            {/* Capability list */}
            <motion.ul variants={staggerContainer(0.08)} className="space-y-3">
              {[
                'Real-time blood availability by city & group',
                'Donor eligibility assessment',
                'Request tracking & status updates',
                'Nearest blood bank directions',
                'Blood drive & campaign info',
                'Analytics summaries & trends',
              ].map((item) => (
                <motion.li
                  key={item}
                  variants={fadeInUp}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <span className="w-5 h-5 rounded-full bg-electric-600/20 border border-electric-600/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-electric-400" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right — Chat UI Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="glass-card rounded-2xl overflow-hidden border border-electric-600/15 shadow-glow-blue">
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/2">
                <div className="w-8 h-8 rounded-full bg-electric-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">RTBMS AI Assistant</p>
                  <p className="text-xs text-electric-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                    Online · GPT-4o
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2 text-white/30">
                  <button className="hover:text-white/60 transition-colors p-1" aria-label="Expand chat">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button className="hover:text-white/60 transition-colors p-1" aria-label="Close chat">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="px-5 py-5 space-y-4 min-h-[260px]">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-end"
                >
                  <div className="chat-bubble-user px-4 py-2.5 max-w-[75%]">
                    <p className="text-sm text-white/85">{DEMO_MESSAGES[0].text}</p>
                  </div>
                </motion.div>

                {/* AI response */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-electric-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="chat-bubble-ai px-4 py-3 mb-2">
                      <p className="text-sm text-white/80 leading-relaxed">
                        Yes! I found <strong>3 verified sources</strong> for O- blood in Delhi:
                      </p>
                      <ol className="mt-2 space-y-1 text-sm text-white/70">
                        <li>1. <strong className="text-white/90">AIIMS Blood Bank</strong> — 8 units · 2.4 km</li>
                        <li>2. <strong className="text-white/90">Sir Ganga Ram Hospital</strong> — 3 units · 5.1 km</li>
                        <li>3. <strong className="text-white/90">Fortis Vasant Kunj</strong> — 2 units · 12.3 km</li>
                      </ol>
                      <p className="mt-2 text-sm text-white/60">Shall I send an emergency request to the nearest one?</p>
                    </div>
                    {/* Reactions */}
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                      </button>
                      <button className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Typing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                  className="flex gap-3 items-center"
                >
                  <div className="w-7 h-7 rounded-full bg-electric-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-electric-600/10 border border-electric-600/20 rounded-2xl px-4 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-electric-400"
                        style={{
                          animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
                  </div>
                </motion.div>
              </div>

              {/* Suggestion Chips */}
              <div className="px-5 pb-3">
                <div className="flex gap-2 flex-wrap">
                  {suggestions.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      onClick={() => setInputVal(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-electric-600/15 hover:border-electric-600/30 hover:text-electric-300 transition-all duration-200 whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-3 bg-white/4 rounded-input border border-white/10 px-4 py-2.5">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask about blood availability..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                  />
                  <div className="flex items-center gap-2 text-white/30">
                    <button className="hover:text-white/60 transition-colors p-1" aria-label="Voice input">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      className="bg-electric-600 hover:bg-electric-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      aria-label="Send message"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
