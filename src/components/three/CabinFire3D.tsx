import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Flame,
  Wind,
  Shield,
  Activity,
  AlertTriangle,
  Zap,
  Power,
  Layers,
} from 'lucide-react';

interface FireHotspot {
  id: string;
  title: string;
  position: [number, number, number];
  description: string;
  specs: Record<string, string>;
}

const HOTSPOTS: FireHotspot[] = [
  {
    id: 'flame_core',
    title: 'Microgravity Spherical Flame Core',
    position: [-0.3, 0.2, 0.4],
    description: 'In zero gravity, combustion lacks buoyancy-driven convection. The flame burns as a quiescent, spherical envelope with blue chemiluminescence.',
    specs: {
      'Flame Geometry': 'Quiescent spherical shell',
      'Combustion Dynamic': 'Diffusion-limited (oxygen starved)',
      'Primary Hazard': 'Continuous toxic CO and HCN gas production',
    },
  },
  {
    id: 'imv_duct',
    title: 'Inter-Module Ventilation (IMV) Duct',
    position: [0.9, 0.8, -0.2],
    description: 'Forced air circulation duct. In microgravity, leaving IMV active acts as an artificial bellows, continuously supplying fresh oxygen to the fire.',
    specs: {
      'Volumetric Flow': '140 m3/hr nominal',
      'Emergency Action': 'Instant manual/command fan trip',
      'Containment': 'Pneumatic butterfly dampers close',
    },
  },
  {
    id: 'pfe_port',
    title: 'PFE Fire Injection Access Port',
    position: [-0.3, 0.7, 0.5],
    description: 'A self-sealing circular injection port allowing astronauts to insert the nozzle of a fine water mist or CO2 extinguisher without opening the rack door.',
    specs: {
      'Extinguishing Agent': 'Fine water mist (<50 um) & Nitrogen',
      'Deployment Duration': '10 to 15 seconds continuous discharge',
      'Electronics Safe': 'Non-conductive fine aerosol atomization',
    },
  },
];

