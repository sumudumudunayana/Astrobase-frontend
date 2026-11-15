import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  CheckCircle2,
  Gauge,
  HeartPulse,
  Search,
  ArrowRight,
  ShieldCheck,
  DoorClosed,
} from 'lucide-react';

interface RepressStage {
  stageId: number;
  title: string;
  category: string;
  chamberPressureKpa: number;
  hatchStatus: string;
  suitState: string;
  description: string;
  mmodCheckPassed: boolean;
}

const REPRESS_STAGES: RepressStage[] = [
  {
    stageId: 1,
    title: 'Crewlock Ingress & Outer Hatch Latching',
    category: 'INGRESS',
    chamberPressureKpa: 0.0,
    hatchStatus: 'Outer Hatch Locked (12 Latches Engaged)',
    suitState: 'Autonomous PLSS Active (29.6 kPa pure O2)',
    description: 'Both spacewalkers enter the Crewlock. Outer hatch is pulled closed and sealed with the mechanical gearbox dogs. Visual inspection confirms all latch indicators are in the green safe position.',
    mmodCheckPassed: false,
  },
  {
    stageId: 2,
    title: 'Stage 1 Repress: Equalization Hold',
    category: 'EQUALIZATION',
    chamberPressureKpa: 34.5,
    hatchStatus: 'Sealed & Differential Holding',
    suitState: 'Equalized with Ambient Chamber',
    description: 'Air from cabin equalization valves is bled into the Crewlock until ambient pressure reaches 34.5 kPa (5.0 psi), matching the suit interior. A 3-minute hold verifies no rapid pressure loss through hatch seals.',
    mmodCheckPassed: false,
  },
  {
    stageId: 3,
    title: 'Stage 2 Repress: Full Atmosphere Recovery',
    category: 'CABIN REPRESS',
    chamberPressureKpa: 101.3,
    hatchStatus: 'Delta-P Zero Across Inner Bulkhead',
    suitState: 'Suit Depressurized to Ambient Cabin',
    description: 'Cabin air is vented until Crewlock reaches full station atmosphere (101.3 kPa / 14.7 psi). Astronauts flip helmet purge valves to equalize helmet pressure with cabin air.',
    mmodCheckPassed: false,
  },
  {
    stageId: 4,
    title: 'Inner Hatch Open & Suit Doffing',
    category: 'DOFFING',
    chamberPressureKpa: 101.3,
    hatchStatus: 'Inner Hatch Open to Equipment Lock',
    suitState: 'Helmet Removed, Disconnecting Umbilicals',
    description: 'Inside support crew opens the inner bulkhead hatch. The spacewalkers are assisted in doffing helmets, gloves, and stepping out of the Lower Torso Assemblies.',
    mmodCheckPassed: true,
  },
  {
    stageId: 5,
    title: 'Post-EVA MMOD & Medical Inspection',
    category: 'POST-FLIGHT AUDIT',
    chamberPressureKpa: 101.3,
    hatchStatus: 'Post-Flight Maintenance Nominal',
    suitState: 'EMU Placed in Recharge Stand',
    description: 'Comprehensive microscopic inspection of outer glove RTV silicone for micro-meteoroid and sharp-edge punctures. Crew biomedical telemetry (heart rate, core body temperature, water loss) is audited by flight surgeon.',
    mmodCheckPassed: true,
  },
];

