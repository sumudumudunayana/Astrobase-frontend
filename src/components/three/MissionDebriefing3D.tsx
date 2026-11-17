import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  FileText,
  Clock,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface TimelineNodeProps {
  position: [number, number, number];
  title: string;
  phase: string;
  score: number;
  isSelected: boolean;
  onClick: () => void;
}

function TimelineEventNode({
  position,
  title,
  phase,
  score,
  isSelected,
  onClick,
}: TimelineNodeProps) {
  const nodeRef = useRef<THREE.Group>(null);

  const isGood = score >= 85;
  const color = isGood ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';

  useFrame((state, delta) => {
    if (nodeRef.current && isSelected) {
      nodeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group ref={nodeRef} position={position} onClick={onClick}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.12, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.7 : 0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Floating holographic ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.9 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text position={[0, 0.35, 0]} fontSize={0.10} color="#f8fafc" anchorX="center">
        {title}
      </Text>
      <Text position={[0, 0.22, 0]} fontSize={0.08} color={color} anchorX="center">
        {score}% Performance
      </Text>
    </group>
  );
}

function DebriefTimelineScene({
  activePhase,
  setActivePhase,
  filterCause,
}: {
  activePhase: number;
  setActivePhase: (phase: number) => void;
  filterCause: string;
}) {
  const arcRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (arcRef.current) {
      arcRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    }
  });

  // 5 Major Flight Phases along an orbital arc
  const phases = [
    { id: 1, pos: [-2.4, -0.4, 0] as [number, number, number], title: 'Launch & Ascent', phase: 'T+0 to Orbit', score: 92 },
    { id: 2, pos: [-1.2, 0.3, 0] as [number, number, number], title: 'Trans-Lunar Injection', phase: 'Deep Space Transit', score: 88 },
    { id: 3, pos: [0, 0.8, 0] as [number, number, number], title: 'Lunar Orbit Insertion', phase: 'Propulsion Burn', score: 74 },
    { id: 4, pos: [1.2, 0.3, 0] as [number, number, number], title: 'Surface Descent & EVA', phase: 'Artemis Ops', score: 90 },
    { id: 5, pos: [2.4, -0.4, 0] as [number, number, number], title: 'Earth Return & Entry', phase: 'Splashdown Recovery', score: 95 },
  ];

  return (
    <group ref={arcRef}>
      {/* Curved Mission Trajectory Arc */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[2.8, 2.85, 64, 1, Math.PI * 0.2, Math.PI * 0.6]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      {/* Holographic Debrief Floor Grid */}
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.0, 3.0]} />
        <meshStandardMaterial color="#091424" metalness={0.9} roughness={0.3} />
      </mesh>
      <gridHelper args={[6.0, 12, '#1e293b', '#0f172a']} position={[0, -0.99, 0]} />

      {/* 5 Phase Nodes */}
      {phases.map((p) => (
        <TimelineEventNode
          key={p.id}
          position={p.pos}
          title={p.title}
          phase={p.phase}
          score={p.score}
          isSelected={activePhase === p.id}
          onClick={() => setActivePhase(p.id)}
        />
      ))}

      {/* Root Cause Tree Hub (Lower Center) */}
      <group position={[0, -0.4, 0.8]}>
        <mesh>
          <boxGeometry args={[1.6, 0.3, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <Text position={[0, 0.05, 0.32]} fontSize={0.09} color="#38bdf8" anchorX="center">
          JUST CULTURE CAUSAL MAP: {filterCause}
        </Text>
      </group>
    </group>
  );
}

export const MissionDebriefing3D: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number>(3); // Default to Lunar Orbit Insertion
  const [filterCause, setFilterCause] = useState<string>('ALL');

  const getPhaseData = () => {
    switch (activePhase) {
      case 1:
        return {
          name: 'Phase 1: Launch & Ascent Insertion',
          score: '92% (Exemplary)',
          strengths: ['Verbatim 3-way readback executed flawlessly across all callouts.', 'High situational awareness during staging transient.'],
          findings: ['Minor comm loop chatter at T+3:15, quickly re-disciplined by Commander.'],
          crmCategory: 'Communication Discipline',
        };
      case 2:
        return {
          name: 'Phase 2: Trans-Lunar Injection Transit',
          score: '88% (Good)',
          strengths: ['Fatigue mitigation protocol followed with 8.5-hr sleep schedules.', 'Workload shared evenly between Pilot and Flight Engineer.'],
          findings: ['Glovebox scheduling friction observed; resolved with DESC script.'],
          crmCategory: 'Fatigue & Conflict Management',
        };
      case 3:
        return {
          name: 'Phase 3: Lunar Orbit Insertion (LOI)',
          score: '74% (Acceptable - Needs Focus)',
          strengths: ['Conservative decision made to cross-check sensor anomaly before secondary burn.'],
          findings: [
            'Attentional fixation occurred on Valve 3 caution indicator for 18 seconds.',
            'Two-person cross-check missed on secondary helium isolation valve line.',
          ],
          crmCategory: 'Situational Awareness & Cross-Check Verification',
        };
      case 4:
        return {
          name: 'Phase 4: Surface Descent & Artemis EVA Ops',
          score: '90% (Exemplary)',
          strengths: ['Superb buddy-system checks on PLSS umbilical pressure and tether hooks.', 'Rapid non-punitive reporting of sample container latch sticking.'],
          findings: ['Time compression on final EVA egress leg required pacing adjustment.'],
          crmCategory: 'Team Coordination & Mutual Support',
        };
      default:
        return {
          name: 'Phase 5: Earth Return & Splashdown Recovery',
          score: '95% (Exemplary)',
          strengths: ['Re-entry checklist verified with 100% ground confirmation.', 'Seamless handover to naval recovery team.'],
          findings: ['None recorded.'],
          crmCategory: 'Operational Perfection',
        };
    }
  };

  const currentData = getPhaseData();

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-400">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
                CRM MODULE 08 // LESSON 07
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 border border-emerald-700/50 text-emerald-300 rounded-full">
                MISSION DEBRIEFING & JUST CULTURE
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Flight Timeline Replay & Non-Punitive Root Cause Analysis
            </h2>
          </div>
        </div>

        {/* Phase Index Badge */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Phase Score:</span>
          <span className="text-emerald-400 font-bold bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700">
            {currentData.score}
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 2.2, 4.4], fov: 48 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 4, 2]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[4, 6, 2]} intensity={0.8} />
          <Suspense fallback={null}>
            <DebriefTimelineScene
              activePhase={activePhase}
              setActivePhase={setActivePhase}
              filterCause={filterCause}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.0}
            minDistance={2.5}
            maxDistance={7.5}
          />
        </Canvas>

        {/* Phase Details Card (Top Left) */}
        <div className="absolute top-20 left-4 z-10 w-80 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2.5">
          <div className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span>Phase Assessment</span>
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <h3 className="text-sm font-bold text-white">{currentData.name}</h3>

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-emerald-400 font-mono text-[10px] block font-bold uppercase">
                Demonstrated Strengths:
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {currentData.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-amber-400 font-mono text-[10px] block font-bold uppercase">
                Identified Findings & Growth Areas:
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {currentData.findings.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Just Culture Framework Guide (Top Right) */}
        <div className="absolute top-20 right-4 z-10 w-76 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            Just Culture Model
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
              <strong>Human Error:</strong> Inadvertent slip or lapse. Response: System redesign & coaching.
            </div>
            <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200">
              <strong>At-Risk Behavior:</strong> Choice where risk is not seen or mistakenly believed justified. Response: Retraining.
            </div>
            <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-200">
              <strong>Reckless Behavior:</strong> Conscious disregard of substantial safety rules. Response: Remedial sanctions.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline Controls */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((pNum) => (
            <button
              key={pNum}
              onClick={() => setActivePhase(pNum)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                activePhase === pNum
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/50'
                  : 'bg-[#0f1d33] text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              Phase {pNum}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Continuous Improvement: </span>
          <span className="text-emerald-300 font-bold">Never conceal near-misses; analyze to strengthen crew safety</span>
        </div>
      </div>
    </div>
  );
};
