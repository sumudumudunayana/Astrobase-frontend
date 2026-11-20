import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  FileText,
  BarChart3,
  Award,
  Sparkles,
} from 'lucide-react';

function HolographicDeskScene({
  activeSection,
}: {
  activeSection: string;
}) {
  const holoChartRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (holoChartRef.current) {
      holoChartRef.current.rotation.y += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sci-Fi Authoring Desk Base */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[4.4, 0.2, 2.2]} />
        <meshStandardMaterial color="#0b1329" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Hologram Projector Emitter Ring */}
      <mesh ref={ringRef} position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.1, 32]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Central Rotating 3D Data Figure Hologram */}
      <group ref={holoChartRef} position={[0, 0, 0]}>
        {/* Holographic 3D Bar Graph Pillars */}
        {[-0.6, -0.2, 0.2, 0.6].map((x, i) => {
          const height = 0.4 + i * 0.35;
          return (
            <mesh key={i} position={[x, (height / 2) - 0.4, 0]}>
              <boxGeometry args={[0.22, height, 0.22]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.6}
                transparent
                opacity={0.85}
                roughness={0.1}
                metalness={0.2}
              />
            </mesh>
          );
        })}

        {/* Orbiting Trend Indicator Line */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[1.8, 0.02, 0.02]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* Left Holographic Manuscript Page: IMRAD Structure */}
      <group position={[-1.7, 0.1, 0]} rotation={[0, 0.25, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 1.8, 0.02]} />
          <meshStandardMaterial
            color="#0f172a"
            transparent
            opacity={0.85}
            emissive="#0284c7"
            emissiveIntensity={0.2}
          />
        </mesh>
        <Html center position={[0, 0.4, 0.05]} className="pointer-events-none select-none text-center">
          <div className="p-2 w-32 space-y-1">
            <div className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700 text-[10px] font-mono font-bold text-cyan-300 truncate">
              {activeSection}
            </div>
            <p className="text-[9px] font-mono text-slate-300 leading-tight">
              IMRAD Protocol: Objectivity & Empirical Citations.
            </p>
          </div>
        </Html>
      </group>

      {/* Right Holographic Manuscript Page: Citations & Evaluation */}
      <group position={[1.7, 0.1, 0]} rotation={[0, -0.25, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 1.8, 0.02]} />
          <meshStandardMaterial
            color="#0f172a"
            transparent
            opacity={0.85}
            emissive="#10b981"
            emissiveIntensity={0.2}
          />
        </mesh>
        <Html center position={[0, 0.4, 0.05]} className="pointer-events-none select-none text-center">
          <div className="p-2 w-32 space-y-1">
            <div className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-[10px] font-mono font-bold text-emerald-300">
              PEER REVIEW
            </div>
            <p className="text-[9px] font-mono text-slate-300 leading-tight">
              NASA Standard: 10/10 // Status: Approved.
            </p>
          </div>
        </Html>
      </group>
    </group>
  );
}

export const ScientificReporting3D: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('HYPOTHESIS & RESULTS');

  const sections = [
    'HYPOTHESIS & RESULTS',
    'EXPERIMENTAL METHOD',
    'DISCUSSION & LIMITS',
    'CITATIONS & REFS',
  ];

  return (
    <div className="w-full rounded-2xl bg-[#050b14] border border-cyan-800/40 p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXP-06 // HOLOGRAPHIC PUBLISHING DESK
            </span>
            <span className="text-xs font-mono text-slate-400">
              Standard IMRAD Architecture & Peer-Review Scrutiny
            </span>
          </div>
          <h3 className="text-base font-bold text-white font-mono tracking-wide">
            Holographic Data Visualization & Publication Manuscript Editor
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-cyan-300 border border-cyan-800/60">
            IMRAD Format Compliant
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-emerald-400 border border-emerald-800/60">
            Status: Peer-Review Accepted
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-xl bg-gradient-to-b from-[#020610] to-[#07111f] border border-slate-800 overflow-hidden">
        <Canvas camera={{ position: [0, 0.4, 4.4], fov: 46 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} color="#bae6fd" />
          <Suspense fallback={null}>
            <HolographicDeskScene activeSection={activeSection} />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} minDistance={2.5} maxDistance={7.0} />
        </Canvas>

        {/* Live Manuscript HUD */}
        <div className="absolute top-3 left-3 bg-[#07111f]/90 border border-cyan-800/80 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-300 backdrop-blur pointer-events-none">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            MANUSCRIPT PIPELINE
          </div>
          <div>Active Chapter: <span className="text-white font-bold">{activeSection}</span></div>
          <div>Data Figures: <span className="text-cyan-300 font-bold">3D Interactive Vector Chart</span></div>
          <div>Peer Status: <span className="text-emerald-400 font-bold">Passed Initial Screening</span></div>
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded border border-slate-800">
          DRAG TO ROTATE // SCROLL TO ZOOM
        </div>
      </div>

      {/* Section Switcher Strip */}
      <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
        <span className="text-xs font-mono text-cyan-400 font-semibold block uppercase">
          Select Active Manuscript Chapter
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all ${
                activeSection === sec
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
