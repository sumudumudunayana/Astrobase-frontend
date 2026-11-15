import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  Flame,
  Radio,
  Compass,
  Layers,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';

interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  role: 'hazard' | 'structure' | 'protocol';
  description: string;
  specs: Record<string, string>;
}

const EVA_HOTSPOTS: Hotspot[] = [
  {
    id: 'ev1_marking',
    title: 'EV1 Lead Spacewalker Markings',
    subtitle: 'Visual Identification Protocol',
    position: [0, 0.9, 0.45],
    role: 'protocol',
    description: 'EV1 wears red diagonal stripes on the legs and arms of the EMU, allowing mission control and fellow crew to distinguish the lead spacewalker during orbital darkness or complex joint procedures.',
    specs: {
      'Designation': 'EV1 (Lead) vs EV2 (Support)',
      'Marking': 'Red stripes on upper arms and lower legs',
      'Responsibility': 'Worksite leader, primary tool deployment',
    },
  },
  {
    id: 'thermal_hazard',
    title: 'Extreme Thermal Cycling',
    subtitle: 'Space Environment Hazard',
    position: [1.2, 0.5, 0],
    role: 'hazard',
    description: 'In Low Earth Orbit, spacecraft pass through sunlight and eclipse every 90 minutes. External surfaces cycle between +121°C (+250°F) in direct sunlight and -156°C (-250°F) in orbital eclipse.',
    specs: {
      'Sunlit Temp': '+121°C (+250°F)',
      'Eclipse Temp': '-156°C (-250°F)',
      'Mitigation': '40-layer aluminized Mylar & LCVG water cooling',
    },
  },
  {
    id: 'mmod_hazard',
    title: 'Micrometeoroids & Orbital Debris (MMOD)',
    subtitle: 'Hypervelocity Impact Risk',
    position: [-1.4, 0.8, -0.4],
    role: 'hazard',
    description: 'Hypervelocity particles travel up to 10 km/s (22,000 mph). Even a 1-millimeter paint fleck can penetrate unprotected suit layers. The outer Ortho-fabric and Kevlar layers are designed to disperse impact energy.',
    specs: {
      'Impact Velocity': 'Up to 10–14 km/s',
      'Critical Particle Size': '> 0.5 mm capable of puncture',
      'Protective Layers': 'Gore-Tex, Kevlar, and Nomex weave',
    },
  },
  {
    id: 'eva_handrail',
    title: 'Yellow EVA Handrail System',
    subtitle: 'Spacecraft Mobility Path',
    position: [0.6, -0.6, 0.3],
    role: 'structure',
    description: 'Astronauts never pull or push directly on spacecraft antennas, solar arrays, or radiator surfaces. Instead, they navigate along anodized yellow aluminum handrails rated for tether carabiner attachment.',
    specs: {
      'Handrail Color': 'High-visibility safety yellow',
      'Tether Load Rating': 'Up to 450 N (100 lbf) sustained pull',
      'Guideline': 'Always maintain 3 points of contact or 2 locked tethers',
    },
  },
  {
    id: 'plss_subsystem',
    title: 'Portable Life Support Subsystem',
    subtitle: 'Primary Autonomous Life Support',
    position: [0, 0.7, -0.6],
    role: 'structure',
    description: 'Mounted to the astronaut back, PLSS supplies 29.6 kPa (4.3 psi) pure oxygen, circulates chilled water through the LCVG, scrubs carbon dioxide, and vents sublimator vapor into space vacuum.',
    specs: {
      'Operating Time': '6.5 to 8.0 hours nominal',
      'Atmosphere': '100% pure oxygen at 29.6 kPa',
      'Heat Rejection': 'Water sublimator porous plate',
    },
  },
];

