import React, { useState } from 'react';
import {
  Menu,
  Sliders,
  Cpu,
  Trash2,
  Download,
  Share2,
  Sparkles,
  Info,
} from 'lucide-react';
import { Session, ChatSettings } from '../types/chat';
import { GEMMA_PERSONAS } from '../utils/personas';

interface ChatHeaderProps {
  session: Session | null;
  settings: ChatSettings;
  onOpenSidebarMobile: () => void;
  onOpenSpecs: () => void;
  onOpenSettings: () => void;
  onClearSession: () => void;
  onExportCurrentChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  session,
  settings,
  onOpenSidebarMobile,
  onOpenSpecs,
  onOpenSettings,
  onClearSession,
  onExportCurrentChat,
}) => {
  const currentPersona =
    GEMMA_PERSONAS.find((p) => p.id === settings.personaId) || GEMMA_PERSONAS[0];

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between z-10 sticky top-0">
      {/* Left: Mobile hamburger & Session/Persona Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebarMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden cursor-pointer"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 items-center justify-center text-white shadow-sm flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                {session?.title || 'New Conversation'}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                {currentPersona.name}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">
              Gemma 4 31B • 256K Context Window
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Model Specs Trigger */}
        <button
          onClick={onOpenSpecs}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          title="Gemma 4 31B Architecture & Specifications"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">31B Specs</span>
        </button>

        {/* Persona & Hyperparameters Settings Trigger */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          title="Settings & Persona"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Tune</span>
        </button>

        {/* Export chat */}
        {session && session.messages.length > 0 && (
          <button
            onClick={onExportCurrentChat}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Export conversation as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Clear chat */}
        {session && session.messages.length > 0 && (
          <button
            onClick={onClearSession}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Clear all messages in this conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
