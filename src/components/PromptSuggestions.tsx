import React from 'react';
import {
  Code,
  Brain,
  Sparkles,
  Languages,
  Terminal,
  FileSearch,
} from 'lucide-react';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({
  onSelectPrompt,
}) => {
  const suggestions = [
    {
      icon: <Code className="w-4 h-4 text-emerald-400" />,
      category: 'Coding & Architecture',
      title: 'Distributed Pub/Sub in TypeScript',
      prompt:
        'Write an event-driven in-memory Pub/Sub message broker in TypeScript with backpressure handling, subscriber filters, and type-safe payloads.',
    },
    {
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      category: 'Deep Reasoning',
      title: 'Explain P vs NP and Verification',
      prompt:
        'Explain the P versus NP problem clearly. Why is verifying a solution fundamentally different from finding one, and what are the implications for modern cryptography?',
    },
    {
      icon: <Terminal className="w-4 h-4 text-indigo-400" />,
      category: 'Systems & Algorithms',
      title: 'Design an LRU Cache with O(1) Ops',
      prompt:
        'Implement a Least Recently Used (LRU) Cache in Python using a doubly linked list and hash map. Provide complete unit tests and complexity analysis.',
    },
    {
      icon: <Languages className="w-4 h-4 text-amber-400" />,
      category: 'Multilingual Nuance',
      title: 'Cross-Cultural Idiom Adaptation',
      prompt:
        'Compare how metaphors of resilience and overcoming adversity differ culturally between Japanese (e.g., 七転び八起き), Spanish, and German.',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-pink-400" />,
      category: 'Creative Scribe',
      title: 'Sci-Fi Hard Vacuum Story',
      prompt:
        'Write a high-tension opening scene about an orbital salvage engineer discovering a dormant pre-singularity beacon in deep space.',
    },
    {
      icon: <FileSearch className="w-4 h-4 text-cyan-400" />,
      category: '256K Context Power',
      title: 'Whole-Document Synthesis',
      prompt:
        'How can I leverage Gemma 4 31B\'s 256K token context window to audit large codebases, multi-chapter specifications, or legal contracts?',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Hero Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Google Gemma 4 31B Open Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How can Gemma 4 assist you today?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Dense 31-billion parameter architecture equipped with 256K context,
          multimodal perception, and deep mathematical reasoning.
        </p>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex flex-col text-left p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-850 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              {item.icon}
              <span className="text-[11px] uppercase tracking-wider text-slate-500">
                {item.category}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
