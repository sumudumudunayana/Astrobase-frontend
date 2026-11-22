import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Thermometer,
  Gauge,
  Sun,
  Moon,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Wind,
} from 'lucide-react';

function HeatExchangePipes({ orbitalState }: { orbitalState: 'SUNLIGHT' | 'ECLIPSE' }) {
  const lineRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (lineRef.current) {
      lineRef.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <group ref={lineRef}>
      {/* Internal Water Loop (Cyan) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.2, 0.035, 16, 64]} />
        <meshStandardMaterial color="#42D9F5" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* External Ammonia Loop (Amber / Red) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.035, 16, 64]} />
        <meshStandardMaterial
          color={orbitalState === 'SUNLIGHT' ? '#F5B942' : '#38BDF8'}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

export const ThermalCabinPressure3D: React.FC = () => {
  const [orbitalState, setOrbitalState] = useState<'SUNLIGHT' | 'ECLIPSE'>('SUNLIGHT');
  const [radiatorAngle, setRadiatorAngle] = useState<number>(45); // degrees
  const [leakSimActive, setLeakSimActive] = useState<boolean>(false);
  const [cabinPressureKpa, setCabinPressureKpa] = useState<number>(101.3);
  const [hatchIsolated, setHatchIsolated] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Dynamic values
  const hullExteriorTemp = orbitalState === 'SUNLIGHT' ? '+121°C' : '-157°C';
  const heatRejectionKw = orbitalState === 'SUNLIGHT' ? 14.2 : 9.8;
  const currentPressure = leakSimActive
    ? hatchIsolated
      ? 96.2
      : 84.5
    : 101.3;

  const handleResetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  const handleToggleLeak = () => {
    if (!leakSimActive) {
      setLeakSimActive(true);
      setHatchIsolated(false);
    } else {
      setLeakSimActive(false);
      setHatchIsolated(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B1424] rounded-xl border border-[#1E2E4A]">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-[#42D9F5]" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            THERMAL CONTROL (ITCS/ETCS) & CABIN PRESSURIZATION
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#94A3B8]">
            ORBIT: <strong className={orbitalState === 'SUNLIGHT' ? 'text-[#F5B942]' : 'text-[#628CFF]'}>{orbitalState} ({hullExteriorTemp})</strong>
          </span>
          <span className="text-[#94A3B8]">
            CABIN PRESSURE:{' '}
            <strong className={currentPressure < 90 ? 'text-[#EF4444] animate-pulse' : 'text-[#10B981]'}>
              {currentPressure} kPa
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-8 relative h-[540px] lg:h-[600px] rounded-xl overflow-hidden bg-[#050914] border border-[#1E2E4A]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#42D9F5]">
                INITIALIZING THERMAL-PNEUMATIC SIMULATION...
              </div>
            }
          >
            <Canvas camera={{ position: [0, 2.0, 4.5], fov: 45 }}>
              <color attach="background" args={['#050914']} />
              <ambientLight intensity={orbitalState === 'SUNLIGHT' ? 0.6 : 0.2} />
              <directionalLight
                position={orbitalState === 'SUNLIGHT' ? [5, 4, 3] : [-5, -2, -3]}
                intensity={orbitalState === 'SUNLIGHT' ? 1.8 : 0.15}
                color={orbitalState === 'SUNLIGHT' ? '#FFF5EA' : '#60A5FA'}
              />
              <Stars radius={40} depth={20} count={1200} factor={3} fade speed={0.4} />

              <group position={[0, 0, 0]}>
                {/* 1. Cylindrical Pressurized Crew Hull */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[0.9, 0.9, 2.2, 32]} />
                  <meshStandardMaterial
                    color="#1E293B"
                    metalness={0.7}
                    roughness={0.3}
                    transparent
                    opacity={0.88}
                  />
                </mesh>

                {/* Micro-leak indicator breach if simulated */}
                {leakSimActive && (
                  <group position={[0.9, 0.2, 0]}>
                    <mesh>
                      <sphereGeometry args={[0.08, 16, 16]} />
                      <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1} />
                    </mesh>
                    <Html position={[0.2, 0.1, 0]} distanceFactor={6}>
                      <div className="bg-[#EF4444] text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold animate-pulse whitespace-nowrap">
                        HULL BREACH: -1.2 kPa/s
                      </div>
                    </Html>
                  </group>
                )}

                {/* 2. Deployable Heat Rejection Radiators (External Ammonia) */}
                <group
                  position={[0, 0, 0]}
                  rotation={[0, (radiatorAngle * Math.PI) / 180, 0]}
                >
                  {/* Left Radiator Wing */}
                  <mesh position={[-2.0, 0, 0]}>
                    <boxGeometry args={[1.8, 1.2, 0.04]} />
                    <meshStandardMaterial
                      color="#E2E8F0"
                      metalness={0.9}
                      roughness={0.1}
                    />
                  </mesh>
                  {/* Right Radiator Wing */}
                  <mesh position={[2.0, 0, 0]}>
                    <boxGeometry args={[1.8, 1.2, 0.04]} />
                    <meshStandardMaterial
                      color="#E2E8F0"
                      metalness={0.9}
                      roughness={0.1}
                    />
                  </mesh>
                </group>

                {/* 3. Circulating ITCS / ETCS Coolant Loop Geometry */}
                <HeatExchangePipes orbitalState={orbitalState} />
              </group>

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={0.8}
                minDistance={2.5}
                maxDistance={7.0}
              />
            </Canvas>
          </Suspense>

          {/* Floating Controls Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#0B1424]/90 border border-[#1E2E4A] px-3 py-1.5 rounded-full backdrop-blur-md">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5 text-[#F5B942]" /> : <Play className="w-3.5 h-3.5" />}
              <span className="font-mono text-[11px]">{autoRotate ? 'TURNING' : 'ROTATE'}</span>
            </button>
            <span className="w-px h-3 bg-[#1E2E4A]" />
            <button
              onClick={handleResetCamera}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">RESET</span>
            </button>
          </div>

          <div className="absolute top-3 right-3 font-mono text-[10px] text-[#42D9F5] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#42D9F5]/20 backdrop-blur-sm pointer-events-none">
            ECLSS ACTIVE THERMAL & PRESSURE
          </div>
        </div>

        {/* Interactive Controls & Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-4 rounded-xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
              <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                ENVIRONMENTAL CONTROLS
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">FLIGHT LOOP</span>
            </div>

            {/* Orbit Phase Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#94A3B8] block">Orbital Radiation Environment:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrbitalState('SUNLIGHT')}
                  className={`py-1.5 px-3 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                    orbitalState === 'SUNLIGHT'
                      ? 'bg-[#F5B942]/20 border-[#F5B942] text-[#F5B942]'
                      : 'bg-[#111E32] border-[#1E2E4A] text-[#94A3B8]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>SUNLIGHT (+121°C)</span>
                </button>
                <button
                  onClick={() => setOrbitalState('ECLIPSE')}
                  className={`py-1.5 px-3 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                    orbitalState === 'ECLIPSE'
                      ? 'bg-[#628CFF]/20 border-[#628CFF] text-[#628CFF]'
                      : 'bg-[#111E32] border-[#1E2E4A] text-[#94A3B8]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>ECLIPSE (-157°C)</span>
                </button>
              </div>
            </div>

            {/* Radiator Articulation Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Radiator Edge-to-Sun Angle:</span>
                <span className="font-mono text-white font-bold">{radiatorAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={radiatorAngle}
                onChange={(e) => setRadiatorAngle(Number(e.target.value))}
                className="w-full accent-[#42D9F5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>0° (Face Sun - Minimal Heat Loss)</span>
                <span>90° (Edge Sun - Max Rejection)</span>
              </div>
            </div>

            {/* Cabin Leak Simulation Toggle */}
            <div className="space-y-2 pt-2 border-t border-[#1E2E4A]">
              <button
                onClick={handleToggleLeak}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all border ${
                  leakSimActive
                    ? 'bg-[#EF4444] text-white border-[#EF4444] animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'bg-[#111E32] border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{leakSimActive ? 'RESOLVE HULL BREACH' : 'TRIGGER MICROMETEOROID LEAK SIM'}</span>
              </button>

              {leakSimActive && (
                <button
                  onClick={() => setHatchIsolated(!hatchIsolated)}
                  className={`w-full py-1.5 px-3 rounded text-xs font-mono font-bold border transition-colors ${
                    hatchIsolated
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                      : 'bg-[#F5B942]/20 border-[#F5B942] text-[#F5B942]'
                  }`}
                >
                  {hatchIsolated ? 'HATCH ISOLATED (STABILIZED)' : 'SEAL COMPARTMENT HATCH'}
                </button>
              )}
            </div>
          </div>

          {/* Educational Note */}
          <div className="glass-panel p-3.5 rounded-xl border border-[#1E2E4A] text-xs">
            <span className="font-mono text-[#42D9F5] block font-bold mb-1">
              THE VACUUM THERMAL PARADOX:
            </span>
            <p className="text-[#94A3B8] leading-relaxed">
              Space is not cold in the conventional sense: because space is a vacuum, heat cannot transfer away via conduction or convection. Spacecraft can only lose heat through infrared radiation. Deployable radiators circulate ammonia to dump kilowatts of avionics and human body heat into deep space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

