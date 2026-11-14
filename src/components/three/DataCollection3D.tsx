import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Activity,
  Sliders,
  Filter,
  Zap,
} from 'lucide-react';

function SpectrometerDataScene({
  isFilterActive,
  hasCosmicRayStrike,
}: {
  isFilterActive: boolean;
  hasCosmicRayStrike: boolean;
}) {
  const laserBeam = useRef<THREE.Mesh>(null);
  const sensorHead = useRef<THREE.Group>(null);
  const dataPointsGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sensorHead.current) {
      sensorHead.current.position.x = Math.sin(t * 1.2) * 1.2;
    }
    if (laserBeam.current) {
      laserBeam.current.position.x = Math.sin(t * 1.2) * 1.2;
    }
  });

  // Generate 20 data nodes along curve
  const dataNodes = Array.from({ length: 24 }).map((_, i) => {
    const x = (i - 11.5) * 0.22;
    let y = -0.3 + 0.6 * Math.sin(i * 0.45);
    let isSpike = false;

    // Simulate transient cosmic ray spike at index 14
    if (i === 14 && hasCosmicRayStrike) {
      y = isFilterActive ? y : 1.35; // Spike if unfiltered
      isSpike = !isFilterActive;
    }

    return { x, y, isSpike };
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Specimen Inspection Bed */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[4.2, 0.2, 2.0]} />
        <meshStandardMaterial color="#0b1329" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Optical Bench Rails */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 4.4, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>

      {/* Moving Spectrometer Sensor Head */}
      <group ref={sensorHead} position={[0, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.4, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.12, 0.08, 0.15, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Pulsed Laser Scanning Beam */}
      <mesh ref={laserBeam} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 2.2, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
      </mesh>

      {/* Ground Specimen Sample Pellet */}
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.15, 32]} />
        <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* 3D Telemetry Data Nodes & Connection Line */}
      <group ref={dataPointsGroup} position={[0, 0.1, 0.6]}>
        {dataNodes.map((pt, idx) => (
          <group key={idx} position={[pt.x, pt.y, 0]}>
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshBasicMaterial color={pt.isSpike ? '#ef4444' : isFilterActive ? '#10b981' : '#38bdf8'} />
            </mesh>
            {/* Outlier Alert Tag */}
            {pt.isSpike && (
              <Html center position={[0, 0.35, 0]} className="pointer-events-none select-none whitespace-nowrap">
                <div className="px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500 text-[10px] font-mono font-bold text-rose-300 animate-pulse">
                  +4.2σ COSMIC RAY SPIKE
                </div>
              </Html>
            )}
          </group>
        ))}

        {/* Interpolation trend line */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[5.0, 0.015, 0.015]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export const DataCollection3D: React.FC = () => {
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [hasCosmicRayStrike, setHasCosmicRayStrike] = useState(true);

  return (
    <div className="w-full rounded-2xl bg-[#050b14] border border-cyan-800/40 p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXP-03 // SPECTROMETRIC DATA INGESTION
            </span>
            <span className="text-xs font-mono text-slate-400">
              High-Frequency Sensor Telemetry & Anomaly Filtering
            </span>
          </div>
          <h3 className="text-base font-bold text-white font-mono tracking-wide">
            Laser Spectrometer Scan & Statistical Outlier Rejection
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-cyan-300 border border-cyan-800/60">
            Sampling Rate: 100 Hz
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-emerald-400 border border-emerald-800/60">
            SNR: 42.6 dB
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-xl bg-gradient-to-b from-[#020610] to-[#07111f] border border-slate-800 overflow-hidden">
        <Canvas camera={{ position: [0, 0.5, 4.4], fov: 46 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} color="#bae6fd" />
          <Suspense fallback={null}>
            <SpectrometerDataScene isFilterActive={isFilterActive} hasCosmicRayStrike={hasCosmicRayStrike} />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} minDistance={2.5} maxDistance={7.0} />
        </Canvas>

        {/* Live Filter Telemetry HUD */}
        <div className="absolute top-3 left-3 bg-[#07111f]/90 border border-cyan-800/80 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-300 backdrop-blur pointer-events-none">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            SENSOR TELEMETRY ENGINE
          </div>
          <div>Detector Band: <span className="text-white font-bold">CCD Photodiode Array</span></div>
          <div>Filter Engine: <span className={isFilterActive ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{isFilterActive ? '3-Sigma Outlier Rejection Active' : 'Raw Sensor Unfiltered'}</span></div>
          <div>Signal Quality: <span className={isFilterActive ? 'text-cyan-300 font-bold' : 'text-rose-400 font-bold'}>{isFilterActive ? 'Clean Monotonic Curve (No Spikes)' : 'Cosmic Ray Artifact Present'}</span></div>
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded border border-slate-800">
          DRAG TO ROTATE // SCROLL TO ZOOM
        </div>
      </div>

      {/* Control Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-cyan-400 font-semibold block uppercase">
            1. Statistical Noise Filter (3σ Threshold)
          </span>
          <button
            onClick={() => setIsFilterActive(!isFilterActive)}
            className={`w-full py-2 px-3 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isFilterActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-rose-900/70 text-rose-200 border border-rose-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isFilterActive ? 'OUTLIER FILTER: ENGAGED (Reject Spike)' : 'OUTLIER FILTER: BYPASSED (Raw Signal)'}</span>
          </button>
        </div>

        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-amber-400 font-semibold block uppercase">
            2. Radiation Environment Injection
          </span>
          <button
            onClick={() => setHasCosmicRayStrike(!hasCosmicRayStrike)}
            className={`w-full py-2 px-3 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
              hasCosmicRayStrike ? 'bg-amber-600 text-white' : 'bg-[#0f1b2d] text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{hasCosmicRayStrike ? 'COSMIC RAY HIT: SIMULATING' : 'COSMIC RAY HIT: NONE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
