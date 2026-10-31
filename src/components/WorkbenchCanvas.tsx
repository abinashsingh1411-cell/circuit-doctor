import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Crosshair, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { IdentifiedError } from '../types';

interface WorkbenchCanvasProps {
  imageSrc: string | null;
  imageSvg?: string | null;
  errors: IdentifiedError[];
  onProbePoint: (point: { x: number; y: number; label: string }) => void;
  probePoints: { x: number; y: number; label: string }[];
}

export const WorkbenchCanvas: React.FC<WorkbenchCanvasProps> = ({
  imageSrc,
  imageSvg,
  errors,
  onProbePoint,
  probePoints,
}) => {
  const [zoom, setZoom] = useState(1);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCursorPos({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
    const label = `Node @ [X:${x}%, Y:${y}%]`;
    onProbePoint({ x, y, label });
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const resetZoom = () => setZoom(1);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Canvas Tool Ribbon */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300 font-sans font-medium">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            Inspection Stage
          </span>
          {cursorPos && (
            <span className="text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40 tabular-nums">
              X: {cursorPos.x}% · Y: {cursorPos.y}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-500 mr-2 tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            onClick={zoomOut}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={zoomIn}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="relative flex-1 min-h-[360px] max-h-[560px] overflow-auto bg-slate-950 bg-grid-tech flex items-center justify-center p-4 cursor-crosshair select-none"
      >
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="relative transition-transform duration-150 ease-out max-w-full"
        >
          {imageSvg ? (
            <div
              className="rounded shadow-xl border border-slate-800 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: imageSvg }}
            />
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt="Circuit prototype inspection view"
              className="max-h-[500px] w-auto object-contain rounded shadow-xl border border-slate-800"
            />
          ) : (
            <div className="text-center p-12 text-slate-500 font-mono text-xs">
              <Crosshair className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No image loaded. Upload a photo, capture via webcam, or pick a Test Lab preset.</span>
            </div>
          )}

          {/* User Placed Probe Markers */}
          {probePoints.map((p, i) => (
            <div
              key={i}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
              <div className="relative">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 bg-cyan-500/30 animate-ping absolute -inset-0" />
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 bg-cyan-400/80 flex items-center justify-center shadow-lg">
                  <span className="text-[9px] font-bold text-slate-950 font-mono">{i + 1}</span>
                </div>
                <div className="absolute left-5 top-0 bg-slate-950/90 text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-md">
                  Probe #{i + 1}
                </div>
              </div>
            </div>
          ))}

          {/* Error Highlights */}
          {errors.map((err, idx) => (
            <div
              key={idx}
              className="mt-2 text-xs"
            />
          ))}
        </div>

        {/* Floating Instruction Hint */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded text-[11px] font-mono text-slate-400 pointer-events-none flex items-center gap-2">
          <span>Click canvas to place physical multimeter/oscilloscope probe flags</span>
        </div>
      </div>
    </div>
  );
};
