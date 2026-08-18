'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import { 
  Paperclip, Send, Plus, Trash2, Copy, Check, Sparkles, 
  MessageSquare, FileText, User, Pencil, RotateCcw,
  Volume2, VolumeX, ThumbsUp, ThumbsDown, X, Download, BookOpen,
  Mic, MicOff, Cpu, Eye, ExternalLink, ChevronDown, FileCheck
} from 'lucide-react';
import BrandIcon from '../components/BrandIcon';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const AVAILABLE_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: '⚡ Llama 3.3 70B (Fast & Smart)', desc: 'Best overall balance of speed and intelligence' },
  { id: 'deepseek-r1-distill-llama-70b', name: '💡 DeepSeek R1 (Deep Reasoning)', desc: 'Advanced math, coding, and logical thinking' },
  { id: 'llama-3.1-8b-instant', name: '🚀 Llama 3.1 8B (Ultra Fast)', desc: 'Instant low-latency responses' },
  { id: 'mixtral-8x7b-32768', name: '🧠 Mixtral 8x7B (Long Context)', desc: 'Great for long document processing' }
];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('prompttolife_chats') : null;
    const initialNewChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [initialNewChat, ...parsed.filter((s: ChatSession) => s.messages.length > 0)];
      } catch (e) {}
    }
    return [initialNewChat];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => sessions[0]?.id || Date.now().toString());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b-versatile');
  
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [execSummary, setExecSummary] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});
  const [citationsMap, setCitationsMap] = useState<Record<string, Array<{ source: string; page: number }>>>({});
  
  const [isListening, setIsListening] = useState(false);
  const [pdfPreviewPage, setPdfPreviewPage] = useState<number | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('prompttolife_chats', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, isLoading]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setExecSummary(null);
    setShowPdfViewer(false);
  };

  const fetchSummary = async (filename: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/summary/${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (data.summary) {
        setExecSummary(data.summary);
      }
    } catch (e) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setExecSummary("Indexing PDF & generating executive summary...");
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedFile(file.name);
        if (data.file_url) setUploadedFileUrl(data.file_url);
        
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 }
        });

        setTimeout(() => fetchSummary(file.name), 3000);
        setTimeout(() => fetchSummary(file.name), 7000);
      } else {
        alert(data.error || 'Upload failed');
        setExecSummary(null);
      }
    } catch (err) {
      alert('Could not connect to backend server on port 8000');
      setExecSummary(null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const streamAIResponse = async (query: string, currentMsgs: Message[]) => {
    setIsLoading(true);
    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, initialAiMsg], updatedAt: Date.now() };
      }
      return s;
    }));

    try {
      const historyItems = currentMsgs.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyItems,
          query: query,
          model: selectedModel
        })
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming failed or server unavailable');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.token) {
                accumulatedText += data.token;
                const currentText = accumulatedText;
                setSessions(prev => prev.map(s => {
                  if (s.id === currentSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map(m => m.id === aiMsgId ? { ...m, text: currentText } : m)
                    };
                  }
                  return s;
                }));
              }
              if (data.citations) {
                setCitationsMap(prev => ({ ...prev, [aiMsgId]: data.citations }));
              }
              if (data.error) {
                accumulatedText += `\n\n*[Error: ${data.error}]*`;
                const errText = accumulatedText;
                setSessions(prev => prev.map(s => {
                  if (s.id === currentSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map(m => m.id === aiMsgId ? { ...m, text: errText } : m)
                    };
                  }
                  return s;
                }));
              }
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === aiMsgId ? { 
              ...m, 
              text: 'Error connecting to backend on http://localhost:8000. Please ensure FastAPI server is running.' 
            } : m)
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newTitle = currentSession.messages.length === 0 ? (query.slice(0, 26) + (query.length > 26 ? '...' : '')) : currentSession.title;
    const updatedMessages = [...currentSession.messages, userMsg];

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          title: newTitle,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    setInput('');
    await streamAIResponse(query, currentSession.messages);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditInputText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditInputText('');
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editInputText.trim() || isLoading) return;
    const newText = editInputText.trim();
    setEditingMessageId(null);

    const msgIndex = currentSession.messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    const updatedUserMsg: Message = {
      ...currentSession.messages[msgIndex],
      text: newText
    };

    const truncatedHistory = currentSession.messages.slice(0, msgIndex);
    const updatedSessionMessages = [...truncatedHistory, updatedUserMsg];

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: updatedSessionMessages, updatedAt: Date.now() };
      }
      return s;
    }));

    await streamAIResponse(newText, truncatedHistory);
  };

  const handleRegenerate = async (msgIndex: number) => {
    if (isLoading) return;
    const messages = currentSession.messages;
    let queryIndex = -1;
    for (let i = msgIndex; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        queryIndex = i;
        break;
      }
    }
    if (queryIndex === -1) return;
    const query = messages[queryIndex].text;

    const truncatedHistory = messages.slice(0, queryIndex);
    const messagesWithQuery = messages.slice(0, queryIndex + 1);

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: messagesWithQuery, updatedAt: Date.now() };
      }
      return s;
    }));

    await streamAIResponse(query, truncatedHistory);
  };

  const handleSpeak = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackMap(prev => ({
      ...prev,
      [id]: prev[id] === type ? (undefined as any) : type
    }));
  };

  const handleExportChat = () => {
    if (currentSession.messages.length === 0) return;
    let mdContent = `# ${currentSession.title}\n\n`;
    currentSession.messages.forEach(m => {
      mdContent += `### ${m.sender === 'user' ? 'User' : 'PromptToLife Assistant'} (${m.timestamp})\n${m.text}\n\n---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPdfViewerPage = (page: number) => {
    setPdfPreviewPage(page);
    setShowPdfViewer(true);
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-zinc-100 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0d121f] border-r border-zinc-800/80 flex flex-col p-4">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>

        <div className="mt-6 flex-1 overflow-y-auto space-y-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2">History</p>
          {sessions.map(s => (
            <div 
              key={s.id}
              onClick={() => setCurrentSessionId(s.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer group transition ${s.id === currentSessionId ? 'bg-zinc-800/90 text-white font-medium' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare className="w-4 h-4 shrink-0 text-amber-500/80" />
                <span className="truncate">{s.title}</span>
              </div>
              {sessions.length > 1 && (
                <Trash2 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSessions(prev => prev.filter(x => x.id !== s.id));
                    if (currentSessionId === s.id) setCurrentSessionId(sessions[0].id);
                  }}
                  className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-rose-400 transition" 
                />
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Top Navbar */}
        <header className="h-14 border-b border-zinc-800/60 px-6 flex items-center justify-between bg-[#090D16]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <BrandIcon size={32} />
            <span className="text-base font-semibold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-amber-200 bg-clip-text text-transparent">
              PromptToLife
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Switcher */}
            <div className="relative flex items-center bg-[#111728] border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-200 shadow-lg focus:outline-none hover:border-amber-500/50 transition">
              <Cpu className="w-3.5 h-3.5 text-amber-400 mr-2 shrink-0" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-xs text-zinc-200 cursor-pointer pr-2 font-medium"
                title={AVAILABLE_MODELS.find(m => m.id === selectedModel)?.desc}
              >
                {AVAILABLE_MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#111728] text-zinc-200 py-1" title={m.desc}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {uploadedFile && (
              <button
                onClick={() => setShowPdfViewer(true)}
                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{uploadedFile}</span>
                <Eye className="w-3 h-3 ml-1 opacity-70" />
              </button>
            )}

            {currentSession.messages.length > 0 && (
              <button 
                onClick={handleExportChat}
                className="flex items-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs px-3 py-1.5 rounded-xl border border-zinc-700/60 transition"
                title="Export Chat (.md)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            )}
          </div>
        </header>

        {/* Executive Summary Banner (if document uploaded) */}
        {execSummary && (
          <div className="bg-gradient-to-r from-[#12192c] via-[#161d36] to-[#12192c] border-b border-amber-500/20 px-6 py-3 text-xs text-zinc-300">
            <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" /> Document Executive Summary ({uploadedFile})
                </div>
                <p className="leading-relaxed whitespace-pre-wrap text-zinc-300">{execSummary}</p>
              </div>
              {uploadedFileUrl && (
                <button
                  onClick={() => setShowPdfViewer(true)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 font-medium"
                >
                  <Eye className="w-3.5 h-3.5" /> View PDF
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat / Hero Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {currentSession.messages.length === 0 ? (
              <div className="text-center pt-16 space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-xl shadow-amber-500/5">
                  <BrandIcon size={48} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                  What do you want to create or explore?
                </h1>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Ask anything, speak your prompt, upload PDFs for grounded RAG answers, or switch Groq AI models dynamically.
                </p>
              </div>
            ) : (
              currentSession.messages.map((msg, index) => (
                <div key={msg.id} className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-1 shadow-sm shadow-amber-500/10">
                      <BrandIcon size={20} />
                    </div>
                  )}
                  <div className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-normal shadow-md' 
                      : 'bg-[#121829] border border-zinc-800 text-zinc-200 shadow-sm'
                  }`}>
                    {/* Message Content or Inline Edit Box */}
                    {editingMessageId === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editInputText}
                          onChange={(e) => setEditInputText(e.target.value)}
                          className="w-full bg-[#090d16] text-white border border-amber-500/50 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Save & Submit
                          </button>
                        </div>
                      </div>
                    ) : (
                      msg.sender === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      ) : (
                        <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                return !inline ? (
                                  <div className="my-3 rounded-xl bg-[#090d16] border border-zinc-800 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-1 bg-[#0d121f] border-b border-zinc-800 text-xs text-zinc-400">
                                      <span className="font-mono text-[11px] uppercase tracking-wider">{match ? match[1] : 'code'}</span>
                                      <button 
                                        onClick={() => copyToClipboard(codeString, msg.id + '-code')}
                                        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition"
                                      >
                                        <Copy className="w-3 h-3" /> Copy
                                      </button>
                                    </div>
                                    <pre className="p-3 text-xs overflow-x-auto font-mono text-zinc-200 leading-relaxed">
                                      <code>{children}</code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className="bg-zinc-800/80 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.text || (isLoading && index === currentSession.messages.length - 1 ? '...' : '')}
                          </ReactMarkdown>
                        </div>
                      )
                    )}

                    {/* Citations Badges */}
                    {msg.sender === 'assistant' && citationsMap[msg.id] && citationsMap[msg.id].length > 0 && (
                      <div className="mt-3 pt-2 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
                        {citationsMap[msg.id].map((c, i) => (
                          <button 
                            key={i} 
                            onClick={() => openPdfViewerPage(c.page)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] transition cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>{c.source} (Page {c.page})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* User Action Controls */}
                    {msg.sender === 'user' && editingMessageId !== msg.id && (
                      <div className="flex items-center justify-end gap-1 mt-2 text-zinc-200 text-xs opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={() => handleStartEdit(msg)}
                          className="text-zinc-200 hover:text-white hover:bg-black/20 p-1.5 rounded-lg transition"
                          title="Edit prompt"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="text-zinc-200 hover:text-white hover:bg-black/20 p-1.5 rounded-lg transition relative"
                          title="Copy prompt"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === msg.id && (
                            <span className="absolute -top-7 right-0 bg-zinc-900 border border-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-[10px] shadow">
                              Copied!
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Assistant Action Controls */}
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center gap-1 mt-3 pt-2 border-t border-zinc-800/80 text-zinc-400 text-xs">
                        {/* Copy Response */}
                        <button 
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 p-1.5 rounded-lg transition relative flex items-center gap-1"
                          title="Copy Response"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === msg.id && (
                            <span className="absolute -top-7 left-0 bg-zinc-900 border border-zinc-700 text-zinc-200 px-2 py-0.5 rounded text-[10px] shadow whitespace-nowrap">
                              Copied!
                            </span>
                          )}
                        </button>

                        {/* Regenerate Response */}
                        <button 
                          onClick={() => handleRegenerate(index)}
                          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 p-1.5 rounded-lg transition"
                          title="Regenerate / Retry"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Read Aloud Text-to-Speech */}
                        <button 
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className={`text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 p-1.5 rounded-lg transition ${speakingId === msg.id ? 'text-amber-400 bg-amber-500/10' : ''}`}
                          title={speakingId === msg.id ? "Stop Reading" : "Read Aloud"}
                        >
                          {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Good Response Feedback */}
                        <button 
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 p-1.5 rounded-lg transition ${feedbackMap[msg.id] === 'up' ? 'text-emerald-400 bg-emerald-500/10' : ''}`}
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Bad Response Feedback */}
                        <button 
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 p-1.5 rounded-lg transition ${feedbackMap[msg.id] === 'down' ? 'text-rose-400 bg-rose-500/10' : ''}`}
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/10">
                  <BrandIcon size={20} className="animate-pulse" />
                </div>
                <div className="bg-[#121829] border border-zinc-800 px-4 py-2.5 rounded-2xl text-xs text-zinc-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Streaming response via {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Groq'}...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area with Native Label-Input & Voice Recording */}
        <div className="p-4 bg-[#090D16]">
          <form 
            onSubmit={handleSend}
            className="max-w-3xl mx-auto relative bg-[#111728] border border-zinc-700/80 focus-within:border-amber-500/70 focus-within:ring-1 focus-within:ring-amber-500/30 rounded-2xl shadow-xl transition flex items-center px-3 py-2"
          >
            {/* PDF File Picker */}
            <label
              htmlFor="pdf-file-input"
              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/60 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
              title="Upload PDF Document"
            >
              <Paperclip className={`w-4 h-4 ${isUploading ? 'animate-spin text-amber-400' : ''}`} />
              <input 
                id="pdf-file-input"
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>

            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${isListening ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/60'}`}
              title={isListening ? "Listening... Click to stop" : "Voice Input (Speech-to-Text)"}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'text-amber-400' : ''}`} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : uploadedFile ? `Ask anything about ${uploadedFile}...` : "Ask anything or type a prompt..."}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-zinc-950 font-bold transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* In-App PDF Preview Drawer / Modal */}
        {showPdfViewer && uploadedFileUrl && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col p-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-[#111728] border border-zinc-800 px-4 py-3 rounded-t-2xl">
              <div className="flex items-center gap-2 text-sm text-zinc-200 font-semibold">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>PDF Preview: {uploadedFile}</span>
                {pdfPreviewPage && (
                  <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-500/30 ml-2">
                    Viewing Page {pdfPreviewPage}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-zinc-400 hover:text-white transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowPdfViewer(false)}
                  className="p-1.5 text-zinc-400 hover:text-white transition rounded-lg hover:bg-zinc-800"
                  title="Close PDF Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-[#090d16] border-x border-b border-zinc-800 rounded-b-2xl overflow-hidden">
              <iframe
                src={`${uploadedFileUrl}#page=${pdfPreviewPage || 1}`}
                className="w-full h-full border-none"
                title="PDF Document Preview"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
