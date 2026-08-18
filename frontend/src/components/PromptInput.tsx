'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  isDarkMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic for textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 220); // max height 220px
    textarea.style.height = `${newHeight}px`;
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const hasContent = prompt.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 select-none">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
        className={`rounded-2xl p-3.5 border transition-all duration-200 shadow-xl relative ${
          isDarkMode
            ? 'bg-[#121316] border-zinc-800/90 focus-within:border-zinc-700'
            : 'bg-white border-zinc-200/90 focus-within:border-zinc-300 shadow-zinc-200/50'
        }`}
      >
        <div className="flex items-end gap-3">
          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message PromptToLife..."
            className={`flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed max-h-48 font-sans ${
              isDarkMode
                ? 'text-zinc-100 placeholder:text-zinc-500'
                : 'text-zinc-900 placeholder:text-zinc-400'
            }`}
          />

          {/* Circular Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!hasContent || isLoading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 mb-0.5 ${
              hasContent && !isLoading
                ? 'bg-amber-500 text-zinc-950 shadow-md hover:bg-amber-400'
                : isDarkMode
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Minimal Bottom Keyboard Hint */}
        <div className={`mt-2 flex items-center justify-end text-[11px] font-sans ${
          isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          <span>Enter to send · Shift + Enter for new line</span>
        </div>
      </form>
    </div>
  );
};
