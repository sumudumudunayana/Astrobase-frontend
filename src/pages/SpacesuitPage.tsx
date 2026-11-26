import React from 'react';
import { SpacesuitViewer3D } from '../components/three/SpacesuitViewer3D';
import { Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SpacesuitPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#42D9F5]/10 border border-[#42D9F5]/30 text-[#42D9F5] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Shield className="w-4 h-4" />
            <span>INTERACTIVE EXTRAVEHICULAR MOBILITY UNIT (EMU) LAB</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Spacesuit Architecture & Hotspots
          </h1>

          <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed mb-4">
            Inspect the high-tech life-sustaining envelope worn by spacewalkers. Rotate and zoom into
            the gold-plated visor, Primary Life Support System (PLSS) backpack, communications
            carrier assembly, multi-layer thermal garments, and tactical EVA gloves.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94A3B8]">
            <Link
              to="/lessons/33333333-3333-3333-3333-333333333303"
              className="text-[#42D9F5] hover:underline flex items-center gap-1"
            >
              <span>Accompanying Lesson: Lesson 03 Spacecraft & Spacesuit Systems</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3D Spacesuit Viewer */}
      <SpacesuitViewer3D />
    </div>
  );
};

