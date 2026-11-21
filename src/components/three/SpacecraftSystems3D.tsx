import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Cpu, Zap, Radio, Shield, Wrench, HeartPulse, RotateCcw } from 'lucide-react';

export interface SpacecraftSystem {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string;
  specs: {
    powerOutput?: string;
    propellant?: string;
    operatingPressure?: string;
    mass?: string;
    redundancy?: string;
  };
  details: string;
}

export const SPACECRAFT_SYSTEMS: SpacecraftSystem[] = [
  {
    id: 'crew_module',
    name: 'Crew Module (CM)',
    category: 'HABITAT & RE-ENTRY',
    color: '#42D9F5',
    description: 'The pressurized habitable capsule housing the flight crew, cockpit touch displays, manual flight hand controllers, and thermal protection heat shields for atmospheric re-entry.',
    specs: {
      operatingPressure: '101.3 kPa (Sea-level mix: 21% O2, 78% N2)',
      mass: '10,400 kg (equipped)',
      redundancy: 'Triple-redundant voting flight computers',
    },
    details: 'Constructed from lightweight aluminum-lithium alloy with a base heat shield coated in PICA-X (Phenolic-Impregnated Carbon Ablator) engineered to endure 2,800°C lunar return velocities.',
  },
  {
    id: 'service_module',
    name: 'Service Module (SM)',
    category: 'STRUCTURAL CORE & UTILITIES',
    color: '#628CFF',
    description: 'The unpressurized mechanical core located beneath the capsule. Contains propulsion engines, consumable water and oxygen stores, avionics bays, and heat dissipation radiators.',
    specs: {
      mass: '15,400 kg (wet including propellant)',
      redundancy: 'Dual isolated consumable distribution buses',
    },
    details: 'Remains mated to the crew module throughout orbital maneuvering and translunar transit, and is jettisoned moments prior to atmospheric re-entry so only the protected crew module survives.',
  },
  {
    id: 'propulsion',
    name: 'Propulsion & Reaction Control (RCS)',
    category: 'ORBITAL MANEUVERING',
    color: '#F5B942',
    description: 'Main orbital maneuvering engine paired with 16 to 24 hypergolic reaction control thrusters for 3-axis translational and rotational attitude control in vacuum.',
    specs: {
      propellant: 'Monomethylhydrazine (MMH) & Nitrogen Tetroxide (NTO)',
      redundancy: 'Dual-string fail-operational cross-feed manifolds',
    },
    details: 'Hypergolic fuels ignite spontaneously upon contact without requiring spark plugs, providing unmatched reliability for critical deorbit burns and emergency abort sequences.',
  },
  {
    id: 'power',
    name: 'Solar Array Power System',
    category: 'ELECTRICAL POWER',
    color: '#10B981',
    description: 'Articulated solar array wings featuring triple-junction Gallium Arsenide (GaAs) photovoltaic cells that track the sun to generate continuous electrical power.',
    specs: {
      powerOutput: '11.0 kW peak at 1 AU',
      mass: 'Four deployable panels with 19-meter span',
      redundancy: 'Four independent lithium-ion battery storage banks',
    },
    details: 'Supplies regulated 120V DC power to avionics, science experiments, life support pumps, and battery chargers, automatically rotating to maintain perpendicular solar incidence.',
  },
  {
    id: 'communications',
    name: 'High-Gain Communications (HGA)',
    category: 'TELEMETRY & AVIONICS',
    color: '#C084FC',
    description: 'Steerable parabolic phased-array dish antenna transmitting high-bandwidth digital telemetry, 4K live video downlinks, and flight computer commands through relay networks.',
    specs: {
      redundancy: 'Simultaneous S-Band & Ka-Band RF transponders',
    },
    details: 'Connects directly with NASA Tracking and Data Relay Satellites (TDRS) in geosynchronous orbit and the Deep Space Network (DSN) for uninterrupted mission telemetry.',
  },
  {
    id: 'life_support',
    name: 'Environmental Life Support (ECLSS)',
    category: 'LIFE SUPPORT & THERMAL',
    color: '#EC4899',
    description: 'Active thermal radiator panels and atmospheric processors that regulate cabin oxygen, scrub metabolic CO2, control humidity, and pump waste heat into deep space.',
    specs: {
      operatingPressure: 'Circulates liquid coolant loops at 18°C',
      redundancy: 'Dual regenerable amine CO2 scrubber beds',
    },
    details: 'Employs closed-loop catalytic oxidation reactors and vacuum desorbing amine resins to recycle cabin air without venting precious consumables into space.',
  },
];

