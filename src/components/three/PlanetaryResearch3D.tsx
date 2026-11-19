import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Activity,
  Sliders,
  Globe2,
  Layers,
  Sparkles,
} from 'lucide-react';

function PlanetaryCoreScene({
  targetBody,
  depthCm,
}: {
  targetBody: 'MOON' | 'MARS';
  depthCm: number;
}) {
  const laserBeam = useRef<THREE.Mesh>(null);
  const sampleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (laserBeam.current) {
      laserBeam.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.0) * 0.05;
    }
  });

  const isMars = targetBody === 'MARS';
  const laserY = 1.0 - (depthCm / 50.0) * 2.0;

  return (
    <group position={[0, 0, 0]}>
      {/* Curation Glovebox Tray */}
      <mesh position={[0, -1.3, 0]}>
        <boxGeometry args={[4.2, 0.25, 2.2]} />
        <meshStandardMaterial color="#0b1329" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Titanium Sample Curation Sleeve */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 2.4, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Internal Stratigraphic Core Column */}
      <group ref={sampleRef} position={[0, 0, 0]}>
        {/* Layer 1: Top surface regolith (0-15cm) */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.7, 32]} />
          <meshStandardMaterial
            color={isMars ? '#b45309' : '#64748b'}
            roughness={0.9}
          />
        </mesh>

        {/* Layer 2: Intermediate sediment / volcanic basalt (15-35cm) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.7, 32]} />
          <meshStandardMaterial
            color={isMars ? '#78350f' : '#475569'}
            roughness={0.8}
          />
        </mesh>

        {/* Layer 3: Deep ancient bedrock / smectite clay horizon (35-50cm) */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.7, 32]} />
          <meshStandardMaterial
            color={isMars ? '#0d9488' : '#334155'}
            roughness={0.7}
          />
        </mesh>
      </group>

      {/* Raman / Infrared Spectrometer Probe Head */}
      <group position={[1.4, laserY, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        <mesh position={[-0.26, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={isMars ? '#2dd4bf' : '#38bdf8'} />
        </mesh>

        {/* Laser Targeting Beam */}
        <mesh position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.02, 0.9, 8]} />
          <meshBasicMaterial color={isMars ? '#2dd4bf' : '#38bdf8'} transparent opacity={0.85} />
        </mesh>

        <Html center position={[0.7, 0, 0]} className="pointer-events-none select-none whitespace-nowrap">
          <div className="px-2 py-0.5 rounded bg-[#09172a]/90 border border-slate-700 text-[10px] font-mono font-bold text-slate-300">
            Depth: {depthCm} cm
          </div>
        </Html>
      </group>

      {/* Core Identification Markings */}
      <Html center position={[0, 1.35, 0]} className="pointer-events-none select-none whitespace-nowrap">
        <div className="px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-[11px] font-mono font-bold text-cyan-300">
          {isMars ? 'MARS // JEZERO CRATER DELTA CORE' : 'MOON // SHACKLETON CRATER CORE'}
        </div>
      </Html>
    </group>
  );
}

export const PlanetaryResearch3D: React.FC = () => {
  const [targetBody, setTargetBody] = useState<'MOON' | 'MARS'>('MARS');
  const [depthCm, setDepthCm] = useState<number>(38);

  const isMars = targetBody === 'MARS';
  const hasHydratedClays = isMars && depthCm >= 30;

  return (
    <div className="w-full rounded-2xl bg-[#050b14] border border-cyan-800/40 p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXP-05 // PLANETARY STRATIGRAPHY & SPECTROSCOPY
            </span>
            <span className="text-xs font-mono text-slate-400">
              In-Situ Core Drill Curation & Mineralogical Reflection
            </span>
          </div>
          <h3 className="text-base font-bold text-white font-mono tracking-wide">
            Planetary Regolith Core Inspection & Aqueous Mineral Signatures
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-cyan-300 border border-cyan-800/60">
            VNIR Range: 400 - 2500 nm
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-emerald-400 border border-emerald-800/60">
            Depth: {depthCm} cm / 50 cm
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-xl bg-gradient-to-b from-[#020610] to-[#07111f] border border-slate-800 overflow-hidden">
        <Canvas camera={{ position: [0, 0.3, 4.4], fov: 48 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} color="#bae6fd" />
          <directionalLight position={[-4, 4, 3]} intensity={1.0} color="#fed7aa" />
          <Suspense fallback={null}>
            <PlanetaryCoreScene targetBody={targetBody} depthCm={depthCm} />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} minDistance={2.5} maxDistance={7.0} />
        </Canvas>

        {/* Real-time Spectrometer Spectral Readout HUD */}
        <div className="absolute top-3 left-3 bg-[#07111f]/90 border border-cyan-800/80 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-300 backdrop-blur pointer-events-none max-w-xs">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            SPECTRAL ABSORPTION TELEMETRY
          </div>
          <div>Core Origin: <span className="text-white font-bold">{targetBody}</span></div>
          <div>Probe Position: <span className="text-cyan-300 font-bold">{depthCm} cm Depth</span></div>
          <div>Stratigraphic Unit: <span className="text-amber-400 font-bold">{depthCm < 15 ? 'Surface Regolith' : depthCm < 35 ? 'Basaltic Volcanics' : 'Smectite Phyllosilicates'}</span></div>
          <div>Aqueous Signature: <span className={hasHydratedClays ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{hasHydratedClays ? 'Strong Hydration Dip (2.2 μm)' : 'Anhydrous / Dry Silicate'}</span></div>
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded border border-slate-800">
          DRAG TO ROTATE // SCROLL TO ZOOM // SLIDE DEPTH TO SCAN
        </div>
      </div>

      {/* Interactive Controls Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Celestial Body Toggle */}
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-cyan-400 font-semibold block uppercase">
            1. Select Planetary Body Core
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTargetBody('MARS')}
              className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all ${
                targetBody === 'MARS'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Mars (Jezero Crater)
            </button>
            <button
              onClick={() => setTargetBody('MOON')}
              className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all ${
                targetBody === 'MOON'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Moon (South Pole)
            </button>
          </div>
        </div>

        {/* Raman Laser Depth Position Slider */}
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
              2. Raman Spectrometer Depth Scan
            </span>
            <span className="text-xs font-mono font-bold text-white">{depthCm} cm</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={depthCm}
            onChange={(e) => setDepthCm(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
