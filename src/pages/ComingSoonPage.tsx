import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Rocket, ArrowLeft, Clock } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  category: string;
  phase?: string;
  description: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  category,
  phase = 'PHASE 02 MILESTONE',
  description,
}) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
      <div className="glass-panel p-8 md:p-12 rounded-2xl border border-[#1E2E4A] max-w-xl w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-space-grid opacity-20 pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-[#111E32] border border-[#F5B942]/30 flex items-center justify-center text-[#F5B942] mx-auto mb-6 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111E32] border border-[#1E2E4A] text-[#F5B942] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>{phase}</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide mb-1">
          {title}
        </h1>
        <span className="text-xs font-mono text-[#42D9F5] block mb-4 uppercase tracking-wider">
          {category}
        </span>

        <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
          {description}
        </p>

        <div className="p-4 rounded-xl bg-[#0B1424] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] mb-6">
          <p className="text-[#E2E8F0] font-semibold mb-1">
            Status: Under Active Systems Engineering
          </p>
          <p className="text-[11px]">
            This mission module is scheduled for development in subsequent milestones. Module 01
            (Astronaut Fundamentals) is fully accessible now.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/academy/astronaut-fundamentals"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#42D9F5] text-[#050914] font-bold text-xs font-mono tracking-wide hover:bg-[#38bdf8] transition-colors flex items-center justify-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            <span>Open Astronaut Fundamentals</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#111E32] border border-[#1E2E4A] text-white text-xs font-mono hover:border-[#42D9F5] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