// 3D Spacecraft Procedural Model with Interactive Highlighting
function SpacecraftModel3D({ selectedSystemId }: { selectedSystemId: string }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const isCM = selectedSystemId === 'crew_module';
  const isSM = selectedSystemId === 'service_module';
  const isProp = selectedSystemId === 'propulsion';
  const isPower = selectedSystemId === 'power';
  const isComms = selectedSystemId === 'communications';
  const isECLSS = selectedSystemId === 'life_support';

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0.72}>
      {/* 1. Crew Module (Capsule Cone) */}
      <group position={[0, 1.1, 0]}>
        <mesh castShadow>
          <coneGeometry args={[1.35, 1.5, 32]} />
          <meshStandardMaterial
            color={isCM ? '#42D9F5' : '#E2E8F0'}
            emissive={isCM ? '#0284C7' : '#000000'}
            emissiveIntensity={isCM ? 0.6 : 0}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        {/* Forward Docking Ring */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.15, 24]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} />
        </mesh>
        {/* Base Heat Shield */}
        <mesh position={[0, -0.78, 0]}>
          <cylinderGeometry args={[1.38, 1.38, 0.1, 32]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
      </group>

      {/* 2. Service Module (Cylindrical Core) */}
      <group position={[0, -0.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.34, 1.34, 1.6, 32]} />
          <meshStandardMaterial
            color={isSM || isECLSS ? (isECLSS ? '#EC4899' : '#628CFF') : '#CBD5E1'}
            emissive={isSM ? '#1D4ED8' : isECLSS ? '#BE185D' : '#000000'}
            emissiveIntensity={isSM || isECLSS ? 0.5 : 0}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* ECLSS Radiator Wrap Stripes on SM Hull */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.35, 1.35, 0.9, 32, 1, true]} />
          <meshStandardMaterial
            color={isECLSS ? '#F43F5E' : '#94A3B8'}
            wireframe={true}
            opacity={0.4}
            transparent
          />
        </mesh>
      </group>

      {/* 3. Main Propulsion Engine Nozzle */}
      <group position={[0, -1.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.7, 0.8, 24]} />
          <meshStandardMaterial
            color={isProp ? '#F5B942' : '#334155'}
            emissive={isProp ? '#D97706' : '#000000'}
            emissiveIntensity={isProp ? 0.7 : 0}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 4. Deployable Solar Array Wings */}
      <group position={[0, -0.3, 0]}>
        {/* Left Solar Wing */}
        <group position={[-2.4, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.9, 0.75, 0.04]} />
            <meshStandardMaterial
              color={isPower ? '#10B981' : '#1E3A8A'}
              emissive={isPower ? '#059669' : '#1E40AF'}
              emissiveIntensity={isPower ? 0.8 : 0.3}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
        </group>
        {/* Right Solar Wing */}
        <group position={[2.4, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.9, 0.75, 0.04]} />
            <meshStandardMaterial
              color={isPower ? '#10B981' : '#1E3A8A'}
              emissive={isPower ? '#059669' : '#1E40AF'}
              emissiveIntensity={isPower ? 0.8 : 0.3}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
        </group>
      </group>

      {/* 5. High-Gain Communications Dish */}
      <group position={[1.2, 0.6, 0.9]} rotation={[0.6, 0.4, 0]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial
            color={isComms ? '#C084FC' : '#F1F5F9'}
            emissive={isComms ? '#9333EA' : '#000000'}
            emissiveIntensity={isComms ? 0.7 : 0}
            side={THREE.DoubleSide}
            metalness={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}

export const SpacecraftSystems3D: React.FC = () => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('crew_module');
  const controlsRef = useRef<any>(null);

  const activeSystem =
    SPACECRAFT_SYSTEMS.find((s) => s.id === selectedSystemId) || SPACECRAFT_SYSTEMS[0];

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Subsystems Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1E2E4A] pb-3">
        <span className="text-xs font-mono text-[#94A3B8] mr-2 uppercase tracking-wider">
          SUBSYSTEM SCHEMATIC:
        </span>
        {SPACECRAFT_SYSTEMS.map((s) => {
          const isSelected = s.id === selectedSystemId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSystemId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5] shadow-[0_0_12px_rgba(66,217,245,0.25)]'
                  : 'bg-[#111E32]/60 text-[#94A3B8] border border-[#1E2E4A] hover:bg-[#111E32] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Canvas + System Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Viewport (7 cols) */}
        <div className="lg:col-span-7 h-[440px] rounded-xl relative border border-[#1E2E4A] bg-[#070D1A] overflow-hidden shadow-2xl">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#42D9F5] font-mono text-xs">MAPPING SPACECRAFT TELEMETRY...</div>}>
            <Canvas camera={{ position: [0, 0.8, 5.2], fov: 44 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 4]} intensity={1.6} color="#FFFFFF" />
              <directionalLight position={[-4, -3, -3]} intensity={0.4} color="#42D9F5" />
              <Stars radius={40} depth={20} count={1200} factor={2} saturation={0.5} fade />

              <SpacecraftModel3D selectedSystemId={selectedSystemId} />

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                minDistance={3.0}
                maxDistance={7.5}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI * 0.85}
              />
            </Canvas>
          </Suspense>

          {/* Canvas Reset Control */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#0B1424]/90 border border-[#1E2E4A] px-3 py-1.5 rounded-full backdrop-blur-md">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">RESET VIEW</span>
            </button>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none text-right font-mono text-[11px] text-[#42D9F5] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#42D9F5]/20 backdrop-blur-sm">
            <span>MODULAR ARCHITECTURE // ORION & DRAGON CLASS</span>
          </div>
        </div>

        {/* Detailed Specs Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
                {activeSystem.category}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                style={{
                  backgroundColor: '#111E32',
                  borderColor: activeSystem.color,
                  color: activeSystem.color,
                }}
              >
                SELECTED SUBSYSTEM
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{activeSystem.name}</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">{activeSystem.description}</p>

            <div className="p-3.5 rounded-lg bg-[#0B1424] border border-[#1E2E4A] text-xs font-mono space-y-2 mb-4">
              {activeSystem.specs.operatingPressure && (
                <div className="flex justify-between border-b border-[#1E2E4A] pb-1.5 text-[#E2E8F0]">
                  <span className="text-[#94A3B8]">PRESSURE:</span>
                  <span className="text-white font-semibold">{activeSystem.specs.operatingPressure}</span>
                </div>
              )}
              {activeSystem.specs.powerOutput && (
                <div className="flex justify-between border-b border-[#1E2E4A] pb-1.5 text-[#E2E8F0]">
                  <span className="text-[#94A3B8]">PEAK POWER:</span>
                  <span className="text-[#10B981] font-semibold">{activeSystem.specs.powerOutput}</span>
                </div>
              )}
              {activeSystem.specs.propellant && (
                <div className="flex justify-between border-b border-[#1E2E4A] pb-1.5 text-[#E2E8F0]">
                  <span className="text-[#94A3B8]">PROPELLANT:</span>
                  <span className="text-[#F5B942] font-semibold">{activeSystem.specs.propellant}</span>
                </div>
              )}
              {activeSystem.specs.mass && (
                <div className="flex justify-between border-b border-[#1E2E4A] pb-1.5 text-[#E2E8F0]">
                  <span className="text-[#94A3B8]">SUBSYSTEM MASS:</span>
                  <span className="text-white font-semibold">{activeSystem.specs.mass}</span>
                </div>
              )}
              {activeSystem.specs.redundancy && (
                <div className="flex justify-between text-[#E2E8F0]">
                  <span className="text-[#94A3B8]">SAFETY ARCHITECTURE:</span>
                  <span className="text-[#42D9F5] font-semibold">{activeSystem.specs.redundancy}</span>
                </div>
              )}
            </div>

            <div className="border-t border-[#1E2E4A] pt-3 text-xs text-[#94A3B8]">
              <span className="font-mono text-[#42D9F5] block mb-1">AEROSPACE FLIGHT HERITAGE:</span>
              <p className="leading-relaxed">{activeSystem.details}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

