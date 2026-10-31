import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  Wrench,
  Activity,
  Layers,
  FileText,
  Cpu,
} from 'lucide-react';
import { CircuitAnalysisResult } from '../types';

interface DiagnosticReportProps {
  analysis: CircuitAnalysisResult | null;
  isAnalyzing: boolean;
  onSelectComponent?: (compName: string) => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  analysis,
  isAnalyzing,
  onSelectComponent,
}) => {
  const [activeTab, setActiveTab] = useState<'verdict' | 'erc' | 'continuity' | 'components' | 'raw'>('verdict');
  const [copied, setCopied] = useState(false);

  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <h4 className="text-base font-medium text-slate-200 mb-1">Executing Hardware Inspection</h4>
        <p className="text-xs font-mono text-slate-400 text-center max-w-sm">
          Tracing electrical nodes, inspecting IC pins, and evaluating electrical rules with zero false-positive constraints...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <Cpu className="w-10 h-10 text-slate-700 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300 mb-1">Awaiting Inspection Trigger</h4>
        <p className="text-xs text-slate-500 max-w-md">
          Load a test scenario or upload a photo of your breadboard/schematic and click &quot;Run Analysis&quot; to inspect continuity, pinouts, and electrical integrity.
        </p>
      </div>
    );
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(analysis.rawMarkdownOutput || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVerdictBadge = () => {
    switch (analysis.verdict) {
      case 'CORRECT':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          title: 'CORRECT',
          sub: 'All verified electrical connections and pin configurations satisfy circuit rules.',
        };
      case 'INCORRECT':
        return {
          bg: 'bg-rose-950/80 border-rose-500/50 text-rose-400',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
          title: 'INCORRECT',
          sub: 'Verifiable physical wiring errors or missing essential hardware signals detected.',
        };
      case 'WARNING / POTENTIAL ISSUE':
      default:
        return {
          bg: 'bg-amber-950/80 border-amber-500/50 text-amber-400',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          title: 'WARNING / POTENTIAL ISSUE',
          sub: 'Visual ambiguity or marginal operating parameters that may lead to intermittent operation.',
        };
    }
  };

  const verdictMeta = getVerdictBadge();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-3 pt-2 bg-slate-950 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verdict')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
              activeTab === 'verdict'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnostic Report
          </button>
          <button
            onClick={() => setActiveTab('erc')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
              activeTab === 'erc'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ERC Rules ({analysis.electricalRuleChecks.length})
          </button>
          <button
            onClick={() => setActiveTab('continuity')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
              activeTab === 'continuity'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Continuity Matrix ({analysis.continuityMatrix.length})
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
              activeTab === 'components'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Components ({analysis.identifiedComponents.length})
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
              activeTab === 'raw'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Output
          </button>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors shrink-0 mb-1"
          title="Copy markdown diagnostic report"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Report'}</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 overflow-y-auto max-h-[620px] space-y-5">
        {activeTab === 'verdict' && (
          <>
            {/* Verdict Hero Banner */}
            <div className={`p-4 rounded-lg border ${verdictMeta.bg}`}>
              <div className="flex items-start gap-3">
                {verdictMeta.icon}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Analysis Verdict:</span>
                    <span className="text-base font-bold font-mono tracking-tight">{verdictMeta.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary || verdictMeta.sub}</p>
                </div>
              </div>
            </div>

            {/* Identified Errors & Miswirings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Identified Errors &amp; Miswirings</span>
              </div>

              {analysis.identifiedErrors.length === 0 ? (
                <div className="p-3.5 bg-slate-950 rounded border border-slate-800 text-xs text-emerald-400 font-mono">
                  None detected with certainty. All traced paths conform to electrical specifications.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analysis.identifiedErrors.map((err, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded border text-xs leading-relaxed ${
                        err.isInconclusive
                          ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                          : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-medium mb-1.5 text-[11px] text-slate-300">
                        <span className="font-semibold text-white">
                          {err.component} · {err.pinOrNode}
                        </span>
                        <span className="text-slate-400">{err.visualLocation}</span>
                      </div>
                      <p className="text-slate-300">
                        <strong className="text-white">Proof: </strong>
                        {err.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Root Cause & Circuit Impact */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Root Cause &amp; Circuit Impact</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {analysis.rootCauseAndImpact}
              </div>
            </div>

            {/* Step-by-Step Remediation */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span>Step-by-Step Remediation</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300">
                <ol className="list-decimal list-inside space-y-1.5">
                  {analysis.stepByStepRemediation.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="text-slate-200">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Safety / Damage Risk */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Safety / Damage Risk</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {analysis.safetyAndDamageRisk}
              </div>
            </div>
          </>
        )}

        {/* ERC Rules Tab */}
        {activeTab === 'erc' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-mono mb-3">
              Automated Electrical Rule Checks (ERC) verifying short circuits, thermal dissipation, pull-ups, and oscillator pins:
            </p>
            <div className="space-y-2">
              {analysis.electricalRuleChecks.map((erc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200 mb-0.5">{erc.check}</div>
                    <div className="text-slate-400 leading-relaxed">{erc.detail}</div>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      erc.status === 'PASS'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : erc.status === 'FAIL'
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {erc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continuity Matrix Tab */}
        {activeTab === 'continuity' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-mono mb-3">
              Electrical node connectivity verification and power domain tracing:
            </p>
            <div className="space-y-2">
              {analysis.continuityMatrix.map((node, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-cyan-400">{node.nodeName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">→ {node.pinsConnected}</span>
                    </div>
                    <div className="text-slate-400">{node.detail}</div>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      node.status === 'VALID'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : node.status === 'OPEN_FAULT' || node.status === 'SHORT_FAULT'
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-mono mb-3">
              Identified ICs, passives, and active devices detected on the workbench:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {analysis.identifiedComponents.map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectComponent && onSelectComponent(comp.name)}
                  className="p-3 rounded bg-slate-950 border border-slate-800 text-xs cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{comp.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {comp.designator || comp.package}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{comp.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Markdown Tab */}
        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Strict Markdown Specification Format</span>
            </div>
            <pre className="p-4 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {analysis.rawMarkdownOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
