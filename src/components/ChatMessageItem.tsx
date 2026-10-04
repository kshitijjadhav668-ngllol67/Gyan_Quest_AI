import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCw,
  Cpu,
  Clock,
  Layers,
} from 'lucide-react';
import { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageItemProps {
  message: Message;
  isLastAssistant: boolean;
  onRegenerate?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLastAssistant,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy message:', e);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown code fences for cleaner voice synthesis
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*_`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div
      className={`group w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-slate-900/40 border-y border-slate-800/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3.5 sm:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-sm">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          )}
        </div>

        {/* Message Content & Metadata */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-200">
              {isUser ? 'You' : 'Gemma 4 31B'}
            </span>

            {!isUser && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                <Cpu className="w-2.5 h-2.5" />
                <span>31B Dense</span>
              </span>
            )}

            {message.durationMs && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Clock className="w-2.5 h-2.5" />
                <span>{(message.durationMs / 1000).toFixed(1)}s</span>
              </span>
            )}

            {message.tokensEstimate && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Layers className="w-2.5 h-2.5" />
                <span>~{message.tokensEstimate} tokens</span>
              </span>
            )}

            <span className="text-[10px] text-slate-500 ml-auto">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Attached Image if user submitted an image */}
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image.previewUrl}
                alt="Uploaded attachment"
                className="max-h-60 max-w-sm rounded-xl border border-slate-700/80 object-cover shadow-md"
              />
            </div>
          )}

          {/* Main Content */}
          <div className="relative">
            <MarkdownRenderer content={message.content} />

            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
            )}
          </div>

          {/* Assistant Action Bar */}
          {!isUser && !message.isStreaming && message.content && (
            <div className="flex items-center gap-1 mt-3 pt-2 text-slate-400 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 text-xs transition-colors cursor-pointer ${
                  isSpeaking ? 'text-indigo-400 bg-indigo-950/60' : ''
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Listen</span>
                  </>
                )}
              </button>

              {isLastAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 text-xs transition-colors cursor-pointer ml-1"
                  title="Regenerate answer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
