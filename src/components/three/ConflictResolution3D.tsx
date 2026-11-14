import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  MessageSquare,
  Flame,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Users2,
  Sparkles,
} from 'lucide-react';

function WardroomDialogueScene({
  conflictStage,
  tensionLevel,
}: {
  conflictStage: 'FRICTION' | 'CONFRONTATION' | 'DESC_MEDIATION' | 'RESOLVED';
  tensionLevel: number; // 0 (Peaceful) to 100 (Explosive)
}) {
  const resonanceWaveRef = useRef<THREE.Group>(null);
  const leftCrewRef = useRef<THREE.Group>(null);
  const rightCrewRef = useRef<THREE.Group>(null);

  const getTensionColor = () => {
    if (tensionLevel > 65) return '#ef4444'; // Red
    if (tensionLevel > 35) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  const tensionColor = getTensionColor();

  useFrame((state, delta) => {
    // Tension arc oscillation between crew members
    if (resonanceWaveRef.current) {
      resonanceWaveRef.current.children.forEach((c, i) => {
        const mesh = c as THREE.Mesh;
        const speed = (tensionLevel / 20) + 1.5;
        mesh.position.y = Math.sin(state.clock.elapsedTime * speed + i * 0.8) * (0.05 + (tensionLevel / 300));
      });
    }

    // Subtle head tilt posture
    if (leftCrewRef.current && rightCrewRef.current) {
      if (conflictStage === 'RESOLVED') {
        leftCrewRef.current.rotation.y = 0.35;
        rightCrewRef.current.rotation.y = -0.35;
      } else if (conflictStage === 'CONFRONTATION') {
        leftCrewRef.current.rotation.y = 0.55;
        rightCrewRef.current.rotation.y = -0.55;
      }
    }
  });

  return (
    <group>
      {/* Wardroom Conference Table Deck */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[2.5, 2.7, 0.15, 32]} />
        <meshStandardMaterial color="#0c1626" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Conference Table */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.9]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Holographic Table Surface */}
      <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 0.8]} />
        <meshStandardMaterial
          color={tensionColor}
          emissive={tensionColor}
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =========================================================
          LEFT CREW MEMBER: DR. ELENA ROSTOVA (Science Lead)
         ========================================================= */}
      <group ref={leftCrewRef} position={[-1.2, 0.2, 0]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.22, 0.12]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <Text position={[0, 0.65, 0]} fontSize={0.11} color="#f8fafc" anchorX="center">
          Dr. Elena Rostova
        </Text>
        <Text position={[0, 0.52, 0]} fontSize={0.08} color="#38bdf8" anchorX="center">
          Science Specialist
        </Text>
      </group>

      {/* =========================================================
          RIGHT CREW MEMBER: MARCUS VANCE (Flight Engineer)
         ========================================================= */}
      <group ref={rightCrewRef} position={[1.2, 0.2, 0]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.22, 0.12]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <Text position={[0, 0.65, 0]} fontSize={0.11} color="#f8fafc" anchorX="center">
          Marcus Vance
        </Text>
        <Text position={[0, 0.52, 0]} fontSize={0.08} color="#f59e0b" anchorX="center">
          Flight Engineer
        </Text>
      </group>

      {/* =========================================================
          INTERPERSONAL RESONANCE ARC (Between Members)
         ========================================================= */}
      <group ref={resonanceWaveRef} position={[0, 0.2, 0]}>
        {Array.from({ length: 9 }).map((_, idx) => {
          const x = -0.8 + idx * 0.2;
          return (
            <mesh key={idx} position={[x, 0, 0]}>
              <sphereGeometry args={[tensionLevel > 50 ? 0.05 : 0.035, 12, 12]} />
              <meshStandardMaterial
                color={tensionColor}
                emissive={tensionColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          );
        })}
      </group>

      {/* Center Tension HUD */}
      <Text position={[0, 0.5, 0]} fontSize={0.11} color={tensionColor} anchorX="center">
        TENSION INDEX: {tensionLevel}/100
      </Text>
      <Text position={[0, 0.35, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        PROTOCOL: {conflictStage}
      </Text>
    </group>
  );
}

export const ConflictResolution3D: React.FC = () => {
  const [conflictStage, setConflictStage] = useState<'FRICTION' | 'CONFRONTATION' | 'DESC_MEDIATION' | 'RESOLVED'>('FRICTION');
  const [tensionLevel, setTensionLevel] = useState<number>(75);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const handleChoice = (type: 'AGGRESSIVE' | 'AVOIDANT' | 'COMPROMISE' | 'COLLABORATIVE') => {
    switch (type) {
      case 'AGGRESSIVE':
        setTensionLevel(95);
        setConflictStage('CONFRONTATION');
        setSelectedResponse('AGGRESSIVE RESPONSE: Blame shifted directly to engineer. Interpersonal friction escalated. Crew communication shut down.');
        break;
      case 'AVOIDANT':
        setTensionLevel(60);
        setSelectedResponse('AVOIDANT: Issue postponed until next flight cycle. Underlying equipment allocation resentment remains unresolved.');
        break;
      case 'COMPROMISE':
        setTensionLevel(35);
        setConflictStage('DESC_MEDIATION');
        setSelectedResponse('COMPROMISE: Shift hours split equally. Both tasks delayed by 1 hour but conflict temporarily contained.');
        break;
      case 'COLLABORATIVE':
        setTensionLevel(12);
        setConflictStage('RESOLVED');
        setSelectedResponse('COLLABORATIVE (DESC SCRIPT): Addressed shared goal. Staggered glovebox maintenance while telemetry runs in background. Win-Win achieved.');
        break;
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded-lg text-amber-400">
            <Users2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
                CRM MODULE 08 // LESSON 05
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950 border border-amber-700/50 text-amber-300 rounded-full">
                INTERPERSONAL DYNAMICS & CONFLICT RESOLUTION
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Habitation Wardroom De-escalation & DESC Model Lab
            </h2>
          </div>
        </div>

        {/* Tension Meter Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">Friction Level:</span>
            <span
              className={`font-bold ${
                tensionLevel > 60 ? 'text-red-400' : tensionLevel > 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {tensionLevel}%
            </span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 2.0, 4.0], fov: 46 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 3, 1]} intensity={1.2} color="#38bdf8" />
          <directionalLight position={[3, 5, 2]} intensity={0.8} />
          <Suspense fallback={null}>
            <WardroomDialogueScene conflictStage={conflictStage} tensionLevel={tensionLevel} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2.2}
            maxDistance={6.5}
          />
        </Canvas>

        {/* Conflict Narrative Context (Top Left) */}
        <div className="absolute top-20 left-4 z-10 w-80 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-amber-400 uppercase tracking-wider">
            Operational Dispute Context
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Science Lead Dr. Rostova needs 3 hours of uninterrupted glovebox isolation for crystallization data.
            Flight Engineer Marcus Vance needs the same compartment immediately to overhaul the primary oxygen scrubber valve.
          </p>
          <div className="text-[10px] text-slate-400 font-mono bg-[#091626] p-2 rounded border border-slate-800">
            <strong>Root Cause:</strong> Resource contention & timeline compression in confined deep space transit.
          </div>
        </div>

        {/* Dialogue Intervention Choices (Top Right) */}
        <div className="absolute top-20 right-4 z-10 w-84 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span>Commander Intervention</span>
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleChoice('COLLABORATIVE')}
              className="w-full text-left p-2 rounded text-xs font-mono bg-emerald-950/40 border border-emerald-600/50 hover:bg-emerald-900/40 text-emerald-200 transition-all"
            >
              <div className="font-bold">1. Assertive Collaborative (DESC Script)</div>
              <div className="text-[10px] text-slate-400">Describe objective facts, specify staggered schedule, protect both goals</div>
            </button>

            <button
              onClick={() => handleChoice('COMPROMISE')}
              className="w-full text-left p-2 rounded text-xs font-mono bg-[#0e1d33] border border-cyan-800/60 hover:bg-[#152a47] text-slate-200 transition-all"
            >
              <div className="font-bold">2. Moderate Compromise</div>
              <div className="text-[10px] text-slate-400">Cut both experiment and valve overhaul time in half</div>
            </button>

            <button
              onClick={() => handleChoice('AVOIDANT')}
              className="w-full text-left p-2 rounded text-xs font-mono bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 text-slate-300 transition-all"
            >
              <div className="font-bold">3. Avoidant / Deferral</div>
              <div className="text-[10px] text-slate-400">Tell crew to table dispute until tomorrow morning shift</div>
            </button>

            <button
              onClick={() => handleChoice('AGGRESSIVE')}
              className="w-full text-left p-2 rounded text-xs font-mono bg-rose-950/40 border border-rose-700/50 hover:bg-rose-900/40 text-rose-200 transition-all"
            >
              <div className="font-bold">4. Aggressive Command Order</div>
              <div className="text-[10px] text-slate-400">Demand science yields immediately without listening to data loss risk</div>
            </button>
          </div>

          {selectedResponse && (
            <div className="p-2.5 rounded bg-[#09172a] border border-cyan-800/60 text-xs text-cyan-200 font-mono mt-2">
              {selectedResponse}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info Strip */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="text-xs font-mono text-slate-400">
          <span className="text-emerald-400 font-bold">DESC Framework: </span>
          <span>D (Describe specific behavior) → E (Express impact) → S (Specify alternative) → C (Consequences for mission)</span>
        </div>
        <button
          onClick={() => {
            setTensionLevel(75);
            setConflictStage('FRICTION');
            setSelectedResponse(null);
          }}
          className="px-2.5 py-1 rounded text-xs font-mono bg-slate-800 text-slate-300 hover:text-white"
        >
          Reset Simulation
        </button>
      </div>
    </div>
  );
};
