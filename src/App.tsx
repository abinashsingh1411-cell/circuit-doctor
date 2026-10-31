import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorkbenchCanvas } from './components/WorkbenchCanvas';
import { DiagnosticReport } from './components/DiagnosticReport';
import { InputControlPanel } from './components/InputControlPanel';
import { AssistantChat } from './components/AssistantChat';
import { PinoutViewer } from './components/PinoutViewer';
import { ErcRuleGuide } from './components/ErcRuleGuide';
import { SAMPLE_SCENARIOS, SampleScenario } from './data/sampleScenarios';
import { CircuitAnalysisResult } from './types';
import { AlertCircle, Terminal, Cpu, Info, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('workbench');
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>('8051');

  // Input states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageSvg, setImageSvg] = useState<string | null>(SAMPLE_SCENARIOS[0].imageSvg);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [circuitDescription, setCircuitDescription] = useState<string>(SAMPLE_SCENARIOS[0].description);
  const [netlistText, setNetlistText] = useState<string>(SAMPLE_SCENARIOS[0].netlist || '');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [probingNotes, setProbingNotes] = useState<string>(SAMPLE_SCENARIOS[0].userProbingNotes || '');
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>(SAMPLE_SCENARIOS[0].id);

  // Probe points on the image canvas
  const [probePoints, setProbePoints] = useState<{ x: number; y: number; label: string }[]>([
    { x: 53.8, y: 28.0, label: 'Pin 31 /EA (Floating Trap)' },
  ]);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<CircuitAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scenario selection
  const handleSelectScenario = (scenario: SampleScenario) => {
    setActiveScenarioId(scenario.id);
    setImageSvg(scenario.imageSvg);
    setImageSrc(null);
    setCircuitDescription(scenario.description);
    setNetlistText(scenario.netlist || '');
    setCodeSnippet(scenario.codeSnippet || '');
    setProbingNotes(scenario.userProbingNotes || '');
    setAnalysisResult(null);
    setErrorMessage(null);

    // Map category to architecture
    if (scenario.category === '8051') setSelectedArchitecture('8051');
    else if (scenario.category === 'ARM7') setSelectedArchitecture('lpc2148');
    else if (scenario.category === 'AVR') setSelectedArchitecture('avr_arduino');
    else if (scenario.category === 'STM32') setSelectedArchitecture('stm32');
    else setSelectedArchitecture('general');

    // Default probe points
    if (scenario.id === '8051-floating-ea') {
      setProbePoints([{ x: 53.8, y: 28.0, label: 'Pin 31 /EA (Floating Trap)' }]);
    } else if (scenario.id === 'breadboard-split-rail-gap') {
      setProbePoints([
        { x: 49.5, y: 17.5, label: 'Split Gap (Cols 30-31)' },
        { x: 67.5, y: 37.5, label: 'Pin 7 VCC (Unpowered)' },
      ]);
    } else if (scenario.id === 'led-direct-gpio-hazard') {
      setProbePoints([{ x: 58.0, y: 49.0, label: 'LED Anode direct to GPIO' }]);
    } else {
      setProbePoints([]);
    }

    setActiveTab('workbench');
  };

  const handleImageSelected = (base64: string, mime: string, svgContent?: string) => {
    setImageSrc(base64);
    setImageSvg(svgContent || null);
    setMimeType(mime);
    setActiveScenarioId(undefined);
  };

  const handleClearImage = () => {
    setImageSrc(null);
    setImageSvg(null);
    setActiveScenarioId(undefined);
    setProbePoints([]);
  };

  const handleProbePoint = (point: { x: number; y: number; label: string }) => {
    setProbePoints((prev) => [...prev.slice(-4), point]);
    setProbingNotes((prev) => {
      const probeStr = `Probed ${point.label}`;
      return prev ? `${prev} | ${probeStr}` : probeStr;
    });
  };

  const handleReset = () => {
    setImageSrc(null);
    setImageSvg(null);
    setCircuitDescription('');
    setNetlistText('');
    setCodeSnippet('');
    setProbingNotes('');
    setProbePoints([]);
    setAnalysisResult(null);
    setActiveScenarioId(undefined);
    setErrorMessage(null);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setActiveTab('workbench');

    try {
      const response = await fetch('/api/analyze-circuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageSrc,
          mimeType: mimeType,
          description: circuitDescription,
          architecture: selectedArchitecture,
          netlist: netlistText,
          codeSnippet: codeSnippet,
          userProbingNotes: probingNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const result: CircuitAnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err.message || 'Inspection failed. Check backend logs or API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation conforming to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunAnalysis={handleRunAnalysis}
        onReset={handleReset}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-lg flex items-center justify-between gap-3 text-xs text-rose-300 font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-xs px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switching */}
        {activeTab === 'workbench' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Input Control Panel & Physical Probing */}
            <div className="lg:col-span-5 space-y-5">
              <InputControlPanel
                onImageSelected={handleImageSelected}
                selectedArchitecture={selectedArchitecture}
                onSelectArchitecture={setSelectedArchitecture}
                circuitDescription={circuitDescription}
                setCircuitDescription={setCircuitDescription}
                netlistText={netlistText}
                setNetlistText={setNetlistText}
                codeSnippet={codeSnippet}
                setCodeSnippet={setCodeSnippet}
                probingNotes={probingNotes}
                setProbingNotes={setProbingNotes}
                onSelectScenario={handleSelectScenario}
                activeScenarioId={activeScenarioId}
                hasImage={Boolean(imageSrc || imageSvg)}
                onClearImage={handleClearImage}
              />

              {/* Quick Workbench Status HUD */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Rigorous Inspection Rules Active
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    ZERO FALSE-POSITIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  The debugging assistant requires direct visual evidence before declaring any node disconnected. If visual angle occludes a wire, it explicitly returns <code className="text-amber-300 font-mono text-[10px]">[INCONCLUSIVE]</code> rather than guessing.
                </div>
              </div>
            </div>

            {/* Right Column: Visual Stage Canvas & Diagnostic Report */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Inspection Stage Canvas */}
              <WorkbenchCanvas
                imageSrc={imageSrc}
                imageSvg={imageSvg}
                errors={analysisResult?.identifiedErrors || []}
                onProbePoint={handleProbePoint}
                probePoints={probePoints}
              />

              {/* Diagnostic Verification Report */}
              <DiagnosticReport
                analysis={analysisResult}
                isAnalyzing={isAnalyzing}
                onSelectComponent={(compName) => {
                  setCircuitDescription((prev) => `${prev}\nFocus on component: ${compName}`);
                }}
              />
            </div>
          </div>
        )}

        {/* Test Labs Preset Explorer */}
        {activeTab === 'scenarios' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Curated Hardware Debugging Test Labs</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Pre-configured hardware test benches showcasing classic pitfalls, sound circuit proof, and uncertainty handling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario)}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-900/90 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                        {scenario.tag}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                          scenario.expectedVerdict === 'CORRECT'
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                            : scenario.expectedVerdict === 'INCORRECT'
                            ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                            : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        {scenario.expectedVerdict}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                      {scenario.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {scenario.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Arch: {scenario.category}</span>
                    <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                      Load Scenario →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Microcontroller Pinout & Hardware Traps Reference */}
        {activeTab === 'pinouts' && <PinoutViewer />}

        {/* Electrical Rule Checks (ERC) & Constitutional Rules */}
        {activeTab === 'erc' && <ErcRuleGuide />}

        {/* Interactive Consultation Assistant */}
        {activeTab === 'assistant' && (
          <div className="max-w-4xl mx-auto">
            <AssistantChat
              analysis={analysisResult}
              activeScenarioName={activeScenarioId}
              architecture={selectedArchitecture}
            />
          </div>
        )}
      </main>
    </div>
  );
}
