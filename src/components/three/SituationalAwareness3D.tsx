import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Radar,
  Eye,
  Crosshair,
  AlertOctagon,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

function SituationalSphereScene({
  awarenessLevel,
  tunnelVisionActive,
  scanPatternActive,
}: {
  awarenessLevel: 1 | 2 | 3;
  tunnelVisionActive: boolean;
  scanPatternActive: boolean;
}) {
  const craftRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const scanSweepRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Subtle spacecraft orientation
    if (craftRef.current) {
      craftRef.current.rotation.y += delta * 0.2;
    }

    // Concentric situational awareness rings rotating at distinct rates
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.15;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.1;
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.08;

    // Cockpit scan sweep
    if (scanSweepRef.current && scanPatternActive) {
      scanSweepRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group>
      {/* Central Spacecraft Complex */}
      <group ref={craftRef}>
        {/* Main Service Module Cylinder */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 1.2, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Command Module Conical Nose */}
        <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.38, 0.6, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Engine Bell */}
        <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.28, 0.4, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Solar Array Wings */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.4, 0.9, 0.04]} />
          <meshStandardMaterial color="#0369a1" emissive="#0284c7" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <boxGeometry args={[0.4, 0.9, 0.04]} />
          <meshStandardMaterial color="#0369a1" emissive="#0284c7" emissiveIntensity={0.3} />
        </mesh>

        {/* Label on spacecraft */}
        <Text position={[0, 1.5, 0]} fontSize={0.14} color="#38bdf8" anchorX="center">
          ORBITAL SPACECRAFT
        </Text>
      </group>

      {/* ==========================================================
          LEVEL 1: PERCEPTION RING (Immediate Internal Systems)
         ========================================================== */}
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[1.5, 0.012, 16, 64]} />
          <meshBasicMaterial
            color={tunnelVisionActive ? '#ef4444' : '#38bdf8'}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Subsystem Health Node 1: ECLSS */}
        <mesh position={[1.5, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
        </mesh>
        {/* Subsystem Health Node 2: Avionics */}
        <mesh position={[-1.5, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
        <Text position={[1.7, 0, 0]} fontSize={0.09} color="#10b981" anchorX="left">
          ECLSS: 101.3 kPa
        </Text>
      </group>

      {/* ==========================================================
          LEVEL 2: COMPREHENSION RING (Proximity & Environment)
         ========================================================== */}
      {awarenessLevel >= 2 && (
        <group ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.3, 0.012, 16, 64]} />
            <meshBasicMaterial
              color={tunnelVisionActive ? '#475569' : '#a855f7'}
              transparent
              opacity={tunnelVisionActive ? 0.2 : 0.7}
            />
          </mesh>
          {/* Orbital Obstacle / Rendezvous Beacon */}
          <mesh position={[0, 2.3, 0]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
          </mesh>
          <Text position={[0, 2.5, 0]} fontSize={0.09} color="#f59e0b" anchorX="center">
            TARGET VEHICLE: 240m (CLOSING 0.4 m/s)
          </Text>
        </group>
      )}

      {/* ==========================================================
          LEVEL 3: PROJECTION RING (Trajectory & Future State)
         ========================================================== */}
      {awarenessLevel >= 3 && (
        <group ref={ring3Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <mesh>
            <torusGeometry args={[3.2, 0.015, 16, 64]} />
            <meshBasicMaterial
              color={tunnelVisionActive ? '#334155' : '#06b6d4'}
              transparent
              opacity={tunnelVisionActive ? 0.15 : 0.85}
            />
          </mesh>
          {/* Future Trajectory Prediction Node */}
          <mesh position={[0, 0, 3.2]}>
            <coneGeometry args={[0.12, 0.25, 16]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.0} />
          </mesh>
          <Text position={[0, 0.3, 3.2]} fontSize={0.10} color="#06b6d4" anchorX="center">
            PERIAPSIS PASS (+28 MIN)
          </Text>
        </group>
      )}

      {/* Tunnel Vision Hazard Cone */}
      {tunnelVisionActive && (
        <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.8, 1.8, 32, 1, true]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>
      )}

      {/* Active Systematic Cross-Cockpit Scan Sweep */}
      {scanPatternActive && !tunnelVisionActive && (
        <group ref={scanSweepRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 3.2, 32, 1, 0, Math.PI / 4]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export const SituationalAwareness3D: React.FC = () => {
  const [awarenessLevel, setAwarenessLevel] = useState<1 | 2 | 3>(3);
  const [tunnelVisionActive, setTunnelVisionActive] = useState<boolean>(false);
  const [scanPatternActive, setScanPatternActive] = useState<boolean>(true);

  const getLevelDescription = () => {
    switch (awarenessLevel) {
      case 1:
        return {
          title: 'Level 1: Perception',
          desc: 'Direct observation of raw flight telemetry, warnings, panel status, and auditory cues.',
          focus: 'Are the oxygen valves open? What is the main engine chamber pressure?',
          danger: 'Risk: Information overload or missing subtle baseline sensor drift.',
        };
      case 2:
        return {
          title: 'Level 2: Comprehension',
          desc: 'Synthesizing disjoint data into an integrated understanding of operational meaning.',
          focus: 'Oxygen pressure drop combined with current draw indicates a line heater failure.',
          danger: 'Risk: Cognitive confirmation bias and misinterpreting system interdependencies.',
        };
      case 3:
        return {
          title: 'Level 3: Projection',
          desc: 'Anticipating future states, trajectory changes, fuel depletion, and margin trends.',
          focus: 'At current consumption rate, reserve ECLSS margin breaches limit before lunar orbit entry.',
          danger: 'Risk: Unprepared for compounded secondary failures without proactive mitigation.',
        };
    }
  };

  const levelInfo = getLevelDescription();

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Radar className="w-5 h-5 animate-spin text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                CRM MODULE 08 // LESSON 03
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 border border-cyan-700/50 text-cyan-300 rounded-full">
                SITUATIONAL AWARENESS & ERROR MANAGEMENT
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Endsley SA Spheres & Cognitive Fixation Prevention Lab
            </h2>
          </div>
        </div>

        {/* Level Badge */}
        <div className="hidden sm:flex items-center gap-2">
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setAwarenessLevel(lvl as 1 | 2 | 3)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                awarenessLevel === lvl
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                  : 'bg-[#0f1d33] text-slate-400 hover:text-white'
              }`}
            >
              SA Level {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 2.8, 5.0], fov: 48 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[3, 4, 3]} intensity={1.5} color="#38bdf8" />
          <pointLight position={[-3, -2, -3]} intensity={0.8} color="#a855f7" />
          <Suspense fallback={null}>
            <SituationalSphereScene
              awarenessLevel={awarenessLevel}
              tunnelVisionActive={tunnelVisionActive}
              scanPatternActive={scanPatternActive}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 1.8}
            minDistance={2.5}
            maxDistance={8}
          />
        </Canvas>

        {/* Left Side: Endsley SA Level Card */}
        <div className="absolute top-20 left-4 z-10 w-80 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400">{levelInfo.title}</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{levelInfo.desc}</p>
          <div className="text-[11px] bg-[#0c182a] p-2 rounded border border-cyan-900/50 text-cyan-200 font-mono">
            <strong>Operational Question:</strong>
            <br />
            {levelInfo.focus}
          </div>
          <div className="text-[10px] text-amber-400 font-mono">{levelInfo.danger}</div>
        </div>

        {/* Right Side: Human Factors Error Trap Simulator */}
        <div className="absolute top-20 right-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl space-y-2.5">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Human Error Traps</span>
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <button
            onClick={() => setTunnelVisionActive(!tunnelVisionActive)}
            className={`w-full p-2.5 rounded text-xs font-mono text-left transition-all ${
              tunnelVisionActive
                ? 'bg-red-600/30 border border-red-500 text-red-200 animate-pulse'
                : 'bg-[#0f1d33] border border-slate-700 text-slate-300 hover:bg-[#162a4a]'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Tunnel Vision / Fixation</span>
              <span className="text-[10px]">{tunnelVisionActive ? 'ACTIVE' : 'OFF'}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Astronaut locks attention onto one flashing caution gauge, losing outer horizon & trajectory awareness.
            </div>
          </button>

          <button
            onClick={() => setScanPatternActive(!scanPatternActive)}
            className={`w-full p-2.5 rounded text-xs font-mono text-left transition-all ${
              scanPatternActive && !tunnelVisionActive
                ? 'bg-cyan-600/30 border border-cyan-500 text-cyan-200'
                : 'bg-[#0f1d33] border border-slate-700 text-slate-300'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Cross-Cockpit Scan Pattern</span>
              <span className="text-[10px]">{scanPatternActive ? 'ACTIVE' : 'OFF'}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Rhythmic scanning (T-pattern) across flight instruments prevents attentional blindness.
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Information Strip */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Active Layer:</span>
          <span className="text-cyan-400 font-bold">
            {awarenessLevel === 1 ? '1: Perception (Raw Data)' : awarenessLevel === 2 ? '2: Comprehension (Meaning)' : '3: Projection (Future State)'}
          </span>
          {tunnelVisionActive && (
            <span className="text-red-400 font-bold bg-red-950 px-2 py-0.5 rounded border border-red-700 animate-pulse">
              FIXATION DETECTED: Outer rings obscured
            </span>
          )}
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mica Endsley SA Model: Perception → Comprehension → Projection</span>
        </div>
      </div>
    </div>
  );
};
