import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Zap,
  Battery,
  BatteryCharging,
  Sun,
  Moon,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Shield,
} from 'lucide-react';

interface SolarWingProps {
  rotationAngle: number;
}

function SolarArrayWings({ rotationAngle }: SolarWingProps) {
  const jointRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (jointRef.current) {
      jointRef.current.rotation.y = (rotationAngle * Math.PI) / 180;
    }
  });

  return (
    <group ref={jointRef}>
      {/* Central Rotating Truss Mast (SARJ) */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 3.8, 16]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Left Solar Photovoltaic Wing */}
      <group position={[0, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 1.8, 0.04]} />
          <meshStandardMaterial
            color="#1E3A8A"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Silicon photovoltaic cell grid lines */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[1.5, 1.7]} />
          <meshStandardMaterial
            color="#38BDF8"
            wireframe
            wireframeLinewidth={2}
          />
        </mesh>
      </group>

      {/* Right Solar Photovoltaic Wing */}
      <group position={[0, -1.2, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 1.8, 0.04]} />
          <meshStandardMaterial
            color="#1E3A8A"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Silicon photovoltaic cell grid lines */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[1.5, 1.7]} />
          <meshStandardMaterial
            color="#38BDF8"
            wireframe
            wireframeLinewidth={2}
          />
        </mesh>
      </group>
    </group>
  );
}