function EarthSphere() {
  const earthRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group position={[0, -18, -12]}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[14, 64, 64]} />
        <meshStandardMaterial
          color="#153664"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Earth atmosphere glow */}
      <mesh scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[14, 32, 32]} />
        <meshBasicMaterial
          color="#42D9F5"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function SpacecraftTruss() {
  return (
    <group position={[-2.2, 0, -0.5]}>
      {/* Cylindrical Airlock Module */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 3.5, 32]} />
        <meshStandardMaterial color="#8899A6" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Quest Airlock Hatch Ring */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[1.76, 0, 0]}>
        <torusGeometry args={[0.7, 0.08, 16, 32]} />
        <meshStandardMaterial color="#F5B942" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Exterior Yellow Handrails */}
      {[0.5, 0, -0.5].map((y, idx) => (
        <group key={idx} position={[1.4, y, 0.8]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 12]} />
            <meshStandardMaterial color="#F5B942" metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[-0.28, 0, -0.06]}>
            <boxGeometry args={[0.04, 0.04, 0.12]} />
            <meshStandardMaterial color="#556677" />
          </mesh>
          <mesh position={[0.28, 0, -0.06]}>
            <boxGeometry args={[0.04, 0.04, 0.12]} />
            <meshStandardMaterial color="#556677" />
          </mesh>
        </group>
      ))}

      {/* Solar Panel Array Segment */}
      <group position={[-1.2, 1.8, -1]}>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <boxGeometry args={[2.5, 0.05, 1.4]} />
          <meshStandardMaterial color="#0b2447" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function AstronautMesh({ isEv1, showThermal }: { isEv1: boolean; showThermal: boolean }) {
  const suitColor = showThermal ? '#FF5533' : '#E8EEF5';
  const shadowColor = showThermal ? '#3388FF' : '#B8C4D0';

  return (
    <group position={[0, 0, 0]}>
      {/* Upper Torso (HUT) */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.7, 0.65, 0.48]} />
        <meshStandardMaterial color={suitColor} roughness={0.4} />
      </mesh>

      {/* Lower Torso Assembly (LTA) */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.3, 0.28, 0.4, 20]} />
        <meshStandardMaterial color={shadowColor} roughness={0.5} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.18, -0.4, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.8, 16]} />
        <meshStandardMaterial color={suitColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.18, -0.4, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.8, 16]} />
        <meshStandardMaterial color={suitColor} roughness={0.5} />
      </mesh>

      {/* Boots */}
      <mesh position={[-0.18, -0.85, 0.08]}>
        <boxGeometry args={[0.18, 0.14, 0.32]} />
        <meshStandardMaterial color="#556070" roughness={0.7} />
      </mesh>
      <mesh position={[0.18, -0.85, 0.08]}>
        <boxGeometry args={[0.18, 0.14, 0.32]} />
        <meshStandardMaterial color="#556070" roughness={0.7} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.45, 0.7, 0.1]} rotation={[0.3, 0, -0.2]}>
        <cylinderGeometry args={[0.11, 0.09, 0.55, 16]} />
        <meshStandardMaterial color={suitColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.45, 0.7, 0.1]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.11, 0.09, 0.55, 16]} />
        <meshStandardMaterial color={suitColor} roughness={0.5} />
      </mesh>

      {/* Gloves (Phase VI) */}
      <mesh position={[-0.52, 0.4, 0.2]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#3A4454" roughness={0.8} />
      </mesh>
      <mesh position={[0.52, 0.4, 0.2]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#3A4454" roughness={0.8} />
      </mesh>

      {/* EV1 Red Stripes on Arms and Legs */}
      {isEv1 && (
        <>
          {/* Arm stripe left */}
          <mesh position={[-0.45, 0.75, 0.1]} rotation={[0.3, 0, -0.2]}>
            <cylinderGeometry args={[0.115, 0.115, 0.08, 16]} />
            <meshStandardMaterial color="#EF4444" roughness={0.3} />
          </mesh>
          {/* Arm stripe right */}
          <mesh position={[0.45, 0.75, 0.1]} rotation={[0.3, 0, 0.2]}>
            <cylinderGeometry args={[0.115, 0.115, 0.08, 16]} />
            <meshStandardMaterial color="#EF4444" roughness={0.3} />
          </mesh>
          {/* Leg stripe left */}
          <mesh position={[-0.18, -0.3, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.08, 16]} />
            <meshStandardMaterial color="#EF4444" roughness={0.3} />
          </mesh>
          {/* Leg stripe right */}
          <mesh position={[0.18, -0.3, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.08, 16]} />
            <meshStandardMaterial color="#EF4444" roughness={0.3} />
          </mesh>
        </>
      )}

      {/* Helmet Shell */}
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color="#E8EEF5" roughness={0.3} />
      </mesh>

      {/* Gold Vapor Visor (EVVA) */}
      <mesh position={[0, 1.25, 0.12]} rotation={[0.1, 0, 0]}>
        <sphereGeometry args={[0.24, 24, 24, 0, Math.PI]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.95}
          roughness={0.08}
        />
      </mesh>

      {/* PLSS Backpack */}
      <mesh position={[0, 0.75, -0.38]}>
        <boxGeometry args={[0.62, 0.82, 0.32]} />
        <meshStandardMaterial color="#DDE4ED" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* SAFER Jetpack unit at bottom of PLSS */}
      <mesh position={[0, 0.3, -0.38]}>
        <boxGeometry args={[0.58, 0.22, 0.26]} />
        <meshStandardMaterial color="#374151" roughness={0.5} />
      </mesh>

      {/* Safety Tether Wire leading to Airlock */}
      <mesh position={[-0.45, 0.1, -0.1]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.008, 0.008, 1.4, 8]} />
        <meshBasicMaterial color="#F5B942" />
      </mesh>
    </group>
  );
}

