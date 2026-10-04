import React from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Code2,
  BrainCircuit,
  Feather,
  Languages,
  Settings2,
  RotateCcw,
} from 'lucide-react';
import { ChatSettings } from '../types/chat';
import { GEMMA_PERSONAS, DEFAULT_CHAT_SETTINGS } from '../utils/personas';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onUpdateSettings: (newSettings: ChatSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-4 h-4 text-purple-400" />;
      case 'Feather':
        return <Feather className="w-4 h-4 text-pink-400" />;
      case 'Languages':
        return <Languages className="w-4 h-4 text-amber-400" />;
      case 'Settings2':
        return <Settings2 className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const handlePersonaSelect = (personaId: string) => {
    onUpdateSettings({
      ...settings,
      personaId,
    });
  };

  const handleReset = () => {
    onUpdateSettings(DEFAULT_CHAT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gemma 4 Configuration</h3>
              <p className="text-xs text-slate-400">
                Tune model persona and generation hyperparameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selection */}
        <div className="mt-5 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            System Persona
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {GEMMA_PERSONAS.map((p) => {
              const isSelected = settings.personaId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePersonaSelect(p.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/50'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getPersonaIcon(p.icon)}
                    <span className="text-xs font-semibold">{p.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {p.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Prompt Textarea if Custom selected */}
        {settings.personaId === 'custom' && (
          <div className="mt-4 space-y-1.5 animate-in fade-in duration-150">
            <label className="text-xs font-semibold text-slate-300">
              Custom System Directive
            </label>
            <textarea
              value={settings.customSystemPrompt}
              onChange={(e) =>
                onUpdateSettings({ ...settings, customSystemPrompt: e.target.value })
              }
              placeholder="e.g. You are an expert NASA orbital mechanics researcher. Always use SI units and cite formulas."
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Hyperparameters */}
        <div className="mt-6 space-y-5 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sampling Parameters
          </h4>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Temperature</span>
              <span className="font-mono text-indigo-400 font-semibold">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={settings.temperature}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.0 (Deterministic / Code)</span>
              <span>0.7 (Default)</span>
              <span>1.5 (Creative)</span>
            </div>
          </div>

          {/* Top-P */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Top-P (Nucleus Sampling)</span>
              <span className="font-mono text-indigo-400 font-semibold">
                {settings.topP.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.topP}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  topP: parseFloat(e.target.value),
                })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Max Output Tokens */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Max Output Tokens</span>
              <span className="font-mono text-indigo-400 font-semibold">
                {settings.maxOutputTokens} tokens
              </span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="256"
              value={settings.maxOutputTokens}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  maxOutputTokens: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
