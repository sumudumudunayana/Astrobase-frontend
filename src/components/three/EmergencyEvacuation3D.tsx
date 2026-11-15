import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Compass,
  AlertOctagon,
  Shield,
  Layers,
  Rocket,
  CheckCircle,
  Users,
  Lock,
} from 'lucide-react';

interface EvacuationHotspot {
  id: string;
  title: string;
  position: [number, number, number];
  description: string;
  specs: Record<string, string>;
}

const HOTSPOTS: EvacuationHotspot[] = [
  {
    id: 'return_capsule',
    title: 'Docked Commercial Crew Return Spacecraft',
    position: [1.8, 0.4, 0],
    description: 'Autonomous crew return vehicle maintaining continuous standby with independent life support, avionics, and re-entry heat shield.',
    specs: {
      'Crew Capacity': '4 Astronauts in custom contour couches',
      'Autonomous Endurance': 'Up to 24 hours free flight',
      'Undock Readiness': '<15 minutes from order',
    },
  },
  {
    id: 'docking_vestibule',
    title: 'International Docking Adapter (IDA)',
    position: [0.9, 0, 0],
    description: 'Low-impact docking system featuring 12 active/passive mechanical hooks and an airtight vestibule with differential pressure equalization valves.',
    specs: {
      'Separation System': 'Pyrotechnic / mechanical spring push-off',
      'Vestibule Volume': '2.1 m3',
      'Leak Check Duration': '5 minute delta-P verification',
    },
  },
  {
    id: 'egress_corridor',
    title: 'Emergency Illuminated Egress Corridor',
    position: [-0.6, -0.3, 0],
    description: 'Photoluminescent green emergency path guidance system guiding crew through smoke or power outages directly towards the departure vehicle.',
    specs: {
      'Illumination': 'Autonomous tritium/photoluminescent glow',
      'Transit Time': '<90 seconds to escape vehicle ingress',
      'Hatches Encountered': '3 sequential pressure bulkheads',
    },
  },
];

