import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Globe2,
  Mountain,
  Compass,
  Layers,
  Activity,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react';

interface GeologicalFeature {
  id: string;
  name: string;
  targetBody: 'Moon' | 'Mars';
  position: [number, number, number];
  category: 'volcanic' | 'impact' | 'aqueous' | 'highland';
  description: string;
  specs: Record<string, string>;
}

const GEOLOGICAL_FEATURES: GeologicalFeature[] = [
  // Moon Features
  {
    id: 'lunar_maria',
    name: 'Mare Tranquillitatis (Sea of Tranquility)',
    targetBody: 'Moon',
    position: [0.6, 0.4, 1.2],
    category: 'volcanic',
    description: 'Extensive basaltic plain formed by ancient volcanic flooding 3.6 billion years ago. Rich in ilmenite (FeTiO3) and basalt.',
    specs: {
      'Rock Type': 'High-Titanium Basalt',
      'Age': '3.6 Billion Years',
      'Historical Note': 'Apollo 11 Touchdown Site (1969)',
    },
  },
  {
    id: 'tycho_crater',
    name: 'Tycho Impact Crater & Ray System',
    targetBody: 'Moon',
    position: [0.2, -1.0, 1.0],
    category: 'impact',
    description: 'Prominent 85 km diameter impact crater with a 2 km deep floor and a 1,500 km radial ejecta ray system spanning across the lunar nearside.',
    specs: {
      'Diameter': '85 km (Depth: 4.8 km)',
      'Age': '108 Million Years (Young Copernicus era)',
      'Central Peak': '1.6 km central uplift peak',
    },
  },
  {
    id: 'lunar_highlands',
    name: 'Anorthositic Primordial Highlands',
    targetBody: 'Moon',
    position: [-0.9, 0.5, 0.8],
    category: 'highland',
    description: 'The Moon’s original buoyant crust formed as plagioclase feldspar crystallized and floated to the top of the primordial magma ocean.',
    specs: {
      'Dominant Mineral': 'Anorthosite (Plagioclase)',
      'Age': '4.4 Billion Years',
      'Albedo': 'High reflectivity (light-colored)',
    },
  },
  // Mars Features
  {
    id: 'olympus_mons',
    name: 'Olympus Mons Shield Volcano',
    targetBody: 'Mars',
    position: [-0.4, 0.3, 1.3],
    category: 'volcanic',
    description: 'The largest known volcano in the solar system. Rises 21.9 km above datum with a 600 km basal diameter, formed by stationary hotspot volcanism.',
    specs: {
      'Elevation': '21.9 km (2.5x Mount Everest)',
      'Base Diameter': '600 km (Size of France)',
      'Caldera Complex': '80 km wide multi-ring caldera',
    },
  },
  {
    id: 'valles_marineris',
    name: 'Valles Marineris Rift Canyon',
    targetBody: 'Mars',
    position: [0.7, -0.2, 1.1],
    category: 'volcanic',
    description: 'Grand crustal rift canyon system stretching over 4,000 km along the Martian equator, reaching depths of up to 7 km.',
    specs: {
      'Length': '4,000 km (Earth USA width)',
      'Depth': 'Up to 7 km deep',
      'Origin': 'Tectonic rifting associated with Tharsis rise',
    },
  },
  {
    id: 'jezero_delta',
    name: 'Jezero Crater Fluvial Delta',
    targetBody: 'Mars',
    position: [0.4, 0.6, 1.1],
    category: 'aqueous',
    description: 'Ancient river fan deposit composed of stratified mudstones and clays deposited by river distributary channels entering paleolake Jezero.',
    specs: {
      'Age': '3.7 Billion Years (Noachian/Hesperian)',
      'Deposits': 'Smectite clays & carbonate minerals',
      'Exploration': 'NASA Perseverance Rover worksite',
    },
  },
  {
    id: 'polar_ice',
    name: 'Planum Boreum (North Polar Ice Cap)',
    targetBody: 'Mars',
    position: [0.0, 1.4, 0.3],
    category: 'aqueous',
    description: 'Permanent water ice layered deposits (NPLD) capped with a seasonal layer of dry ice (frozen CO2) up to 1 meter thick.',
    specs: {
      'Diameter': '1,000 km across',
      'Composition': '95% Water Ice (H2O), 5% Dust / CO2',
      'Thickness': 'Up to 3 km thick',
    },
  },
];

