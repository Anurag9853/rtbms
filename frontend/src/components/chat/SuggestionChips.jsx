import { motion } from 'framer-motion';

/**
 * SuggestionChips — context-aware quick prompts
 */
export function SuggestionChips({ suggestions = [], onSelect, compact = false }) {
  if (!suggestions.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'px-1'}`}>
      {suggestions.map((chip, i) => (
        <motion.button
          key={chip}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(chip)}
          className="text-xs px-3 py-1.5 rounded-full bg-electric-600/10 border border-electric-600/20 text-electric-300/80 hover:bg-electric-600/20 hover:border-electric-600/35 hover:text-electric-200 transition-all duration-200 whitespace-nowrap cursor-pointer"
          aria-label={`Suggest: ${chip}`}
        >
          {chip}
        </motion.button>
      ))}
    </div>
  );
}
