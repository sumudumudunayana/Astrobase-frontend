import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

import { Play, Pause, ChevronRight, ChevronLeft, Rocket, ShieldCheck, Flame, Compass, RefreshCw } from 'lucide-react';

export interface SpaceflightPhaseInfo {
  id: number;
  name: string;
  codename: string;
  altitude: string;
  velocity: string;
  gForce: string;
  description: string;
  keyEvents: string[];
  trajectoryPoint: [number, number, number];
  spacecraftRotation: [number, number, number];
}

export const PHASES_DATA: SpaceflightPhaseInfo[] = [
  {
    id: 1,
    name: 'Launch',
    codename: 'T-00:00:00 // LIFTOFF',
    altitude: '0 - 15 km',
    velocity: '0 -> Mach 1.5',
    gForce: '1.2 -> 2.5 g',
    description: 'First-stage rocket engines ignite at full chamber pressure. Hold-down clamps release, and the vehicle ascends vertically before initiating the aerodynamic gravity turn.',
    keyEvents: ['Main Engine Ignition', 'Hold-down clamp release', 'Tower clearance', 'Roll program initiation'],
    trajectoryPoint: [0, 2.05, 0],
    spacecraftRotation: [0, 0, 0],
  },
  {
    id: 2,
    name: 'Ascent & Max-Q',
    codename: 'T+00:01:18 // MAX-Q & STAGING',
    altitude: '15 - 80 km',
    velocity: 'Mach 1.5 -> Mach 10',
    gForce: '2.5 -> 4.5 g',
    description: 'The vehicle passes through Maximum Dynamic Pressure (Max-Q), experiencing peak aerodynamic stress. Engines throttle back briefly before first-stage Main Engine Cutoff (MECO) and stage separation.',
    keyEvents: ['Max-Q peak dynamic pressure', 'Engine throttle-down & throttle-up', 'MECO (Main Engine Cutoff)', 'First stage separation'],
    trajectoryPoint: [1.3, 2.2, 0.4],
    spacecraftRotation: [0, 0, -Math.PI / 4],
  },
  {
    id: 3,
    name: 'Orbital Insertion',
    codename: 'T+00:08:45 // SECO',
    altitude: '180 - 220 km',
    velocity: '7.7 km/s (27,700 km/h)',
    gForce: '0.0 g (Free Fall)',
    description: 'The vacuum-rated upper stage delivers the final horizontal velocity impulse. Second Engine Cutoff (SECO) occurs, confirming insertion into low Earth orbit.',
    keyEvents: ['Second Engine Cutoff (SECO)', 'Orbit circularization burn', 'Solar array deployment', 'Crew cabin zero-g adaptation'],
    trajectoryPoint: [2.5, 1.4, 0.8],
    spacecraftRotation: [0, 0, -Math.PI / 2],
  },
  {
    id: 4,
    name: 'Orbital Flight',
    codename: 'MET 01:00:00 // LEO STATIONKEEPING',
    altitude: '408 km',
    velocity: '7.66 km/s',
    gForce: '0.0001 g (Microgravity)',
    description: 'The spacecraft operates in continuous free fall around Earth. Systems perform rendezvous phasing, microgravity experiments, thermal roll maneuvers, and ground telemetry passes.',
    keyEvents: ['Proximity rendezvous operations', 'Thermal barbecue roll', 'Star tracker alignment', 'Three-way MCC communications'],
    trajectoryPoint: [2.7, 0, 0.2],
    spacecraftRotation: [0, 0, -Math.PI / 2],
  },
  {
    id: 5,
    name: 'Deorbit & Re-entry',
    codename: 'EI 400K FT // ENTRY INTERFACE',
    altitude: '122 km -> 15 km',
    velocity: 'Mach 25 -> Mach 1.5',
    gForce: '4.0 -> 5.5 g',
    description: 'A retrograde burn drops perigee into Earth atmosphere. At Entry Interface, hypersonic compression ionizes air into glowing plasma reaching 2,500°C, causing an RF communications blackout.',
    keyEvents: ['Retrograde deorbit burn', 'Trunk / Service module separation', 'Entry Interface (EI 122 km)', 'Plasma sheath RF blackout'],
    trajectoryPoint: [1.7, -1.9, 0.6],
    spacecraftRotation: [0, 0, -Math.PI * 0.85],
  },
  {
    id: 6,
    name: 'Terminal Descent & Landing',
    codename: 'TOUCHDOWN // RECOVERY',
    altitude: '10 km -> 0 km',
    velocity: '8 m/s (28 km/h)',
    gForce: '1.0 g',
    description: 'Supersonic drogue chutes stabilize the capsule, followed by main parachute deployment. The spacecraft achieves safe splashdown in oceanic recovery coordinates or cushioned land touchdown.',
    keyEvents: ['Apex cover jettison', 'Drogue parachute deployment', 'Triple main parachute opening', 'Splashdown & recovery ship pickup'],
    trajectoryPoint: [0.1, -2.05, 0],
    spacecraftRotation: [0, 0, -Math.PI],
  },
];

