import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sprout,
  Sun,
  Droplets,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Thermometer,
} from 'lucide-react';

interface PlantBedProps {
  growthStage: number; // 0 = Seed, 1 = Sprout, 2 = Vegetative, 3 = Mature Harvest
  lightColor: string;
  lightIntensity: number;
}

function PlantBed({ growthStage, lightColor, lightIntensity }: PlantBedProps) {
  // Height and scale factor based on stage
  const heightMultiplier = growthStage === 0 ? 0.05 : growthStage === 1 ? 0.25 : growthStage === 2 ? 0.6 : 1.0;
  const leafColor = growthStage === 3 ? '#22C55E' : '#4ADE80';

  return (
    <group position={[0, -0.2, 0]}>
      {/* Hydroponic Root Growth Tray */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.25, 1.4]} />
        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Aerated Root Substrate Pillow Matrix */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[2.25, 0.06, 1.25]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* Array of Crops (e.g. Red Romaine Lettuce & Dwarf Wheat) */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, xi) =>
        [-0.4, 0, 0.4].map((z, zi) => (
          <group key={`${xi}-${zi}`} position={[x, 0.17, z]}>
            {/* Stem */}
            <mesh position={[0, 0.15 * heightMultiplier, 0]}>
              <cylinderGeometry
                args={[
                  0.02 * heightMultiplier,
                  0.025 * heightMultiplier,
                  0.3 * heightMultiplier,
                  8,
                ]}
              />
              <meshStandardMaterial color="#16A34A" roughness={0.5} />
            </mesh>
            {/* Leaves / Canopy Clustered */}
            {growthStage > 0 && (
              <group position={[0, 0.3 * heightMultiplier, 0]}>
                {[0, 1, 2, 3].map((leafIdx) => {
                  const angle = (leafIdx * Math.PI) / 2;
                  return (
                    <mesh
                      key={leafIdx}
                      position={[
                        Math.cos(angle) * 0.08 * heightMultiplier,
                        0.04 * heightMultiplier,
                        Math.sin(angle) * 0.08 * heightMultiplier,
                      ]}
                      rotation={[0.3, angle, 0]}
                    >
                      <sphereGeometry
                        args={[
                          0.12 * heightMultiplier,
                          8,
                          8,
                          0,
                          Math.PI * 2,
                          0,
                          Math.PI * 0.5,
                        ]}
                      />
                      <meshStandardMaterial
                        color={leafColor}
                        roughness={0.4}
                        side={THREE.DoubleSide}
                      />
                    </mesh>
                  );
                })}
              </group>
            )}
          </group>
        ))
      )}

      {/* Overhead LED Lighting Bar Rig */}
      <group position={[0, 1.5, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 0.08, 1.4]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glowing LED emitter plate */}
        <mesh position={[0, -0.045, 0]}>
          <planeGeometry args={[2.2, 1.2]} />
          <meshStandardMaterial
            color={lightColor}
            emissive={lightColor}
            emissiveIntensity={lightIntensity}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight
          position={[0, -0.3, 0]}
          color={lightColor}
          intensity={lightIntensity * 2.5}
          distance={3.5}
        />
      </group>
    </group>
  );
}

