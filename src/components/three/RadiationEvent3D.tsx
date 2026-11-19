import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Sun,
  Shield,
  Activity,
  Users,
  Layers,
  Radio,
  CheckCircle,
} from 'lucide-react';

interface RadiationHotspot {
  id: string;
  title: string;
  position: [number, number, number];
  description: string;
  specs: Record<string, string>;
}

const HOTSPOTS: RadiationHotspot[] = [
  {
    id: 'water_wall',
    title: 'Hydrogen-Rich Water Wall Bladders',
    position: [-0.6, 0.4, 0.4],
    description: '10cm thick flexible water containment bladders surrounding the central sleep and storm quarters. Hydrogen nuclei absorb proton kinetic energy without creating secondary spallation.',
    specs: {
      'Shielding Mass': '10 to 12 g/cm2',
      'Material': 'High-density H2O bladders',
      'Proton Attenuation': '65% reduction in primary flux',
    },
  },
  {
    id: 'polyethylene',
    title: 'High-Density Polyethylene (HDPE) Tiles',
    position: [0.6, -0.2, 0.4],
    description: 'Dense hydrocarbon polymer tiles (CH2) lining the forward and zenith hull bulkheads where solar proton exposure is maximum.',
    specs: {
      'Density': '0.97 g/cm3',
      'Hydrocarbon Ratio': '2:1 Hydrogen-to-Carbon',
      'Bremsstrahlung': 'Virtually zero secondary X-ray generation',
    },
  },
  {
    id: 'dosimeter',
    title: 'TEPC Real-Time Tissue Dosimeter',
    position: [0, 0.6, 0.6],
    description: 'Tissue Equivalent Proportional Counter continuously recording absorbed dose in micro-Sieverts and biological dose equivalent (micro-Gy).',
    specs: {
      'Sensor Type': 'Low-pressure tissue equivalent gas sphere',
      'External Rate': '3,450 uSv / hr (CME peak)',
      'Shelter Target': '<50 uSv / hr',
    },
  },
];

