import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Shield, Radio, Wind, Sparkles, Footprints, Layers, RotateCcw, Play, Pause } from 'lucide-react';

export interface SpacesuitHotspot {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  position: [number, number, number];
  specs: {
    pressure?: string;
    temperatureRange?: string;
    operatingDuration?: string;
    primaryMaterial?: string;
  };
  functionDescription: string;
  educationalNotes: string;
}

export const SPACESUIT_HOTSPOTS: SpacesuitHotspot[] = [
  {
    id: 'helmet',
    title: 'Extravehicular Visor & Helmet Assembly (EVVA)',
    subtitle: 'Optical & Radiation Protection System',
    category: 'HEAD & SENSORY',
    position: [0, 1.45, 0.28],
    specs: {
      temperatureRange: '-156°C to +121°C',
      primaryMaterial: 'High-impact Polycarbonate with vapor-deposited gold (24k)',
      pressure: '29.6 kPa (4.3 psi internal)',
    },
    functionDescription: 'Provides structural pressure sealing, impact shielding from micrometeoroids, and optical filtering. The gold coating reflects up to 90% of hazardous solar infrared and ultraviolet rays.',
    educationalNotes: 'Features an internal purge valve for emergency oxygen replenishment and a Valsalva device allowing astronauts to clear inner ear pressure during airlock cycles.',
  },
  {
    id: 'plss',
    title: 'Primary Life Support System (PLSS)',
    subtitle: 'Autonomous Atmospheric & Thermal Backpack',
    category: 'LIFE SUPPORT',
    position: [0, 0.95, -0.45],
    specs: {
      operatingDuration: '7.0 to 8.5 hours autonomous EVA',
      primaryMaterial: 'Aluminum honeycomb & titanium pressure tanks',
      pressure: '29.6 kPa (4.3 psi pure O2)',
    },
    functionDescription: 'Regulates 100% pure oxygen atmosphere, scrubs carbon dioxide via regenerable metal oxide or Lithium Hydroxide (LiOH) canisters, and sublimates water into space vacuum to dissipate metabolic heat.',
    educationalNotes: 'Includes a secondary emergency oxygen pack (SOP) that automatically supplies 30 minutes of emergency reserve gas if catastrophic suit puncture occurs.',
  },
  {
    id: 'comms',
    title: 'Communications Carrier Assembly (CCA)',
    subtitle: 'Audio Telemetry & Biometrics',
    category: 'AVIONICS',
    position: [0.32, 1.35, 0.05],
    specs: {
      operatingDuration: 'Dual-redundant UHF/VHF transceivers',
      primaryMaterial: 'Elastic fabric ("Snoopy Cap") with dual noise-cancelling mics',
    },
    functionDescription: 'Transmits voice communications directly to MCC and fellow spacewalkers over space-to-ground audio loops, alongside electrocardiogram (ECG) heart telemetry and suit pressure status.',
    educationalNotes: 'Nicknamed the "Snoopy Cap" due to its distinctive black-and-white color scheme reminiscent of the comic strip beagle, who serves as NASA\'s official safety mascot.',
  },
  {
    id: 'tmg',
    title: 'Thermal Micrometeoroid Garment (TMG)',
    subtitle: 'Multi-Layer Environmental Barrier',
    category: 'PRESSURE & THERMAL',
    position: [0, 0.72, 0.28],
    specs: {
      temperatureRange: '-150°C to +120°C',
      primaryMaterial: '14 layers: Ortho-Fabric (Gore-Tex, Kevlar, Nomex) + Aluminized Mylar',
      pressure: '29.6 kPa operating differential',
    },
    functionDescription: 'Insulates against the extreme temperature swings between orbital sunlight and orbital shadow, while stopping hypervelocity micrometeoroids traveling at up to 10 km/s.',
    educationalNotes: 'Worn directly over the Liquid Cooling and Ventilation Garment (LCVG), which circulates chilled water through 90 meters of fine tubing adjacent to the skin to prevent heat stroke.',
  },
  {
    id: 'gloves',
    title: 'Phase VI EVA Tactical Gloves',
    subtitle: 'Articulated Pressurized Hand Enclosure',
    category: 'MOBILITY',
    position: [0.88, 0.52, 0.12],
    specs: {
      temperatureRange: 'Integrated fingertip resistance heaters',
      primaryMaterial: 'RTV silicone palms, Kevlar outer shell, rotary wrist bearing',
    },
    functionDescription: 'Allows tactile manipulation of tools, tether hooks, and ISS handrails while pressurized. Rotary wrist bearings allow 360-degree pronation/supination without balloon resistance.',
    educationalNotes: 'Because gloves are under high pressure, prolonged work causes intense hand fatigue. Fingertip resistance heaters counteract conductive cold when gripping frigid metal structures in space.',
  },
  {
    id: 'boots',
    title: 'Thermal EVA Lunar/Orbital Boots',
    subtitle: 'Anchorage & Surface Protection',
    category: 'MOBILITY & FOOTING',
    position: [0.32, -1.35, 0.1],
    specs: {
      primaryMaterial: 'Multi-layer insulation with siliconized tread & heel restraint lugs',
      temperatureRange: '-150°C to +120°C',
    },
    functionDescription: 'Provides extreme thermal insulation against frozen or sunbaked surfaces, incorporating heel lugs designed to lock into the Canadarm2 Portable Foot Restraint (PFR).',
    educationalNotes: 'Unlike Apollo lunar overshoes designed for sharp abrasive regolith dust, modern orbital EMU boots focus on thermal isolation and locking securely into robotic arm work platforms.',
  },
];

