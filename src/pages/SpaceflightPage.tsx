import React from 'react';
import { SpaceflightPhases3D } from '../components/three/SpaceflightPhases3D';
import { Rocket, Compass, Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SpaceflightPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#42D9F5]/10 border border-[#42D9F5]/30 text-[#42D9F5] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Rocket className="w-4 h-4" />
            <span>INTERACTIVE ORBITAL FLIGHT LAB</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Spaceflight Phases Simulation
          </h1>

          <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed mb-4">
            Follow a complete human orbital flight profile from pad ignition and Max-Q atmospheric
            ascent, through orbital insertion, LEO operations, hypersonic re-entry, and landing
            recovery.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94A3B8]">
            <Link
              to="/lessons/33333333-3333-3333-3333-333333333305"
              className="text-[#42D9F5] hover:underline flex items-center gap-1"
            >
              <span>Accompanying Lesson: Lesson 05 Flight Dynamics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3D Interactive Simulator */}
      <SpaceflightPhases3D />
    </div>
  );
};

