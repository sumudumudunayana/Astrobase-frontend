import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Zap,
  HeartPulse,
  ShieldAlert,
  Sliders,
  Play,
  Pause,
  AlertTriangle,
} from 'lucide-react';

function CentrifugeMechanismScene({
  gForce,
  isSpinning,
  isAgsmActive,
}: {
  gForce: number;
  isSpinning: boolean;
  isAgsmActive: boolean;
}) {
  const armGroupRef = useRef<THREE.Group>(null);
  const gondolaRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (armGroupRef.current && isSpinning) {
      // Angular velocity proportional to sqrt(G)
      const angularSpeed = Math.sqrt(Math.max(1, gForce)) * 1.6;
      armGroupRef.current.rotation.y += delta * angularSpeed;
    }

    // Gondola swing angle due to centripetal acceleration
    if (gondolaRef.current) {
      const swingAngle = Math.atan(gForce / 1.0) * 0.45;
      gondolaRef.current.rotation.z = -swingAngle;
    }
  });

  return (
    <group>
      {/* Centrifuge Facility Chamber Floor */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4.2, 4.4, 0.2, 32]} />
        <meshStandardMaterial color="#08101e" metalness={0.8} roughness={0.3} />
      </mesh>
      <gridHelper args={[8.4, 16, '#1e293b', '#0f172a']} position={[0, -1.09, 0]} />

      {/* Central Motor Hub Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 1.4, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.4} />
      </mesh>

      {/* Rotating Centrifuge Arm Assembly */}
      <group ref={armGroupRef} position={[0, 0.35, 0]}>
        {/* Counterweight Arm (Short side) */}
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[1.5, 0.25, 0.25]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[-1.9, 0, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>

        {/* Main Radial Arm (Long side) */}
        <mesh position={[1.4, 0, 0]}>
          <boxGeometry args={[2.8, 0.2, 0.25]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Trusses along the arm */}
        <mesh position={[1.2, 0.15, 0]}>
          <boxGeometry args={[2.0, 0.08, 0.18]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>

        {/* =======================================================
            COCKPIT GONDOLA CAPSULE (Mounted at arm tip)
           ======================================================= */}
        <group ref={gondolaRef} position={[2.8, 0, 0]}>
          {/* Gimbal Ring Mount */}
          <mesh>
            <torusGeometry args={[0.55, 0.05, 16, 32]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>

          {/* Aerodynamic Gondola Pod */}
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
            <meshStandardMaterial
              color="#0f1d33"
              metalness={0.6}
              roughness={0.2}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Transparent Acrylic Canopy Visor */}
          <mesh position={[0.1, 0.05, 0]}>
            <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.4}
              transmission={0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Trainee Hologram Pilot */}
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.12, 0.35, 8, 16]} />
            <meshStandardMaterial
              color={isAgsmActive ? '#10b981' : gForce > 5.5 ? '#ef4444' : '#38bdf8'}
              emissive={isAgsmActive ? '#10b981' : gForce > 5.5 ? '#ef4444' : '#0284c7'}
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Gondola Labels */}
          <Text position={[0, 0.65, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
            {gForce.toFixed(1)} G
          </Text>
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.09}
            color={isAgsmActive ? '#10b981' : '#f59e0b'}
            anchorX="center"
          >
            {isAgsmActive ? 'AGSM STRAINING ENGAGED' : 'PASSIVE SEAT'}
          </Text>
        </group>
      </group>
    </group>
  );
}

