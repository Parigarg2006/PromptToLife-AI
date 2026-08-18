'use client';

import React from 'react';
import { Sparkles, Plus, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isBackendConnected?: boolean;
  onNewChat: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewChat,
  isDarkMode,
  onToggleTheme,
  hasMessages,
}) => {
  return (
    <header className={`h-14 px-6 flex items-center justify-between sticky top-0 z-50 select-none transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-zinc-950/80 text-zinc-100 border-b border-zinc-800/50 backdrop-blur-md' 
        : 'bg-white/80 text-zinc-900 border-b border-zinc-200/80 backdrop-blur-md'
    }`}>
      {/* Brand: Clean Amber/Orange Icon + PromptToLife */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-base tracking-tight font-sans">
          PromptToLife
        </span>
      </div>

      {/* Right Controls: Theme Toggle & New Chat Button */}
      <div className="flex items-center gap-2">
        {hasMessages && (
          <button
            onClick={onNewChat}
            title="New Chat"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isDarkMode
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>New Chat</span>
          </button>
        )}

        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-1.5 rounded-lg transition-all border ${
            isDarkMode
              ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border-zinc-200'
          }`}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>
      </div>
    </header>
  );
};
