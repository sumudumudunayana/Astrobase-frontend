import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  ClipboardCheck,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  DoorOpen,
  Zap,
} from 'lucide-react';

interface ChecklistStep {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  actionName: string;
  cabinPressureKpa: number;
  oxygenPurityPercent: number;
  nitrogenPurityPercent: number;
  dcsRiskLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'NOMINAL';
  description: string;
  safetyNote: string;
}

const PREP_STEPS: ChecklistStep[] = [
  {
    id: 'step_1',
    stepNumber: 1,
    title: 'Baseline Cabin Atmosphere',
    category: 'HABITAT BASELINE',
    actionName: 'Verify Cabin Pressure',
    cabinPressureKpa: 101.3,
    oxygenPurityPercent: 21,
    nitrogenPurityPercent: 78,
    dcsRiskLevel: 'HIGH',
    description: 'ISS Quest airlock is pressurized at 101.3 kPa (14.7 psi) with 78% nitrogen. If an astronaut instantly donned an EMU at 29.6 kPa, nitrogen bubbles would form in blood tissue causing fatal decompression sickness.',
    safetyNote: 'Mandatory 4-hour pre-breathe protocol or overnight campout required before hatch egress.',
  },
  {
    id: 'step_2',
    stepNumber: 2,
    title: 'Denitrogenation Pre-Breathe',
    category: 'PHYSIOLOGICAL SAFEGUARD',
    actionName: 'Start 100% O2 Pre-Breathe',
    cabinPressureKpa: 70.3,
    oxygenPurityPercent: 100,
    nitrogenPurityPercent: 0,
    dcsRiskLevel: 'MODERATE',
    description: 'Astronaut dons oxygen mask and performs light ergometer exercise while breathing 100% O2. Nitrogen is washed out from fatty tissues into the lungs and exhaled.',
    safetyNote: 'Strict protocol: removing mask for even 60 seconds resets the denitrogenation timer.',
  },
  {
    id: 'step_3',
    stepNumber: 3,
    title: 'EMU Donning & Delta-P Leak Check',
    category: 'SUIT INTEGRITY',
    actionName: 'Seal Helmet & Pressurize Suit',
    cabinPressureKpa: 70.3,
    oxygenPurityPercent: 100,
    nitrogenPurityPercent: 0,
    dcsRiskLevel: 'LOW',
    description: 'Astronaut enters the Hard Upper Torso (HUT) mounted on the airlock wall stand. Crew lock lower torso is locked into place. PLSS pressurizes suit to 29.6 kPa above ambient to perform the 2-minute delta-P decay test.',
    safetyNote: 'Maximum allowable leak rate: no more than 0.2 kPa drop over 120 seconds.',
  },
  {
    id: 'step_4',
    stepNumber: 4,
    title: 'Autonomous PLSS Switchover',
    category: 'POWER & LIFE SUPPORT',
    actionName: 'Disconnect Airlock Umbilicals',
    cabinPressureKpa: 70.3,
    oxygenPurityPercent: 100,
    nitrogenPurityPercent: 0,
    dcsRiskLevel: 'LOW',
    description: 'Station power and cooling fluid umbilicals are disconnected. The EMU switches over to internal silver-zinc battery power and autonomous water sublimation cooling.',
    safetyNote: 'Confirm primary battery voltage > 16.8 V and sublimation water tank head pressure nominal.',
  },
  {
    id: 'step_5',
    stepNumber: 5,
    title: 'Airlock Depressurization Cycle',
    category: 'AIRLOCK OPERATIONS',
    actionName: 'Depressurize Crewlock to Vacuum',
    cabinPressureKpa: 0.0,
    oxygenPurityPercent: 100,
    nitrogenPurityPercent: 0,
    dcsRiskLevel: 'NOMINAL',
    description: 'The internal hatch between the Equipment Lock and Crewlock is sealed. The depressurization valve opens, venting airlock atmosphere down to 34.5 kPa (equal with suit), pausing for final integrity check, then venting to 0 kPa vacuum.',
    safetyNote: 'The depress pump recovers 80% of nitrogen and oxygen back into storage tanks before final venting.',
  },
  {
    id: 'step_6',
    stepNumber: 6,
    title: 'Outer Hatch Unlatch & Egress',
    category: 'EGRESS AUTHORIZATION',
    actionName: 'Open Outer Hatch to Space',
    cabinPressureKpa: 0.0,
    oxygenPurityPercent: 100,
    nitrogenPurityPercent: 0,
    dcsRiskLevel: 'NOMINAL',
    description: 'Flight Director issues formal GO FOR EVA. Spacewalker unlatches outer hatch, pushes thermal cover aside, anchors waist safety tether to external D-ring slide wire, and steps into the vacuum of space.',
    safetyNote: 'Rule of Dual Anchors: tether must be physically attached before hands leave the airlock frame.',
  },
];

