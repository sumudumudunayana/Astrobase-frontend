import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Sun,
  Shield,
  Activity,
  Wind,
  Layers,
  Thermometer,
  AlertTriangle,
} from 'lucide-react';

interface HazardSiteMode {
  id: string;
  name: string;
  radiationMicroSvYr: number;
  tempMinC: number;
  tempMaxC: number;
  dustHazardLevel: 'SEVERE' | 'MODERATE' | 'NONE';
  description: string;
}

const MODES: Record<string, HazardSiteMode> = {
  exposed: {
    id: 'exposed',
    name: 'Unshielded Surface Site',
    radiationMicroSvYr: 240000,
    tempMinC: -125,
    tempMaxC: 20,
    dustHazardLevel: 'SEVERE',
    description: 'Direct surface exposure with zero mass shielding. Incurring continuous Galactic Cosmic Rays, periodic Solar Particle Events, and electrostatic perchlorate dust accumulation.',
  },
  berm: {
    id: 'berm',
    name: '2.5m Regolith Berm Burial',
    radiationMicroSvYr: 12000,
    tempMinC: -40,
    tempMaxC: 0,
    dustHazardLevel: 'MODERATE',
    description: 'Habitat covered by 2.5 meters of processed regolith overburden (500 g/cm2). Blocks 95% of cosmic rays and micrometeoroids while damping thermal extremes.',
  },
  lava_tube: {
    id: 'lava_tube',
    name: 'Subsurface Basaltic Lava Tube',
    radiationMicroSvYr: 2500,
    tempMinC: -20,
    tempMaxC: -20,
    dustHazardLevel: 'NONE',
    description: 'Natural underground cavern beneath 15 meters of solid basaltic bedrock. Complete protection from cosmic radiation, zero surface dust storms, and a perpetual stable temperature.',
  },
};

// Dust Storm Particles Simulation
function DustStormParticles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 400;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      array[i * 3] += 3.0 * delta; // Horizontal wind
      array[i * 3 + 1] += (Math.random() - 0.5) * 0.4 * delta;
      if (array[i * 3] > 4.0) array[i * 3] = -4.0;
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
        color="#F59E0B"
        transparent
        opacity={0.6}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

function HabitatShieldingScene({ mode }: { mode: string }) {
  const isBerm = mode === 'berm';
  const isLavaTube = mode === 'lava_tube';

  return (
    <group>
      {/* Ground Terrain */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial
          color={isLavaTube ? '#1E293B' : '#9A3412'}
          roughness={0.9}
        />
      </mesh>

      {/* Lava Tube Overhead Arch (If Lava Tube) */}
      {isLavaTube && (
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[2.8, 2.8, 6.0, 24, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Inflatable Surface Habitat Module (Hemisphere/Cylinder) */}
      <group position={[0, 0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[1.1, 1.1, 1.2, 24]} />
          <meshStandardMaterial
            color="#E2E8F0"
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[1.1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>

        {/* Airlock Hatch */}
        <mesh position={[1.12, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      </group>

      {/* Regolith Berm Mounding (If Berm Mode) */}
      {isBerm && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[1.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#7C2D12"
            roughness={0.95}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Solar Panel Array (Surface Only) */}
      {!isLavaTube && (
        <group position={[-2.4, 0.8, 0]} rotation={[0.4, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.4, 1.8, 0.05]} />
            <meshStandardMaterial color="#0284C7" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Mast Support */}
          <mesh position={[0, -0.6, -0.2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="#64748B" />
          </mesh>
        </group>
      )}

      {/* Dust Particles */}
      <DustStormParticles active={mode === 'exposed'} />
    </group>
  );
}

export const PlanetaryHazards3D: React.FC = () => {
  const [selectedModeKey, setSelectedModeKey] = useState<string>('exposed');
  const activeMode = MODES[selectedModeKey] || MODES.exposed;

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
                PLANETARY HAZARDS &amp; HABITAT SHIELDING
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                LESSON 03 3D LAB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              GCR Radiation • SPE Solar Storms • Perchlorate Dust • Lava Tube Shelters
            </p>
          </div>
        </div>

        {/* Shielding Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(MODES).map((k) => (
            <button
              key={k}
              onClick={() => setSelectedModeKey(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedModeKey === k
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {MODES[k].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="h-[480px] lg:h-[540px] w-full relative">
        <Canvas camera={{ position: [0, 2.2, 5.2], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={selectedModeKey === 'lava_tube' ? 0.2 : 0.4} />
          <directionalLight
            position={[5, 7, 4]}
            intensity={selectedModeKey === 'lava_tube' ? 0.3 : 1.4}
            color="#F59E0B"
          />
          <directionalLight position={[-4, -2, -2]} intensity={0.2} color="#38BDF8" />
          <Stars radius={50} depth={30} count={2000} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <HabitatShieldingScene mode={selectedModeKey} />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3.0}
            maxDistance={8.0}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Canvas>

        {/* Environmental Telemetry HUD (Top-Left) */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-2xl p-4 shadow-xl min-w-[240px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              RADIATION &amp; THERMAL METRICS
            </span>

            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  activeMode.radiationMicroSvYr > 100000
                    ? 'text-rose-400'
                    : activeMode.radiationMicroSvYr > 10000
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {(activeMode.radiationMicroSvYr / 1000).toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">mSv / year</span>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">DIURNAL TEMP:</span>
                <span className="text-cyan-300 font-bold">
                  {activeMode.tempMinC}°C to {activeMode.tempMaxC}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DUST HAZARD:</span>
                <span
                  className={`font-bold ${
                    activeMode.dustHazardLevel === 'SEVERE'
                      ? 'text-rose-400'
                      : activeMode.dustHazardLevel === 'MODERATE'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeMode.dustHazardLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GCR SHIELDING:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedModeKey === 'lava_tube'
                    ? '99% (SOLID BASALT)'
                    : selectedModeKey === 'berm'
                    ? '95% (2.5m REGOLITH)'
                    : '0% (UNSHIELDED)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Description Card (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-10 max-w-sm bg-[#0B1528]/95 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {activeMode.name}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{activeMode.description}</p>
        </div>
      </div>
    </div>
  );
};