function CelestialSphere({
  targetBody,
  selectedFeature,
  onSelectFeature,
}: {
  targetBody: 'Moon' | 'Mars';
  selectedFeature: GeologicalFeature | null;
  onSelectFeature: (f: GeologicalFeature) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  const isMoon = targetBody === 'Moon';
  const features = GEOLOGICAL_FEATURES.filter((f) => f.targetBody === targetBody);

  return (
    <group>
      {/* Primary Planet/Moon Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial
          color={isMoon ? '#94A3B8' : '#C2410C'}
          roughness={0.8}
          metalness={0.1}
          bumpScale={0.05}
        />
      </mesh>

      {/* Surface Features / Hotspot Markers */}
      {features.map((feature) => {
        const isSelected = selectedFeature?.id === feature.id;
        return (
          <group
            key={feature.id}
            position={feature.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectFeature(feature);
            }}
          >
            <mesh>
              <sphereGeometry args={[isSelected ? 0.09 : 0.06, 16, 16]} />
              <meshStandardMaterial
                color={
                  isSelected
                    ? '#38BDF8'
                    : feature.category === 'aqueous'
                    ? '#0284C7'
                    : feature.category === 'volcanic'
                    ? '#F97316'
                    : '#F59E0B'
                }
                emissive={isSelected ? '#38BDF8' : '#F97316'}
                emissiveIntensity={isSelected ? 1.0 : 0.4}
              />
            </mesh>
            {/* Pulsing ring for selected feature */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.1, 0.14, 24]} />
                <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export const PlanetaryGeology3D: React.FC = () => {
  const [targetBody, setTargetBody] = useState<'Moon' | 'Mars'>('Moon');
  const [selectedFeature, setSelectedFeature] = useState<GeologicalFeature | null>(
    GEOLOGICAL_FEATURES[0]
  );

  const handleSwitchBody = (body: 'Moon' | 'Mars') => {
    setTargetBody(body);
    const firstOfBody = GEOLOGICAL_FEATURES.find((f) => f.targetBody === body);
    setSelectedFeature(firstOfBody || null);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                MOON &amp; MARS COMPARATIVE GEOLOGY
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                LESSON 01 3D LAB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Planetary Stratigraphy • Volcanism • Impact Basins • Fluvial Sediments
            </p>
          </div>
        </div>

        {/* Target Body Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSwitchBody('Moon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              targetBody === 'Moon'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            THE MOON (LUNA)
          </button>

          <button
            onClick={() => handleSwitchBody('Mars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              targetBody === 'Mars'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            MARS (RED PLANET)
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="h-[480px] lg:h-[540px] w-full relative">
        <Canvas camera={{ position: [0, 1.0, 3.8], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 6, 4]} intensity={1.5} />
          <directionalLight position={[-5, -2, -3]} intensity={0.2} color="#38BDF8" />
          <Stars radius={60} depth={40} count={2500} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <CelestialSphere
              targetBody={targetBody}
              selectedFeature={selectedFeature}
              onSelectFeature={setSelectedFeature}
            />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2.2}
            maxDistance={6.0}
            maxPolarAngle={Math.PI / 1.6}
          />
        </Canvas>

        {/* Feature Hotspot Selector Chips (Overlay Bottom-Left) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 max-w-xs">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            GEOLOGICAL FORMATIONS:
          </span>
          {GEOLOGICAL_FEATURES.filter((f) => f.targetBody === targetBody).map((f) => {
            const isSelected = selectedFeature?.id === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFeature(f)}
                className={`px-3 py-1.5 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-[#0B1528]/80 text-slate-400 border-[#1E2E4A] hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="truncate">{f.name}</span>
                <ChevronRight className="w-3 h-3 shrink-0 ml-1 opacity-70" />
              </button>
            );
          })}
        </div>

        {/* Selected Feature Scientific Deep-Dive Card (Overlay Bottom-Right) */}
        {selectedFeature && (
          <div className="absolute bottom-4 right-4 z-10 max-w-sm bg-[#0B1528]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedFeature.name}
                </h4>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                {selectedFeature.category}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedFeature.description}</p>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 gap-1">
              {Object.entries(selectedFeature.specs).map(([key, val]) => (
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
