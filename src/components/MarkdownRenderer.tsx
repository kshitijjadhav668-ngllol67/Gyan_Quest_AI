import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Extract and render code blocks with dedicated interactive headers and copy actions
  // We can parse the content into tokens or render HTML and attach handlers, or custom parse code blocks
  return <MarkdownContent content={content} />;
};

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  // Split content by code blocks ```lang ... ``` so we can render interactive React code blocks
  const parts = splitCodeBlocks(content);

  return (
    <div className="prose prose-invert max-w-none text-slate-100 text-[15px] leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              language={part.language || 'plaintext'}
              code={part.code}
            />
          );
        }

        // Render standard markdown for non-code text
        const rawHtml = marked.parse(part.text, {
          breaks: true,
          gfm: true,
        }) as string;

        return (
          <div
            key={index}
            className="markdown-body [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>li]:mb-1 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mt-3 [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-indigo-200 [&>h3]:mt-2 [&>h3]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500/70 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-300 [&>blockquote]:my-3 [&>table]:w-full [&>table]:border-collapse [&>table]:my-3 [&>table_th]:border [&>table_th]:border-slate-700 [&>table_th]:bg-slate-800/80 [&>table_th]:p-2.5 [&>table_th]:text-left [&>table_td]:border [&>table_td]:border-slate-700/60 [&>table_td]:p-2.5 [&>table_tr:nth-child(even)]:bg-slate-800/30 [&>hr]:border-slate-700/60 [&>hr]:my-4 [&_code]:bg-slate-800/90 [&_code]:text-emerald-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono [&_a]:text-indigo-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-indigo-300"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        );
      })}
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="my-3.5 rounded-xl border border-slate-700/80 bg-slate-950/90 overflow-hidden shadow-lg shadow-black/20 text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-indigo-300 ml-1.5">
            {language}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({lineCount} {lineCount === 1 ? 'line' : 'lines'})
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-slate-200 scrollbar-thin scrollbar-thumb-slate-700">
        <pre className="m-0 p-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Helper function to split markdown content into text parts and code block parts
function splitCodeBlocks(
  text: string
): Array<{ type: 'text'; text: string } | { type: 'code'; language: string; code: string }> {
  const result: Array<
    { type: 'text'; text: string } | { type: 'code'; language: string; code: string }
  > = [];

  const codeRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(text)) !== null) {
    // Push preceding text if any
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        text: text.slice(lastIndex, match.index),
      });
    }

    const language = match[1] || 'plaintext';
    // Remove trailing newline if present in code
    const code = match[2].replace(/\n$/, '');

    result.push({
      type: 'code',
      language,
      code,
    });

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      text: text.slice(lastIndex),
    });
  }

  return result;
}