// High-Energy Proton Flux Streams
function ProtonFluxParticles({ active, shielded }: { active: boolean; shielded: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 500;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -4 + Math.random() * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Protons travelling rapidly from left (sunward) to right
      array[i * 3] += (4.5 + Math.random() * 3.0) * delta;
      if (array[i * 3] > 3.5) {
        array[i * 3] = -4;
        array[i * 3 + 1] = (Math.random() - 0.5) * 3;
        array[i * 3 + 2] = (Math.random() - 0.5) * 3;
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
        size={0.04}
        color={shielded ? '#38BDF8' : '#F59E0B'}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function StormShelterAssembly({
  waterWallsDeployed,
  polyethyleneStacked,
  crewMustered,
  selectedHotspot,
  onSelectHotspot,
}: {
  waterWallsDeployed: boolean;
  polyethyleneStacked: boolean;
  crewMustered: boolean;
  selectedHotspot: RadiationHotspot | null;
  onSelectHotspot: (h: RadiationHotspot) => void;
}) {
  return (
    <group>
      {/* Outer Spacecraft Hull Shell (Semi-transparent) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.3, 1.3, 3.2, 24, 1, true]} />
        <meshStandardMaterial
          color="#1E293B"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hull Rings / Bulkheads */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.7, 1.32, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
      ))}

      {/* Central Storm Shelter Core Cylinder */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.75, 0.75, 1.8, 20]} />
        <meshStandardMaterial
          color="#0F172A"
          metalness={0.7}
          roughness={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Water Wall Shielding Bladders (Surrounding Core) */}
      {waterWallsDeployed && (
        <group onClick={() => onSelectHotspot(HOTSPOTS[0])}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.92, 0.92, 1.6, 24, 1, true]} />
            <meshStandardMaterial
              color="#0284C7"
              emissive="#0369A1"
              emissiveIntensity={0.4}
              transparent
              opacity={0.65}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Polyethylene Cargo Blocks (Sunward Facing Wall) */}
      {polyethyleneStacked && (
        <group position={[-0.9, 0, 0]} onClick={() => onSelectHotspot(HOTSPOTS[1])}>
          {[-0.4, 0, 0.4].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[0.15, 0.35, 1.2]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* TEPC Dosimeter Sensor */}
      <group position={[0, 0.6, 0.6]} onClick={() => onSelectHotspot(HOTSPOTS[2])}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#10B981" emissive="#059669" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* 4 Astronauts Mustered in Core */}
      {crewMustered ? (
        <group position={[0, -0.2, 0]}>
          {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
            <group key={i} position={[x, 0, (i % 2 === 0 ? 0.1 : -0.1)]}>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.1, 0.08, 0.35, 12]} />
                <meshStandardMaterial color="#E2E8F0" />
              </mesh>
              <mesh position={[0, 0.42, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#CBD5E1" />
              </mesh>
            </group>
          ))}
        </group>
      ) : (
        /* Dispersed crew */
        <group>
          <mesh position={[-1.2, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
          <mesh position={[1.2, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
        </group>
      )}

      {/* High-energy particle stream */}
      <ProtonFluxParticles active={true} shielded={waterWallsDeployed} />

      {/* Hotspots */}
      {HOTSPOTS.map((h) => {
        const isSelected = selectedHotspot?.id === h.id;
        return (
          <group key={h.id} position={h.position} onClick={() => onSelectHotspot(h)}>
            <mesh>
              <sphereGeometry args={[isSelected ? 0.09 : 0.06, 16, 16]} />
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

export const RadiationEvent3D: React.FC = () => {
  const [waterWallsDeployed, setWaterWallsDeployed] = useState(false);
  const [polyethyleneStacked, setPolyethyleneStacked] = useState(false);
  const [crewMustered, setCrewMustered] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<RadiationHotspot | null>(HOTSPOTS[0]);

  // Derived telemetry
  const externalDoseRate = 3450; // uSv/h
  const internalDoseRate = waterWallsDeployed && polyethyleneStacked && crewMustered
    ? 42
    : waterWallsDeployed && polyethyleneStacked
    ? 280
    : waterWallsDeployed
    ? 850
    : 3100;

  const handleReset = () => {
    setWaterWallsDeployed(false);
    setPolyethyleneStacked(false);
    setCrewMustered(false);
    setSelectedHotspot(HOTSPOTS[0]);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                SOLAR PARTICLE EVENT (SPE) & STORM SHELTER
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                CRITICAL LAB 04
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Class X9.2 Solar Flare CME • Hydrogen-Rich Mass Shielding
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setWaterWallsDeployed(!waterWallsDeployed)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              waterWallsDeployed
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {waterWallsDeployed ? 'WATER WALLS DEPLOYED' : 'DEPLOY WATER WALLS'}
          </button>

          <button
            onClick={() => setPolyethyleneStacked(!polyethyleneStacked)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              polyethyleneStacked
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {polyethyleneStacked ? 'HDPE CARGO STACKED' : 'STACK HDPE CARGO'}
          </button>

          <button
            onClick={() => setCrewMustered(!crewMustered)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              crewMustered
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 animate-bounce'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {crewMustered ? 'ALL 4 CREW IN SHELTER' : 'MUSTER CREW TO CORE'}
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
        <Canvas camera={{ position: [0, 1.8, 3.8], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[-6, 4, 3]} intensity={1.5} color="#F59E0B" />
          <directionalLight position={[4, -2, -2]} intensity={0.3} color="#38BDF8" />
          <Stars radius={50} depth={30} count={2200} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <StormShelterAssembly
              waterWallsDeployed={waterWallsDeployed}
              polyethyleneStacked={polyethyleneStacked}
              crewMustered={crewMustered}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={2.0}
            maxDistance={7}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>

        {/* Real-time Telemetry HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-xl p-3 shadow-xl min-w-[210px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              RADIATION DOSIMETRY HUD
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  internalDoseRate > 200
                    ? 'text-rose-400 animate-pulse'
                    : internalDoseRate > 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {internalDoseRate}
              </span>
              <span className="text-xs font-mono text-slate-400">μSv / hr</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">EXTERNAL FLUX:</span>
              <span className="font-bold text-rose-400">{externalDoseRate} μSv / hr</span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">ATTENUATION:</span>
              <span
                className={`font-bold ${
                  internalDoseRate <= 50 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {(100 - (internalDoseRate / externalDoseRate) * 100).toFixed(1)}% PROTECTED
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">CREW MUSTER:</span>
              <span className={`font-bold ${crewMustered ? 'text-emerald-400' : 'text-rose-400'}`}>
                {crewMustered ? '4/4 IN SHELTER' : 'DISPERSED (EXPOSED)'}
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
