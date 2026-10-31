import React from 'react';
import { ShieldCheck, Eye, Compass, AlertOctagon, HelpCircle, CheckCircle2 } from 'lucide-react';

export const ErcRuleGuide: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>Electrical Rule Checks (ERC) &amp; Rigorous Analytical Protocol</span>
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Constitutional operating rules preventing false positives and ensuring verifiable, evidence-backed hardware debugging.
        </p>
      </div>

      {/* 3 Critical Operating Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 bg-slate-950 rounded border border-cyan-800/40 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>1. Zero Tolerance for Lazy Defaults</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Never output generic warnings like &quot;missing VCC&quot;, &quot;missing ground&quot;, or &quot;missing clock oscillator&quot; unless the exact pin has been visually traced and confirmed to be completely floating or unpowered. If an onboard regulator, USB supply, or internal oscillator provides power/clock, it is NEVER flagged as missing.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded border border-cyan-800/40 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
            <Eye className="w-4 h-4 shrink-0" />
            <span>2. Visual Evidence Requirement</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every reported error or missing connection MUST quote or point to the exact visual coordinate [X%, Y%], tie-point column, or pin number in the image/diagram, explaining why the current physical wiring fails.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded border border-cyan-800/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>3. Uncertainty Handling</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            If an image angle, wire clutter, or low resolution prevents clearly tracing a connection, the assistant explicitly states:
            <br />
            <span className="text-amber-300 font-bold block mt-1">
              &quot;[INCONCLUSIVE: Cannot clearly trace wire path due to visual angle]&quot;
            </span>
            rather than assuming it is broken.
          </p>
        </div>
      </div>

      {/* 3-Step Analytical Inspection Procedure */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
          <span>Three-Stage Circuit Inspection Methodology</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="p-3.5 bg-slate-950 rounded border border-slate-800 flex items-start gap-3">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold shrink-0">
              STEP 1
            </span>
            <div>
              <div className="font-bold text-white mb-0.5">Component Identification</div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Catalog every IC package (DIP, SOIC, QFP), notch orientation, pin 1 dot marker, discrete resistors, electrolytic/ceramic capacitors, crystal oscillators, power rails, jumper bridges, and microcontroller headers.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded border border-slate-800 flex items-start gap-3">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold shrink-0">
              STEP 2
            </span>
            <div>
              <div className="font-bold text-white mb-0.5">Continuity &amp; Connectivity Logic</div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Trace node connections from power sources to IC pins. Specifically detect breadboard center power rail split gaps (columns 30-31), inverted IC orientation, floating reset/boot pins, and open-drain pull-up requirements.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded border border-slate-800 flex items-start gap-3">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold shrink-0">
              STEP 3
            </span>
            <div>
              <div className="font-bold text-white mb-0.5">Electrical Rule Checks (ERC)</div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Check for direct short circuits (VCC to GND), missing series current-limiting resistors for LEDs (preventing overcurrent destruction), floating CMOS inputs, voltage level mismatches (5V into non-tolerant 3.3V GPIOs), and thermal dissipation overratings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
