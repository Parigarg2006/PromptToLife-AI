'use client';

import React, { useState, useEffect } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Code2,
  Monitor,
  Smartphone,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CodeCanvasProps {
  code: string;
  isLoading?: boolean;
}

const THINKING_STEPS = [
  'Analyzing prompt & routing intent...',
  'Synthesizing handcrafted React component & state...',
  'Bundling Tailwind CSS styles & Lucide icons...',
  'Rendering live Sandpack iframe sandbox...',
];

const CustomSandpackToolbar = ({
  activeTab,
  setActiveTab,
  viewport,
  setViewport,
  code,
  onResetPreview,
  hasCode,
  onTriggerToast,
  zoomScale,
  setZoomScale,
  isFullscreen,
  setIsFullscreen,
}: {
  activeTab: 'preview' | 'code';
  setActiveTab: (tab: 'preview' | 'code') => void;
  viewport: 'desktop' | 'mobile';
  setViewport: (vp: 'desktop' | 'mobile') => void;
  code: string;
  onResetPreview: () => void;
  hasCode: boolean;
  onTriggerToast: (msg: string) => void;
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!hasCode) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    onTriggerToast('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.15, 1.5));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.15, 0.65));
  };

  return (
    <div className="h-11 bg-darkcard border-b border-warm-800/80 px-4 flex items-center justify-between text-xs py-2 shrink-0 select-none font-sans">
      {/* macOS Dots + View Switcher Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 inline-block" />
        </div>

        <div className="flex items-center gap-1 bg-darkcanvas p-1 rounded-xl border border-warm-800">
          <button
            onClick={() => setActiveTab('preview')}
            disabled={!hasCode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all disabled:opacity-40 text-xs ${
              activeTab === 'preview' && hasCode
                ? 'bg-warm-800 text-sand-100 shadow-sm border border-warm-700/60'
                : 'text-sand-400 hover:text-sand-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-amber-500" />
            <span>Live Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            disabled={!hasCode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all disabled:opacity-40 text-xs ${
              activeTab === 'code' && hasCode
                ? 'bg-warm-800 text-sand-100 shadow-sm border border-warm-700/60'
                : 'text-sand-400 hover:text-sand-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-sand-400" />
            <span>Source Code</span>
          </button>
        </div>
      </div>

      {/* Viewport, Zoom Controls, Reset, Copy Code, Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 bg-darkcanvas p-1 rounded-xl border border-warm-800">
          <button
            onClick={handleZoomOut}
            disabled={!hasCode || zoomScale <= 0.7}
            title="Zoom Out"
            className="p-1 rounded-lg text-sand-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 text-sand-300">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={!hasCode || zoomScale >= 1.45}
            title="Zoom In"
            className="p-1 rounded-lg text-sand-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-darkcanvas p-1 rounded-xl border border-warm-800">
          <button
            onClick={() => setViewport('desktop')}
            disabled={!hasCode}
            title="Desktop Viewport"
            className={`p-1 rounded-lg transition-colors disabled:opacity-40 ${
              viewport === 'desktop' && hasCode ? 'bg-warm-800 text-sand-100' : 'text-sand-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            disabled={!hasCode}
            title="Mobile Viewport (375px Container)"
            className={`p-1 rounded-lg transition-colors disabled:opacity-40 ${
              viewport === 'mobile' && hasCode ? 'bg-warm-800 text-sand-100' : 'text-sand-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetPreview}
          disabled={!hasCode}
          title="Reset Preview State"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-darkcanvas hover:bg-warm-900 text-sand-300 border border-warm-800 text-xs font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sand-400" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Copy Code Button */}
        <button
          onClick={handleCopy}
          disabled={!hasCode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-darkcanvas hover:bg-warm-900 text-sand-200 border border-warm-800 text-xs font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sand-400" />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          disabled={!hasCode}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          className="p-1.5 rounded-xl bg-darkcanvas hover:bg-warm-900 text-sand-300 border border-warm-800 text-xs font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-500" /> : <Maximize2 className="w-3.5 h-3.5 text-sand-400" />}
        </button>
      </div>
    </div>
  );
};

export const CodeCanvas: React.FC<CodeCanvasProps> = ({ code, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [key, setKey] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isLoading) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < THINKING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleResetPreview = () => {
    setKey((prev) => prev + 1);
    setZoomScale(1.0);
    handleTriggerToast('Preview state reset');
  };

  const handleTriggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const hasCode = Boolean(code && code.trim().length > 0);

  return (
    <div className={`h-full w-full flex flex-col bg-darkcanvas overflow-hidden relative font-sans ${isFullscreen ? 'fixed inset-0 z-50 bg-darkcanvas' : ''}`}>
      {/* Top Toolbar */}
      <CustomSandpackToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewport={viewport}
        setViewport={setViewport}
        code={code}
        onResetPreview={handleResetPreview}
        hasCode={hasCode}
        onTriggerToast={handleTriggerToast}
        zoomScale={zoomScale}
        setZoomScale={setZoomScale}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-5 right-5 z-40 px-3.5 py-2 rounded-xl bg-warm-900 border border-amber-500/40 text-sand-100 text-xs shadow-xl flex items-center gap-2 backdrop-blur-md"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step-by-Step Thinking Indicator Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-darkcanvas/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-sand-100"
          >
            <div className="w-14 h-14 rounded-2xl bg-darkcard border border-warm-800 flex items-center justify-center shadow-2xl relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 opacity-30 blur-lg animate-pulse" />
              <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
            </div>
            <div className="text-center font-sans space-y-1">
              <div className="text-sm font-semibold text-sand-100 tracking-tight">
                {THINKING_STEPS[stepIndex]}
              </div>
              <div className="text-[11px] text-sand-400 font-mono">
                Step {stepIndex + 1} of {THINKING_STEPS.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Execution Container */}
      {hasCode ? (
        <SandpackProvider
          key={key}
          template="react-ts"
          theme="dark"
          files={{
            '/App.tsx': code,
          }}
          customSetup={{
            dependencies: {
              'lucide-react': '^0.454.0',
              react: '^18.3.1',
              'react-dom': '^18.3.1',
            },
          }}
          options={{
            recompileMode: 'immediate',
            visibleFiles: ['/App.tsx'],
            activeFile: '/App.tsx',
            externalResources: [
              'https://cdn.tailwindcss.com',
            ],
          }}
        >
          <div className="flex-1 w-full h-full relative overflow-hidden bg-darkcanvas flex items-center justify-center">
            <motion.div
              animate={{
                maxWidth: viewport === 'mobile' ? '375px' : '100%',
                scale: zoomScale,
              }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full h-full transform-gpu ${
                viewport === 'mobile'
                  ? 'my-4 h-[calc(100%-2rem)] border-[8px] border-warm-850 rounded-[32px] shadow-2xl overflow-hidden'
                  : 'w-full h-full'
              }`}
            >
              <SandpackLayout style={{ height: '100%', width: '100%', border: 'none', background: '#0b0c0e' }}>
                {activeTab === 'preview' ? (
                  <SandpackPreview
                    showRefreshButton={false}
                    showOpenInCodeSandbox={false}
                    style={{ height: '100%', width: '100%', background: '#0b0c0e' }}
                  />
                ) : (
                  <SandpackCodeEditor
                    showLineNumbers={true}
                    showInlineErrors={true}
                    showTabs={false}
                    closableTabs={false}
                    style={{ height: '100%', width: '100%', background: '#11141b' }}
                  />
                )}
              </SandpackLayout>
            </motion.div>
          </div>
        </SandpackProvider>
      ) : (
        /* Empty Studio Canvas */
        <div className="flex-1 w-full h-full bg-darkcanvas flex flex-col items-center justify-center p-8 text-center select-none relative">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center max-w-md space-y-6"
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 opacity-25 blur-xl animate-pulse-subtle" />
              <div className="relative w-16 h-16 rounded-2xl bg-darkcard border border-warm-800 text-amber-500 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-semibold text-sand-100 tracking-tight">
                Live Sandbox Ready
              </h3>
              <p className="text-xs text-sand-400 font-sans leading-relaxed">
                Your generated micro-app will render instantly in this client-side Sandpack runner with full reactivity and TypeScript support.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full text-left pt-2 font-sans">
              <div className="p-3.5 rounded-2xl bg-darkcard/90 border border-warm-800/80 backdrop-blur-md shadow-sm">
                <div className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider mb-1">01</div>
                <div className="text-xs font-semibold text-sand-200">Describe Idea</div>
                <div className="text-[10px] text-sand-400 mt-0.5">Prompt any tool or select concept</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-darkcard/90 border border-warm-800/80 backdrop-blur-md shadow-sm">
                <div className="text-[10px] font-mono text-orange-500 font-bold uppercase tracking-wider mb-1">02</div>
                <div className="text-xs font-semibold text-sand-200">AI Synthesizes</div>
                <div className="text-[10px] text-sand-400 mt-0.5">Compiles pure React component</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-darkcard/90 border border-warm-800/80 backdrop-blur-md shadow-sm">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">03</div>
                <div className="text-xs font-semibold text-sand-200">Interact & Export</div>
                <div className="text-[10px] text-sand-400 mt-0.5">Live execution & 1-click export</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
