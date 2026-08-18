'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Edit3,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  isDarkMode: boolean;
  onRegenerate?: (promptText: string) => void;
  onEditPrompt?: (text: string) => void;
  lastUserPrompt?: string;
  isLoading?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isDarkMode,
  onRegenerate,
  onEditPrompt,
  lastUserPrompt,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    // Cancel speech if component unmounts
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown tags for clear speech
      const cleanText = message.text
        .replace(/```[\s\S]*?```/g, 'Code block omitted for brevity.')
        .replace(/[*#_`~]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`py-5 px-4 md:px-6 w-full ${
        isUser
          ? ''
          : isDarkMode
          ? 'bg-zinc-900/50 border-y border-zinc-800/40'
          : 'bg-zinc-50 border-y border-zinc-200/60'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        {/* Avatar Icon */}
        <div className="shrink-0 mt-0.5 select-none">
          {isUser ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
              isDarkMode
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                : 'bg-zinc-200 text-zinc-700 border border-zinc-300'
            }`}>
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-zinc-950' : 'bg-white'
              }`}>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          )}
        </div>

        {/* Message Content & Action Bar Container */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Sender Name & Timestamp */}
          <div className="flex items-center justify-between select-none">
            <span className={`text-xs font-semibold tracking-tight ${
              isUser
                ? isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
                : 'text-zinc-200'
            }`}>
              {isUser ? 'You' : 'PromptToLife'}
            </span>
            <span className={`text-[10px] font-mono ${
              isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {message.timestamp}
            </span>
          </div>

          {/* Message Text / Markdown Body */}
          {isUser ? (
            <div className={`text-sm font-sans leading-relaxed whitespace-pre-wrap ${
              isDarkMode ? 'text-zinc-100' : 'text-zinc-800'
            }`}>
              {message.text}
            </div>
          ) : (
            <MarkdownRenderer content={message.text} />
          )}

          {/* Response Action Buttons underneath AI Answers */}
          {!isUser && (
            <div className="pt-2 flex items-center gap-1.5 text-xs select-none">
              {/* Copy Response (📋) */}
              <button
                onClick={handleCopy}
                title="Copy Full Response"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                  isDarkMode
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              {/* Regenerate (🔄) */}
              {onRegenerate && lastUserPrompt && (
                <button
                  onClick={() => onRegenerate(lastUserPrompt)}
                  disabled={isLoading}
                  title="Regenerate Response"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all disabled:opacity-40 ${
                    isDarkMode
                      ? 'hover:bg-zinc-800 text-zinc-400 hover:text-amber-400'
                      : 'hover:bg-zinc-200 text-zinc-500 hover:text-amber-600'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}

              {/* Read Out (🔊) - Speech Synthesis */}
              <button
                onClick={handleToggleSpeech}
                title={isSpeaking ? 'Stop Reading' : 'Read Response Aloud'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                  isSpeaking
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : isDarkMode
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-[11px] text-amber-400 font-medium">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Read aloud</span>
                  </>
                )}
              </button>

              <div className={`h-3 w-px mx-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />

              {/* Thumbs Up (👍) */}
              <button
                onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                title="Good response"
                className={`p-1.5 rounded-lg transition-all ${
                  feedback === 'like'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                    : isDarkMode
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs Down (👎) */}
              <button
                onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                title="Poor response"
                className={`p-1.5 rounded-lg transition-all ${
                  feedback === 'dislike'
                    ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                    : isDarkMode
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* User Message Action Buttons */}
          {isUser && (
            <div className="pt-1 flex items-center gap-2 text-xs select-none">
              <button
                onClick={handleCopy}
                title="Copy Prompt"
                className={`flex items-center gap-1 text-[11px] transition-colors ${
                  isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onEditPrompt && (
                <button
                  onClick={() => onEditPrompt(message.text)}
                  title="Edit & Resend Prompt"
                  className={`flex items-center gap-1 text-[11px] transition-colors ${
                    isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
