import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileCode,
  ListFilter,
  CheckCircle,
  FlaskConical,
  X,
  Gauge,
  Sliders,
} from 'lucide-react';
import { SAMPLE_SCENARIOS, SampleScenario } from '../data/sampleScenarios';

interface InputControlPanelProps {
  onImageSelected: (base64: string, mimeType: string, svgContent?: string) => void;
  selectedArchitecture: string;
  onSelectArchitecture: (arch: string) => void;
  circuitDescription: string;
  setCircuitDescription: (desc: string) => void;
  netlistText: string;
  setNetlistText: (netlist: string) => void;
  codeSnippet: string;
  setCodeSnippet: (code: string) => void;
  probingNotes: string;
  setProbingNotes: (notes: string) => void;
  onSelectScenario: (scenario: SampleScenario) => void;
  activeScenarioId?: string;
  hasImage: boolean;
  onClearImage: () => void;
}

export const InputControlPanel: React.FC<InputControlPanelProps> = ({
  onImageSelected,
  selectedArchitecture,
  onSelectArchitecture,
  circuitDescription,
  setCircuitDescription,
  netlistText,
  setNetlistText,
  codeSnippet,
  setCodeSnippet,
  probingNotes,
  setProbingNotes,
  onSelectScenario,
  activeScenarioId,
  hasImage,
  onClearImage,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'camera' | 'text' | 'scenarios'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onImageSelected(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Webcam camera handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onImageSelected(dataUrl, 'image/jpeg');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Target Architecture Selector Bar */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Target Architecture &amp; Pin Rules
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-mono">
          {[
            { id: 'general', label: 'Analog / Discrete' },
            { id: '8051', label: '8051 (AT89C51)' },
            { id: 'lpc2148', label: 'ARM7 (LPC2148)' },
            { id: 'avr_arduino', label: 'AVR / Arduino' },
            { id: 'stm32', label: 'STM32 (F103)' },
          ].map((arch) => (
            <button
              key={arch.id}
              onClick={() => onSelectArchitecture(arch.id)}
              className={`px-2.5 py-1.5 rounded transition-colors text-left truncate ${
                selectedArchitecture === arch.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {arch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Mode Navigation */}
      <div className="flex items-center justify-between px-3 pt-2 bg-slate-950/70 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveInputTab('upload')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeInputTab === 'upload'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo / Schematic
          </button>
          <button
            onClick={() => setActiveInputTab('camera')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeInputTab === 'camera'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Live Bench Cam
          </button>
          <button
            onClick={() => setActiveInputTab('scenarios')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeInputTab === 'scenarios'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Test Labs ({SAMPLE_SCENARIOS.length})
          </button>
          <button
            onClick={() => setActiveInputTab('text')}
            className={`px-3 py-2 rounded-t transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeInputTab === 'text'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Netlist &amp; Code
          </button>
        </div>

        {hasImage && (
          <button
            onClick={onClearImage}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded transition-colors mb-1"
          >
            <X className="w-3 h-3" />
            Clear Image
          </button>
        )}
      </div>

      {/* Input Mode Panels */}
      <div className="p-4 flex-1">
        {/* Upload Mode */}
        {activeInputTab === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-lg p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all flex flex-col items-center justify-center min-h-[160px]"
            >
              <Upload className="w-8 h-8 text-cyan-400/80 mb-2" />
              <div className="text-xs font-semibold text-slate-200">
                Click to upload physical breadboard photo, schematic, or netlist
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Supports PNG, JPG, WEBP, SVG · High resolution recommended for pin-level tracing
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Circuit Description Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Intended Circuit Function / Known Symptoms (Optional)
              </label>
              <textarea
                value={circuitDescription}
                onChange={(e) => setCircuitDescription(e.target.value)}
                rows={2}
                placeholder="e.g., 8051 running LED blink on Port 0 with 11.0592MHz crystal, but MCU won't boot..."
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>
        )}

        {/* Live Bench Camera */}
        {activeInputTab === 'camera' && (
          <div className="space-y-3">
            <div className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden min-h-[220px] flex items-center justify-center">
              {isCameraActive ? (
                <div className="w-full h-full flex flex-col items-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-h-[300px] object-contain bg-black"
                  />
                  <div className="p-3 bg-slate-950/90 w-full flex items-center justify-center gap-3 border-t border-slate-800">
                    <button
                      onClick={captureCameraFrame}
                      className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold font-mono rounded transition-colors"
                    >
                      Freeze &amp; Inspect Frame
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-8 h-8 text-cyan-400 mx-auto" />
                  <div className="text-xs text-slate-300 font-medium">Capture directly from your bench camera</div>
                  <p className="text-[11px] font-mono text-slate-500 max-w-xs mx-auto">
                    Position camera directly overhead perpendicular to the breadboard to eliminate perspective occlusion.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono rounded border border-slate-700 transition-colors"
                  >
                    Start Bench Camera
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Labs Preset Scenarios */}
        {activeInputTab === 'scenarios' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
              <span>Curated Physical Prototypes &amp; Hardware Traps</span>
              <span className="text-[10px] text-slate-500">Click to load instantly</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1">
              {SAMPLE_SCENARIOS.map((scenario) => {
                const isActive = activeScenarioId === scenario.id;
                return (
                  <div
                    key={scenario.id}
                    onClick={() => onSelectScenario(scenario)}
                    className={`p-3 rounded border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200">{scenario.title}</span>
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
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Netlist & Code Tab */}
        {activeInputTab === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Netlist / Schematic Pinout Wire List
              </label>
              <textarea
                value={netlistText}
                onChange={(e) => setNetlistText(e.target.value)}
                rows={3}
                placeholder="U1 8051: Pin 40 -> 5V, Pin 20 -> GND, Pin 31 -> FLOATING..."
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Embedded Firmware / Reset Vector Code Snippet
              </label>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                rows={3}
                placeholder="// e.g. main() GPIO configuration, clock PLL registers, or interrupt setup..."
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>
        )}

        {/* Multimeter Probing Notes */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            Multimeter / Oscilloscope Probe Measurements (Optional)
          </label>
          <input
            type="text"
            value={probingNotes}
            onChange={(e) => setProbingNotes(e.target.value)}
            placeholder="e.g. Pin 40 measures 5.01V, Pin 31 measures 0.12V, XTAL Pin 18 measures 11.05MHz 2Vpp..."
            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
          />
        </div>
      </div>
    </div>
  );
};
