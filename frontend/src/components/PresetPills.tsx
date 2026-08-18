'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TemplateItem } from '@/lib/api';
import { Wallet, Zap, Clock, BarChart2, Sparkles, ArrowUpRight } from 'lucide-react';

interface PresetPillsProps {
  templates: TemplateItem[];
  onSelectPreset: (template: TemplateItem) => void;
  isLoading: boolean;
}

const PRESET_CARDS = [
  {
    id: 'trip-splitter',
    title: 'Splitwise & Trip Calculator',
    subtitle: 'Group expense equalizer & settlement tracker',
    icon: <Wallet className="w-4 h-4 text-emerald-400" />,
    badge: 'Finance',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    hoverGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    prompt: 'Create a Splitwise & Trip Budget Calculator micro-app to split bills among friends with settlement calculation, category tags, and balance overview.',
  },
  {
    id: 'flashcard-quiz',
    title: 'Flashcard Quiz Arena',
    subtitle: 'Deck flip cards, timers & score tracker',
    icon: <Zap className="w-4 h-4 text-purple-400" />,
    badge: 'Education',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    hoverGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
    prompt: 'Create a Flashcard Quiz Arena micro-app with deck flip cards, timer countdown, score tracking, and custom card builder.',
  },
  {
    id: 'pomodoro-habit',
    title: 'Pomodoro & Habit Hub',
    subtitle: 'Focus timers & daily streak counters',
    icon: <Clock className="w-4 h-4 text-amber-400" />,
    badge: 'Focus',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    hoverGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    prompt: 'Create an Aesthetic Pomodoro & Habit Tracker micro-app with focus timers, streak counters, and daily habit checkmarks.',
  },
  {
    id: 'quick-poll',
    title: 'Interactive Analytics',
    subtitle: 'Live data metrics & chart visualizer',
    icon: <BarChart2 className="w-4 h-4 text-sky-400" />,
    badge: 'Analytics',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    hoverGlow: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
    prompt: 'Create an Interactive Data & Chart Visualizer micro-app with metric cards, progress bars, category filters, and live data adding.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export const PresetPills: React.FC<PresetPillsProps> = ({
  onSelectPreset,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-3 my-2 font-sans">
      <div className="flex items-center justify-between text-[11px] font-sans text-sand-400 font-medium uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-sand-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse-subtle" />
          Starter Concepts Gallery
        </span>
        <span>Instant Execution</span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
      >
        {PRESET_CARDS.map((card) => (
          <motion.button
            key={card.id}
            variants={cardVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            onClick={() =>
              onSelectPreset({
                id: card.id,
                title: card.title,
                category: card.badge,
                prompt: card.prompt,
              })
            }
            className={`group text-left p-3.5 rounded-2xl bg-darkcard/80 border border-warm-800 backdrop-blur-md transition-all disabled:opacity-50 flex flex-col justify-between gap-3 shadow-md ${card.hoverGlow}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-darkcanvas border border-warm-800 flex items-center justify-center shrink-0">
                {card.icon}
              </div>
              <span
                className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${card.badgeClass}`}
              >
                {card.badge}
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold text-sand-100 group-hover:text-white tracking-tight flex items-center gap-1">
                {card.title}
                <ArrowUpRight className="w-3 h-3 text-sand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[11px] text-sand-400 font-sans mt-0.5 line-clamp-1">
                {card.subtitle}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
