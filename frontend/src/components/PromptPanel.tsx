'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TemplateItem } from '@/lib/api';
import { PresetPills } from './PresetPills';
import {
  ArrowUp,
  Loader2,
  Sparkles,
  AlertCircle,
  Layout,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  type: 'text' | 'app';
  text: string;
  timestamp: string;
}

interface PromptPanelProps {
  onGenerate: (prompt: string, templateId?: string) => Promise<void>;
  isLoading: boolean;
  templates: TemplateItem[];
  errorMsg: string | null;
  messages: ChatMessage[];
  onClearHistory?: () => void;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  onGenerate,
  isLoading,
  templates,
  errorMsg,
  messages,
  onClearHistory,
}) => {
  const [prompt, setPrompt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    const userText = prompt.trim();
    setPrompt('');
    onGenerate(userText);
  };

  const handleSelectPreset = (tpl: TemplateItem) => {
    onGenerate(tpl.prompt, tpl.id);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditPrompt = (text: string) => {
    setPrompt(text);
    textareaRef.current?.focus();
  };

  const handleRegenerate = (text: string) => {
    if (isLoading) return;
    onGenerate(text);
  };

  return (
    <div className="h-full flex flex-col justify-between bg-darkcanvas/90 border-r border-warm-800/80 p-5 overflow-hidden font-sans">
      {/* Top Header & New Studio / Clear Control */}
      <div className="pb-3 border-b border-warm-800/60 flex items-center justify-between shrink-0">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-sand-100 tracking-tight">
            Chat & Studio Assistant
          </h2>
          <p className="text-[11px] font-sans text-sand-400">
            Prompt new micro-apps or refine active components
          </p>
        </div>

        {messages.length > 0 && onClearHistory && (
          <button
            onClick={onClearHistory}
            disabled={isLoading}
            title="Start New Studio Session"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-warm-900 hover:bg-warm-850 text-sand-300 border border-warm-800 text-[11px] font-medium transition-colors disabled:opacity-40"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>New Session</span>
          </button>
        )}
      </div>

      {/* Chat Message History & Starter Gallery Container */}
      <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-4">
        {messages.length === 0 ? (
          /* Empty Chat Feed State -> Shows Welcome & Starter Concepts */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col justify-center gap-5"
          >
            <div className="space-y-1.5">
              <h3 className="text-xl font-medium text-sand-100 tracking-tight">
                What micro-app would you like to build?
              </h3>
              <p className="text-xs text-sand-400 font-sans leading-relaxed">
                Describe a tool or ask a question. PromptToLife compiles pure React components live on the right canvas.
              </p>
            </div>

            {/* Starter Gallery -> Disappears once conversation starts! */}
            <PresetPills
              templates={templates}
              onSelectPreset={handleSelectPreset}
              isLoading={isLoading}
            />
          </motion.div>
        ) : (
          /* Conversation Message Bubbles */
          <div className="space-y-3.5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-col gap-1 text-xs font-sans ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`flex gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-500 font-serif text-xs font-bold shadow-sm">
                        P
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-warm-800/90 text-sand-100 border border-warm-700/80'
                          : 'bg-darkcard border border-warm-800 text-sand-200'
                      }`}
                    >
                      {msg.type === 'app' ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                            <Layout className="w-3.5 h-3.5 text-amber-500" /> Micro-App Rendered
                          </div>
                          <p className="text-xs text-sand-100 font-sans">{msg.text}</p>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                      <span className="text-[10px] text-sand-400 font-mono mt-1.5 block opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* ChatGPT/Claude-style Message Action Controls for User Prompts */}
                  {msg.sender === 'user' && (
                    <div className="flex items-center gap-1 pr-1 text-[11px]">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="Copy Prompt"
                        className="p-1 rounded-lg hover:bg-warm-900 text-sand-400 hover:text-sand-200 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-mono">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEditPrompt(msg.text)}
                        title="Edit & Reuse Prompt"
                        className="p-1 rounded-lg hover:bg-warm-900 text-sand-400 hover:text-sand-200 flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleRegenerate(msg.text)}
                        disabled={isLoading}
                        title="Regenerate App"
                        className="p-1 rounded-lg hover:bg-warm-900 text-sand-400 hover:text-amber-500 flex items-center gap-1 transition-colors disabled:opacity-40"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2.5 items-center text-xs text-sand-400 font-sans p-2"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Processing intent & synthesizing code...</span>
              </motion.div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-2 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="font-sans leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {/* Floating Chat Input Box */}
      <form onSubmit={handleSubmit} className="shrink-0 pt-2 border-t border-warm-800/60">
        <div className="claude-input-card rounded-2xl p-3 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe a new micro-app or ask to refine active code... (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent border-none text-xs text-sand-100 placeholder:text-sand-400 outline-none resize-none font-sans leading-relaxed"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-30 disabled:bg-warm-800 text-white flex items-center justify-center transition-all shadow-md shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5" />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};