// Procedural 3D Spacesuit Model
function SpacesuitModel({
  selectedHotspotId,
  onSelectHotspot,
}: {
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Helmet Assembly */}
      <group position={[0, 1.45, 0]}>
        {/* White outer shell */}
        <mesh castShadow>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Gold Reflective Visor */}
        <mesh position={[0, 0.02, 0.18]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.26, 24, 24, 0, Math.PI, 0, Math.PI * 0.65]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.95}
            roughness={0.08}
            emissive="#B8860B"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Helmet base collar ring */}
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.08, 32]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. Hard Upper Torso (HUT) */}
      <group position={[0, 0.85, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.38, 0.85, 24]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Chest Display and Control Module (DCM) */}
        <mesh position={[0, 0.1, 0.38]}>
          <boxGeometry args={[0.34, 0.38, 0.14]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Red & Blue Umbilical Connectors */}
        <mesh position={[-0.1, 0.22, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
        <mesh position={[0.1, 0.22, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
          <meshStandardMaterial color="#3B82F6" />
        </mesh>
      </group>

      {/* 3. Primary Life Support System (PLSS) Backpack */}
      <group position={[0, 0.95, -0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.96, 0.34]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Antenna Mast */}
        <mesh position={[0.22, 0.6, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.45, 12]} />
          <meshStandardMaterial color="#42D9F5" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 4. Arms & Gloves */}
      {/* Left Arm */}
      <group position={[-0.54, 0.9, 0]}>
        <mesh rotation={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.13, 0.11, 0.55, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-0.14, -0.45, 0.05]} rotation={[0.3, 0, 0.2]}>
          <cylinderGeometry args={[0.11, 0.09, 0.5, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
        </mesh>
        {/* Left Glove */}
        <mesh position={[-0.22, -0.75, 0.12]}>
          <boxGeometry args={[0.14, 0.18, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.54, 0.9, 0]}>
        <mesh rotation={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.13, 0.11, 0.55, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0.14, -0.45, 0.05]} rotation={[0.3, 0, -0.2]}>
          <cylinderGeometry args={[0.11, 0.09, 0.5, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
        </mesh>
        {/* Right Glove */}
        <mesh position={[0.22, -0.75, 0.12]}>
          <boxGeometry args={[0.14, 0.18, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* 5. Lower Torso & Legs */}
      <group position={[0, 0.2, 0]}>
        {/* Waist Bearing */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.12, 24]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Left Leg */}
        <group position={[-0.2, -0.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.12, 0.75, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.65, 0.02]}>
            <cylinderGeometry args={[0.12, 0.11, 0.65, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          {/* Left Boot */}
          <mesh position={[0, -1.05, 0.08]}>
            <boxGeometry args={[0.18, 0.16, 0.32]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group position={[0.2, -0.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.12, 0.75, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.65, 0.02]}>
            <cylinderGeometry args={[0.12, 0.11, 0.65, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          {/* Right Boot */}
          <mesh position={[0, -1.05, 0.08]}>
            <boxGeometry args={[0.18, 0.16, 0.32]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Interactive 3D Hotspot Markers */}
      {SPACESUIT_HOTSPOTS.map((hotspot) => {
        const isSelected = hotspot.id === selectedHotspotId;
        return (
          <group
            key={hotspot.id}
            position={hotspot.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectHotspot(hotspot.id);
            }}
          >
            {/* Pulsing Core */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.07 : 0.045, 16, 16]} />
              <meshBasicMaterial color={isSelected ? '#F5B942' : '#42D9F5'} toneMapped={false} />
            </mesh>
            {/* Outer Ring */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.14 : 0.09, 16, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#F5B942' : '#42D9F5'}
                transparent
                opacity={0.35}
                wireframe
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export const SpacesuitViewer3D: React.FC = () => {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('helmet');
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<any>(null);

  const activeHotspot =
    SPACESUIT_HOTSPOTS.find((h) => h.id === selectedHotspotId) || SPACESUIT_HOTSPOTS[0];

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hotspots Quick Switch Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1E2E4A] pb-3">
        <span className="text-xs font-mono text-[#94A3B8] mr-2 uppercase tracking-wider">
          SUBSYSTEM HOTSPOTS:
        </span>
        {SPACESUIT_HOTSPOTS.map((h) => {
          const isSelected = h.id === selectedHotspotId;
          return (
            <button
              key={h.id}
              onClick={() => setSelectedHotspotId(h.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5] shadow-[0_0_12px_rgba(66,217,245,0.25)]'
                  : 'bg-[#111E32]/60 text-[#94A3B8] border border-[#1E2E4A] hover:bg-[#111E32] hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#F5B942]' : 'bg-[#42D9F5]'}`} />
              <span>{h.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Canvas + Engineering Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Canvas Box (7 cols) */}
        <div className="lg:col-span-7 h-[540px] lg:h-[580px] rounded-xl relative border border-[#1E2E4A] bg-[#070D1A] overflow-hidden shadow-2xl">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#42D9F5] font-mono text-xs">INITIALIZING SPACESUIT TELEMETRY...</div>}>
            <Canvas camera={{ position: [0, 0.4, 3.8], fov: 42 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 5, 4]} intensity={1.5} color="#FFFFFF" castShadow />
              <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#42D9F5" />
              <pointLight position={[0, -2, 2]} intensity={0.4} color="#628CFF" />
              <Stars radius={30} depth={15} count={1200} factor={2} saturation={0.5} fade />

              <SpacesuitModel
                selectedHotspotId={selectedHotspotId}
                onSelectHotspot={(id) => setSelectedHotspotId(id)}
              />

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={1.0}
                minDistance={2.2}
                maxDistance={5.5}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI * 0.85}
              />
            </Canvas>
          </Suspense>

          {/* Canvas Floating Controls */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#0B1424]/90 border border-[#1E2E4A] px-3 py-1.5 rounded-full backdrop-blur-md">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
              title={autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5 text-[#F5B942]" /> : <Play className="w-3.5 h-3.5" />}
              <span className="font-mono text-[11px]">{autoRotate ? 'TURNING' : 'ROTATE'}</span>
            </button>
            <span className="w-px h-3 bg-[#1E2E4A]" />
            <button
              onClick={handleResetCamera}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">RESET</span>
            </button>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none text-right font-mono text-[11px] text-[#42D9F5] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#42D9F5]/20 backdrop-blur-sm">
            <span>NASA EMU / xEMU ARCHITECTURE</span>
          </div>
        </div>

        {/* Hotspot Engineering Specifications Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
                {activeHotspot.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111E32] text-[#F5B942] border border-[#F5B942]/30">
                ACTIVE HOTSPOT
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{activeHotspot.title}</h3>
            <p className="text-xs font-mono text-[#94A3B8] mb-4">{activeHotspot.subtitle}</p>

            <div className="p-3.5 rounded-lg bg-[#0B1424] border border-[#1E2E4A] mb-4">
              <h4 className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider mb-1.5">
                Primary Function & Operations:
              </h4>
              <p className="text-sm text-[#E2E8F0] leading-relaxed">
                {activeHotspot.functionDescription}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
              {activeHotspot.specs.pressure && (
                <div className="p-2.5 rounded bg-[#111E32] border border-[#1E2E4A]">
                  <span className="text-[10px] text-[#94A3B8] block">INTERNAL PRESSURE</span>
                  <span className="text-white font-semibold">{activeHotspot.specs.pressure}</span>
                </div>
              )}
              {activeHotspot.specs.temperatureRange && (
                <div className="p-2.5 rounded bg-[#111E32] border border-[#1E2E4A]">
                  <span className="text-[10px] text-[#94A3B8] block">THERMAL ENVELOPE</span>
                  <span className="text-white font-semibold">{activeHotspot.specs.temperatureRange}</span>
                </div>
              )}
              {activeHotspot.specs.operatingDuration && (
                <div className="p-2.5 rounded bg-[#111E32] border border-[#1E2E4A] col-span-2">
                  <span className="text-[10px] text-[#94A3B8] block">AUTONOMOUS DURATION</span>
                  <span className="text-[#42D9F5] font-semibold">{activeHotspot.specs.operatingDuration}</span>
                </div>
              )}
              {activeHotspot.specs.primaryMaterial && (
                <div className="p-2.5 rounded bg-[#111E32] border border-[#1E2E4A] col-span-2">
                  <span className="text-[10px] text-[#94A3B8] block">MATERIALS & CONSTRUCTION</span>
                  <span className="text-[#F8FAFC] font-semibold">{activeHotspot.specs.primaryMaterial}</span>
                </div>
              )}
            </div>

            {/* University Educational Notes */}
            <div className="border-t border-[#1E2E4A] pt-3 text-xs text-[#94A3B8]">
              <span className="font-mono text-[#F5B942] block mb-1">ASTRONAUT OPERATIONAL INSIGHT:</span>
              <p className="italic leading-relaxed">{activeHotspot.educationalNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