function Airlock3DChamber({
  stepNumber,
  isHatchOpen,
}: {
  stepNumber: number;
  isHatchOpen: boolean;
}) {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Cylindrical Crewlock Chamber Hull */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.5, 1.5, 3.2, 32, 1, true]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.7}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Internal Reinforcing Rib Rings */}
      {[-1.0, 0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.48, 0.05, 12, 32]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} />
        </mesh>
      ))}

      {/* Inner Hatch (Bulkhead towards Equipment Lock) */}
      <mesh position={[-1.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[1.48, 32]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Outer Egress Hatch Ring */}
      <mesh position={[1.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.9, 0.08, 16, 32]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} />
      </mesh>

      {/* Outer Hatch Door (Opens at Step 6) */}
      <group
        position={[1.6, 0, 0]}
        rotation={[0, isHatchOpen ? Math.PI / 2.2 : 0, 0]}
      >
        <mesh position={[0, 0, isHatchOpen ? 0.7 : 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.85, 0.85, 0.1, 24]} />
          <meshStandardMaterial
            color={isHatchOpen ? '#0EA5E9' : '#475569'}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Astronaut in Suit Donning Stand inside Crewlock */}
      <group position={[0, -0.2, 0]}>
        {/* Torso */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.55, 0.5, 0.38]} />
          <meshStandardMaterial
            color={stepNumber >= 3 ? '#E2E8F0' : '#64748B'}
            roughness={0.4}
          />
        </mesh>
        {/* Helmet */}
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial
            color={stepNumber >= 3 ? '#E2E8F0' : '#475569'}
            roughness={0.3}
          />
        </mesh>
        {/* Gold Visor (active when sealed) */}
        {stepNumber >= 3 && (
          <mesh position={[0, 1.05, 0.1]} rotation={[0.1, 0, 0]}>
            <sphereGeometry args={[0.2, 20, 20, 0, Math.PI]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.1} />
          </mesh>
        )}
        {/* Legs */}
        <mesh position={[-0.15, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.7, 16]} />
          <meshStandardMaterial color="#CBD5E1" />
        </mesh>
        <mesh position={[0.15, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.7, 16]} />
          <meshStandardMaterial color="#CBD5E1" />
        </mesh>

        {/* Umbilical Hose (Disconnected in Step 4+) */}
        {stepNumber < 4 && (
          <mesh position={[-0.4, 0.4, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
            <meshStandardMaterial color="#38BDF8" />
          </mesh>
        )}
      </group>

      {/* Depressurization Valve Particle / Glow Indicator */}
      {stepNumber === 5 && (
        <pointLight position={[0.8, 0.8, 0]} color="#38BDF8" intensity={2} distance={3} />
      )}
    </group>
  );
}

export const EVAPreparationChecklist3D: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = PREP_STEPS[currentStepIndex];
  const isHatchOpen = currentStepIndex >= 5;

  const handleNext = () => {
    if (currentStepIndex < PREP_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-space-950 border border-space-800 shadow-2xl flex flex-col">
      {/* Top Header & Control Toolbar */}
      <div className="relative z-20 flex flex-col gap-3 p-4 bg-gradient-to-b from-space-900/95 via-space-950/95 to-space-950 border-b border-space-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                  QUEST AIRLOCK PRE-BREATHE & DEPRESSURIZATION
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  LESSON 03 3D LAB
                </span>
              </div>
              <p className="text-xs text-space-400 mt-0.5">
                Interactive Checklist Gate • DCS Decompression Sickness Prevention
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-space-900 border border-space-700 text-space-300 hover:text-white transition-colors cursor-pointer"
              title="Reset checklist"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {currentStepIndex < PREP_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>{step.actionName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>GO FOR EVA EGRESS</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Step Selector Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-space-800/80">
          <span className="text-[10px] font-mono text-space-400 uppercase tracking-wider mr-1">
            CHECKLIST SEQUENCE:
          </span>
          {PREP_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`py-1 px-2.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'bg-emerald-500 text-black font-bold shadow-md ring-1 ring-emerald-300'
                  : idx < currentStepIndex
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'bg-space-900/80 text-space-400 border border-space-800 hover:text-white'
              }`}
            >
              Step {s.stepNumber}: {s.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[520px] lg:h-[620px] bg-space-950">
        <Canvas camera={{ position: [3.4, 1.8, 3.2], fov: 45 }} className="w-full h-full bg-space-950">
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 4]} intensity={1.8} color="#FFFFFF" />
          <directionalLight position={[-3, -2, -3]} intensity={0.5} color="#38BDF8" />
          <Stars radius={50} depth={20} count={1200} factor={2} />

          <Airlock3DChamber stepNumber={step.stepNumber} isHatchOpen={isHatchOpen} />

          <OrbitControls
            enablePan={false}
            minDistance={2.0}
            maxDistance={6.0}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
      </div>

      {/* Bottom Live Atmospheric & Physiological HUD */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-space-900/95 backdrop-blur-md border border-space-700/80 rounded-lg p-3.5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-800/60">
                {step.category}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Step {step.stepNumber}: {step.title}
              </h4>
            </div>
            <p className="text-xs text-space-300 leading-relaxed line-clamp-2">
              {step.description}
            </p>
          </div>

          {/* Telemetry Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t lg:border-t-0 lg:border-l border-space-800 pt-2 lg:pt-0 lg:pl-4">
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800 text-left">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Cabin Pressure</span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300">
                {step.cabinPressureKpa.toFixed(1)} kPa
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800 text-left">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Atmosphere O2</span>
              <span className="text-[11px] font-mono font-semibold text-emerald-300">
                {step.oxygenPurityPercent}% O2
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800 text-left">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Nitrogen Residual</span>
              <span className="text-[11px] font-mono font-semibold text-amber-300">
                {step.nitrogenPurityPercent}% N2
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800 text-left">
              <span className="block text-[9px] font-mono text-space-400 uppercase">DCS Bend Risk</span>
              <span
                className={`text-[11px] font-mono font-bold ${
                  step.dcsRiskLevel === 'NOMINAL'
                    ? 'text-emerald-400'
                    : step.dcsRiskLevel === 'LOW'
                    ? 'text-cyan-300'
                    : 'text-amber-400'
                }`}
              >
                {step.dcsRiskLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
