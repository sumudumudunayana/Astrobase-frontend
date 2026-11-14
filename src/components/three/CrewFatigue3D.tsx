import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Moon,
  Sun,
  Activity,
  HeartPulse,
  Bed,
  ShieldAlert,
  Zap,
  Sliders,
} from 'lucide-react';

function CircadianSleepPodScene({
  dutyHours,
  lightSpectrum,
  sleepMode,
}: {
  dutyHours: number;
  lightSpectrum: 'BLUE_ALERT' | 'RED_SLEEP' | 'NEUTRAL';
  sleepMode: boolean;
}) {
  const dialRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Group>(null);
  const podLightRef = useRef<THREE.PointLight>(null);

  const getLightColor = () => {
    switch (lightSpectrum) {
      case 'BLUE_ALERT':
        return '#38bdf8'; // Blue-enriched morning light
      case 'RED_SLEEP':
        return '#f87171'; // Melatonin-protective red spectrum
      default:
        return '#fef08a'; // Neutral cabin light
    }
  };

  const currentLightColor = getLightColor();

  useFrame((state, delta) => {
    // 24-hr Circadian orbit dial rotation
    if (dialRef.current) {
      dialRef.current.rotation.z += delta * 0.15;
    }

    // Cognitive wave oscillation
    if (waveRef.current) {
      waveRef.current.children.forEach((c, idx) => {
        const mesh = c as THREE.Mesh;
        const freq = 2.0 + idx * 0.3;
        mesh.scale.y = 0.5 + Math.sin(state.clock.elapsedTime * freq) * 0.4 * (dutyHours / 8);
      });
    }
  });

  return (
    <group>
      {/* Platform */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[2.8, 3.0, 0.15, 32]} />
        <meshStandardMaterial color="#0b1322" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* =========================================================
          SLEEP QUARTER BUNK POD (Right side)
         ========================================================= */}
      <group position={[1.2, 0.2, 0]}>
        {/* Enclosed Acoustic Sleep Capsule Shell */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 1.8, 1.2]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.6}
            roughness={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Interior Sleeping Berth / Restraint Bag */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.22, 0.9, 8, 16]} />
          <meshStandardMaterial
            color={sleepMode ? '#38bdf8' : '#64748b'}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        {/* Pod Circadian Lighting Panel */}
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.8]} />
          <meshStandardMaterial
            color={currentLightColor}
            emissive={currentLightColor}
            emissiveIntensity={sleepMode ? 0.4 : 1.2}
          />
        </mesh>
        <pointLight
          ref={podLightRef}
          position={[0, 0.7, 0]}
          color={currentLightColor}
          intensity={sleepMode ? 0.3 : 1.5}
          distance={2.5}
        />

        <Text position={[0, 1.1, 0]} fontSize={0.11} color="#f8fafc" anchorX="center">
          CREW SLEEP POD 02
        </Text>
        <Text position={[0, -1.0, 0]} fontSize={0.09} color={currentLightColor} anchorX="center">
          SPECTRUM: {lightSpectrum}
        </Text>
      </group>

      {/* =========================================================
          24-HR CIRCADIAN ORBIT DIAL (Left side)
         ========================================================= */}
      <group position={[-1.2, 0.3, 0]}>
        <group ref={dialRef}>
          {/* Day / Sun Arc (Top Half) */}
          <mesh>
            <ringGeometry args={[0.85, 1.1, 32, 1, 0, Math.PI]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          {/* Night / Orbital Shadow Arc (Bottom Half) */}
          <mesh>
            <ringGeometry args={[0.85, 1.1, 32, 1, Math.PI, Math.PI]} />
            <meshBasicMaterial color="#1e1b4b" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Central Dial Hub */}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial color="#071322" metalness={0.8} />
        </mesh>

        {/* Hours on Duty Pointer */}
        <group rotation={[0, 0, -((dutyHours / 24) * Math.PI * 2)]}>
          <mesh position={[0, 0.45, 0.05]}>
            <boxGeometry args={[0.04, 0.7, 0.02]} />
            <meshStandardMaterial
              color={dutyHours > 12 ? '#ef4444' : dutyHours > 9 ? '#f59e0b' : '#10b981'}
              emissive={dutyHours > 12 ? '#ef4444' : '#10b981'}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>

        <Text position={[0, 0.15, 0.06]} fontSize={0.14} color="#ffffff" anchorX="center">
          {dutyHours}h
        </Text>
        <Text position={[0, -0.15, 0.06]} fontSize={0.08} color="#94a3b8" anchorX="center">
          DUTY CYCLE
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.10} color="#38bdf8" anchorX="center">
          CIRCADIAN RHYTHM DIAL
        </Text>
      </group>

      {/* =========================================================
          COGNITIVE REACTION-TIME / WORKLOAD BARS (Center Floor)
         ========================================================= */}
      <group ref={waveRef} position={[0, -0.5, 0.8]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[(i - 3) * 0.22, 0.3, 0]}>
            <boxGeometry args={[0.12, 0.6, 0.12]} />
            <meshStandardMaterial
              color={dutyHours > 12 ? '#ef4444' : dutyHours > 9 ? '#f59e0b' : '#06b6d4'}
              emissive={dutyHours > 12 ? '#ef4444' : '#06b6d4'}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}
        <Text position={[0, -0.15, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
          COGNITIVE WORKLOAD & REACTION TIME LATENCY
        </Text>
      </group>
    </group>
  );
}

