import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Globe2,
  Mountain,
  Compass,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sun,
  Radio,
  Sparkles,
} from 'lucide-react';

interface CandidateSite {
  id: string;
  name: string;
  targetBody: 'Moon' | 'Mars';
  position: [number, number, number]; // 3D coordinates on sphere
  slopeDeg: number;
  boulderDensityPct: number;
  solarIlluminationPct: number;
  commsVisibilityPct: number;
  scientificValueScore: number; // 0-100
  rationale: string;
}

const CANDIDATE_SITES: CandidateSite[] = [
  // Moon Artemis Candidates
  {
    id: 'shackleton_rim',
    name: 'Shackleton Crater Connecting Rim',
    targetBody: 'Moon',
    position: [0.1, -1.85, 0.4], // Near lunar south pole
    slopeDeg: 6.8,
    boulderDensityPct: 14,
    solarIlluminationPct: 92, // Peak of Eternal Light
    commsVisibilityPct: 88,
    scientificValueScore: 98,
    rationale:
      'Direct rim access to permanently shadowed cryogenic cold traps containing water ice volatiles. Highly continuous solar illumination.',
  },
  {
    id: 'malapert_mountain',
    name: 'Malapert Mountain (Massif)',
    targetBody: 'Moon',
    position: [-0.3, -1.8, 0.6],
    slopeDeg: 12.4,
    boulderDensityPct: 22,
    solarIlluminationPct: 89,
    commsVisibilityPct: 95,
    scientificValueScore: 84,
    rationale:
      'Elevated peak provides uninterrupted Direct-to-Earth line-of-sight communication relay and panoramic line of sight.',
  },
  {
    id: 'haworth_crater',
    name: 'Haworth Crater Ridge',
    targetBody: 'Moon',
    position: [0.4, -1.75, -0.3],
    slopeDeg: 16.2, // Exceeds safe 12 deg landing threshold
    boulderDensityPct: 35,
    solarIlluminationPct: 65,
    commsVisibilityPct: 70,
    scientificValueScore: 90,
    rationale:
      'Extremely steep terrain rim. Rich volatile signatures but severe landing hazard for lunar lander stability.',
  },

  // Mars Candidates
  {
    id: 'jezero_delta',
    name: 'Jezero Crater Fan Delta',
    targetBody: 'Mars',
    position: [1.1, 0.6, 1.4],
    slopeDeg: 4.5,
    boulderDensityPct: 12,
    solarIlluminationPct: 78,
    commsVisibilityPct: 92,
    scientificValueScore: 99,
    rationale:
      'Ancient river-lake system with deltaic clay and carbonate deposits optimal for fossilized microbial biosignature discovery.',
  },
  {
    id: 'gale_crater',
    name: 'Gale Crater (Mount Sharp Floor)',
    targetBody: 'Mars',
    position: [1.5, -0.4, 1.0],
    slopeDeg: 5.2,
    boulderDensityPct: 16,
    solarIlluminationPct: 80,
    commsVisibilityPct: 90,
    scientificValueScore: 92,
    rationale:
      'Thick layered sedimentary strata recording billions of years of climatic transition from aqueous warm to arid freeze.',
  },
  {
    id: 'valles_marineris',
    name: 'Valles Marineris Chasma Floor',
    targetBody: 'Mars',
    position: [-1.4, -0.2, 1.2],
    slopeDeg: 21.0, // High slope danger
    boulderDensityPct: 48,
    solarIlluminationPct: 55,
    commsVisibilityPct: 60,
    scientificValueScore: 95,
    rationale:
      'Immense canyon floor exposes deep planetary crust, but catastrophic slope gradients and sheer rock walls preclude safe touchdown.',
  },
];

