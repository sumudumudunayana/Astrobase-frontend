import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Zap,
  Thermometer,
  Shield,
  Activity,
  Layers,
  Power,
  Sliders,
} from 'lucide-react';

interface MalfunctionHotspot {
  id: string;
  title: string;
  position: [number, number, number];
  description: string;
  specs: Record<string, string>;
}

const HOTSPOTS: MalfunctionHotspot[] = [
  {
    id: 'pump_module',
    title: 'ETCS External Ammonia Pump Module',
    position: [-0.8, 0.4, 0.3],
    description: '3-horsepower canned motor pump circulating anhydrous ammonia at 2,000 kg/hr through external truss radiators to reject spacecraft thermal loads.',
    specs: {
      'Working Fluid': 'Anhydrous Ammonia (NH3)',
      'Nominal Flow': '2,150 kg / hr',
      'Fault Trigger': 'Impeller motor electrical surge trip',
    },
  },
  {
    id: 'mbsu',
    title: 'Main Bus Switching Unit (MBSU)',
    position: [0.6, 0.5, 0.2],
    description: '160V DC power routing assembly distributing power from solar array channels to internal habitat DC-to-DC Converter Units (DDCUs).',
    specs: {
      'Main Voltage': '160V DC nominal',
      'Cross-Tie Relay': 'Bus A-to-B tie contactor (RBI-4)',
      'Load Rating': '30 kW continuous per bus',
    },
  },
  {
    id: 'ifhx',
    title: 'Interface Heat Exchanger (IFHX)',
    position: [0, -0.4, 0.2],
    description: 'Plate-fin counterflow heat exchanger transferring thermal energy from internal water loops (IATCS) to external ammonia loops (ETCS).',
    specs: {
      'Heat Rejection': '14 kW nominal capacity',
      'Internal Fluid': 'Deionized water loop',
      'Overheat Limit': 'Inlet temp >28.5°C triggers shutdown',
    },
  },
];