// Smoke Aerosol Particles
function SmokeParticles({ active, extinguished }: { active: boolean; extinguished: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 400;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -0.3 + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = 0.2 + (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = 0.4 + (Math.random() - 0.5) * 0.4;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      if (!extinguished) {
        array[i * 3] += (Math.random() - 0.5) * 0.6 * delta;
        array[i * 3 + 1] += (Math.random() - 0.5) * 0.6 * delta;
        array[i * 3 + 2] += (0.4 + Math.random() * 0.5) * delta;

        if (array[i * 3 + 2] > 2.0) {
          array[i * 3] = -0.3 + (Math.random() - 0.5) * 0.3;
          array[i * 3 + 1] = 0.2 + (Math.random() - 0.5) * 0.3;
          array[i * 3 + 2] = 0.4;
        }
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
        size={extinguished ? 0.03 : 0.08}
        color={extinguished ? '#64748B' : '#94A3B8'}
        transparent
        opacity={extinguished ? 0.25 : 0.75}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

function FireRackAssembly({
  powerCut,
  imvShutdown,
  extinguisherDischarged,
  scrubberActive,
  selectedHotspot,
  onSelectHotspot,
}: {
  powerCut: boolean;
  imvShutdown: boolean;
  extinguisherDischarged: boolean;
  scrubberActive: boolean;
  selectedHotspot: FireHotspot | null;
  onSelectHotspot: (h: FireHotspot) => void;
}) {
  const flameMeshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (flameMeshRef.current && !extinguisherDischarged) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 10) * 0.12;
      flameMeshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Module Interior Wall Shell */}
      <mesh position={[0, 0, -0.6]}>
        <boxGeometry args={[3.2, 2.6, 0.4]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Avionics Rack AR-3 (Center-Left) */}
      <group position={[-0.3, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 2.2, 0.6]} />
          <meshStandardMaterial
            color={extinguisherDischarged ? '#334155' : powerCut ? '#1E293B' : '#0F172A'}
            metalness={0.6}
            roughness={0.5}
          />
        </mesh>

        {/* Rack Faceplate / Avionics Breaker Panels */}
        <mesh position={[0, 0, 0.31]}>
          <boxGeometry args={[1.1, 2.1, 0.02]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>

        {/* Fire Injection Port */}
        <mesh
          position={[0, 0.7, 0.32]}
          onClick={() => onSelectHotspot(HOTSPOTS[2])}
        >
          <ringGeometry args={[0.04, 0.08, 16]} />
          <meshBasicMaterial color={extinguisherDischarged ? '#10B981' : '#F59E0B'} />
        </mesh>

        {/* Microgravity Spherical Flame Core */}
        {!extinguisherDischarged && (
          <group position={[0, 0.2, 0.4]} onClick={() => onSelectHotspot(HOTSPOTS[0])}>
            <mesh ref={flameMeshRef}>
              <sphereGeometry args={[0.16, 24, 24]} />
              <meshStandardMaterial
                color="#F97316"
                emissive="#EF4444"
                emissiveIntensity={1.8}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Inner Blue Chemiluminescent Core */}
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#38BDF8" transparent opacity={0.9} />
            </mesh>
            <pointLight intensity={2.5} distance={3} color="#F97316" />
          </group>
        )}
      </group>

      {/* IMV Ventilation Loop (Right Side) */}
      <group position={[1.1, 0.6, 0]} onClick={() => onSelectHotspot(HOTSPOTS[1])}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.8, 20]} />
          <meshStandardMaterial
            color={imvShutdown ? '#475569' : '#0284C7'}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Fan Blades indicator */}
        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.16, 8]} />
          <meshBasicMaterial color={imvShutdown ? '#EF4444' : '#10B981'} />
        </mesh>
      </group>

      {/* Emergency Toxic Atmosphere Scrubber (ETAS) Unit (Bottom Right) */}
      <group position={[1.1, -0.6, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.6, 0.5]} />
          <meshStandardMaterial
            color={scrubberActive ? '#047857' : '#1E293B'}
            metalness={0.7}
          />
        </mesh>
        <mesh position={[0, 0, 0.26]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color={scrubberActive ? '#10B981' : '#64748B'} />
        </mesh>
      </group>

      {/* Smoke Particulates Simulation */}
      <SmokeParticles
        active={!scrubberActive}
        extinguished={extinguisherDischarged}
      />

      {/* Interactive Hotspots */}
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

export const CabinFire3D: React.FC = () => {
  const [powerCut, setPowerCut] = useState(false);
  const [imvShutdown, setImvShutdown] = useState(false);
  const [extinguisherDischarged, setExtinguisherDischarged] = useState(false);
  const [scrubberActive, setScrubberActive] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<FireHotspot | null>(HOTSPOTS[0]);

  // Derived telemetry
  const smokeObscuration = scrubberActive
    ? 0.5
    : extinguisherDischarged
    ? 15.0
    : imvShutdown
    ? 38.0
    : 48.0;

  const coPpm = scrubberActive ? 8 : extinguisherDischarged ? 45 : 190;
  const rackTempC = extinguisherDischarged ? 24 : powerCut ? 38 : 68;

  const handleReset = () => {
    setPowerCut(false);
    setImvShutdown(false);
    setExtinguisherDischarged(false);
    setScrubberActive(false);
    setSelectedHotspot(HOTSPOTS[0]);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                MICROGRAVITY FIRE & TOXIC SMOKE RESPONSE
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                CRITICAL LAB 03
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Destiny Laboratory Avionics Bay AR-3 • Zero-g Combustion Suppression
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPowerCut(!powerCut)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              powerCut
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {powerCut ? 'RACK POWER CUT' : 'CUT RACK POWER'}
          </button>

          <button
            onClick={() => setImvShutdown(!imvShutdown)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              imvShutdown
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            {imvShutdown ? 'IMV FANS OFF' : 'SHUTDOWN IMV FANS'}
          </button>

          <button
            onClick={() => setExtinguisherDischarged(!extinguisherDischarged)}
            disabled={!imvShutdown}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !imvShutdown
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : extinguisherDischarged
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {extinguisherDischarged ? 'EXTINGUISHER DISCHARGED' : 'DISCHARGE PFE MIST'}
          </button>

          <button
            onClick={() => setScrubberActive(!scrubberActive)}
            disabled={!extinguisherDischarged}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !extinguisherDischarged
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : scrubberActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {scrubberActive ? 'TOXIC SCRUB ACTIVE' : 'ENGAGE TOXIC SCRUB'}
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
        <Canvas camera={{ position: [0, 0.4, 3.4], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 6, 4]} intensity={1.0} />
          <directionalLight position={[-4, -2, -2]} intensity={0.3} color="#F97316" />
          <Stars radius={50} depth={30} count={2000} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <FireRackAssembly
              powerCut={powerCut}
              imvShutdown={imvShutdown}
              extinguisherDischarged={extinguisherDischarged}
              scrubberActive={scrubberActive}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={1.8}
            maxDistance={6}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>

        {/* Real-time Telemetry HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-xl p-3 shadow-xl min-w-[210px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              ATMOSPHERIC CONTAMINATION
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  smokeObscuration > 10
                    ? 'text-rose-400 animate-pulse'
                    : smokeObscuration > 2
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {smokeObscuration.toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-slate-400">SMOKE OBSCURATION</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">CO TOXIC LEVEL:</span>
              <span
                className={`font-bold ${
                  coPpm > 50 ? 'text-rose-400' : coPpm > 15 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {coPpm} PPM
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">RACK TEMP:</span>
              <span className={`font-bold ${rackTempC > 45 ? 'text-rose-400' : 'text-slate-300'}`}>
                {rackTempC}°C
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">IMV VENTILATION:</span>
              <span className={`font-bold ${imvShutdown ? 'text-emerald-400' : 'text-rose-400'}`}>
                {imvShutdown ? 'ISOLATED (SAFE)' : 'FORCED AIR ACTIVE'}
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
