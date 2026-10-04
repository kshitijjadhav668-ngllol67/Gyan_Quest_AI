import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { PromptSuggestions } from './components/PromptSuggestions';
import { ModelSpecsModal } from './components/ModelSpecsModal';
import { SettingsModal } from './components/SettingsModal';
import {
  Message,
  Session,
  ChatSettings,
  ChatImage,
  ModelSpecs,
} from './types/chat';
import { GEMMA_PERSONAS, DEFAULT_CHAT_SETTINGS } from './utils/personas';

const STORAGE_KEY_SESSIONS = 'gemma4_sessions_v1';
const STORAGE_KEY_ACTIVE_ID = 'gemma4_active_session_id_v1';
const STORAGE_KEY_SETTINGS = 'gemma4_settings_v1';

const DEFAULT_SPECS: ModelSpecs = {
  id: 'gemma-4-31b-it',
  fullName: 'models/gemma-4-31b-it',
  displayName: 'Gemma 4 31B IT',
  architecture: 'Dense Decoder-only Transformer',
  parameters: '31 Billion Dense',
  contextWindow: '256,000 tokens',
  inputTokenLimit: 262144,
  outputTokenLimit: 32768,
  license: 'Permissive Commercial (Apache 2.0 Heritage)',
  languages: '140+ Natural Languages & All Major Programming Languages',
  multimodal: true,
  releaseYear: '2026',
};

function createInitialSession(settings: ChatSettings): Session {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    settings: { ...settings },
  };
}