// Thruster Plume Particles for undocking departure
function ThrusterPlumes({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 250;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 1.6 + Math.random() * 0.2;
      pos[i * 3 + 1] = 0.4 + (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      array[i * 3] -= 2.0 * delta; // Thruster exhaust firing backwards against station
      if (array[i * 3] < 0.8) {
        array[i * 3] = 1.6 + Math.random() * 0.2;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#38BDF8"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function EvacuationStationAssembly({
  maydayDeclared,
  egressHighlighted,
  hatchesSealed,
  boarded,
  undocked,
  selectedHotspot,
  onSelectHotspot,
}: {
  maydayDeclared: boolean;
  egressHighlighted: boolean;
  hatchesSealed: boolean;
  boarded: boolean;
  undocked: boolean;
  selectedHotspot: EvacuationHotspot | null;
  onSelectHotspot: (h: EvacuationHotspot) => void;
}) {
  const capsuleGroupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (undocked && capsuleGroupRef.current) {
      if (capsuleGroupRef.current.position.x < 3.8) {
        capsuleGroupRef.current.position.x += 0.8 * delta;
      }
    } else if (capsuleGroupRef.current) {
      capsuleGroupRef.current.position.x = 1.8;
    }
  });

  return (
    <group>
      {/* Station Habitats (Left and Center Modules) */}
      <group position={[-1.2, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.0, 1.0, 2.4, 24, 1, true]} />
          <meshStandardMaterial
            color="#1E293B"
            metalness={0.8}
            roughness={0.3}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Egress Route Path Lighting */}
        {egressHighlighted && (
          <group position={[0, -0.6, 0]} onClick={() => onSelectHotspot(HOTSPOTS[2])}>
            {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
              <mesh key={i} position={[x, 0, 0]}>
                <boxGeometry args={[0.2, 0.02, 0.1]} />
                <meshBasicMaterial color="#10B981" />
              </mesh>
            ))}
          </group>
        )}

        {/* Module Hatches Along Corridor */}
        {[-0.6, 0.6].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.45, 1.0, 20]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Sealed Hatch Door */}
            {hatchesSealed && (
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.45, 20]} />
                <meshStandardMaterial color="#10B981" metalness={0.7} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Docking Vestibule / Adapter (Node 2 Forward Port) */}
      <group position={[0.5, 0, 0]} onClick={() => onSelectHotspot(HOTSPOTS[1])}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.65, 0.65, 0.8, 20]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Docking Ring Petals */}
        <mesh position={[0.42, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.48, 0.68, 16]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} />
        </mesh>
      </group>

      {/* Commercial Crew Escape Capsule (Right Side) */}
      <group ref={capsuleGroupRef} position={[1.8, 0, 0]} onClick={() => onSelectHotspot(HOTSPOTS[0])}>
        {/* Capsule Cone Body */}
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.75, 1.4, 24]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.2} roughness={0.3} />
        </mesh>
        {/* Heat Shield Base */}
        <mesh position={[-0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.76, 24]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>

        {/* Windows / Cockpit */}
        <mesh position={[0.4, 0.28, 0.2]} rotation={[0.4, 0.6, 0]}>
          <boxGeometry args={[0.18, 0.12, 0.04]} />
          <meshStandardMaterial color="#0284C7" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Crew Onboard indicator */}
        {boarded && (
          <group position={[0, 0.1, 0]}>
            {[-0.1, 0.1].map((z, i) => (
              <mesh key={i} position={[0, 0, z]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color="#10B981" />
              </mesh>
            ))}
          </group>
        )}

        {/* Departure Thruster Plumes */}
        <ThrusterPlumes active={undocked} />
      </group>

      {/* Interactive Hotspots */}
      {HOTSPOTS.map((h) => {
        const isSelected = selectedHotspot?.id === h.id;
        return (
          <group key={h.id} position={h.position} onClick={() => onSelectHotspot(h)}>
            <mesh>
              <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
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

export const EmergencyEvacuation3D: React.FC = () => {
  const [maydayDeclared, setMaydayDeclared] = useState(false);
  const [egressHighlighted, setEgressHighlighted] = useState(false);
  const [hatchesSealed, setHatchesSealed] = useState(false);
  const [boarded, setBoarded] = useState(false);
  const [undocked, setUndocked] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<EvacuationHotspot | null>(HOTSPOTS[0]);

  // Derived telemetry
  const musterCount = undocked || boarded ? 4 : maydayDeclared ? 2 : 0;
  const statusLabel = undocked
    ? 'SEPARATION COMPLETE (DEPARTING)'
    : boarded
    ? 'CREW STRAPPED IN (READY TO UNDOCK)'
    : maydayDeclared
    ? 'STATION ABORT (MUSTERING)'
    : 'STANDBY NOMINAL';

  const handleReset = () => {
    setMaydayDeclared(false);
    setEgressHighlighted(false);
    setHatchesSealed(false);
    setBoarded(false);
    setUndocked(false);
    setSelectedHotspot(HOTSPOTS[0]);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                EMERGENCY STATION EVACUATION & UNDOCKING
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                CRITICAL LAB 07
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Catastrophic Hull Breach • Egress Route & Escape Capsule Undock
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMaydayDeclared(!maydayDeclared)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              maydayDeclared
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-bounce'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            {maydayDeclared ? 'MAYDAY BROADCAST' : 'DECLARE MAYDAY'}
          </button>

          <button
            onClick={() => setEgressHighlighted(!egressHighlighted)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              egressHighlighted
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {egressHighlighted ? 'EGRESS PATH LIT' : 'LIGHT EGRESS ROUTE'}
          </button>

          <button
            onClick={() => setHatchesSealed(!hatchesSealed)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              hatchesSealed
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {hatchesSealed ? 'HATCHES DOGGED' : 'SEAL TRANSIT HATCHES'}
          </button>

          <button
            onClick={() => setBoarded(!boarded)}
            disabled={!maydayDeclared}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !maydayDeclared
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : boarded
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {boarded ? 'CREW STRAPPED IN' : 'BOARD RETURN CAPSULE'}
          </button>

          <button
            onClick={() => setUndocked(!undocked)}
            disabled={!boarded || !hatchesSealed}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !boarded || !hatchesSealed
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : undocked
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 animate-bounce'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            {undocked ? 'UNDOCKED (SAFE SEPARATION)' : 'EXECUTE EMERGENCY UNDOCK'}
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
        <Canvas camera={{ position: [0.5, 2.0, 4.2], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 4]} intensity={1.2} />
          <directionalLight position={[-4, -3, -2]} intensity={0.3} color="#38BDF8" />
          <Stars radius={50} depth={30} count={2000} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <EvacuationStationAssembly
              maydayDeclared={maydayDeclared}
              egressHighlighted={egressHighlighted}
              hatchesSealed={hatchesSealed}
              boarded={boarded}
              undocked={undocked}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={2.0}
            maxDistance={8}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>

        {/* Real-time Telemetry HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-xl p-3 shadow-xl min-w-[210px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              EVACUATION MUSTER HUD
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  musterCount === 4 ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
                }`}
              >
                {musterCount} / 4
              </span>
              <span className="text-xs font-mono text-slate-400">CREW ACCOUNTED</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">MISSION STATUS:</span>
              <span
                className={`font-bold ${
                  undocked ? 'text-emerald-400' : boarded ? 'text-cyan-300' : 'text-rose-400'
                }`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">HATCH INTEGRITY:</span>
              <span className={`font-bold ${hatchesSealed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hatchesSealed ? 'SEALED (ISOLATED)' : 'OPEN / IN TRANSIT'}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">DEPARTURE HOOKS:</span>
              <span className={`font-bold ${undocked ? 'text-emerald-400' : 'text-slate-400'}`}>
                {undocked ? 'RELEASED (SPRING PUSH-OFF)' : 'LATCHED (DOCKED)'}
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
