'use client';

import React from 'react';
import { Layers } from 'lucide-react';

interface HeaderProps {
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isBackendConnected }) => {
  return (
    <header className="h-14 border-b border-warm-800/80 bg-darkcanvas/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Sleek Minimal Startup Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-terracotta-600 p-0.5 shadow-md shadow-amber-500/15">
          <div className="w-full h-full bg-darkcanvas rounded-[10px] flex items-center justify-center">
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <span className="font-serif text-lg font-medium text-sand-100 tracking-tight">
          PromptToLife
        </span>
      </div>

      {/* Backend Status Pill */}
      <div className="flex items-center gap-3 text-xs font-sans">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-darkcard/90 border border-warm-800 text-sand-400 backdrop-blur-sm shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'}`} />
          <span className="text-[11px] text-sand-300 font-medium">
            {isBackendConnected ? 'FastAPI Active' : 'Local Engine'}
          </span>
        </div>
      </div>
    </header>
  );
};
