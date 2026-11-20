import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Activity,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileCheck,
  Disc,
  Crosshair,
} from 'lucide-react';

interface SampleTarget {
  id: string;
  name: string;
  rockType: string;
  depthCm: number;
  expectedMinerals: string[];
  astrobiologyInterest: string;
}

const SAMPLE_TARGETS: SampleTarget[] = [
  {
    id: 'target1',
    name: 'Skinner Ridge Mudstone',
    rockType: 'Fine-Grained Lacustrine Mudstone',
    depthCm: 6.8,
    expectedMinerals: ['Smectite Clays', 'Aqueous Carbonates', 'Silica'],
    astrobiologyInterest: 'High biosignature preservation potential from ancient delta lake bed.',
  },
  {
    id: 'target2',
    name: 'Wildcat Ridge Sandstone',
    rockType: 'Sulfate-Cemented Delta Sandstone',
    depthCm: 5.4,
    expectedMinerals: ['Sulfates', 'Hematite', 'Aromatics'],
    astrobiologyInterest: 'Rich in organic molecules and saline evaporite crystals.',
  },
  {
    id: 'target3',
    name: 'Apollo 17 Station 6 Boulder',
    rockType: 'Impact Melt Breccia',
    depthCm: 7.2,
    expectedMinerals: ['Plagioclase Feldspar', 'Pyroxene', 'Ilmenite'],
    astrobiologyInterest: 'Chronology marker for South Pole-Aitken basin impact cataclysm.',
  },
];

// 3D Sampling Target Rock & Core Drill Station
const RockOutcropAndDrill: React.FC<{
  stage: 'inspect' | 'abrade' | 'drill' | 'seal';
  drillProgress: number;
}> = ({ stage, drillProgress }) => {
  const drillBitRef = useRef<THREE.Group>(null);
  const dustParticlesRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    // Spin drill bit during drilling or abrading
    if (drillBitRef.current && (stage === 'drill' || stage === 'abrade')) {
      drillBitRef.current.rotation.y += delta * 18;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Planetary Bedrock base */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.4, 4.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Target Specimen Rock */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <dodecahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color="#9a3412" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Abraded patch (visible after inspect stage) */}
      {(stage === 'abrade' || stage === 'drill' || stage === 'seal') && (
        <mesh position={[0, 1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 32]} />
          <meshStandardMaterial color="#fdba74" roughness={0.4} />
        </mesh>
      )}

      {/* Drilled Borehole (visible when drilling or sealed) */}
      {(stage === 'drill' || stage === 'seal') && (
        <mesh position={[0, 1.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 24]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      )}

      {/* Coring Drill Tool Assembly */}
      <group
        position={[0, 2.5 - (drillProgress / 100) * 1.1, 0]}
        ref={drillBitRef}
      >
        {/* Upper drill housing */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.9, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Titanium Core Drill Bit with diamond-impregnated cutting teeth */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.7, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Drill Tip */}
        <mesh position={[0, -0.28, 0]}>
          <coneGeometry args={[0.13, 0.15, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
        </mesh>
      </group>

      {/* Extracted Core Sample Tube (Shown in 'seal' stage) */}
      {stage === 'seal' && (
        <group position={[1.4, 0.7, 0.6]} rotation={[0.2, 0.3, 0]}>
          {/* Gold-coated titanium sample tube */}
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.9, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Sealed Hermetic Endcap */}
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.8} />
          </mesh>
          <Text position={[0, 0, 0.13]} fontSize={0.08} color="#ffffff" anchorX="center">
            CORE-05-A
          </Text>
        </group>
      )}
    </group>
  );
};

