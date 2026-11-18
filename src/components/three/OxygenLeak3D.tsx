import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Flame,
  Shield,
  Activity,
  Layers,
  CheckCircle,
  AlertOctagon,
  Gauge,
  Sliders,
} from 'lucide-react';

interface O2Hotspot {
  id: string;
  title: string;
  position: [number, number, number];
  description: string;
  specs: Record<string, string>;
}

const HOTSPOTS: O2Hotspot[] = [
  {
    id: 'manifold',
    title: 'High-Pressure Oxygen Flex Line',
    position: [-0.6, 0.4, 0.2],
    description: '13.8 MPa (2000 psi) high-pressure oxygen delivery flex hose leading from external cryogenic storage to the internal habitat manifold.',
    specs: {
      'Operating Pressure': '13.8 MPa / 2000 psi',
      'Gas Purity': '99.8% medical grade O2',
      'Leak Trigger': 'Elastomeric flange seal micro-tear',
    },
  },
  {
    id: 'isolation_valve',
    title: 'Solenoid Isolation Shutoff Valve',
    position: [0.3, 0.5, 0.1],
    description: 'Quarter-turn stainless steel solenoid valve with manual override lever to isolate supply lines from cabin distribution loops.',
    specs: {
      'Response Time': '<250 milliseconds',
      'Actuation': '28V DC redundant bus command',
      'Overboard Venting': 'Direct space vacuum dump port',
    },
  },
  {
    id: 'sensor',
    title: 'Zirconia Ceramic Oxygen Sensor',
    position: [0.8, -0.2, 0.4],
    description: 'Electrochemical oxygen sensor continuously measuring cabin partial pressure and volumetric concentration.',
    specs: {
      'Nominal Target': '20.9% - 21.8%',
      'Warning Threshold': '23.5% (Elevated Flammability)',
      'Critical Abort': '24.1% (Extreme Fire Hazard)',
    },
  },
];

