import React from 'react';
import { Cpu, Play, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunAnalysis: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunAnalysis,
  onReset,
  isAnalyzing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            CircuitDoctor
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 border-l border-slate-800 pl-2.5">
            Hardware Debugger
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'workbench' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4 font-semibold' : ''
            }`}
          >
            Workbench
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'scenarios' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4 font-semibold' : ''
            }`}
          >
            Test Labs
          </button>
          <button
            onClick={() => setActiveTab('pinouts')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'pinouts' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4 font-semibold' : ''
            }`}
          >
            MCU Traps
          </button>
          <button
            onClick={() => setActiveTab('erc')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'erc' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4 font-semibold' : ''
            }`}
          >
            ERC Rules
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'assistant' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4 font-semibold' : ''
            }`}
          >
            Engineer Q&A
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onReset}
            title="Reset workbench inputs"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Tracing Circuit...' : 'Run Analysis'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
