'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PromptPanel, ChatMessage } from '@/components/PromptPanel';
import { CodeCanvas } from '@/components/CodeCanvas';
import {
  fetchTemplates,
  generateMicroApp,
  checkBackendHealth,
  TemplateItem,
} from '@/lib/api';

/**
 * Robust code extractor ensuring Sandpack receives pure TSX code
 * without raw JSON strings or markdown fence wrappers.
 */
function extractPureCode(rawPayload: string): string {
  if (!rawPayload) return '';
  let str = rawPayload.strip ? rawPayload.strip() : rawPayload.trim();

  // Strip outer markdown fence wrappers
  const fenceRegex = /```(?:jsx|tsx|javascript|typescript|js|ts|json)?\s*([\s\S]*?)\s*```/g;
  const match = fenceRegex.exec(str);
  if (match && match[1]) {
    str = match[1].trim();
  } else {
    str = str.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  // Attempt JSON parsing if raw payload is a stringified JSON object
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed.code === 'string') {
        return extractPureCode(parsed.code);
      }
    } catch {
      // Continue if not valid JSON
    }
  }

  // Ensure React import line is present at the very top
  if (!str.includes("from 'react'") && !str.includes('from "react"')) {
    str = `import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';\n${str}`;
  }

  return str;
}

export default function Home() {
  const [currentCode, setCurrentCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const init = async () => {
      const healthy = await checkBackendHealth();
      setIsBackendConnected(healthy);
      const tpls = await fetchTemplates();
      setTemplates(tpls);
    };
    init();
  }, []);

  const handleGenerate = async (promptText: string, templateId?: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append User Message to Chat Feed
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      text: promptText,
      timestamp: nowStr,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Pass existing currentCode context for refinement iterations
      const result = await generateMicroApp(promptText, templateId, currentCode);

      if (result.type === 'app' && result.code) {
        const cleanCode = extractPureCode(result.code);
        setCurrentCode(cleanCode);

        const aiAppMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          type: 'app',
          text: result.message || '✨ Generated micro-app on the canvas.',
          timestamp: nowStr,
        };
        setMessages((prev) => [...prev, aiAppMsg]);
      } else if (result.type === 'text' && result.content) {
        const aiTextMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          type: 'text',
          text: result.content,
          timestamp: nowStr,
        };
        setMessages((prev) => [...prev, aiTextMsg]);
      }
    } catch (err: any) {
      console.error('Generation Error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-warm-950 text-sand-100 overflow-hidden font-sans">
      {/* Editorial Header */}
      <Header isBackendConnected={isBackendConnected} />

      {/* Main Dual-Pane Dashboard */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Conversational Chat & Router Panel (4 Cols) */}
        <div className="lg:col-span-4 h-full overflow-hidden">
          <PromptPanel
            onGenerate={handleGenerate}
            isLoading={isLoading}
            templates={templates}
            errorMsg={errorMsg}
            messages={messages}
          />
        </div>

        {/* Right Side: Sandpack Canvas (8 Cols) */}
        <div className="lg:col-span-8 h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-warm-800/80">
          <CodeCanvas code={currentCode} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
