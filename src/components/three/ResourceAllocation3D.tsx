import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Battery,
  Droplet,
  Wind,
  Flame,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import type { ResourceAllocation } from '../../types/training';

// 3D Consumables Tank Farm & Battery Energy Storage
const ConsumablesTanks3D: React.FC<{
  selectedResource: string;
}> = ({ selectedResource }) => {
  const farmRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (farmRef.current) {
      farmRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={farmRef}>
      {/* Central Support Truss */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>

      {/* Cryogenic Liquid Oxygen (LOX) Spheres */}
      <group position={[-1.4, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial
            color={selectedResource === 'OXYGEN' ? '#38bdf8' : '#0284c7'}
            metalness={0.8}
            roughness={0.2}
            emissive={selectedResource === 'OXYGEN' ? '#0369a1' : '#000000'}
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text position={[0, 0.9, 0]} fontSize={0.16} color="#38bdf8" anchorX="center">
          LOX Tank (O2)
        </Text>
      </group>

      {/* Potable Water Tank (H2O) */}
      <group position={[1.4, 0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 1.3, 24]} />
          <meshStandardMaterial
            color={selectedResource === 'WATER' ? '#06b6d4' : '#0891b2'}
            metalness={0.7}
            roughness={0.3}
            emissive={selectedResource === 'WATER' ? '#0e7490' : '#000000'}
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text position={[0, 0.9, 0]} fontSize={0.16} color="#22d3ee" anchorX="center">
          Water Tank (H2O)
        </Text>
      </group>

      {/* Battery Energy Storage Module */}
      <group position={[-1.4, -0.8, 0]}>
        <mesh>
          <boxGeometry args={[1.0, 0.8, 0.8]} />
          <meshStandardMaterial
            color={selectedResource === 'BATTERY_ENERGY_KWH' ? '#f59e0b' : '#d97706'}
            metalness={0.7}
            roughness={0.3}
            emissive={selectedResource === 'BATTERY_ENERGY_KWH' ? '#b45309' : '#000000'}
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text position={[0, 0.6, 0]} fontSize={0.16} color="#fbbf24" anchorX="center">
          EPS Battery (kWh)
        </Text>
      </group>

      {/* Delta-V Hypergolic Propellant Tank */}
      <group position={[1.4, -0.8, 0]}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color={selectedResource === 'PROPULSION_DELTA_V' ? '#f43f5e' : '#e11d48'}
            metalness={0.8}
            roughness={0.2}
            emissive={selectedResource === 'PROPULSION_DELTA_V' ? '#be123c' : '#000000'}
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text position={[0, 0.8, 0]} fontSize={0.16} color="#fb7185" anchorX="center">
          Propellant Delta-V
        </Text>
      </group>
    </group>
  );
};

export const ResourceAllocation3D: React.FC = () => {
  const [resources, setResources] = useState<ResourceAllocation[]>([
    {
      resourceType: 'OXYGEN',
      unit: 'kg',
      totalAvailable: 250.0,
      plannedAllocation: 180.0,
      emergencyReserve: 70.0,
      estimatedConsumptionRatePerHour: 0.14, // 0.84 kg / day * 4 crew = 3.36 kg/day = ~0.14 kg/hr
      minRequiredReservePercent: 25.0,
    },
    {
      resourceType: 'WATER',
      unit: 'L',
      totalAvailable: 600.0,
      plannedAllocation: 430.0,
      emergencyReserve: 170.0,
      estimatedConsumptionRatePerHour: 0.42, // 10 L / day = ~0.42 L/hr
      minRequiredReservePercent: 25.0,
    },
    {
      resourceType: 'BATTERY_ENERGY_KWH',
      unit: 'kWh',
      totalAvailable: 120.0,
      plannedAllocation: 85.0,
      emergencyReserve: 35.0,
      estimatedConsumptionRatePerHour: 3.2,
      minRequiredReservePercent: 25.0,
    },
    {
      resourceType: 'PROPULSION_DELTA_V',
      unit: 'm/s',
      totalAvailable: 2400.0,
      plannedAllocation: 1850.0,
      emergencyReserve: 550.0,
      estimatedConsumptionRatePerHour: 0.0,
      minRequiredReservePercent: 20.0,
    },
  ]);

  const [selectedResourceType, setSelectedResourceType] = useState<string>('OXYGEN');
  const selectedResource = resources.find((r) => r.resourceType === selectedResourceType) || resources[0];

  const handleUpdatePlanned = (value: number) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.resourceType === selectedResourceType) {
          const newPlanned = Math.min(r.totalAvailable, Math.max(10, value));
          const newReserve = parseFloat((r.totalAvailable - newPlanned).toFixed(1));
          return {
            ...r,
            plannedAllocation: newPlanned,
            emergencyReserve: newReserve,
          };
        }
        return r;
      })
    );
  };

  const reservePercent = selectedResource.totalAvailable > 0
    ? (selectedResource.emergencyReserve / selectedResource.totalAvailable) * 100.0
    : 0;
  const isReserveCompliant = reservePercent >= selectedResource.minRequiredReservePercent;

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              CONSUMABLES BUDGETING & EMERGENCY RESERVES
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 05 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Metabolic Rates // Minimum 25% Reserve Flight Rule // Power Load-Shedding Hierarchy
            </p>
          </div>
        </div>

        {/* Reserve Compliance Tag */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 ${
              isReserveCompliant
                ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                : 'bg-rose-950 text-rose-400 border-rose-600 animate-pulse'
            }`}
          >
            {isReserveCompliant ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {isReserveCompliant ? 'RESERVE COMPLIANT' : 'RESERVE DEFICIT ALERT'}
          </span>
        </div>
      </div>

      {/* 3D Tanks Canvas */}
      <div className="relative w-full h-[460px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 2.5, 6.2], fov: 46 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 6]} intensity={1.8} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <ConsumablesTanks3D selectedResource={selectedResourceType} />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3.5}
            maxDistance={15}
          />
        </Canvas>

        {/* In-Canvas Telemetry HUD */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1.5 min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">INSPECTED RESOURCE:</span>
            <span className="font-bold text-white">{selectedResource.resourceType}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>TOTAL CAPACITY:</span>
            <span className="text-cyan-400 font-bold">{selectedResource.totalAvailable} {selectedResource.unit}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>EMERGENCY RESERVE:</span>
            <span
              className={`font-bold ${
                isReserveCompliant ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {selectedResource.emergencyReserve} {selectedResource.unit} ({reservePercent.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isReserveCompliant ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (reservePercent / 50) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Station & Allocation Sliders */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Resource Selector */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Consumable Subsystems ({resources.length})
          </label>
          <div className="space-y-2">
            {resources.map((res) => {
              const pct = (res.emergencyReserve / res.totalAvailable) * 100.0;
              const isOk = pct >= res.minRequiredReservePercent;

              return (
                <button
                  key={res.resourceType}
                  onClick={() => setSelectedResourceType(res.resourceType)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                    selectedResourceType === res.resourceType
                      ? 'bg-cyan-950/70 border-cyan-500 text-white'
                      : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{res.resourceType}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isOk ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Res: {res.emergencyReserve} {res.unit} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">
                    Planned: {res.plannedAllocation} {res.unit} // Rate: {res.estimatedConsumptionRatePerHour} {res.unit}/h
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Resource Allocation Slider */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Planned Allocation Tuning
            </label>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[#94a3b8] mb-1">
                  <span>Planned Mission Usage:</span>
                  <span className="text-white font-bold">{selectedResource.plannedAllocation} {selectedResource.unit}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={selectedResource.totalAvailable}
                  step={selectedResource.totalAvailable > 500 ? 10 : 2}
                  value={selectedResource.plannedAllocation}
                  onChange={(e) => handleUpdatePlanned(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748b]">Emergency Safety Reserve:</span>
                <span
                  className={`font-bold ${
                    isReserveCompliant ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedResource.emergencyReserve} {selectedResource.unit} (Req: &ge; {selectedResource.minRequiredReservePercent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#050914] border border-[#1e293b] text-[10px] text-[#64748b]">
            Flight Rule: If planned usage reduces emergency reserves below 25%, ground controllers must reject the flight plan.
          </div>
        </div>

        {/* Consumption Metrics & Metabolic Equations */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-amber-400" />
            NASA Baseline Metabolic Metrics
          </label>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#64748b]">O2 Metabolic Rate:</span>
              <span className="text-cyan-300 font-bold">0.84 kg / crew / sol</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Drinking Water Rate:</span>
              <span className="text-cyan-300 font-bold">2.5 L / crew / sol</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Hygiene Flush Rate:</span>
              <span className="text-white font-bold">1.5 L / crew / sol</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Caloric Energy Rate:</span>
              <span className="text-amber-400 font-bold">3,000 kcal / sol</span>
            </div>
            <p className="text-[10px] text-[#64748b] pt-1 border-t border-[#1e293b]">
              Closed-loop recycling (ECLSS) recovers up to 98% of water and 50% of oxygen, extending consumable endurance dramatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