export const EVAPostProcedures3D: React.FC = () => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const stage = REPRESS_STAGES[currentStageIdx];

  const handleNext = () => {
    if (currentStageIdx < REPRESS_STAGES.length - 1) {
      setCurrentStageIdx(currentStageIdx + 1);
    }
  };

  const handleReset = () => {
    setCurrentStageIdx(0);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-space-950 border border-space-800 shadow-2xl flex flex-col">
      {/* Top Header & Control Toolbar */}
      <div className="relative z-20 flex flex-col gap-3 p-4 bg-gradient-to-b from-space-900/95 via-space-950/95 to-space-950 border-b border-space-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                  POST-EVA INGRESS & REPRESSURIZATION
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  LESSON 06 3D LAB
                </span>
              </div>
              <p className="text-xs text-space-400 mt-0.5">
                Staged Airlock Repress • Post-Spacewalk Doffing & MMOD Glove Inspection
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-space-900 border border-space-700 text-space-300 hover:text-white transition-colors cursor-pointer"
              title="Reset procedure"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {currentStageIdx < REPRESS_STAGES.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span>ADVANCE REPRESS STEP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>POST-EVA CYCLE COMPLETE</span>
              </div>
            )}
          </div>
        </div>

        {/* Stage Selector Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-space-800/80">
          <span className="text-[10px] font-mono text-space-400 uppercase tracking-wider mr-1">
            REPRESS PHASE:
          </span>
          {REPRESS_STAGES.map((s, idx) => (
            <button
              key={s.stageId}
              onClick={() => setCurrentStageIdx(idx)}
              className={`py-1 px-3 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                idx === currentStageIdx
                  ? 'bg-cyan-500 text-black font-bold shadow-md ring-1 ring-cyan-300'
                  : idx < currentStageIdx
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'bg-space-900/80 text-space-400 border border-space-800 hover:text-white'
              }`}
            >
              Phase {s.stageId}: {s.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[520px] lg:h-[620px] bg-space-950">
        <Canvas camera={{ position: [2.8, 1.4, 3.4], fov: 45 }} className="w-full h-full bg-space-950">
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 5, 4]} intensity={1.6} color="#FFFFFF" />
          <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#38BDF8" />
          <Stars radius={50} depth={20} count={1200} factor={2} />

          {/* Airlock Repress Chamber */}
          <group position={[0, -0.3, 0]}>
            {/* Cylinder Chamber */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.4, 1.4, 2.8, 24, 1, true]} />
              <meshStandardMaterial
                color="#334155"
                metalness={0.7}
                roughness={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Inner Hatch Door (Opens in Stage 4) */}
            <group position={[-1.4, 0, 0]} rotation={[0, currentStageIdx >= 3 ? Math.PI / 2.2 : 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.75, 0.75, 0.08, 24]} />
                <meshStandardMaterial color="#64748B" metalness={0.8} />
              </mesh>
            </group>

            {/* Ingressed Astronaut inside Chamber */}
            <group position={[0, -0.2, 0]}>
              {/* Torso */}
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[0.55, 0.5, 0.38]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
              </mesh>
              {/* Helmet (Removed in Phase 4 & 5) */}
              {currentStageIdx < 3 ? (
                <>
                  <mesh position={[0, 1.0, 0]}>
                    <sphereGeometry args={[0.22, 20, 20]} />
                    <meshStandardMaterial color="#CBD5E1" />
                  </mesh>
                  <mesh position={[0, 1.0, 0.1]} rotation={[0.1, 0, 0]}>
                    <sphereGeometry args={[0.2, 20, 20, 0, Math.PI]} />
                    <meshStandardMaterial color="#F59E0B" metalness={0.9} />
                  </mesh>
                </>
              ) : (
                /* Head unhelmeted */
                <mesh position={[0, 0.95, 0]}>
                  <sphereGeometry args={[0.14, 16, 16]} />
                  <meshStandardMaterial color="#FCD34D" roughness={0.7} />
                </mesh>
              )}
              {/* Legs */}
              <mesh position={[-0.14, -0.2, 0]}>
                <cylinderGeometry args={[0.1, 0.08, 0.7, 16]} />
                <meshStandardMaterial color="#94A3B8" />
              </mesh>
              <mesh position={[0.14, -0.2, 0]}>
                <cylinderGeometry args={[0.1, 0.08, 0.7, 16]} />
                <meshStandardMaterial color="#94A3B8" />
              </mesh>
            </group>
          </group>

          <OrbitControls
            enablePan={false}
            minDistance={2.0}
            maxDistance={5.5}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </div>

      {/* Bottom Live Atmospheric & Post-Flight Panel */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-space-900/95 backdrop-blur-md border border-space-700/80 rounded-lg p-3.5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-cyan-950/90 text-cyan-300 border border-cyan-800/60">
                {stage.category}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Phase {stage.stageId}: {stage.title}
              </h4>
            </div>
            <p className="text-xs text-space-300 leading-relaxed line-clamp-2">
              {stage.description}
            </p>
          </div>

          {/* Telemetry Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t lg:border-t-0 lg:border-l border-space-800 pt-2 lg:pt-0 lg:pl-4 text-left">
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Chamber Pressure</span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300">
                {stage.chamberPressureKpa.toFixed(1)} kPa
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Hatch Status</span>
              <span className="text-[11px] font-mono font-semibold text-emerald-300 truncate block">
                {stage.hatchStatus.split(' ')[0]} {stage.hatchStatus.split(' ')[1]}
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Glove MMOD Check</span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  stage.mmodCheckPassed ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {stage.mmodCheckPassed ? 'No Punctures' : 'Pending Ingress'}
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Post-EVA Heart Rate</span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300">
                74 bpm (Resting)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
