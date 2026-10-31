import React, { useState } from 'react';
import { ARCHITECTURES } from '../data/architectures';
import { AlertTriangle, ShieldCheck, Zap, Info, Cpu } from 'lucide-react';

export const PinoutViewer: React.FC = () => {
  const [selectedArchId, setSelectedArchId] = useState<string>('8051');
  const currentArch = ARCHITECTURES.find((a) => a.id === selectedArchId) || ARCHITECTURES[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      {/* Header and selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Microcontroller Hardware Architecture &amp; Pinout Traps</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Critical hardware requirements, active levels, and failure traps that fail silent or trigger bus halt.
          </p>
        </div>

        {/* Chip Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1 rounded border border-slate-800 text-xs font-mono">
          {ARCHITECTURES.map((arch) => (
            <button
              key={arch.id}
              onClick={() => setSelectedArchId(arch.id)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                selectedArchId === arch.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {arch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-950 rounded border border-slate-800 text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">OPERATING SUPPLY</div>
          <div className="font-semibold text-slate-200 font-mono">{currentArch.operatingVoltage}</div>
        </div>
        <div className="p-3.5 bg-slate-950 rounded border border-slate-800 text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">CLOCK &amp; CRYSTAL SPEC</div>
          <div className="font-semibold text-slate-200 font-mono">{currentArch.clockSpec}</div>
        </div>
        <div className="p-3.5 bg-slate-950 rounded border border-slate-800 text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">RESET POLARITY</div>
          <div className="font-semibold text-slate-200 font-mono">{currentArch.resetBehavior}</div>
        </div>
      </div>

      {/* Critical Hardware Traps Checklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Known Microcontroller Hardware Traps (Watch Out!)</span>
        </div>
        <div className="space-y-2">
          {currentArch.criticalTraps.map((trap, idx) => (
            <div
              key={idx}
              className="p-3 bg-amber-950/20 border border-amber-800/40 rounded text-xs text-amber-200/90 leading-relaxed font-mono flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{trap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pin Reference Table */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>High-Risk Pin Map &amp; Interfacing Rules</span>
        </div>
        <div className="border border-slate-800 rounded overflow-hidden">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Pin</th>
                <th className="py-2.5 px-3">Signal</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Function</th>
                <th className="py-2.5 px-3">Hardware Trap / Wiring Caution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-slate-300">
              {currentArch.pins.map((p) => (
                <tr key={p.pin} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-white tabular-nums">#{p.pin}</td>
                  <td className="py-2.5 px-3 font-semibold text-cyan-300">{p.name}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.type === 'POWER'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : p.type === 'GND'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : p.type === 'BOOT' || p.type === 'RESET'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{p.description}</td>
                  <td className="py-2.5 px-3 text-xs">
                    {p.hardwareTrap ? (
                      <span className="text-amber-300 font-medium">{p.hardwareTrap}</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