export const SpaceGreenhouse3D: React.FC = () => {
  const [lightSpectrum, setLightSpectrum] = useState<'PAR_FULL' | 'RED_BOOST' | 'BLUE_VEG' | 'FAR_RED'>('PAR_FULL');
  const [growthStage, setGrowthStage] = useState<number>(2); // 0 to 3
  const [phLevel, setPhLevel] = useState<number>(5.8);
  const [ecNutrient, setEcNutrient] = useState<number>(1.6); // mS/cm
  const [photoperiodHours, setPhotoperiodHours] = useState<number>(16);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Determine LED hex & telemetry
  let ledHex = '#E879F9'; // default full spectrum PAR (magenta glow)
  let spectrumDescription = 'Balanced Red (660nm) + Blue (450nm) + Trace White for full photosynthetic drive.';
  if (lightSpectrum === 'RED_BOOST') {
    ledHex = '#EF4444';
    spectrumDescription = 'Deep Red 660nm: Maximizes chlorophyll A/B absorption, driving rapid stem and leaf expansion.';
  } else if (lightSpectrum === 'BLUE_VEG') {
    ledHex = '#38BDF8';
    spectrumDescription = 'Royal Blue 450nm: Regulates stomatal conductance, prevents leggy hypocotyl elongation.';
  } else if (lightSpectrum === 'FAR_RED') {
    ledHex = '#BE123C';
    spectrumDescription = 'Far-Red 730nm: Simulates natural canopy shade, accelerating leaf surface area expansion.';
  }

  // Bioregenerative metrics
  const o2Output = (0.05 + growthStage * 0.045).toFixed(2); // kg O2 per tray / day
  const co2Absorption = (0.06 + growthStage * 0.055).toFixed(2); // kg CO2 removed / day
  const dailyBiomassGrams = (15 + growthStage * 32).toFixed(0);

  const handleResetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header telemetry summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B1424] rounded-xl border border-[#1E2E4A]">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-[#10B981]" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            BIOREGENERATIVE HABITAT GREENHOUSE (APH / VEGGIE)
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#94A3B8]">
            O2 PRODUCED: <strong className="text-[#10B981]">+{o2Output} kg/d</strong>
          </span>
          <span className="text-[#94A3B8]">
            CO2 SCRUBBED: <strong className="text-[#42D9F5]">-{co2Absorption} kg/d</strong>
          </span>
          <span className="text-[#94A3B8]">
            YIELD: <strong className="text-[#F5B942]">+{dailyBiomassGrams} g/d</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-8 relative h-[540px] lg:h-[600px] rounded-xl overflow-hidden bg-[#050914] border border-[#1E2E4A]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#10B981]">
                BOOTING ADVANCED PLANT HABITAT 3D SIMULATOR...
              </div>
            }
          >
            <Canvas camera={{ position: [0, 2.2, 3.8], fov: 45 }}>
              <color attach="background" args={['#050914']} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[3, 5, 3]} intensity={0.8} />
              <Stars radius={30} depth={15} count={800} factor={2} fade />

              <PlantBed
                growthStage={growthStage}
                lightColor={ledHex}
                lightIntensity={1.2}
              />

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={0.8}
                minDistance={2.0}
                maxDistance={6.0}
              />
            </Canvas>
          </Suspense>

          {/* Floating Controls Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#0B1424]/90 border border-[#1E2E4A] px-3 py-1.5 rounded-full backdrop-blur-md">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#10B981] transition-colors"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5 text-[#F5B942]" /> : <Play className="w-3.5 h-3.5" />}
              <span className="font-mono text-[11px]">{autoRotate ? 'TURNING' : 'ROTATE'}</span>
            </button>
            <span className="w-px h-3 bg-[#1E2E4A]" />
            <button
              onClick={handleResetCamera}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#10B981] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">RESET</span>
            </button>
          </div>

          <div className="absolute top-3 right-3 font-mono text-[10px] text-[#10B981] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#10B981]/20 backdrop-blur-sm pointer-events-none">
            NASA ADVANCED PLANT HABITAT
          </div>
        </div>

        {/* Interactive Controls & Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-4 rounded-xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
              <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                HORTICULTURE PARAMETERS
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">GROWTH MATRIX</span>
            </div>

            {/* LED Spectrum Mode Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#94A3B8] block">LED Photobiology Spectrum:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'PAR_FULL', label: 'Full PAR (Pink)', color: '#E879F9' },
                  { id: 'RED_BOOST', label: 'Red (660nm)', color: '#EF4444' },
                  { id: 'BLUE_VEG', label: 'Blue (450nm)', color: '#38BDF8' },
                  { id: 'FAR_RED', label: 'Far-Red (730nm)', color: '#BE123C' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLightSpectrum(item.id as any)}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono transition-colors border text-left flex items-center gap-1.5 ${
                      lightSpectrum === item.id
                        ? 'bg-[#111E32] border-[#42D9F5] text-white font-bold'
                        : 'bg-[#0B1424] border-[#1E2E4A] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#94A3B8] italic">{spectrumDescription}</p>
            </div>

            {/* Crop Growth Progression Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Crop Maturation Stage:</span>
                <span className="font-mono text-[#10B981] font-bold">
                  {growthStage === 0
                    ? 'Day 01 (Seedling/Ggerm)'
                    : growthStage === 1
                    ? 'Day 08 (Vegetative Shoot)'
                    : growthStage === 2
                    ? 'Day 18 (Canopy Expansion)'
                    : 'Day 28 (Harvest Ready)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={growthStage}
                onChange={(e) => setGrowthStage(Number(e.target.value))}
                className="w-full accent-[#10B981] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>Germination</span>
                <span>Canopy</span>
                <span>Harvest</span>
              </div>
            </div>

            {/* Nutrient & pH Telemetry */}
            <div className="space-y-2 pt-2 border-t border-[#1E2E4A]">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#0B1424] border border-[#1E2E4A]">
                  <span className="text-[10px] text-[#94A3B8] block">HYDROPONIC pH</span>
                  <span className="text-[#42D9F5] font-bold">{phLevel} (Opt: 5.5-6.2)</span>
                </div>
                <div className="p-2 rounded bg-[#0B1424] border border-[#1E2E4A]">
                  <span className="text-[10px] text-[#94A3B8] block">EC NUTRIENT</span>
                  <span className="text-[#F5B942] font-bold">{ecNutrient} mS/cm</span>
                </div>
              </div>
              <div className="p-2 rounded bg-[#0B1424] border border-[#1E2E4A] flex justify-between text-xs font-mono">
                <span className="text-[#94A3B8]">Photoperiod Cycle:</span>
                <span className="text-white font-bold">{photoperiodHours}h Light / {24 - photoperiodHours}h Dark</span>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="glass-panel p-3.5 rounded-xl border border-[#1E2E4A] text-xs">
            <span className="font-mono text-[#10B981] block font-bold mb-1">
              BIOREGENERATIVE LIFE SUPPORT (CELSS):
            </span>
            <p className="text-[#94A3B8] leading-relaxed">
              Growing fresh greens in long-duration missions serves a threefold purpose: direct physiological nutrition (vitamins C & K degrade rapidly in packaged foods), closed-loop biological O2 generation / CO2 scrubbing, and vital psychological well-being for astronauts isolated in harsh orbital habitats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