function EarthGlobe() {
  const earthRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial
          color="#16325B"
          roughness={0.8}
          metalness={0.1}
          emissive="#0A192F"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[2.08, 36, 36]} />
        <meshBasicMaterial
          color="#42D9F5"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// 3D Orbital Trajectory Arc
function TrajectoryArc({ activePhaseId }: { activePhaseId: number }) {
  const points = useMemo(() => {
    return PHASES_DATA.map((p) => new THREE.Vector3(...p.trajectoryPoint));
  }, []);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points, false);
  }, [points]);

  const curvePoints = useMemo(() => curve.getPoints(80), [curve]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(curvePoints), [curvePoints]);

  return (
    <group>
      {/* Flight Path Line */}
      <Line points={curvePoints} color="#42D9F5" lineWidth={2} transparent opacity={0.6} />

      {/* Trajectory Waypoints */}
      {PHASES_DATA.map((phase) => {
        const isActive = phase.id === activePhaseId;
        return (
          <group key={phase.id} position={phase.trajectoryPoint}>
            <mesh>
              <sphereGeometry args={[isActive ? 0.09 : 0.05, 16, 16]} />
              <meshBasicMaterial
                color={isActive ? '#F5B942' : '#42D9F5'}
                toneMapped={false}
              />
            </mesh>
            {isActive && (
              <mesh>
                <sphereGeometry args={[0.16, 16, 16]} />
                <meshBasicMaterial
                  color="#F5B942"
                  transparent
                  opacity={0.3}
                  wireframe
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Animated Spacecraft Traveling to Current Phase
function SpacecraftActor({ targetPhase }: { targetPhase: SpaceflightPhaseInfo }) {
  const craftRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (!craftRef.current) return;
    const [tx, ty, tz] = targetPhase.trajectoryPoint;
    const [rx, ry, rz] = targetPhase.spacecraftRotation;

    // Smooth damp towards target waypoint
    craftRef.current.position.x = THREE.MathUtils.damp(craftRef.current.position.x, tx, 3.5, delta);
    craftRef.current.position.y = THREE.MathUtils.damp(craftRef.current.position.y, ty, 3.5, delta);
    craftRef.current.position.z = THREE.MathUtils.damp(craftRef.current.position.z, tz, 3.5, delta);

    craftRef.current.rotation.x = THREE.MathUtils.damp(craftRef.current.rotation.x, rx, 3.5, delta);
    craftRef.current.rotation.y = THREE.MathUtils.damp(craftRef.current.rotation.y, ry, 3.5, delta);
    craftRef.current.rotation.z = THREE.MathUtils.damp(craftRef.current.rotation.z, rz, 3.5, delta);
  });

  return (
    <group ref={craftRef} position={targetPhase.trajectoryPoint} scale={0.15}>
      {/* Command Capsule Body */}
      <mesh castShadow>
        <coneGeometry args={[0.5, 0.7, 16]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Base Heat Shield */}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.08, 16]} />
        <meshStandardMaterial color="#2B2D42" roughness={0.9} />
      </mesh>
      {/* Thruster Flame / Plasma Plume */}
      {targetPhase.id <= 3 && (
        <mesh position={[0, -0.7, 0]}>
          <coneGeometry args={[0.25, 0.6, 8]} />
          <meshBasicMaterial color="#F5B942" transparent opacity={0.8} />
        </mesh>
      )}
      {targetPhase.id === 5 && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#FF4500" transparent opacity={0.35} wireframe />
        </mesh>
      )}
    </group>
  );
}

export const SpaceflightPhases3D: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const activePhase = PHASES_DATA[activePhaseIndex];

  // Auto-play timer
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActivePhaseIndex((prev) => (prev + 1) % PHASES_DATA.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNext = () => {
    setActivePhaseIndex((prev) => (prev + 1) % PHASES_DATA.length);
  };

  const handlePrev = () => {
    setActivePhaseIndex((prev) => (prev - 1 + PHASES_DATA.length) % PHASES_DATA.length);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Phase Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1E2E4A] pb-3">
        {PHASES_DATA.map((p, idx) => {
          const isSelected = idx === activePhaseIndex;
          return (
            <button
              key={p.id}
              onClick={() => {
                setActivePhaseIndex(idx);
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5] shadow-[0_0_12px_rgba(66,217,245,0.25)]'
                  : 'bg-[#111E32]/60 text-[#94A3B8] border border-[#1E2E4A] hover:bg-[#111E32] hover:text-white'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                isSelected ? 'bg-[#42D9F5] text-[#050914]' : 'bg-[#1E2E4A] text-[#94A3B8]'
              }`}>
                {p.id}
              </span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Canvas + Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Canvas Box (7 columns) */}
        <div className="lg:col-span-7 h-[540px] lg:h-[580px] rounded-xl relative border border-[#1E2E4A] bg-[#070D1A] overflow-hidden shadow-2xl">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#42D9F5] font-mono text-xs">SYNCHRONIZING ORBITAL TRAJECTORY...</div>}>
            <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 3, 5]} intensity={1.5} color="#FFFFFF" />
              <directionalLight position={[-4, -3, -2]} intensity={0.3} color="#42D9F5" />
              <Stars radius={40} depth={20} count={2000} factor={3} saturation={0.5} fade />

              <EarthGlobe />
              <TrajectoryArc activePhaseId={activePhase.id} />
              <SpacecraftActor targetPhase={activePhase} />

              <OrbitControls enableZoom={true} enablePan={false} minDistance={3.5} maxDistance={9} />
            </Canvas>
          </Suspense>

          {/* Interactive Player Controls on Canvas */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#0B1424]/90 border border-[#1E2E4A] px-3 py-1.5 rounded-full backdrop-blur-md">
            <button
              onClick={handlePrev}
              className="p-1 text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
              title="Previous Phase"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 text-[#42D9F5] hover:text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Auto-Play Sequence'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleNext}
              className="p-1 text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
              title="Next Phase"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-[#94A3B8] border-l border-[#1E2E4A] pl-2 ml-1">
              Phase {activePhase.id}/6
            </span>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none text-right font-mono text-[11px] text-[#42D9F5] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#42D9F5]/20 backdrop-blur-sm">
            <span>FLIGHT DYNAMICS SIMULATOR</span>
          </div>
        </div>

        {/* Phase Telemetry & Educational Content (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#42D9F5] tracking-wider uppercase font-semibold">
                {activePhase.codename}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111E32] text-[#F5B942] border border-[#F5B942]/30">
                PHASE {activePhase.id} OF 6
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{activePhase.name}</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">{activePhase.description}</p>

            {/* Real-time Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1E2E4A]/80 font-mono text-center">
              <div>
                <span className="text-[10px] text-[#94A3B8] block">ALTITUDE</span>
                <span className="text-xs font-bold text-white">{activePhase.altitude}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block">VELOCITY</span>
                <span className="text-xs font-bold text-[#42D9F5]">{activePhase.velocity}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block">ACCEL / G</span>
                <span className="text-xs font-bold text-[#F5B942]">{activePhase.gForce}</span>
              </div>
            </div>

            {/* Critical Milestones */}
            <div className="mt-4">
              <h4 className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#42D9F5]" />
                Key Flight Events & Checkpoints:
              </h4>
              <ul className="space-y-1.5">
                {activePhase.keyEvents.map((evt, i) => (
                  <li key={i} className="text-xs text-[#E2E8F0] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#42D9F5]" />
                    <span>{evt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
