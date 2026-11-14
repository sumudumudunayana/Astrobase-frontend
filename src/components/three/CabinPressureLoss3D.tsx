import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  AlertTriangle,
  Shield,
  Activity,
  Wind,
  Layers,
  Lock,
  Unlock,
  HeartPulse,
} from 'lucide-react';

interface PressureHotspot {
  id: string;
  title: string;
  position: [number, number, number];
  role: 'hazard' | 'isolation' | 'sensor';
  description: string;
  specs: Record<string, string>;
}

const HOTSPOTS: PressureHotspot[] = [
  {
    id: 'puncture',
    title: 'MMOD Kinetic Hull Puncture',
    position: [-2.2, 0.4, 0.8],
    role: 'hazard',
    description: 'A 4mm orbital debris fragment penetrated the Whipple bumper shield and outer aluminum-lithium pressure wall, creating an acoustic sonic air leak.',
    specs: {
      'Breach Diameter': '4.2 mm aperture',
      'Leak Velocity': 'Sonic choked flow (340 m/s)',
      'Cabin Delta-P': '-1.8 kPa / minute',
    },
  },
  {
    id: 'hatch',
    title: 'Bulkhead Isolation Hatch & Dogs',
    position: [-0.9, 0, 0],
    role: 'isolation',
    description: 'Manual/automatic pressure-assisted sealing hatch. Locking eight circumferential dog latches isolates Node 2 from the main station core.',
    specs: {
      'Hatch Type': 'Common CBM Hatch',
      'Latch System': '8-point mechanical gear dogs',
      'Seal Rating': '140 kPa differential pressure',
    },
  },
  {
    id: 'sensor',
    title: 'Delta-P Barometric Transducer',
    position: [0.8, 0.6, 0.5],
    role: 'sensor',
    description: 'Triple-redundant silicon diaphragm pressure sensor measuring absolute atmospheric pressure and instantaneous rate of change.',
    specs: {
      'Nominal Setpoint': '101.3 kPa (14.7 psi)',
      'Alarm Threshold': '90.0 kPa (Depress alert)',
      'TUC @ 50 kPa': '5 to 8 minutes',
    },
  },
];

