import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Droplet,
  RotateCw,
  Gauge,
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

function CentrifugeDrum({ isSpinning, rpm }: { isSpinning: boolean; rpm: number }) {
  const drumRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (drumRef.current && isSpinning) {
      drumRef.current.rotation.y += delta * (rpm / 200);
    }
  });

  return (
    <group ref={drumRef}>
      {/* Outer rotary drum */}
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 1.2, 24, 1, true]} />
        <meshStandardMaterial
          color="#38BDF8"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Inner distillation rotor blades */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <boxGeometry args={[0.04, 1.0, 0.9]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Centrifugal core shaft */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 1.3, 16]} />
        <meshStandardMaterial color="#42D9F5" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function WaterFlowStream({ color, speed, yOffset }: { color: string; speed: number; yOffset: number }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -2.2 + Math.random() * 4.4;
      pos[i * 3 + 1] = yOffset + (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }
    return pos;
  }, [count, yOffset]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      array[idx] += speed * delta;
      if (array[idx] > 2.2) {
        array[idx] = -2.2;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const WaterRecovery3D: React.FC = () => {
  const [bpaActive, setBpaActive] = useState<boolean>(true); // Brine Processor Assembly
  const [centrifugeRpm, setCentrifugeRpm] = useState<number>(1200);
  const [catalyticTemp, setCatalyticTemp] = useState<number>(130); // °C
  const [dailyCrewLiters, setDailyCrewLiters] = useState<number>(15.0); // liters of wastewater
  const [selectedUnit, setSelectedUnit] = useState<string>('UPA');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Derived recovery mathematics
  const baseEfficiency = 0.93; // 93% standard ISS WRS
  const bpaBonus = bpaActive ? 0.05 : 0.0; // +5% with BPA
  const recoveryRate = ((baseEfficiency + bpaBonus) * 100).toFixed(1);
  const potableOutputLiters = (dailyCrewLiters * (baseEfficiency + bpaBonus)).toFixed(2);
  const brineWasteLiters = (dailyCrewLiters * (1 - (baseEfficiency + bpaBonus))).toFixed(2);
  const conductivityPpm = catalyticTemp >= 125 ? 4.2 : 18.5; // ppm TDS

  const handleResetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B1424] rounded-xl border border-[#1E2E4A]">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-[#42D9F5]" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            ECLSS WATER RECOVERY SYSTEM (UPA / WPA / BPA)
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#94A3B8]">
            RECOVERY EFFICIENCY:{' '}
            <strong className="text-[#10B981]">{recoveryRate}%</strong>
          </span>
          <span className="text-[#94A3B8]">
            POTABLE OUTPUT:{' '}
            <strong className="text-[#42D9F5]">{potableOutputLiters} L/day</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-8 relative h-[540px] lg:h-[600px] rounded-xl overflow-hidden bg-[#050914] border border-[#1E2E4A]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#42D9F5]">
                LOADING WATER RECYCLING 3D RIG...
              </div>
            }
          >
            <Canvas camera={{ position: [0, 2.0, 4.2], fov: 45 }}>
              <color attach="background" args={['#050914']} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 5, 4]} intensity={1.2} />
              <pointLight position={[-2, 1, 1]} intensity={0.8} color="#F5B942" />
              <pointLight position={[2, 1, 1]} intensity={0.8} color="#42D9F5" />
              <Stars radius={40} depth={20} count={1000} factor={3} fade speed={0.4} />

              <group position={[0, -0.2, 0]}>
                {/* 1. UPA Distillation Assembly (Vacuum Centrifuge) - Left */}
                <group
                  position={[-2.1, 0, 0]}
                  onClick={() => setSelectedUnit('UPA')}
                >
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.9, 1.5, 0.8]} />
                    <meshStandardMaterial
                      color={selectedUnit === 'UPA' ? '#1E3A5F' : '#111E32'}
                      metalness={0.7}
                      roughness={0.3}
                    />
                  </mesh>

                  {/* Rotary Centrifuge Inside UPA Housing */}
                  <group position={[0, 0, 0.45]}>
                    <CentrifugeDrum isSpinning={true} rpm={centrifugeRpm} />
                  </group>

                  <Html position={[0, -0.95, 0]} center distanceFactor={7}>
                    <div className="bg-[#0B1424]/90 border border-[#F5B942]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#F5B942] whitespace-nowrap">
                      UPA CENTRIFUGE ({centrifugeRpm} RPM)
                    </div>
                  </Html>
                </group>

                {/* 2. Brine Processor Assembly (BPA Membrane Desalination) - Center-Left */}
                {bpaActive && (
                  <group position={[-0.8, 0.5, -0.3]}>
                    <mesh>
                      <boxGeometry args={[0.6, 0.6, 0.4]} />
                      <meshStandardMaterial color="#0284C7" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <Html position={[0, -0.45, 0]} center distanceFactor={7}>
                      <div className="bg-[#0B1424]/90 border border-[#38BDF8]/40 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#38BDF8]">
                        BPA BRINE CELL (+5%)
                      </div>
                    </Html>
                  </group>
                )}

                {/* 3. WPA Multi-Filtration Beds & Catalytic Reactor - Center */}
                <group
                  position={[0.2, 0, 0]}
                  onClick={() => setSelectedUnit('WPA')}
                >
                  {/* Two Vertical Filtration Columns */}
                  <mesh position={[-0.3, 0.1, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 1.3, 24]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
                  </mesh>
                  <mesh position={[0.3, 0.1, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 1.3, 24]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
                  </mesh>
                  {/* Catalytic High-Temp Oxidation Core */}
                  <mesh position={[0, 0.85, 0]}>
                    <sphereGeometry args={[0.22, 16, 16]} />
                    <meshStandardMaterial
                      color="#EF4444"
                      emissive="#EF4444"
                      emissiveIntensity={catalyticTemp >= 125 ? 0.6 : 0.2}
                      metalness={0.5}
                    />
                  </mesh>

                  <Html position={[0, -0.95, 0]} center distanceFactor={7}>
                    <div className="bg-[#0B1424]/90 border border-[#42D9F5]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#42D9F5] whitespace-nowrap">
                      WPA CATALYTIC REACTOR ({catalyticTemp}°C)
                    </div>
                  </Html>
                </group>

                {/* 4. Potable Water Storage Tank & Iodine/Silver Microbial Dosing - Right */}
                <group
                  position={[2.1, 0, 0]}
                  onClick={() => setSelectedUnit('POTABLE')}
                >
                  <mesh>
                    <cylinderGeometry args={[0.42, 0.42, 1.4, 32]} />
                    <meshStandardMaterial
                      color={selectedUnit === 'POTABLE' ? '#1E3A5F' : '#0369A1'}
                      metalness={0.9}
                      roughness={0.15}
                    />
                  </mesh>
                  {/* Water purity sensor collar */}
                  <mesh position={[0, 0.45, 0]}>
                    <torusGeometry args={[0.44, 0.04, 16, 32]} />
                    <meshStandardMaterial
                      color={conductivityPpm < 10 ? '#10B981' : '#EF4444'}
                      emissive={conductivityPpm < 10 ? '#10B981' : '#EF4444'}
                      emissiveIntensity={0.5}
                    />
                  </mesh>

                  <Html position={[0, -0.95, 0]} center distanceFactor={7}>
                    <div className="bg-[#0B1424]/90 border border-[#10B981]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#10B981] whitespace-nowrap">
                      POTABLE WATER TANK
                    </div>
                  </Html>
                </group>

                {/* Fluid Lines */}
                {/* Urine line (amber) */}
                <WaterFlowStream color="#F5B942" speed={1.2} yOffset={0.3} />
                {/* Purified drinking water (pure cyan) */}
                <WaterFlowStream color="#42D9F5" speed={1.6} yOffset={-0.3} />
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
            WRS / ISS RECYCLING
          </div>
        </div>

        {/* Interactive Controls & Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-4 rounded-xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
              <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                WATER PURITY CONTROLS
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">WRS RACK 03</span>
            </div>

            {/* Brine Processor Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Brine Processor Assembly (BPA):</span>
                <button
                  onClick={() => setBpaActive(!bpaActive)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                    bpaActive
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                      : 'bg-[#64748B]/20 border-[#64748B] text-[#94A3B8]'
                  }`}
                >
                  {bpaActive ? 'ENABLED (98%)' : 'DISABLED (93%)'}
                </button>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                BPA recovers residual water trapped in concentrated urine brine using vacuum membrane distillation.
              </p>
            </div>

            {/* Centrifuge Speed Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">UPA Distillation Rotor:</span>
                <span className="font-mono text-white font-bold">{centrifugeRpm} RPM</span>
              </div>
              <input
                type="range"
                min="600"
                max="1800"
                step="100"
                value={centrifugeRpm}
                onChange={(e) => setCentrifugeRpm(Number(e.target.value))}
                className="w-full accent-[#42D9F5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>600 RPM</span>
                <span>1200 (Nominal)</span>
                <span>1800 RPM</span>
              </div>
            </div>

            {/* Catalytic Reactor Temp */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Catalytic Oxidizer Temp:</span>
                <span className={`font-mono font-bold ${catalyticTemp >= 125 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {catalyticTemp}°C ({catalyticTemp >= 125 ? 'OPTIMAL' : 'LOW PPOX'})
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="145"
                step="5"
                value={catalyticTemp}
                onChange={(e) => setCatalyticTemp(Number(e.target.value))}
                className="w-full accent-[#EF4444] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>90°C (Incomplete)</span>
                <span>130°C (Sterile)</span>
              </div>
            </div>

            {/* Water Quality Telemetry */}
            <div className="p-2.5 rounded-lg bg-[#0B1424] border border-[#1E2E4A] space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">TDS Conductivity:</span>
                <span className={conductivityPpm < 10 ? 'text-[#10B981] font-bold' : 'text-[#EF4444] font-bold'}>
                  {conductivityPpm} ppm (Limit: &lt;10 ppm)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Daily Brine Reject:</span>
                <span className="text-[#F5B942]">{brineWasteLiters} L/day</span>
              </div>
            </div>
          </div>

          {/* Subsystem Details Card */}
          <div className="glass-panel p-3.5 rounded-xl border border-[#1E2E4A] text-xs">
            <span className="font-mono text-[#42D9F5] block font-bold mb-1">
              SUBSYSTEM INFO: {selectedUnit}
            </span>
            {selectedUnit === 'UPA' && (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Urine Processor Assembly (UPA):</strong> Since liquid cannot be boiled normally in microgravity (bubbles cling to heater elements), the UPA spins a distillation centrifuge to create an artificial 1G field, allowing vapor separation under low pressure vacuum boiling.
              </p>
            )}
            {selectedUnit === 'WPA' && (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Water Processor Assembly (WPA):</strong> Filters combined condensate and UPA distillate through particulate beds, activated carbon, and an oxygen-injected catalytic reactor at 130°C to break down organic impurities into trace CO2.
              </p>
            )}
            {selectedUnit === 'POTABLE' && (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Potable Water Storage:</strong> Dosed with silver biocide (or iodine on older systems) to inhibit microbial colonization in plumbing lines before delivery to galley hydration stations and astronaut beverage pouches.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

