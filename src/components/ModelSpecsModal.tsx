import React from 'react';
import {
  X,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Zap,
  BookOpen,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { ModelSpecs } from '../types/chat';

interface ModelSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  specs: ModelSpecs;
}

export const ModelSpecsModal: React.FC<ModelSpecsModalProps> = ({
  isOpen,
  onClose,
  specs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {specs.displayName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Model
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {specs.fullName}
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

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-medium">
              <Layers className="w-4 h-4" />
              <span>Parameters</span>
            </div>
            <p className="text-base font-bold text-white mt-1">31B Dense</p>
            <p className="text-[11px] text-slate-400">Pure dense transformer</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-medium">
              <Zap className="w-4 h-4" />
              <span>Context</span>
            </div>
            <p className="text-base font-bold text-white mt-1">256K Tokens</p>
            <p className="text-[11px] text-slate-400">~200,000 words</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-pink-400 text-xs font-medium">
              <Globe className="w-4 h-4" />
              <span>Languages</span>
            </div>
            <p className="text-base font-bold text-white mt-1">140+ Langs</p>
            <p className="text-[11px] text-slate-400">Multilingual parity</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>License</span>
            </div>
            <p className="text-base font-bold text-white mt-1">Permissive</p>
            <p className="text-[11px] text-slate-400">Apache 2.0 open</p>
          </div>
        </div>

        {/* Deep Tech Specs Table */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Architecture & Benchmarks
          </h4>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80 text-xs">
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-400">Base Architecture</span>
              <span className="font-medium text-slate-200">{specs.architecture}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-400">Input Token Limit</span>
              <span className="font-mono text-slate-200">
                {specs.inputTokenLimit.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-400">Max Generation Limit</span>
              <span className="font-mono text-slate-200">
                {specs.outputTokenLimit.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-400">Multimodal Capabilities</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Text, Vision, Document Analysis
              </span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-400">Target Workloads</span>
              <span className="text-slate-200 text-right">
                Agentic workflows, Deep Reasoning, SOTA Coding, Multilingual
              </span>
            </div>
          </div>

          {/* Model Family Evolution */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-900/40">
            <h5 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              What makes Gemma 4 31B special?
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gemma 4 31B bridges the gap between local open-weights execution and
              cloud-scale frontier intelligence. Featuring dense attention mechanisms, 
              native multi-turn instruction following, and a 256K extended context window, 
              it allows in-depth code audits, whole-document comprehension, and complex mathematical deductions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
};