export const ElectricalPowerSystem3D: React.FC = () => {
  const [sunAngle, setSunAngle] = useState<number>(45); // degrees 0-180
  const [loadSheddingActive, setLoadSheddingActive] = useState<boolean>(false);
  const [autoSunTracking, setAutoSunTracking] = useState<boolean>(true);
  const [batterySoc, setBatterySoc] = useState<number>(84); // %
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Solar generation calculations based on cosine angle of incidence
  const isEclipse = sunAngle > 165 || sunAngle < 15;
  const arrayAngle = autoSunTracking ? sunAngle : 90;
  const incidenceEff = isEclipse ? 0 : Math.max(0, Math.sin((arrayAngle * Math.PI) / 180));
  const solarGenKw = (incidenceEff * 84).toFixed(1); // Max 84 kW
  const baseLoadKw = 28.5; // Essential life support, thermal loops, avionics
  const scienceLoadKw = loadSheddingActive ? 0.0 : 22.0; // Science payloads
  const totalDemandKw = (baseLoadKw + scienceLoadKw).toFixed(1);
  const netPowerKw = (Number(solarGenKw) - Number(totalDemandKw)).toFixed(1);

  const handleResetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B1424] rounded-xl border border-[#1E2E4A]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#F5B942]" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            EPS ELECTRICAL POWER GENERATION & PCDU BUS TELEMETRY
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#94A3B8]">
            SOLAR GEN: <strong className="text-[#F5B942]">{solarGenKw} kW</strong>
          </span>
          <span className="text-[#94A3B8]">
            TOTAL DEMAND: <strong className="text-white">{totalDemandKw} kW</strong>
          </span>
          <span className="text-[#94A3B8]">
            NET FLUX:{' '}
            <strong className={Number(netPowerKw) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
              {Number(netPowerKw) > 0 ? `+${netPowerKw}` : netPowerKw} kW
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-8 relative h-[540px] lg:h-[600px] rounded-xl overflow-hidden bg-[#050914] border border-[#1E2E4A]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#F5B942]">
                BOOTING EPS 3D BUS MODEL...
              </div>
            }
          >
            <Canvas camera={{ position: [3.5, 2.5, 4.2], fov: 45 }}>
              <color attach="background" args={['#050914']} />
              <ambientLight intensity={0.35} />
              <directionalLight
                position={[
                  Math.cos((sunAngle * Math.PI) / 180) * 8,
                  4,
                  Math.sin((sunAngle * Math.PI) / 180) * 8,
                ]}
                intensity={isEclipse ? 0.1 : 2.0}
                color="#FEF08A"
              />
              <pointLight position={[0, 0, 1.5]} intensity={0.8} color="#42D9F5" />
              <Stars radius={40} depth={20} count={1200} factor={3} fade speed={0.4} />

              <group position={[0, 0, 0]}>
                {/* Central Spacecraft Avionics & PCDU Core */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.2, 1.2, 1.8]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Battery Bank Vault Enclosure (Li-Ion) */}
                <mesh position={[0, -0.7, 0]}>
                  <boxGeometry args={[1.0, 0.35, 1.4]} />
                  <meshStandardMaterial
                    color="#10B981"
                    emissive="#10B981"
                    emissiveIntensity={0.25}
                    metalness={0.6}
                  />
                </mesh>

                {/* Articulated Solar Array Wings (Rotating with SARJ) */}
                <group position={[0, 0, 0]}>
                  <SolarArrayWings rotationAngle={arrayAngle} />
                </group>

                {/* Visual Sun Vector Marker */}
                {!isEclipse && (
                  <Html
                    position={[
                      Math.cos((sunAngle * Math.PI) / 180) * 3,
                      1.8,
                      Math.sin((sunAngle * Math.PI) / 180) * 3,
                    ]}
                    center
                    distanceFactor={8}
                  >
                    <div className="bg-[#F5B942] text-[#050914] px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-[0_0_15px_rgba(245,185,66,0.8)]">
                      ☀️ SOLAR INCIDENCE VECTOR
                    </div>
                  </Html>
                )}
              </group>

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={0.8}
                minDistance={3.0}
                maxDistance={8.0}
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

          <div className="absolute top-3 right-3 font-mono text-[10px] text-[#F5B942] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#F5B942]/20 backdrop-blur-sm pointer-events-none">
            ISS SARJ / 160V PRIMARY BUS
          </div>
        </div>

        {/* Interactive Controls & Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-4 rounded-xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
              <span className="text-xs font-mono text-[#F5B942] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                POWER MANAGEMENT BUS
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">MBSU CONTROLLER</span>
            </div>

            {/* Sun Vector Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-[#F5B942]" />
                  Orbital Sun Angle:
                </span>
                <span className="font-mono text-white font-bold">{sunAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={sunAngle}
                onChange={(e) => setSunAngle(Number(e.target.value))}
                className="w-full accent-[#F5B942] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>0° (Eclipse)</span>
                <span>90° (Zenith Noon)</span>
                <span>180° (Sunset)</span>
              </div>
            </div>

            {/* Sun Tracking Joint Toggle */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">SARJ Sun-Tracking Gimbal:</span>
                <button
                  onClick={() => setAutoSunTracking(!autoSunTracking)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                    autoSunTracking
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                      : 'bg-[#64748B]/20 border-[#64748B] text-[#94A3B8]'
                  }`}
                >
                  {autoSunTracking ? 'AUTO-TRACKING' : 'LOCKED (90°)'}
                </button>
              </div>
            </div>

            {/* Battery State of Charge Telemetry */}
            <div className="p-3 rounded-lg bg-[#0B1424] border border-[#1E2E4A] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-[#10B981]" />
                  Li-Ion Battery Bank SoC:
                </span>
                <span className="text-white font-bold">{batterySoc}%</span>
              </div>
              <div className="w-full bg-[#111E32] rounded-full h-2 overflow-hidden border border-[#1E2E4A]">
                <div
                  className={`h-full transition-all duration-300 ${
                    batterySoc < 50 ? 'bg-[#EF4444]' : batterySoc < 70 ? 'bg-[#F5B942]' : 'bg-[#10B981]'
                  }`}
                  style={{ width: `${batterySoc}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#94A3B8]">
                <span>Bus Voltage: 124.6 V DC</span>
                <span>Cell Health: 99.1%</span>
              </div>
            </div>

            {/* Load Shedding Toggle Button */}
            <div className="pt-2 border-t border-[#1E2E4A]">
              <button
                onClick={() => setLoadSheddingActive(!loadSheddingActive)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                  loadSheddingActive
                    ? 'bg-[#F5B942] text-[#050914] border-[#F5B942]'
                    : 'bg-[#111E32] border-[#1E2E4A] text-[#94A3B8] hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {loadSheddingActive
                    ? 'RESTORE NON-ESSENTIAL PAYLOADS (-22 kW)'
                    : 'TRIGGER LOAD SHEDDING (+22 kW SAVINGS)'}
                </span>
              </button>
            </div>
          </div>

          {/* Educational Note */}
          <div className="glass-panel p-3.5 rounded-xl border border-[#1E2E4A] text-xs">
            <span className="font-mono text-[#F5B942] block font-bold mb-1">
              ORBITAL ECLIPSE POWER ARCHITECTURE:
            </span>
            <p className="text-[#94A3B8] leading-relaxed">
              In Low Earth Orbit, a spacecraft plunges into Earth's shadow for ~35 minutes out of every 90-minute orbit. During eclipse, solar arrays produce exactly 0 kW. Massive Li-ion battery banks must deliver tens of kilowatts uninterrupted to power life-support scrubbers and attitude thrusters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