function O2CloudParticles({ o2Percent, active }: { o2Percent: number; active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 300;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += 0.2 * delta;
      if (array[i * 3 + 1] > 1.2) {
        array[i * 3 + 1] = -1.0;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const isEnriched = o2Percent > 23.5;
  const particleColor = isEnriched ? '#F59E0B' : '#10B981';

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={particleColor}
        transparent
        opacity={active ? 0.75 : 0.2}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function OxygenRackAssembly({
  valveIsolated,
  nitrogenInjected,
  isLeaking,
  selectedHotspot,
  onSelectHotspot,
}: {
  valveIsolated: boolean;
  nitrogenInjected: boolean;
  isLeaking: boolean;
  selectedHotspot: O2Hotspot | null;
  onSelectHotspot: (h: O2Hotspot) => void;
}) {
  return (
    <group>
      {/* ECLSS Equipment Rack Frame */}
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[2.4, 2.6, 0.8]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Rack Inner Bay */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.1, 2.3, 0.05]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cryogenic / High-Pressure Storage Tanks (Twin Cylinders) */}
      <group position={[-0.6, -0.3, 0.2]}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 1.2, 24]} />
          <meshStandardMaterial color="#38BDF8" metalness={0.85} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial color="#38BDF8" metalness={0.85} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial color="#38BDF8" metalness={0.85} />
        </mesh>
      </group>

      {/* High-Pressure Distribution Manifold Pipe */}
      <mesh
        position={[-0.1, 0.35, 0.2]}
        rotation={[0, 0, Math.PI / 2]}
        onClick={() => onSelectHotspot(HOTSPOTS[0])}
      >
        <cylinderGeometry args={[0.04, 0.04, 1.1, 16]} />
        <meshStandardMaterial
          color={isLeaking && !valveIsolated ? '#EF4444' : '#94A3B8'}
          metalness={0.8}
        />
      </mesh>

      {/* Solenoid Shutoff Valve */}
      <group
        position={[0.3, 0.35, 0.2]}
        onClick={() => onSelectHotspot(HOTSPOTS[1])}
      >
        <mesh>
          <boxGeometry args={[0.18, 0.22, 0.18]} />
          <meshStandardMaterial color={valveIsolated ? '#10B981' : '#F59E0B'} metalness={0.7} />
        </mesh>
        {/* Actuator Knob / Handle */}
        <mesh
          position={[0, 0.14, 0]}
          rotation={[0, valveIsolated ? Math.PI / 2 : 0, 0]}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color={valveIsolated ? '#047857' : '#DC2626'} />
        </mesh>
      </group>

      {/* Nitrogen Injection Line (Green pipe coming from right) */}
      <mesh position={[0.8, -0.1, 0.2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 16]} />
        <meshStandardMaterial
          color={nitrogenInjected ? '#10B981' : '#475569'}
          metalness={0.8}
        />
      </mesh>

      {/* Flow Meter / Ceramic Sensor Unit */}
      <group
        position={[0.8, 0.35, 0.25]}
        onClick={() => onSelectHotspot(HOTSPOTS[2])}
      >
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          <meshStandardMaterial color="#0284C7" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={isLeaking && !valveIsolated ? '#EF4444' : '#10B981'} />
        </mesh>
      </group>

      {/* Interactive Hotspot Spheres */}
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

export const OxygenLeak3D: React.FC = () => {
  const [isLeaking, setIsLeaking] = useState(true);
  const [valveIsolated, setValveIsolated] = useState(false);
  const [nitrogenInjected, setNitrogenInjected] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<O2Hotspot | null>(HOTSPOTS[0]);

  // Derived telemetry
  const o2Percent = valveIsolated && nitrogenInjected
    ? 21.2
    : valveIsolated
    ? 23.4
    : isLeaking
    ? 25.1
    : 20.9;

  const flammabilityMultiplier = (Math.pow(o2Percent / 20.9, 3.2)).toFixed(1);

  const handleReset = () => {
    setIsLeaking(true);
    setValveIsolated(false);
    setNitrogenInjected(false);
    setSelectedHotspot(HOTSPOTS[0]);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                OXYGEN ENRICHMENT & MANIFOLD ISOLATION
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                CRITICAL LAB 02
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Destiny Laboratory OGA • High-Pressure Manifold Leak
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setValveIsolated(!valveIsolated)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              valveIsolated
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {valveIsolated ? 'VALVE ISOLATED' : 'CLOSE ISOLATION VALVE'}
          </button>

          <button
            onClick={() => setNitrogenInjected(!nitrogenInjected)}
            disabled={!valveIsolated}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !valveIsolated
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : nitrogenInjected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {nitrogenInjected ? 'N2 PURGE COMPLETE' : 'INJECT N2 DILUTION'}
          </button>

          <button
            onClick={() => setIsLeaking(!isLeaking)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            {isLeaking ? 'SIMULATING LEAK' : 'LEAK OFF'}
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
        <Canvas camera={{ position: [0, 0.4, 3.2], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={1.2} />
          <directionalLight position={[-4, -2, -2]} intensity={0.3} color="#38BDF8" />
          <Stars radius={50} depth={30} count={2000} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <OxygenRackAssembly
              valveIsolated={valveIsolated}
              nitrogenInjected={nitrogenInjected}
              isLeaking={isLeaking}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
            <O2CloudParticles o2Percent={o2Percent} active={isLeaking && !valveIsolated} />
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
              CABIN O2 CONCENTRATION
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  o2Percent > 24.1
                    ? 'text-rose-400 animate-pulse'
                    : o2Percent > 23.0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {o2Percent.toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({(o2Percent * 1.013).toFixed(1)} kPa ppO2)
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">FLAMMABILITY:</span>
              <span
                className={`font-bold ${
                  Number(flammabilityMultiplier) > 1.5 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {flammabilityMultiplier}x NOMINAL
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">ISOLATION VALVE:</span>
              <span className={`font-bold ${valveIsolated ? 'text-emerald-400' : 'text-rose-400'}`}>
                {valveIsolated ? 'CLOSED (SAFE)' : 'OPEN (LEAKING)'}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">N2 PURGE:</span>
              <span className={`font-bold ${nitrogenInjected ? 'text-emerald-400' : 'text-slate-400'}`}>
                {nitrogenInjected ? 'COMPLETE' : 'INACTIVE'}
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