// 3D Air Leak Particles
function LeakParticles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 350;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -2.2 + (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 1] = 0.4 + (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 2] = 0.8 + (Math.random() - 0.5) * 0.1;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Escape vector outwards towards space
      array[i * 3 + 2] += (2.5 + Math.random() * 2.0) * delta;
      array[i * 3] += (Math.random() - 0.5) * 0.3 * delta;
      array[i * 3 + 1] += (Math.random() - 0.5) * 0.3 * delta;

      if (array[i * 3 + 2] > 2.8) {
        array[i * 3] = -2.2 + (Math.random() - 0.5) * 0.1;
        array[i * 3 + 1] = 0.4 + (Math.random() - 0.5) * 0.1;
        array[i * 3 + 2] = 0.8;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#38BDF8"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3D Habitat Module Geometry with Hatch
function HabitatAssembly({
  hatchSealed,
  isLeaking,
  maskEquipped,
  selectedHotspot,
  onSelectHotspot,
}: {
  hatchSealed: boolean;
  isLeaking: boolean;
  maskEquipped: boolean;
  selectedHotspot: PressureHotspot | null;
  onSelectHotspot: (h: PressureHotspot) => void;
}) {
  return (
    <group>
      {/* Node 2 Module (Compromised segment on left) */}
      <group position={[-2.2, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.1, 1.1, 2.2, 24, 1, true]} />
          <meshStandardMaterial
            color={isLeaking && !hatchSealed ? '#EF4444' : '#1E293B'}
            roughness={0.4}
            metalness={0.6}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Module Endcap Bulkhead */}
        <mesh position={[-1.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[1.1, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* Whipple Shielding Ribs */}
        {[-0.6, 0, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.12, 0.03, 8, 24]} />
            <meshStandardMaterial color="#64748B" metalness={0.8} />
          </mesh>
        ))}

        {/* Puncture Hole Alert Ring */}
        <mesh
          position={[0, 0.4, 0.8]}
          onClick={() => onSelectHotspot(HOTSPOTS[0])}
        >
          <ringGeometry args={[0.04, 0.12, 16]} />
          <meshBasicMaterial
            color={isLeaking ? '#EF4444' : '#10B981'}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Bulkhead Ring between Node 2 and Node 1 */}
      <mesh position={[-0.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.55, 1.15, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Bulkhead Hatch Plate */}
      <group
        position={[-0.9, hatchSealed ? 0 : 0.65, 0]}
        onClick={() => onSelectHotspot(HOTSPOTS[1])}
      >
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.52, 24]} />
          <meshStandardMaterial
            color={hatchSealed ? '#10B981' : '#F59E0B'}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        {/* Hatch Dog Latches */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <mesh
              key={i}
              position={[0.02, Math.sin(rad) * 0.46, Math.cos(rad) * 0.46]}
            >
              <boxGeometry args={[0.04, 0.06, 0.04]} />
              <meshStandardMaterial color={hatchSealed ? '#059669' : '#DC2626'} />
            </mesh>
          );
        })}
      </group>

      {/* Node 1 & Destiny Core (Safe Haven segment on right) */}
      <group position={[1.1, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.1, 1.1, 3.4, 24, 1, true]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Right Bulkhead */}
        <mesh position={[1.7, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[1.1, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* Interior Lighting Strips */}
        <pointLight
          position={[0, 0.7, 0]}
          intensity={1.2}
          color={isLeaking && !hatchSealed ? '#F87171' : '#38BDF8'}
        />

        {/* Delta-P Sensor hot-point */}
        <mesh
          position={[-0.3, 0.6, 0.5]}
          onClick={() => onSelectHotspot(HOTSPOTS[2])}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Astronaut inside Core with Mask indicator */}
        <group position={[0.4, -0.4, 0]}>
          {/* Astronaut torso */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.16, 0.14, 0.45, 12]} />
            <meshStandardMaterial color="#E2E8F0" />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.56, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#CBD5E1" />
          </mesh>
          {/* Quick-Don Mask */}
          {maskEquipped && (
            <mesh position={[0, 0.54, 0.1]}>
              <boxGeometry args={[0.14, 0.1, 0.08]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.3} />
            </mesh>
          )}
        </group>
      </group>

      {/* Gas Leak Particle Effect */}
      <LeakParticles active={isLeaking && !hatchSealed} />

      {/* Interactive Hotspot Indicators */}
      {HOTSPOTS.map((h) => {
        const isSelected = selectedHotspot?.id === h.id;
        return (
          <group key={h.id} position={h.position} onClick={() => onSelectHotspot(h)}>
            <mesh>
              <sphereGeometry args={[isSelected ? 0.1 : 0.07, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#38BDF8' : '#F59E0B'}
                emissive={isSelected ? '#0284C7' : '#B45309'}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export const CabinPressureLoss3D: React.FC = () => {
  const [isLeaking, setIsLeaking] = useState(true);
  const [hatchSealed, setHatchSealed] = useState(false);
  const [maskEquipped, setMaskEquipped] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<PressureHotspot | null>(HOTSPOTS[0]);

  // Derived Telemetry Values
  const cabinPressureKpa = hatchSealed
    ? 98.4
    : isLeaking
    ? 84.6
    : 101.3;

  const tucMinutes = cabinPressureKpa < 50 ? 5 : cabinPressureKpa < 80 ? 45 : 999;

  const handleReset = () => {
    setIsLeaking(true);
    setHatchSealed(false);
    setMaskEquipped(false);
    setSelectedHotspot(HOTSPOTS[0]);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Wind className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                CABIN PRESSURE LOSS & HATCH ISOLATION
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
                CRITICAL LAB 01
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Node 2 (Harmony) Hull Puncture • Rapid Decompression Simulation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMaskEquipped(!maskEquipped)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              maskEquipped
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-bounce'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            {maskEquipped ? 'MASK ON (100% O2)' : 'DON QUICK-DON MASK'}
          </button>

          <button
            onClick={() => setHatchSealed(!hatchSealed)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              hatchSealed
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {hatchSealed ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {hatchSealed ? 'HATCH SEALED' : 'SEAL NODE 2 HATCH'}
          </button>

          <button
            onClick={() => setIsLeaking(!isLeaking)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {isLeaking ? 'SIMULATE LEAK ON' : 'LEAK PAUSED'}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="h-[480px] lg:h-[540px] w-full relative">
        <Canvas camera={{ position: [0, 2.2, 4.5], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 4]} intensity={1.2} />
          <directionalLight position={[-4, -3, -2]} intensity={0.3} color="#38BDF8" />
          <Stars radius={60} depth={40} count={2500} factor={3} saturation={0} fade speed={1} />

          <Suspense fallback={null}>
            <HabitatAssembly
              hatchSealed={hatchSealed}
              isLeaking={isLeaking}
              maskEquipped={maskEquipped}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={2.5}
            maxDistance={8}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>

        {/* Real-time Telemetry HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-xl p-3 shadow-xl min-w-[210px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              CABIN PRESSURE STATUS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  cabinPressureKpa < 90 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {cabinPressureKpa.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">kPa</span>
              <span className="text-[10px] font-mono text-slate-500">
                ({(cabinPressureKpa * 0.145038).toFixed(1)} psi)
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">TREND:</span>
              <span
                className={`font-bold ${
                  hatchSealed ? 'text-emerald-400' : isLeaking ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {hatchSealed ? 'STABILIZED' : isLeaking ? '-1.8 kPa / MIN' : 'NOMINAL'}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">TUC LIMIT:</span>
              <span className="font-bold text-amber-400">
                {tucMinutes > 100 ? 'UNRESTRICTED' : `${tucMinutes} MIN`}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">CREW SpO2:</span>
              <span className={`font-bold ${maskEquipped ? 'text-emerald-400' : 'text-amber-400'}`}>
                {maskEquipped ? '99% (MASK 100% O2)' : '93% (DECLINING)'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Hotspot Deep-Dive Overlay */}
        {selectedHotspot && (
          <div className="absolute bottom-4 right-4 z-10 max-w-sm bg-[#0B1528]/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedHotspot.title}
                </h4>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {selectedHotspot.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedHotspot.description}</p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-1 gap-1">
              {Object.entries(selectedHotspot.specs).map(([key, val]) => (
                <div key={key} className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-cyan-300 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
