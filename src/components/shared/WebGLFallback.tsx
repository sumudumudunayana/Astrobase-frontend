import React from 'react';
import { EyeOff, AlertTriangle } from 'lucide-react';

interface WebGLFallbackProps {
  title?: string;
  description?: string;
  heightClass?: string;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({
  title = '3D Simulation Fallback',
  description = 'Interactive 3D view is rendering in tactical 2D telemetry mode.',
  heightClass = 'h-72',
}) => {
  return (
    <div
      className={`w-full ${heightClass} rounded-xl border border-[#1E2E4A] bg-[#0B1424] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-space-grid opacity-30 pointer-events-none" />
      <div className="w-14 h-14 rounded-full bg-[#111E32] border border-[#42D9F5]/30 flex items-center justify-center mb-4 text-[#42D9F5] shadow-lg">
        <EyeOff className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
      <p className="text-sm text-[#94A3B8] max-w-md mt-1 mb-4">{description}</p>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111E32] border border-[#F5B942]/30 text-xs text-[#F5B942]">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Tactical 2D Telemetry Active</span>
      </div>
    </div>
  );
};

