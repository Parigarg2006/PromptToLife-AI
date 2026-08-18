'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Copy, Check, Code2 } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language || 'code';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-[#0d1117] shadow-xl text-xs font-mono">
      {/* Code Block Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-zinc-800/80 text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-[11px] uppercase tracking-wider text-zinc-300">
            {displayLang}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-all text-[11px] font-sans"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed text-zinc-100 font-mono">
        <pre className="!bg-transparent !p-0 !m-0">
          <code className={`language-${displayLang}`}>{value}</code>
        </pre>
      </div>
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent font-sans text-sm text-zinc-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
              return <CodeBlock language={language} value={codeString} />;
            }
            return (
              <code
                className="bg-zinc-800/70 text-amber-300 font-mono text-[12px] px-1.5 py-0.5 rounded border border-zinc-700/50"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold text-zinc-100 mb-3 mt-4 tracking-tight border-b border-zinc-800 pb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-semibold text-zinc-100 mb-2 mt-4 tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold text-amber-400/90 mb-2 mt-3">{children}</h3>;
          },
          p({ children }) {
            return <p className="mb-3 leading-relaxed text-zinc-300">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-3 space-y-1 text-zinc-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-3 space-y-1 text-zinc-300">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-amber-500/80 bg-zinc-900/60 pl-4 py-2 my-3 rounded-r-lg italic text-zinc-400">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                <table className="w-full text-left text-xs text-zinc-300 divide-y divide-zinc-800">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-2.5 bg-zinc-800/60 font-semibold text-zinc-200">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2 border-t border-zinc-800/50">{children}</td>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