export const CrewFatigue3D: React.FC = () => {
  const [dutyHours, setDutyHours] = useState<number>(8);
  const [lightSpectrum, setLightSpectrum] = useState<'BLUE_ALERT' | 'RED_SLEEP' | 'NEUTRAL'>('NEUTRAL');
  const [sleepMode, setSleepMode] = useState<boolean>(false);

  // Dynamic calculations based on NASA SAFTE fatigue modeling
  const reactionTimeMs = Math.round(220 + Math.pow(Math.max(0, dutyHours - 6), 1.6) * 35);
  const errorProbabilityPct = Math.min(65, Math.round(1.5 + Math.pow(Math.max(0, dutyHours - 7), 1.8) * 3));
  const cognitiveEffectivenessPct = Math.max(30, Math.round(100 - (dutyHours - 4) * 4.8));

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-950/60 border border-purple-500/40 rounded-lg text-purple-400">
            <HeartPulse className="w-5 h-5 animate-pulse text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-400 tracking-wider uppercase">
                CRM MODULE 08 // LESSON 04
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 border border-purple-700/50 text-purple-300 rounded-full">
                WELLNESS, FATIGUE & CIRCADIAN CYCLES
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Sleep Pod Architecture & Cognitive Degradation Gauge
            </h2>
          </div>
        </div>

        {/* Cognitive Index Badge */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <div className="bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
            <span className="text-slate-400">Effectiveness:</span>
            <span
              className={`font-bold ${
                cognitiveEffectivenessPct > 80
                  ? 'text-emerald-400'
                  : cognitiveEffectivenessPct > 60
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {cognitiveEffectivenessPct}%
            </span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 2.4, 4.4], fov: 48 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 4, 2]} intensity={1.2} color="#38bdf8" />
          <directionalLight position={[4, 6, 3]} intensity={0.8} />
          <Suspense fallback={null}>
            <CircadianSleepPodScene
              dutyHours={dutyHours}
              lightSpectrum={lightSpectrum}
              sleepMode={sleepMode}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2.5}
            maxDistance={7.5}
          />
        </Canvas>

        {/* Left Side: Duty Hours & Bio-Telemetry Metrics */}
        <div className="absolute top-20 left-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-3">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>NASA SAFTE Fatigue Bio-Model</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">MET Continuous Duty:</span>
              <span className="text-white font-bold">{dutyHours} Hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="18"
              step="1"
              value={dutyHours}
              onChange={(e) => setDutyHours(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Fresh (2h)</span>
              <span>Nominal (8h)</span>
              <span>Exhausted (18h)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Psychomotor Reaction Latency:</span>
              <span className={`font-bold ${reactionTimeMs > 350 ? 'text-red-400' : 'text-slate-200'}`}>
                {reactionTimeMs} ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Lapse / Error Probability:</span>
              <span className={`font-bold ${errorProbabilityPct > 20 ? 'text-red-400' : 'text-slate-200'}`}>
                {errorProbabilityPct}%
              </span>
            </div>
            {dutyHours > 12 && (
              <div className="p-2 rounded bg-red-950/70 border border-red-800 text-[11px] text-red-200">
                CRITICAL FATIGUE: Exceeds 12-hr flight limit. High risk of procedural lapse. Mandatory rest required.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Fatigue Countermeasures Suite */}
        <div className="absolute top-20 right-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Sleep Pod Environment</span>
            <Bed className="w-3.5 h-3.5 text-purple-400" />
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => {
                setLightSpectrum('BLUE_ALERT');
                setSleepMode(false);
              }}
              className={`w-full p-2 rounded text-xs font-mono text-left transition-all ${
                lightSpectrum === 'BLUE_ALERT'
                  ? 'bg-sky-600/30 border border-sky-400 text-sky-200'
                  : 'bg-[#0f1d33] border border-transparent text-slate-300'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-sky-400" />
                <span>Blue Light Therapy (Alertness)</span>
              </div>
              <div className="text-[10px] text-slate-400">Suppresses melatonin for post-sleep wake cycle</div>
            </button>

            <button
              onClick={() => {
                setLightSpectrum('RED_SLEEP');
                setSleepMode(true);
              }}
              className={`w-full p-2 rounded text-xs font-mono text-left transition-all ${
                lightSpectrum === 'RED_SLEEP'
                  ? 'bg-rose-600/30 border border-rose-400 text-rose-200'
                  : 'bg-[#0f1d33] border border-transparent text-slate-300'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-rose-400" />
                <span>Red-Shift Light (Pre-Sleep)</span>
              </div>
              <div className="text-[10px] text-slate-400">Stimulates natural melatonin production for sleep</div>
            </button>

            <button
              onClick={() => {
                setSleepMode(!sleepMode);
              }}
              className={`w-full p-2 rounded text-xs font-mono text-left transition-all ${
                sleepMode
                  ? 'bg-emerald-600/30 border border-emerald-400 text-emerald-200'
                  : 'bg-[#0f1d33] border border-transparent text-slate-300'
              }`}
            >
              <div className="font-bold">
                Berth State: {sleepMode ? 'REST CYCLE ACTIVE' : 'OPEN CABIN'}
              </div>
              <div className="text-[10px] text-slate-400">Acoustic baffling 48 dB, airflow 0.15 m/s</div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info Strip */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="text-xs font-mono text-slate-400">
          <span>Flight Rule: </span>
          <span className="text-cyan-300 font-bold">8.5 Hours Uninterrupted Sleep Opportunity</span>
          <span> per 24-hr MET cycle required before EVAs or docking maneuvers.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDutyHours(8)}
            className="px-2.5 py-1 rounded text-xs font-mono bg-slate-800 text-slate-300 hover:text-white"
          >
            Reset to 8h Duty
          </button>
        </div>
      </div>
    </div>
  );
};
