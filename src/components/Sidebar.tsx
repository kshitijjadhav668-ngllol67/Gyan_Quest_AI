import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Pin,
  Download,
  Upload,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Session } from '../types/chat';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onOpenSpecs: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onExportAll: () => void;
  onImportBackup: (importedSessions: Session[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onOpenSpecs,
  isOpenMobile,
  onCloseMobile,
  onExportAll,
  onImportBackup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportBackup(json);
        } else if (json.id && json.messages) {
          onImportBackup([json]);
        }
      } catch (err) {
        alert('Invalid JSON file format for chat import.');
      }
    };
    reader.readAsText(file);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const regularSessions = filteredSessions.filter((s) => !s.isPinned);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight">
                  Gemma 4
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  31B
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Open Intelligence</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-3 space-y-2 border-b border-slate-800/60">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {pinnedSessions.length > 0 && (
            <div className="mb-2">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Pin className="w-3 h-3 text-indigo-400 rotate-45" />
                Pinned
              </span>
              <div className="mt-1 space-y-0.5">
                {pinnedSessions.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    isEditing={editingSessionId === session.id}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      onCloseMobile();
                    }}
                    onStartRename={(e) => handleStartRename(session, e)}
                    onSaveRename={(e) => handleSaveRename(session.id, e)}
                    onCancelRename={handleCancelRename}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePinSession(session.id);
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {regularSessions.length > 0 && (
            <div>
              {pinnedSessions.length > 0 && (
                <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Recent
                </span>
              )}
              <div className="space-y-0.5">
                {regularSessions.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    isEditing={editingSessionId === session.id}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      onCloseMobile();
                    }}
                    onStartRename={(e) => handleStartRename(session, e)}
                    onSaveRename={(e) => handleSaveRename(session.id, e)}
                    onCancelRename={handleCancelRename}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePinSession(session.id);
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No conversations yet. Start one above!
            </div>
          )}
        </div>

        {/* Backup / Export & Model Specs Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2.5">
          {/* Quick specs pill */}
          <button
            onClick={onOpenSpecs}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  Gemma 4 31B IT
                </p>
                <p className="text-[10px] text-slate-400">256K Context Window</p>
              </div>
            </div>
            <span className="text-[10px] text-indigo-400 font-medium">Specs</span>
          </button>

          {/* Import / Export actions */}
          <div className="flex items-center justify-between px-1 text-slate-400">
            <button
              onClick={onExportAll}
              className="flex items-center gap-1 text-[11px] hover:text-slate-200 transition-colors cursor-pointer"
              title="Export all chats as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <label className="flex items-center gap-1 text-[11px] hover:text-slate-200 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </aside>
    </>
  );
};

interface SessionListItemProps {
  session: Session;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  onSelect: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.MouseEvent) => void;
  onCancelRename: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const SessionListItem: React.FC<SessionListItemProps> = ({
  session,
  isActive,
  isEditing,
  editingTitle,
  setEditingTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onTogglePin,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
        isActive
          ? 'bg-slate-800 text-white font-medium shadow-sm'
          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MessageSquare
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            isActive ? 'text-indigo-400' : 'text-slate-500'
          }`}
        />

        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveRename(e as any);
              if (e.key === 'Escape') onCancelRename(e as any);
            }}
            autoFocus
            className="w-full bg-slate-950 px-1.5 py-0.5 rounded border border-indigo-500 text-white text-xs focus:outline-none"
          />
        ) : (
          <span className="truncate">{session.title}</span>
        )}
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <button
              onClick={onSaveRename}
              className="p-1 hover:text-emerald-400 text-slate-400"
              title="Save title"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={onCancelRename}
              className="p-1 hover:text-red-400 text-slate-400"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onTogglePin}
              className={`p-1 hover:text-indigo-300 ${
                session.isPinned ? 'text-indigo-400' : 'text-slate-500'
              }`}
              title={session.isPinned ? 'Unpin' : 'Pin conversation'}
            >
              <Pin className="w-3 h-3 rotate-45" />
            </button>
            <button
              onClick={onStartRename}
              className="p-1 hover:text-slate-200 text-slate-500"
              title="Rename conversation"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:text-red-400 text-slate-500"
              title="Delete conversation"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