function CoolantFlowParticles({ active, alert }: { active: boolean; alert: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 300;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      array[i * 3] += (active ? 1.2 : 0.2) * delta;
      if (array[i * 3] > 1.3) {
        array[i * 3] = -1.3;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={alert ? '#EF4444' : '#38BDF8'}
        transparent
        opacity={active ? 0.8 : 0.25}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function TrussSystemAssembly({
  loadShed,
  busIsolated,
  crossTieEngaged,
  auxPumpActive,
  selectedHotspot,
  onSelectHotspot,
}: {
  loadShed: boolean;
  busIsolated: boolean;
  crossTieEngaged: boolean;
  auxPumpActive: boolean;
  selectedHotspot: MalfunctionHotspot | null;
  onSelectHotspot: (h: MalfunctionHotspot) => void;
}) {
  return (
    <group>
      {/* S1 Integrated Truss Segment (Box Frame) */}
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[3.2, 0.9, 0.9]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} wireframe />
      </mesh>

      {/* Main Structural Spars */}
      {[-1.4, -0.7, 0, 0.7, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.4]}>
          <boxGeometry args={[0.08, 0.9, 0.9]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
      ))}

      {/* External Radiator Panel Assembly (Top) */}
      <mesh position={[0, 1.1, -0.4]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[2.8, 1.2, 0.04]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.7}
          roughness={0.2}
          emissive={auxPumpActive ? '#0284C7' : '#DC2626'}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* ETCS Ammonia Pump Module (Left) */}
      <group position={[-0.8, 0.3, 0.2]} onClick={() => onSelectHotspot(HOTSPOTS[0])}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.5, 16]} />
          <meshStandardMaterial
            color={auxPumpActive ? '#047857' : '#DC2626'}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={auxPumpActive ? '#10B981' : '#EF4444'} />
        </mesh>
      </group>

      {/* Main Bus Switching Unit (Right) */}
      <group position={[0.6, 0.3, 0.2]} onClick={() => onSelectHotspot(HOTSPOTS[1])}>
        <mesh>
          <boxGeometry args={[0.5, 0.6, 0.35]} />
          <meshStandardMaterial
            color={crossTieEngaged ? '#0284C7' : busIsolated ? '#475569' : '#DC2626'}
            metalness={0.7}
          />
        </mesh>
        {/* Cross-Tie Contactor Light */}
        <mesh position={[0, 0.2, 0.2]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color={crossTieEngaged ? '#10B981' : '#F59E0B'} />
        </mesh>
      </group>

      {/* Interface Heat Exchanger (Center Bottom) */}
      <group position={[0, -0.3, 0.2]} onClick={() => onSelectHotspot(HOTSPOTS[2])}>
        <mesh>
          <boxGeometry args={[0.7, 0.35, 0.3]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        {/* Coolant manifold pipes */}
        <mesh position={[-0.2, 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color="#38BDF8" metalness={0.8} />
        </mesh>
        <mesh position={[0.2, 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color="#EF4444" metalness={0.8} />
        </mesh>
      </group>

      {/* Coolant Flow Particles */}
      <CoolantFlowParticles active={auxPumpActive} alert={!auxPumpActive} />

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

export const EquipmentMalfunctions3D: React.FC = () => {
  const [loadShed, setLoadShed] = useState(false);
  const [busIsolated, setBusIsolated] = useState(false);
  const [crossTieEngaged, setCrossTieEngaged] = useState(false);
  const [auxPumpActive, setAuxPumpActive] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<MalfunctionHotspot | null>(HOTSPOTS[0]);

  // Derived telemetry
  const avionicsTempC = auxPumpActive && crossTieEngaged
    ? 17.2
    : auxPumpActive
    ? 21.0
    : loadShed
    ? 26.5
    : 29.8;

  const busBVoltage = crossTieEngaged ? 160 : 0;
  const heatRejectionKw = auxPumpActive ? 14.2 : loadShed ? 6.1 : 3.8;

  const handleReset = () => {
    setLoadShed(false);
    setBusIsolated(false);
    setCrossTieEngaged(false);
    setAuxPumpActive(false);
    setSelectedHotspot(HOTSPOTS[0]);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                THERMAL LOOP & MAIN BUS FAULT ISOLATION
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                CRITICAL LAB 05
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Truss S1 ETCS Loop B Trip • Bus Cross-Tie & Load Shedding
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLoadShed(!loadShed)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              loadShed
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {loadShed ? 'LOAD SHED ACTIVE (-8.4 kW)' : 'SHED NON-CRITICAL LOADS'}
          </button>

          <button
            onClick={() => setBusIsolated(!busIsolated)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              busIsolated
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {busIsolated ? 'BUS B ISOLATED' : 'ISOLATE BUS B'}
          </button>

          <button
            onClick={() => setCrossTieEngaged(!crossTieEngaged)}
            disabled={!busIsolated}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !busIsolated
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : crossTieEngaged
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {crossTieEngaged ? 'BUS A-B CROSS-TIED (160V)' : 'ENGAGE BUS CROSS-TIE'}
          </button>

          <button
            onClick={() => setAuxPumpActive(!auxPumpActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              auxPumpActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 animate-bounce'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {auxPumpActive ? 'AUX PUMP ONLINE' : 'START AUX PUMP'}
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
        <Canvas camera={{ position: [0, 1.2, 3.2], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 7, 4]} intensity={1.2} />
          <directionalLight position={[-4, -2, -2]} intensity={0.3} color="#38BDF8" />
          <Stars radius={50} depth={30} count={2000} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <TrussSystemAssembly
              loadShed={loadShed}
              busIsolated={busIsolated}
              crossTieEngaged={crossTieEngaged}
              auxPumpActive={auxPumpActive}
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
              THERMAL TELEMETRY HUD
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  avionicsTempC > 25
                    ? 'text-rose-400 animate-pulse'
                    : avionicsTempC > 20
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {avionicsTempC.toFixed(1)}°C
              </span>
              <span className="text-xs font-mono text-slate-400">AVIONICS INLET</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">HEAT REJECTION:</span>
              <span className="font-bold text-cyan-300">{heatRejectionKw} kW</span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">MAIN BUS B:</span>
              <span className={`font-bold ${busBVoltage > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {busBVoltage}V DC {crossTieEngaged ? '(CROSS-TIED)' : '(TRIPPED)'}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">AMMONIA PUMP:</span>
              <span className={`font-bold ${auxPumpActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {auxPumpActive ? 'LOOP A (2,400 RPM)' : 'LOOP B FAILED'}
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
