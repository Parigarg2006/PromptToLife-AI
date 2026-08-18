'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StarterCardsProps {
  onSelectPrompt: (promptText: string) => void;
  isDarkMode: boolean;
  isLoading: boolean;
}

const QUICK_SUGGESTIONS = [
  {
    label: 'Draft an interactive dashboard',
    prompt: 'Draft an executive interactive data dashboard architecture with metric cards, filters, and charts.',
  },
  {
    label: 'Explain async algorithms',
    prompt: 'Explain asynchronous event loops and concurrency algorithms with practical code examples.',
  },
  {
    label: 'Refactor React component',
    prompt: 'How do I refactor a complex React component to improve performance, re-renders, and custom hook organization?',
  },
  {
    label: 'Write a Python script',
    prompt: 'Write a clean Python script for automated data fetching, parsing, and error handling with type hints.',
  },
];

export const StarterCards: React.FC<StarterCardsProps> = ({
  onSelectPrompt,
  isDarkMode,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-auto px-4 py-12 flex flex-col justify-center items-center text-center font-sans select-none">
      {/* Centered Claude-Style Minimalist Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="space-y-2 mb-8"
      >
        <h1 className={`text-2xl sm:text-3xl font-medium tracking-tight ${
          isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
        }`}>
          What would you like to build or explore today?
        </h1>
        <p className={`text-sm ${
          isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          Ask questions, analyze complex concepts, or generate production code.
        </p>
      </motion.div>

      {/* Lightweight, Borderless Pill Chips */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        className="flex flex-wrap items-center justify-center gap-2 max-w-xl"
      >
        {QUICK_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => onSelectPrompt(item.prompt)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all border ${
              isDarkMode
                ? 'bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 border-zinc-800/80 hover:border-zinc-700'
                : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-700 border-zinc-200/80 hover:border-zinc-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </motion.div>
    </div>
  );
};