export default function App() {
  // Chat settings
  const [settings, setSettings] = useState<ChatSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return DEFAULT_CHAT_SETTINGS;
  });

  // Sessions
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return [createInitialSession(DEFAULT_CHAT_SETTINGS)];
  });

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (saved) return saved;
    } catch (e) {
      // fallback
    }
    return sessions[0]?.id || '';
  });

  // UI state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [modelSpecs, setModelSpecs] = useState<ModelSpecs>(DEFAULT_SPECS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeSessionId);
  }, [activeSessionId]);

  // Fetch model info on mount
  useEffect(() => {
    fetch('/api/model-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.model) {
          setModelSpecs(data.model);
        }
      })
      .catch((err) => console.log('Loaded local model specs'));
  }, []);

  // Ensure active session exists
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  // Auto-scroll to bottom of chat
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeSessionId]);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom('auto');
    }
  }, [activeSession?.messages, isStreaming]);

  // Session Management
  const handleNewChat = () => {
    if (isStreaming) handleStopStreaming();
    const newSession = createInitialSession(settings);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (isStreaming && activeSessionId === sessionId) {
      handleStopStreaming();
    }

    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createInitialSession(settings);
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
      )
    );
  };

  const handleTogglePinSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
      )
    );
  };

  const handleClearSession = () => {
    if (!activeSession) return;
    if (confirm('Clear all messages in this conversation?')) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, messages: [], updatedAt: Date.now() }
            : s
        )
      );
    }
  };

  const handleExportCurrentChat = () => {
    if (!activeSession || activeSession.messages.length === 0) return;

    let markdown = `# ${activeSession.title}\n\n`;
    markdown += `*Model: Gemma 4 31B IT (Google DeepMind)*\n`;
    markdown += `*Date: ${new Date(activeSession.createdAt).toLocaleString()}*\n\n---\n\n`;

    activeSession.messages.forEach((msg) => {
      const sender = msg.role === 'user' ? '### User' : '### Gemma 4 31B';
      markdown += `${sender}\n\n${msg.content}\n\n`;
      if (msg.image) {
        markdown += `*(Attached Image: ${msg.image.name || 'image'})*\n\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const jsonStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gemma4_31b_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (imported: Session[]) => {
    if (!imported || imported.length === 0) return;
    setSessions((prev) => [...imported, ...prev]);
    setActiveSessionId(imported[0].id);
    alert(`Successfully imported ${imported.length} conversation(s)!`);
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send Message & Streaming Core
  const handleSendMessage = async (text: string, image?: ChatImage) => {
    if (!activeSession) return;
    if (isStreaming) return;

    const userMessageId = `msg_user_${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      image,
    };

    // Auto title if first message
    const isFirstMessage = activeSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? text.length > 32
        ? `${text.substring(0, 32)}...`
        : text
      : activeSession.title;

    const assistantMessageId = `msg_asst_${Date.now() + 1}`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
      modelDisplayName: 'Gemma 4 31B IT',
    };

    const updatedMessages = [...activeSession.messages, userMessage, assistantPlaceholder];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Determine system prompt
    const persona =
      GEMMA_PERSONAS.find((p) => p.id === settings.personaId) || GEMMA_PERSONAS[0];
    const systemInstruction =
      settings.personaId === 'custom'
        ? settings.customSystemPrompt
        : persona.systemInstruction;

    const apiMessages = [...activeSession.messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
      image: m.image
        ? {
            data: m.image.data,
            mimeType: m.image.mimeType,
          }
        : undefined,
    }));

    const startTime = Date.now();
    let accumulatedText = '';
    let responseEngine = 'gemma-4-31b-it';
    let tokensEstimate = 0;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemInstruction,
          temperature: settings.temperature,
          topP: settings.topP,
          topK: settings.topK,
          maxOutputTokens: settings.maxOutputTokens,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            const rawData = line.substring(6).trim();
            if (!rawData) continue;

            try {
              const data = JSON.parse(rawData);

              if (currentEvent === 'chunk' && data.text) {
                accumulatedText += data.text;
                tokensEstimate += Math.ceil(data.text.length / 4);

                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== activeSession.id) return s;
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId
                          ? {
                              ...m,
                              content: accumulatedText,
                              tokensEstimate,
                              isStreaming: true,
                            }
                          : m
                      ),
                    };
                  })
                );
              } else if (currentEvent === 'start') {
                if (data.engine) responseEngine = data.engine;
              } else if (currentEvent === 'done') {
                if (data.tokensGenerated) tokensEstimate = data.tokensGenerated;
              } else if (currentEvent === 'error') {
                accumulatedText += `\n\n*(Error: ${data.message || 'Generation issue'})*`;
              }
            } catch (err) {
              // Parse error
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        accumulatedText += `\n\n*(Note: Generation paused: ${err.message || 'Network error'})*`;
      }
    } finally {
      const durationMs = Date.now() - startTime;
      setIsStreaming(false);
      abortControllerRef.current = null;

      // Finalize assistant message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSession.id) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: accumulatedText || '*(No response received)*',
                    durationMs,
                    tokensEstimate: tokensEstimate || Math.ceil(accumulatedText.length / 4),
                    engine: responseEngine,
                    isStreaming: false,
                  }
                : m
            ),
          };
        })
      );
    }
  };

  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length < 2 || isStreaming) return;

    // Find last user message
    const lastUserIndex = [...activeSession.messages]
      .reverse()
      .findIndex((m) => m.role === 'user');

    if (lastUserIndex === -1) return;

    const actualUserIndex = activeSession.messages.length - 1 - lastUserIndex;
    const lastUserMsg = activeSession.messages[actualUserIndex];

    // Remove everything from the last user message onwards
    const prunedMessages = activeSession.messages.slice(0, actualUserIndex);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id ? { ...s, messages: prunedMessages } : s
      )
    );

    // Resend
    setTimeout(() => {
      handleSendMessage(lastUserMsg.content, lastUserMsg.image);
    }, 50);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.id || ''}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onExportAll={handleExportAll}
        onImportBackup={handleImportBackup}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-radial-gradient from-slate-900/60 to-slate-950">
        {/* Chat Header */}
        <ChatHeader
          session={activeSession}
          settings={settings}
          onOpenSidebarMobile={() => setIsMobileSidebarOpen(true)}
          onOpenSpecs={() => setIsSpecsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearSession={handleClearSession}
          onExportCurrentChat={handleExportCurrentChat}
        />

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800 flex flex-col">
          {activeSession && activeSession.messages.length > 0 ? (
            <div className="flex-1 py-4 divide-y divide-slate-800/30">
              {activeSession.messages.map((message, idx) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isLastAssistant={
                    idx === activeSession.messages.length - 1 &&
                    message.role === 'assistant'
                  }
                  onRegenerate={handleRegenerate}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <PromptSuggestions onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
          <ChatInput
            onSendMessage={handleSendMessage}
            onStopStreaming={handleStopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {/* Technical Specifications Modal */}
      <ModelSpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        specs={modelSpecs}
      />

      {/* Hyperparameters & Persona Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