export const EVAFundamentals3D: React.FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(EVA_HOTSPOTS[0]);
  const [isEv1, setIsEv1] = useState(true);
  const [showThermalGradient, setShowThermalGradient] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-space-950 border border-space-800 shadow-2xl flex flex-col">
      {/* Top Header & Control Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-space-900/95 via-space-950/95 to-space-950 border-b border-space-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                EVA FUNDAMENTALS & SPACE ENVIRONMENT
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                LESSON 01 3D LAB
              </span>
            </div>
            <p className="text-xs text-space-400 mt-0.5">
              Low Earth Orbit • 400 km Altitude • 28,000 km/h Orbital Velocity
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEv1(!isEv1)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
              isEv1
                ? 'bg-red-950/80 text-red-200 border-red-700 shadow-md shadow-red-950/40'
                : 'bg-space-900 text-space-300 border-space-700 hover:text-white'
            }`}
          >
            {isEv1 ? 'EV1: LEAD (RED STRIPES)' : 'EV2: SUPPORT (WHITE)'}
          </button>

          <button
            onClick={() => setShowThermalGradient(!showThermalGradient)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              showThermalGradient
                ? 'bg-amber-950/80 text-amber-200 border-amber-700 shadow-md shadow-amber-950/40'
                : 'bg-space-900 text-space-300 border-space-700 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{showThermalGradient ? 'THERMAL OVERLAY ON' : 'THERMAL OVERLAY OFF'}</span>
          </button>

          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className="p-2 rounded-lg bg-space-900 border border-space-700 text-space-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle rotation"
          >
            {isAutoRotate ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[520px] lg:h-[620px] bg-space-950">
        <Canvas
          camera={{ position: [2.8, 1.4, 3.2], fov: 45 }}
          className="w-full h-full bg-space-950"
        >
          <ambientLight intensity={showThermalGradient ? 0.3 : 0.6} />
          <directionalLight
            position={[5, 6, 4]}
            intensity={showThermalGradient ? 2.5 : 1.5}
            color={showThermalGradient ? '#FFB088' : '#FFFFFF'}
          />
          <directionalLight
            position={[-5, -4, -4]}
            intensity={showThermalGradient ? 0.2 : 0.4}
            color="#4488FF"
          />

          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <EarthSphere />
          <SpacecraftTruss />
          <AstronautMesh isEv1={isEv1} showThermal={showThermalGradient} />

          {/* Interactive 3D Hotspot Markers */}
          {EVA_HOTSPOTS.map((hotspot) => {
            const isSelected = selectedHotspot?.id === hotspot.id;
            return (
              <group key={hotspot.id} position={hotspot.position}>
                <Html distanceFactor={10} center>
                  <button
                    onClick={() => setSelectedHotspot(hotspot)}
                    className={`group relative flex items-center justify-center transition-transform hover:scale-115 ${
                      isSelected ? 'scale-120' : 'scale-100'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transition-all ${
                        hotspot.role === 'hazard'
                          ? 'bg-amber-500 text-black border border-amber-300'
                          : hotspot.role === 'protocol'
                          ? 'bg-red-500 text-white border border-red-300'
                          : 'bg-cyan-500 text-black border border-cyan-200'
                      }`}
                    >
                      !
                    </span>
                    <span className="sr-only">{hotspot.title}</span>
                  </button>
                </Html>
              </group>
            );
          })}

          <OrbitControls
            enablePan={false}
            autoRotate={isAutoRotate}
            autoRotateSpeed={0.8}
            minDistance={1.8}
            maxDistance={7.0}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </div>

      {/* Bottom Info HUD Panel */}
      {selectedHotspot && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-space-900/95 backdrop-blur-md border border-space-700/80 rounded-lg p-3.5 shadow-xl transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedHotspot.role === 'hazard'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : selectedHotspot.role === 'protocol'
                      ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  }`}
                >
                  {selectedHotspot.role}
                </span>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {selectedHotspot.title}
                </h4>
                <span className="text-xs text-space-400 hidden sm:inline">• {selectedHotspot.subtitle}</span>
              </div>
              <p className="text-xs text-space-300 line-clamp-2 leading-relaxed">
                {selectedHotspot.description}
              </p>
            </div>

            {/* Telemetry / Specs Badges */}
            <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-space-800 pt-2 md:pt-0 md:pl-4">
              {Object.entries(selectedHotspot.specs).map(([key, val]) => (
                <div key={key} className="bg-space-950/80 px-2 py-1 rounded border border-space-800 text-left">
                  <span className="block text-[9px] font-mono text-space-400 uppercase tracking-wider">
                    {key}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-cyan-300">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