// 3D Planetary Globe with Candidate Landing Beacons
const PlanetaryBodyGlobe: React.FC<{
  targetBody: 'Moon' | 'Mars';
  selectedSite: CandidateSite;
  onSelectSite: (site: CandidateSite) => void;
}> = ({ targetBody, selectedSite, onSelectSite }) => {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05;
    }
  });

  const bodySites = CANDIDATE_SITES.filter((s) => s.targetBody === targetBody);

  return (
    <group>
      {/* Central Planet Sphere */}
      <mesh ref={globeRef} receiveShadow castShadow>
        <sphereGeometry args={[1.9, 64, 64]} />
        <meshStandardMaterial
          color={targetBody === 'Moon' ? '#94a3b8' : '#c2410c'}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Candidate Landing Site Beacons */}
      {bodySites.map((site) => {
        const isSelected = selectedSite.id === site.id;
        const isDangerous = site.slopeDeg > 12 || site.boulderDensityPct > 30;

        return (
          <group
            key={site.id}
            position={site.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSite(site);
            }}
          >
            {/* Landing Target Ring */}
            <mesh>
              <ringGeometry args={[0.08, 0.16, 24]} />
              <meshBasicMaterial
                color={isSelected ? '#38bdf8' : isDangerous ? '#ef4444' : '#10b981'}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Glowing Center Pin */}
            <mesh position={[0, 0, 0.1]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial
                color={isSelected ? '#38bdf8' : isDangerous ? '#f87171' : '#34d399'}
                emissive={isSelected ? '#0284c7' : '#000000'}
                emissiveIntensity={0.8}
              />
            </mesh>

            {/* Site Label */}
            <Text
              position={[0, 0.28, 0.1]}
              fontSize={0.1}
              color={isSelected ? '#38bdf8' : '#ffffff'}
              anchorX="center"
            >
              {site.name.split(' (')[0]}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export const LandingSiteSelection3D: React.FC = () => {
  const [targetBody, setTargetBody] = useState<'Moon' | 'Mars'>('Moon');
  const [selectedSite, setSelectedSite] = useState<CandidateSite>(CANDIDATE_SITES[0]);

  // Criteria Weightings for Trade Study
  const [safetyWeight, setSafetyWeight] = useState<number>(50); // 0-100
  const [scienceWeight, setScienceWeight] = useState<number>(50); // 0-100

  // Calculate composite landing suitability score (0-100%)
  const slopeSafetyScore = Math.max(0, 100 - (selectedSite.slopeDeg / 20) * 100);
  const boulderSafetyScore = Math.max(0, 100 - (selectedSite.boulderDensityPct / 50) * 100);
  const engineeringSafety = (slopeSafetyScore * 0.6 + boulderSafetyScore * 0.4);

  const missionOpsScore =
    (selectedSite.solarIlluminationPct * 0.5 + selectedSite.commsVisibilityPct * 0.5);

  const compositeScore = Math.round(
    (engineeringSafety * (safetyWeight / 100) +
      selectedSite.scientificValueScore * (scienceWeight / 100) +
      missionOpsScore * 0.3) /
      (safetyWeight / 100 + scienceWeight / 100 + 0.3)
  );

  const isGoForLanding =
    selectedSite.slopeDeg <= 12 &&
    selectedSite.boulderDensityPct <= 30 &&
    compositeScore >= 75;

  const handleBodySwitch = (body: 'Moon' | 'Mars') => {
    setTargetBody(body);
    const first = CANDIDATE_SITES.find((s) => s.targetBody === body);
    if (first) setSelectedSite(first);
  };

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Globe2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              LANDING SITE SELECTION & TERRAIN TRADE STUDY
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 07 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Slope Hazard Contours // DTE Line-of-Sight // Multi-Attribute Trade Matrix
            </p>
          </div>
        </div>

        {/* Target Body Selector */}
        <div className="flex items-center gap-1.5 bg-[#050914] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => handleBodySwitch('Moon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              targetBody === 'Moon'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Moon (Artemis Polar)
          </button>
          <button
            onClick={() => handleBodySwitch('Mars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              targetBody === 'Mars'
                ? 'bg-orange-700 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Mars (Equatorial & Delta)
          </button>
        </div>
      </div>

      {/* 3D Globe Canvas */}
      <div className="relative w-full h-[480px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 4.8], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 6]} intensity={1.8} castShadow />
          <directionalLight position={[-8, -4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <PlanetaryBodyGlobe
              targetBody={targetBody}
              selectedSite={selectedSite}
              onSelectSite={(s) => setSelectedSite(s)}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3.0}
            maxDistance={12}
          />
        </Canvas>

        {/* Floating GO / NO-GO Landing Decision Badge */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1.5 min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">TOUCHDOWN DECISION:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                isGoForLanding
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                  : 'bg-rose-950 text-rose-400 border border-rose-600'
              }`}
            >
              {isGoForLanding ? 'GO FOR TOUCHDOWN' : 'NO-GO / ABORT SITE'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
            <span>COMPOSITE SUITABILITY:</span>
            <span className="text-white font-bold">{compositeScore}%</span>
          </div>
          <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                compositeScore >= 75 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${compositeScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trade Study Weighting Sliders & Candidate Matrix */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Candidate Site Selector */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-cyan-400" />
            Candidate Landing Targets
          </label>
          <div className="space-y-2">
            {CANDIDATE_SITES.filter((s) => s.targetBody === targetBody).map((site) => (
              <button
                key={site.id}
                onClick={() => setSelectedSite(site)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedSite.id === site.id
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{site.name}</span>
                  {site.slopeDeg > 12 ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5">
                  Slope: {site.slopeDeg}° // Sci Score: {site.scientificValueScore}/100
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Candidate Technical Telemetry */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            Site Engineering Metrics
          </label>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Max Terrain Slope:</span>
              <span
                className={`font-bold ${
                  selectedSite.slopeDeg > 12 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {selectedSite.slopeDeg}° (Max Limit: 12°)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Boulder Density:</span>
              <span
                className={`font-bold ${
                  selectedSite.boulderDensityPct > 30 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {selectedSite.boulderDensityPct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Solar Illumination:</span>
              <span className="text-amber-400 font-bold">{selectedSite.solarIlluminationPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Direct-to-Earth Comms:</span>
              <span className="text-cyan-400 font-bold">{selectedSite.commsVisibilityPct}%</span>
            </div>
            <div className="pt-1 border-t border-[#1e293b] text-[11px] text-[#94a3b8]">
              {selectedSite.rationale}
            </div>
          </div>
        </div>

        {/* Trade Study Weighting Controls */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            Trade Matrix Criteria Weights
          </label>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[#94a3b8] mb-1">
                <span>Landing Safety Weight:</span>
                <span className="text-white font-bold">{safetyWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={safetyWeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSafetyWeight(val);
                  setScienceWeight(100 - val);
                }}
                className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#94a3b8] mb-1">
                <span>Scientific Return Weight:</span>
                <span className="text-white font-bold">{scienceWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={scienceWeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setScienceWeight(val);
                  setSafetyWeight(100 - val);
                }}
                className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div className="p-2 rounded-lg bg-[#050914] border border-[#1e293b] text-[10px] text-[#64748b]">
              Aerospace flight safety principle: Regardless of science merit, if slope &gt; 12° or
              boulders &gt; 30cm, landing gear collapse risk triggers an automatic abort.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
