import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sun,
  Shield,
  Radio,
  Zap,
  Activity,
  Maximize2,
  Sliders,
  Globe2,
} from 'lucide-react';

interface SpaceWeatherObservatory3DProps {
  activeView?: 'HELIOSPHERE' | 'SOLAR_FLARE' | 'MAGNETOSPHERE' | 'RADIATION_BELTS';
  flareActive?: boolean;
}

function HeliosphereScene({
  activeView,
  flareActive,
}: {
  activeView: 'HELIOSPHERE' | 'SOLAR_FLARE' | 'MAGNETOSPHERE' | 'RADIATION_BELTS';
  flareActive: boolean;
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const cmeArcRef = useRef<THREE.Group>(null);
  const earthGroupRef = useRef<THREE.Group>(null);
  const bowShockRef = useRef<THREE.Mesh>(null);
  const windParticlesRef = useRef<THREE.Points>(null);
  const l1SatelliteRef = useRef<THREE.Group>(null);

  // Solar wind particle positions
  const particleCount = 280;
  const [particlePositions] = useState(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = -4.5 + Math.random() * 8.5; // along Sun-Earth axis
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }
    return pos;
  });

  useFrame((state, delta) => {
    // Sun rotation
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.15;
    }

    // CME plasma arc pulsation
    if (cmeArcRef.current && flareActive) {
      cmeArcRef.current.rotation.z += delta * 0.8;
      const s = 1.0 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
      cmeArcRef.current.scale.set(s, s, s);
    }

    // Earth group rotation
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.3;
    }

    // Bow shock shimmer
    if (bowShockRef.current) {
      const mat = bowShockRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      }
    }

    // Stream solar wind particles toward Earth (from left to right)
    if (windParticlesRef.current) {
      const arr = windParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const speed = flareActive ? 7.5 : 3.8;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3] += speed * delta;
        if (arr[i * 3] > 4.2) {
          arr[i * 3] = -4.5;
          arr[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
        }
      }
      windParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // L1 Satellite hover
    if (l1SatelliteRef.current) {
      l1SatelliteRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group>
      {/* ========================================================
          1. THE SUN (Left at X = -4.8)
         ======================================================== */}
      <group position={[-4.8, 0, 0]}>
        {/* Core Solar Sphere */}
        <mesh ref={sunRef}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#ea580c"
            emissiveIntensity={1.8}
            roughness={0.2}
          />
        </mesh>

        {/* Solar Corona Glow Shell */}
        <mesh scale={[1.15, 1.15, 1.15]}>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshBasicMaterial
            color="#fef08a"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Coronal Mass Ejection (CME) Plasma Ejection Loops */}
        <group ref={cmeArcRef} position={[1.4, 0.4, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <torusGeometry args={[0.5, 0.08, 16, 32, Math.PI * 0.8]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={flareActive ? 2.2 : 0.8}
            />
          </mesh>
        </group>

        <Text position={[0, 2.2, 0]} fontSize={0.18} color="#facc15" anchorX="center">
          SOLAR ACTIVE REGION 3664
        </Text>
        <Text position={[0, 1.9, 0]} fontSize={0.11} color="#f97316" anchorX="center">
          {flareActive ? 'CME / X-CLASS SOLAR FLARE ONSET' : 'QUIET SOLAR HELIOSPHERE'}
        </Text>
      </group>

      {/* ========================================================
          2. SOLAR WIND STREAM (Particles traveling to Earth)
         ======================================================== */}
      <points ref={windParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={flareActive ? '#f97316' : '#38bdf8'}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ========================================================
          3. SUN-EARTH L1 LAGRANGE POINT (DSCOVR Satellite)
         ======================================================== */}
      <group ref={l1SatelliteRef} position={[0.8, 0, 0]}>
        {/* DSCOVR Satellite Body */}
        <mesh>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
        {/* Solar Panels */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.28, 0.02]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.12, 0.28, 0.02]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 0.5, 0]} fontSize={0.09} color="#38bdf8" anchorX="center">
          DSCOVR (L1 MONITOR)
        </Text>
      </group>

      {/* ========================================================
          4. PLANET EARTH & MAGNETOSPHERE (Right at X = 3.2)
         ======================================================== */}
      <group position={[3.2, 0, 0]}>
        {/* Earth Bow Shock Wave (Curved barrier facing the Sun) */}
        <mesh
          ref={bowShockRef}
          position={[-1.2, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <cylinderGeometry args={[1.6, 2.4, 0.6, 24, 1, true, -Math.PI / 2, Math.PI]} />
          <meshBasicMaterial
            color={flareActive ? '#ef4444' : '#06b6d4'}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>

        {/* Van Allen Radiation Belts */}
        {(activeView === 'RADIATION_BELTS' || activeView === 'MAGNETOSPHERE') && (
          <group>
            {/* Inner Belt (Proton-rich) */}
            <mesh rotation={[Math.PI / 6, 0, 0]}>
              <torusGeometry args={[1.0, 0.12, 16, 48]} />
              <meshBasicMaterial
                color="#f59e0b"
                transparent
                opacity={0.5}
                wireframe
              />
            </mesh>
            {/* Outer Belt (Electron-rich) */}
            <mesh rotation={[-Math.PI / 6, 0, 0]}>
              <torusGeometry args={[1.5, 0.16, 16, 48]} />
              <meshBasicMaterial
                color="#a855f7"
                transparent
                opacity={0.4}
                wireframe
              />
            </mesh>
            {/* South Atlantic Anomaly (SAA) Hotspot */}
            <mesh position={[-0.45, -0.2, 0.55]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={1.2}
              />
            </mesh>
            <Text position={[-0.45, -0.45, 0.55]} fontSize={0.08} color="#ef4444" anchorX="center">
              SAA HOTSPOT
            </Text>
          </group>
        )}

        {/* Earth Globe */}
        <group ref={earthGroupRef}>
          <mesh>
            <sphereGeometry args={[0.65, 32, 32]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Atmosphere Halos */}
          <mesh scale={[1.06, 1.06, 1.06]}>
            <sphereGeometry args={[0.65, 24, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} side={THREE.BackSide} />
          </mesh>
        </group>

        {/* ISS Orbital Trajectory Ring */}
        <mesh rotation={[Math.PI / 3.5, 0, 0]}>
          <ringGeometry args={[0.82, 0.84, 48]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
        <Text position={[0, 1.4, 0]} fontSize={0.14} color="#f8fafc" anchorX="center">
          EARTH // ISS ORBIT
        </Text>
        <Text position={[0, -1.4, 0]} fontSize={0.10} color="#06b6d4" anchorX="center">
          MAGNETOPAUSE DEFLECTION
        </Text>
      </group>
    </group>
  );
}

export const SpaceWeatherObservatory3D: React.FC<SpaceWeatherObservatory3DProps> = ({
  activeView = 'HELIOSPHERE',
  flareActive = true,
}) => {
  const [viewMode, setViewMode] = useState<'HELIOSPHERE' | 'SOLAR_FLARE' | 'MAGNETOSPHERE' | 'RADIATION_BELTS'>(activeView);
  const [isFlareSimulated, setIsFlareSimulated] = useState<boolean>(flareActive);

  // Camera positions based on view mode
  const getCameraPosition = (): [number, number, number] => {
    switch (viewMode) {
      case 'SOLAR_FLARE':
        return [-3.5, 1.2, 4.0];
      case 'MAGNETOSPHERE':
      case 'RADIATION_BELTS':
        return [3.0, 1.5, 4.2];
      default:
        return [0, 2.5, 8.5];
    }
  };

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#040812] via-[#081328] to-[#03060f] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded-lg text-amber-400">
            <Sun className="w-5 h-5 animate-spin text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
                NASA GSFC DONKI // OSDR RADLAB 3D
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950 border border-amber-700/50 text-amber-300 rounded-full">
                HELIOSPHERIC OBSERVATORY
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Sun-Earth Space Weather, Solar Wind & Van Allen Belts
            </h2>
          </div>
        </div>

        {/* View Mode Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {(['HELIOSPHERE', 'SOLAR_FLARE', 'MAGNETOSPHERE', 'RADIATION_BELTS'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === mode
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1d33] text-slate-400 hover:text-white'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: getCameraPosition(), fov: 46 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[-4.8, 0, 0]} intensity={3.0} color="#f59e0b" distance={16} />
          <directionalLight position={[0, 6, 4]} intensity={0.8} />
          <Stars radius={120} depth={60} count={3000} factor={4} saturation={0} fade />
          <Suspense fallback={null}>
            <HeliosphereScene activeView={viewMode} flareActive={isFlareSimulated} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 1.9}
            minDistance={2.5}
            maxDistance={14.0}
          />
        </Canvas>

        {/* Telemetry Card (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 w-80 bg-[#081220]/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              {viewMode === 'SOLAR_FLARE'
                ? 'Solar Flare Plasma Ejection'
                : viewMode === 'RADIATION_BELTS'
                ? 'Van Allen Trapped Dosimetry'
                : viewMode === 'MAGNETOSPHERE'
                ? 'Earth Magnetic Bow Shock'
                : 'Heliospheric Interplanetary Vector'}
            </span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {viewMode === 'SOLAR_FLARE'
              ? 'Active Region 3664 has ejected a coronal mass ejection plasma cloud at 1,420 km/s. WSA-Enlil models estimate Earth impact within 28.5 hours.'
              : viewMode === 'RADIATION_BELTS'
              ? 'ISS passes through the South Atlantic Anomaly (SAA) 4 times per day, where inner Van Allen proton belts dip to 200 km, spiking detector dose rates to 1,120 μGy/day.'
              : viewMode === 'MAGNETOSPHERE'
              ? 'Earth magnetic dipole forms a bow shock at 10-12 Earth radii, deflecting 99% of charged solar wind particles into the geomagnetic tail.'
              : 'Continuous solar wind streams past DSCOVR satellite at Lagrange Point L1, providing 45-60 minute advance warning of impending geomagnetic storms.'}
          </p>
        </div>
      </div>

      {/* Bottom Controls Strip */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFlareSimulated(!isFlareSimulated)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              isFlareSimulated
                ? 'bg-rose-600/30 border border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate X-Class Solar Flare: {isFlareSimulated ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>NASA CCMC Space Weather Standard: </span>
          <span className="text-cyan-300 font-bold">L1 early warning provides 45 min mission response</span>
        </div>
      </div>
    </div>
  );
};