export const CentrifugeTrainer3D: React.FC = () => {
  const [gForce, setGForce] = useState<number>(3.5);
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [isAgsmActive, setIsAgsmActive] = useState<boolean>(false);
  const [strainingSeconds, setStrainingSeconds] = useState<number>(0);

  // Greyout / Blackout condition calculation (NASA / CSA Aviation Medicine)
  // Normal relaxed G-tolerance limit is approx +4.5 to +5.0 Gz.
  // AGSM raises G-tolerance limit to +8.0 to +9.0 Gz.
  const isGreyout = gForce > 4.5 && !isAgsmActive;
  const isGloc = gForce > 6.0 && !isAgsmActive;

  // Straining timer
  useEffect(() => {
    let interval: any;
    if (isAgsmActive) {
      interval = setInterval(() => {
        setStrainingSeconds((s) => (s + 1) % 4); // 3-second breathing cadence
      }, 1000);
    } else {
      setStrainingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isAgsmActive]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                CSA / NASA FLIGHT PHYSIOLOGY LAB
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 border border-cyan-700/50 text-cyan-300 rounded-full">
                HUMAN CENTRIFUGE SIMULATOR
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              High-G Acceleration & Anti-G Straining Maneuver (AGSM)
            </h2>
          </div>
        </div>

        {/* Live G-Readout Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">Head-to-Toe Vector:</span>
            <span
              className={`text-base font-bold ${
                isGloc ? 'text-red-400 animate-pulse' : isGreyout ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              +{gForce.toFixed(1)} Gz
            </span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        {/* Greyout / Blackout Tunnel Vision Overlay */}
        {isGloc ? (
          <div className="absolute inset-0 z-20 pointer-events-none bg-black/90 flex flex-col items-center justify-center space-y-2">
            <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
            <h3 className="text-xl font-bold font-mono text-red-400 uppercase tracking-widest">
              G-LOC OCCURRED (LOSS OF CONSCIOUSNESS)
            </h3>
            <p className="text-xs text-slate-300 font-mono max-w-md text-center">
              Cerebral blood pressure dropped below 22 mmHg at eye level. Engage Anti-G Straining Maneuver immediately.
            </p>
          </div>
        ) : isGreyout ? (
          <div className="absolute inset-0 z-20 pointer-events-none bg-radial-gradient shadow-[inset_0_0_120px_60px_rgba(0,0,0,0.85)] border-4 border-amber-500/50 flex items-center justify-center">
            <div className="bg-amber-950/80 px-4 py-2 rounded-xl border border-amber-500 text-amber-300 font-mono text-xs font-bold animate-pulse">
              PERIPHERAL VISION LOSS // GREYOUT WARNING
            </div>
          </div>
        ) : null}

        <Canvas
          camera={{ position: [0, 4.2, 5.8], fov: 46 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 4, 0]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[5, 8, 4]} intensity={0.9} />
          <Suspense fallback={null}>
            <CentrifugeMechanismScene
              gForce={gForce}
              isSpinning={isSpinning}
              isAgsmActive={isAgsmActive}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={3.0}
            maxDistance={8.5}
          />
        </Canvas>

        {/* Left Side: G-Force Acceleration Regulator */}
        <div className="absolute top-20 left-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-3">
          <div className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span>Centrifuge G-Load</span>
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Applied +Gz Load:</span>
              <span className="text-white font-bold">+{gForce.toFixed(1)} Gz</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={gForce}
              onChange={(e) => setGForce(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Launch (+3G)</span>
              <span>Re-Entry (+5G)</span>
              <span>Extreme (+8G)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Eye-Level Blood Pressure:</span>
              <span className={`font-bold ${gForce > 5.0 && !isAgsmActive ? 'text-red-400' : 'text-emerald-400'}`}>
                {Math.max(15, Math.round(120 - (gForce - 1) * 22 + (isAgsmActive ? 35 : 0)))} mmHg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gondola Radial Speed:</span>
              <span className="text-cyan-300 font-bold">{Math.round(gForce * 18.5)} rpm</span>
            </div>
          </div>
        </div>

        {/* Right Side: Anti-G Straining Maneuver (AGSM) Interactive Pacer */}
        <div className="absolute top-20 right-4 z-10 w-80 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-3">
          <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>AGSM Countermeasure Pacer</span>
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The Canadian Space Agency & NASA AGSM protocol protects blood flow to the brain by tensing calf, thigh, and abdominal muscle groups while maintaining a strict 3-second closed glottis breathing exchange.
          </p>

          <button
            onClick={() => setIsAgsmActive(!isAgsmActive)}
            className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isAgsmActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 animate-pulse'
                : 'bg-[#0f1d33] hover:bg-[#162a4a] text-cyan-300 border border-cyan-800/60'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>{isAgsmActive ? 'AGSM ENGAGED (HOLD MUSCLE TENSION)' : 'ACTIVATE AGSM STRAINING'}</span>
          </button>

          {isAgsmActive && (
            <div className="p-2.5 rounded bg-emerald-950/50 border border-emerald-600/50 text-xs font-mono text-emerald-200 text-center">
              CADENCE: {strainingSeconds < 3 ? 'HOLD & TENSE' : 'RAPID INHALE/EXHALE (0.5s)'} ({strainingSeconds + 1}/3s)
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-cyan-300 font-bold flex items-center gap-1.5"
          >
            {isSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSpinning ? 'Pause Centrifuge' : 'Resume Rotation'}</span>
          </button>

          <button
            onClick={() => {
              setGForce(3.5);
              setIsAgsmActive(false);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 hover:text-white"
          >
            Reset to Launch Baseline (+3.5G)
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Flight Rule: </span>
          <span className="text-cyan-300 font-bold">AGSM adds +3.5 to +4.0 Gz tolerance</span>
          <span> preventing G-LOC during peak ballistic atmospheric entry.</span>
        </div>
      </div>
    </div>
  );
};