export const SampleCollection3D: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<SampleTarget>(SAMPLE_TARGETS[0]);
  const [stage, setStage] = useState<'inspect' | 'abrade' | 'drill' | 'seal'>('inspect');
  const [drillProgress, setDrillProgress] = useState<number>(0);
  const [isDrilling, setIsDrilling] = useState(false);
  const [sampleTubeCount, setSampleTubeCount] = useState<number>(14); // 43 tubes total on Perseverance

  const handleStartAbrasion = () => {
    setStage('abrade');
    setDrillProgress(30);
  };

  const handleStartDrilling = () => {
    setStage('drill');
    setIsDrilling(true);
    let p = 30;
    const interval = setInterval(() => {
      p += 10;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setIsDrilling(false);
        setStage('seal');
      }
      setDrillProgress(p);
    }, 400);
  };

  const handleHermeticSeal = () => {
    setStage('seal');
    setSampleTubeCount((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setStage('inspect');
    setDrillProgress(0);
    setIsDrilling(false);
  };

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Disc className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              PLANETARY SAMPLE CORING & HERMETIC SEALING
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 06 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Rotary Percussive Bit // Ultra-Clean Nitrogen Hermetic Weld // Category V Planetary Protection
            </p>
          </div>
        </div>

        {/* Tube Carousel Inventory */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#050914] px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs font-mono">
            <span className="text-[#64748b]">EMPTY TUBES REMAINING:</span>
            <span className="text-amber-400 font-bold">{sampleTubeCount} / 43</span>
          </div>
          <button
            onClick={handleReset}
            className="p-2 bg-[#0d152a] hover:bg-[#1e293b] text-[#94a3b8] hover:text-white rounded-xl border border-[#1e293b] transition-colors"
            title="Reset Sample Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Simulation Canvas */}
      <div className="relative w-full h-[480px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 2.5, 4.5], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 10, 6]} intensity={1.7} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <RockOutcropAndDrill stage={stage} drillProgress={drillProgress} />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={2.0}
            maxDistance={10}
          />
        </Canvas>

        {/* Sampling Pipeline Step HUD */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-2 min-w-[260px]">
          <span className="text-[#64748b] font-bold">SAMPLING PIPELINE STAGES:</span>
          <div className="space-y-1.5">
            {[
              { key: 'inspect', label: '1. Target Outcrop Survey' },
              { key: 'abrade', label: '2. Diamond Abrasion Bit' },
              { key: 'drill', label: '3. Percussive Coring (6cm)' },
              { key: 'seal', label: '4. Hermetic Seal & Catalog' },
            ].map((st) => (
              <div
                key={st.key}
                className={`p-1.5 rounded-lg flex items-center justify-between ${
                  stage === st.key
                    ? 'bg-cyan-950/80 border border-cyan-500 text-white font-bold'
                    : 'text-[#64748b] bg-[#050914]'
                }`}
              >
                <span>{st.label}</span>
                {stage === st.key && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Drill Progress Overlay */}
        {isDrilling && (
          <div className="absolute top-4 right-4 p-3 rounded-xl bg-cyan-950/90 backdrop-blur-md border border-cyan-500 text-white text-xs font-mono min-w-[220px] space-y-1">
            <div className="flex justify-between">
              <span className="text-cyan-300 font-bold">PENETRATING MATRIX...</span>
              <span>{drillProgress}%</span>
            </div>
            <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${drillProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-cyan-200/80">3,000 impacts/min percussive hammer rate</p>
          </div>
        )}

        {/* Completed Core Specimen Banner */}
        {stage === 'seal' && (
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-emerald-950/90 backdrop-blur-md border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">HERMETIC SEAL CONFIRMED (TUBE ID: CORE-05-A)</span>
                <p className="text-[11px] text-emerald-300/80">
                  Zero Earth biological contamination verified. Stored in internal belly carousel for Mars Sample Return.
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-900 border border-emerald-600 font-bold text-white">
              6.5 cm Core // 12.8 g
            </span>
          </div>
        )}
      </div>

      {/* Control Station & Science Telemetry */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Target Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            Select Rock Target
          </label>
          <div className="space-y-2">
            {SAMPLE_TARGETS.map((target) => (
              <button
                key={target.id}
                onClick={() => {
                  setSelectedTarget(target);
                  handleReset();
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedTarget.id === target.id
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">{target.name}</div>
                <div className="text-[10px] text-[#64748b]">{target.rockType}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Drill Operations Actuator */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Robotic Arm Drill Tool Controls
            </label>
            <div className="space-y-2">
              <button
                onClick={handleStartAbrasion}
                disabled={stage !== 'inspect'}
                className="w-full py-2 px-3 rounded-xl bg-[#0f172a] border border-[#1e293b] enabled:hover:border-amber-500 enabled:hover:text-amber-300 text-slate-300 font-mono text-xs flex items-center justify-between disabled:opacity-40 transition-colors"
              >
                <span>1. Deploy Abrasion Bit (50mm patch)</span>
                {stage !== 'inspect' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={handleStartDrilling}
                disabled={stage !== 'abrade' || isDrilling}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950 border border-cyan-600 enabled:hover:bg-cyan-900 text-white font-mono text-xs flex items-center justify-between disabled:opacity-40 transition-colors"
              >
                <span>2. Extract Core Sample (Rotary Percussive)</span>
                {drillProgress === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={handleHermeticSeal}
                disabled={stage !== 'seal'}
                className="w-full py-2 px-3 rounded-xl bg-emerald-950 border border-emerald-600 enabled:hover:bg-emerald-900 text-white font-mono text-xs flex items-center justify-between disabled:opacity-40 transition-colors"
              >
                <span>3. Hermetic Laser Seal & Archive</span>
                {stage === 'seal' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Scientific Astrobiology Telemetry */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            In-Situ Geochemical Signatures
          </label>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[#64748b]">MINERAL SUITE:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedTarget.expectedMinerals.map((min, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300 text-[10px]"
                  >
                    {min}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[#64748b]">ASTROBIOLOGY RELEVANCE:</span>
              <p className="text-slate-200 mt-0.5">{selectedTarget.astrobiologyInterest}</p>
            </div>
            <div className="pt-1 border-t border-[#1e293b] flex justify-between text-[11px]">
              <span className="text-[#64748b]">Planetary Protection:</span>
              <span className="text-emerald-400 font-bold">Category V Restricted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
