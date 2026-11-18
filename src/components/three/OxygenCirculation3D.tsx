import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Wind,
  Gauge,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Users,
  CheckCircle,
} from 'lucide-react';

interface ParticleSystemProps {
  speed: number;
  count: number;
}

function OxygenFlowParticles({ speed, count }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, originalZ } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const origZ = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Flow along path: X from -2.0 (OGA) to 0 (Tanks) to +2.0 (Cabin)
      const t = Math.random();
      const x = -2.2 + t * 4.4;
      const radius = 0.18 + Math.random() * 0.12;
      const angle = Math.random() * Math.PI * 2;
      const y = Math.sin(t * Math.PI) * 0.4 + Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      origZ[i] = z;
    }
    return { positions: pos, originalZ: origZ };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      array[idx] += speed * delta * 1.8;
      if (array[idx] > 2.2) {
        array[idx] = -2.2;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#42D9F5"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FanBlades({ isSpinning, speed }: { isSpinning: boolean; speed: number }) {
  const meshRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (meshRef.current && isSpinning) {
      meshRef.current.rotation.z += delta * speed * 8;
    }
  });

  return (
    <group ref={meshRef}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const rot = (i * Math.PI) / 3;
        return (
          <mesh key={i} rotation={[0, 0, rot]} position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.42, 0.015]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
        <meshStandardMaterial color="#42D9F5" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

export const OxygenCirculation3D: React.FC = () => {
  const [crewSize, setCrewSize] = useState<number>(4);
  const [electrolyzerCurrent, setElectrolyzerCurrent] = useState<number>(24); // Amperes
  const [fanSpeed, setFanSpeed] = useState<'LOW' | 'NOMINAL' | 'BOOST'>('NOMINAL');
  const [emergencyPurgeActive, setEmergencyPurgeActive] = useState<boolean>(false);
  const [activeSubsystem, setActiveSubsystem] = useState<string>('OGA');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Derived engineering metrics
  const o2ConsumptionPerPerson = 0.84; // kg/day
  const totalDailyDemand = (crewSize * o2ConsumptionPerPerson).toFixed(2);
  const flowRateSpeed =
    emergencyPurgeActive ? 2.5 : fanSpeed === 'BOOST' ? 1.8 : fanSpeed === 'NOMINAL' ? 1.0 : 0.45;
  const ppO2 = emergencyPurgeActive ? 24.8 : (20.9 + (electrolyzerCurrent - 24) * 0.12).toFixed(1);
  const h2VentFlow = (electrolyzerCurrent * 0.035).toFixed(2); // kg/hr

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 3D Viewport Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B1424] rounded-xl border border-[#1E2E4A]">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-[#42D9F5]" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            ECLSS O2 GENERATION & CABIN CIRCULATION
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#94A3B8]">
            CABIN PPO2:{' '}
            <strong className={Number(ppO2) < 19.5 || Number(ppO2) > 23.5 ? 'text-[#F5B942]' : 'text-[#10B981]'}>
              {ppO2} kPa
            </strong>
          </span>
          <span className="text-[#94A3B8]">
            CREW LOAD: <strong className="text-white">{totalDailyDemand} kg/day</strong>
          </span>
          {emergencyPurgeActive && (
            <span className="px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold animate-pulse">
              PURGE ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: 3D Canvas + Telemetry Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas Container */}
        <div className="lg:col-span-8 relative h-[540px] lg:h-[600px] rounded-xl overflow-hidden bg-[#050914] border border-[#1E2E4A]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#42D9F5]">
                INITIALIZING 3D O2 SIMULATION...
              </div>
            }
          >
            <Canvas camera={{ position: [0, 1.8, 4.5], fov: 42 }}>
              <color attach="background" args={['#050914']} />
              <ambientLight intensity={0.45} />
              <directionalLight position={[5, 6, 4]} intensity={1.2} />
              <pointLight position={[-2, 1, 1]} intensity={0.8} color="#42D9F5" />
              <pointLight position={[2, 1, 1]} intensity={0.6} color="#628CFF" />
              <Stars radius={40} depth={20} count={1200} factor={3} fade speed={0.5} />

              <group position={[0, -0.2, 0]}>
                {/* 1. Oxygen Generation Assembly (OGA) - Left Rack */}
                <group
                  position={[-2.2, 0, 0]}
                  onClick={() => setActiveSubsystem('OGA')}
                >
                  {/* Electrolyzer Rack Enclosure */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[1.0, 1.6, 0.7]} />
                    <meshStandardMaterial
                      color={activeSubsystem === 'OGA' ? '#1E3A5F' : '#111E32'}
                      metalness={0.7}
                      roughness={0.3}
                    />
                  </mesh>

                  {/* Water Electrolysis Cell Stack (Titanium PEM Cells) */}
                  <mesh position={[0, 0.15, 0.2]}>
                    <boxGeometry args={[0.7, 0.9, 0.35]} />
                    <meshStandardMaterial
                      color="#42D9F5"
                      emissive="#42D9F5"
                      emissiveIntensity={0.25 + (electrolyzerCurrent / 35) * 0.3}
                      metalness={0.9}
                      roughness={0.2}
                    />
                  </mesh>

                  {/* Hydrogen Vent Line to Exterior */}
                  <mesh position={[0, 0.95, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
                    <meshStandardMaterial color="#F5B942" metalness={0.6} roughness={0.3} />
                  </mesh>

                  <Html position={[0, 1.15, 0]} center distanceFactor={6}>
                    <div className="bg-[#0B1424]/90 border border-[#42D9F5]/40 px-2 py-0.5 rounded text-[9px] font-mono text-[#42D9F5] whitespace-nowrap cursor-pointer shadow-sm">
                      OGA CORE ({electrolyzerCurrent}A)
                    </div>
                  </Html>
                </group>

                {/* 2. Manifold Ducting (Connecting Pipes) */}
                <group position={[-1.0, 0.3, 0]}>
                  {/* Main High-Pressure O2 Delivery Line */}
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.045, 0.045, 1.4, 16]} />
                    <meshStandardMaterial color="#628CFF" metalness={0.8} roughness={0.2} />
                  </mesh>
                </group>

                {/* 3. High-Pressure Storage COPVs (Composite Overwrapped Vessels) - Center */}
                <group
                  position={[0, 0, 0]}
                  onClick={() => setActiveSubsystem('COPV')}
                >
                  {/* Tank 1 */}
                  <mesh position={[-0.32, 0.1, 0]}>
                    <capsuleGeometry args={[0.26, 0.9, 16, 24]} />
                    <meshStandardMaterial
                      color={activeSubsystem === 'COPV' ? '#2563EB' : '#1D4ED8'}
                      metalness={0.5}
                      roughness={0.4}
                    />
                  </mesh>
                  {/* Tank 2 */}
                  <mesh position={[0.32, 0.1, 0]}>
                    <capsuleGeometry args={[0.26, 0.9, 16, 24]} />
                    <meshStandardMaterial
                      color={activeSubsystem === 'COPV' ? '#2563EB' : '#1D4ED8'}
                      metalness={0.5}
                      roughness={0.4}
                    />
                  </mesh>
                  {/* Manifold Regulator Valve Body */}
                  <mesh position={[0, 0.72, 0]}>
                    <boxGeometry args={[0.8, 0.12, 0.2]} />
                    <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.1} />
                  </mesh>

                  <Html position={[0, 0.95, 0]} center distanceFactor={6}>
                    <div className="bg-[#0B1424]/90 border border-[#628CFF]/40 px-2 py-0.5 rounded text-[9px] font-mono text-[#628CFF] whitespace-nowrap cursor-pointer shadow-sm">
                      COPV STORAGE (20.6 MPa)
                    </div>
                  </Html>
                </group>

                {/* 4. Distribution Duct & Cabin Blower Fan - Right */}
                <group position={[1.1, 0.3, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.045, 0.045, 1.2, 16]} />
                    <meshStandardMaterial color="#628CFF" metalness={0.8} roughness={0.2} />
                  </mesh>
                </group>

                {/* 5. Cabin Diffuser & Ventilation Fan Module */}
                <group
                  position={[2.2, 0, 0]}
                  onClick={() => setActiveSubsystem('VENT')}
                >
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.9, 1.4, 0.7]} />
                    <meshStandardMaterial
                      color={activeSubsystem === 'VENT' ? '#1E3A5F' : '#111E32'}
                      metalness={0.6}
                      roughness={0.4}
                    />
                  </mesh>

                  {/* Rotary Ventilation Blower Inside Housing */}
                  <group position={[0, 0.2, 0.36]}>
                    <FanBlades
                      isSpinning={true}
                      speed={fanSpeed === 'BOOST' ? 3.5 : fanSpeed === 'NOMINAL' ? 1.8 : 0.8}
                    />
                  </group>

                  {/* Air Diffuser Grille */}
                  <mesh position={[0, -0.35, 0.36]}>
                    <planeGeometry args={[0.65, 0.35]} />
                    <meshStandardMaterial
                      color="#0F172A"
                      wireframe
                      wireframeLinewidth={2}
                    />
                  </mesh>

                  <Html position={[0, 0.95, 0]} center distanceFactor={6}>
                    <div className="bg-[#0B1424]/90 border border-[#10B981]/40 px-2 py-0.5 rounded text-[9px] font-mono text-[#10B981] whitespace-nowrap cursor-pointer shadow-sm">
                      VENTILATION BLOWER
                    </div>
                  </Html>
                </group>

                {/* Dynamic Animated Oxygen Flow Particles */}
                <OxygenFlowParticles speed={flowRateSpeed} count={80} />
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
            OGA / ISS ARCHITECTURE
          </div>
        </div>

        {/* Interactive Engineering Controls Panel */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-4 rounded-xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
              <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                TELEMETRY & ACTUATION
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">FLIGHT CONTROLLER</span>
            </div>

            {/* Crew Complement Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#628CFF]" />
                  Active Crew Size:
                </span>
                <span className="font-mono text-white font-bold">{crewSize} Astronauts</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCrewSize(num)}
                    className={`flex-1 py-1 rounded text-xs font-mono transition-colors border ${
                      crewSize === num
                        ? 'bg-[#42D9F5]/20 border-[#42D9F5] text-[#42D9F5] font-bold'
                        : 'bg-[#111E32] border-[#1E2E4A] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {num} P
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Standard metabolic consumption: 0.84 kg O2 / human / 24-hr day.
              </p>
            </div>

            {/* Electrolyzer Current Controller */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#F5B942]" />
                  Electrolyzer Cell Current:
                </span>
                <span className="font-mono text-[#F5B942] font-bold">{electrolyzerCurrent} A</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="1"
                value={electrolyzerCurrent}
                onChange={(e) => setElectrolyzerCurrent(Number(e.target.value))}
                className="w-full accent-[#F5B942] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>10A (Idle: 0.4 kg/d)</span>
                <span>35A (Max: 1.4 kg/d)</span>
              </div>
            </div>

            {/* Cabin Fan Speed Selector */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <span className="text-xs text-[#94A3B8] block">Circulation Blower Rate:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'NOMINAL', 'BOOST'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFanSpeed(mode)}
                    className={`py-1 rounded text-xs font-mono transition-colors border ${
                      fanSpeed === mode
                        ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold'
                        : 'bg-[#111E32] border-[#1E2E4A] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Reserve Purge Toggle */}
            <div className="pt-2 border-t border-[#1E2E4A]">
              <button
                onClick={() => setEmergencyPurgeActive(!emergencyPurgeActive)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all border ${
                  emergencyPurgeActive
                    ? 'bg-[#EF4444] text-white border-[#EF4444] animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-[#111E32] border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{emergencyPurgeActive ? 'DEACTIVATE EMERGENCY PURGE' : 'TRIGGER O2 HIGH-FLOW PURGE'}</span>
              </button>
            </div>
          </div>

          {/* Subsystem Details Box */}
          <div className="glass-panel p-3.5 rounded-xl border border-[#1E2E4A] text-xs">
            <span className="font-mono text-[#42D9F5] block font-bold mb-1">
              SUBSYSTEM FOCUS: {activeSubsystem}
            </span>
            {activeSubsystem === 'OGA' && (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Oxygen Generation Assembly (OGA):</strong> Deionizes recycled water and splits it via Proton Exchange Membrane (PEM) electrolysis: 2H2O → 2H2 + O2. Hydrogen is vented or routed to the Sabatier reactor.
              </p>
            )}
            {activeSubsystem === 'COPV' && (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Composite Overwrapped Pressure Vessels (COPV):</strong> Carbon-fiber wrapped titanium liners storing pure O2 pressurized at 3,000 psi (20.6 MPa) as a buffer for cabin repressurization and EVA recharge.
              </p>
            )}
            {activeSubsystem === 'VENT' && (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Ventilation Diffuser:</strong> Essential in microgravity! Without forced ventilation, exhaled CO2 forms a suffocating envelope around sleeping astronauts due to lack of buoyancy-driven natural convection.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

