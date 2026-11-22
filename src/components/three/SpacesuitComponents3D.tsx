import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  Layers,
  Shield,
  Wind,
  Battery,
  Flame,
  Activity,
  Maximize2,
  Minimize2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

type SuitSubsystem = 'plss' | 'hut' | 'helmet' | 'lcvg' | 'gloves' | 'sop';

interface SubsystemData {
  id: SuitSubsystem;
  name: string;
  category: string;
  position: [number, number, number];
  materials: string;
  pressure: string;
  flowRate: string;
  functionDesc: string;
  failureMitigation: string;
}

const SUBSYSTEMS: Record<SuitSubsystem, SubsystemData> = {
  helmet: {
    id: 'helmet',
    name: 'Extravehicular Visor Assembly (EVVA)',
    category: 'OPTICAL & PRESSURE',
    position: [0, 1.35, 0.25],
    materials: 'Polycarbonate shell + vapor-deposited 24-karat gold coating',
    pressure: '29.6 kPa (4.3 psi) structural pressure containment',
    flowRate: '100% O2 flow over visor to prevent fogging (0.17 kg/hr)',
    functionDesc: 'Gold coating attenuates 90% of solar thermal infrared radiation and prevents retinal sunburn in unfiltered orbital sunlight. Features movable side sun visors and an internal purge valve for emergency depressurization clearing.',
    failureMitigation: 'Dual mechanical latches with visual indicators prevent accidental unlocking in vacuum.',
  },
  hut: {
    id: 'hut',
    name: 'Hard Upper Torso (HUT) & DCM',
    category: 'STRUCTURAL CORE',
    position: [0, 0.7, 0.28],
    materials: 'Fiberglass / epoxy composite shell with aluminum hardware',
    pressure: '29.6 kPa nominal differential pressure',
    flowRate: 'Primary umbilical hub for water, oxygen, and biometric telemetry',
    functionDesc: 'The structural core of the EMU. The chest-mounted Display and Control Module (DCM) houses suit pressure switches, sublimator mode switches, communications selectors, and a mirror-readable analog pressure gauge.',
    failureMitigation: 'Mechanical valves override digital computer controls for emergency suit venting or pure O2 surge.',
  },
  plss: {
    id: 'plss',
    name: 'Primary Life Support Subsystem (PLSS)',
    category: 'LIFE SUPPORT SYSTEM',
    position: [0, 0.75, -0.45],
    materials: 'Titanium O2 pressure vessels (60 MPa / 8,800 psi storage)',
    pressure: '29.6 kPa pure oxygen loop regulated by dual redundant sensors',
    flowRate: '0.17 kg/hr O2 delivery with 1.8 kg/hr closed-loop recirc fan',
    functionDesc: 'Backpack unit providing 7 to 8.5 hours of complete life support. Houses high-pressure O2 bottles, regenerable metal oxide (MetOx) CO2 absorption canisters, silver-zinc battery, and a porous plate water sublimator for metabolic cooling.',
    failureMitigation: 'Automatic acoustic alarm and DCM warning tone if CO2 partial pressure exceeds 2.0 mmHg or O2 loop drops.',
  },
  sop: {
    id: 'sop',
    name: 'Secondary Oxygen Pack (SOP)',
    category: 'EMERGENCY REDUNDANCY',
    position: [0, 0.2, -0.42],
    materials: 'Dual cross-linked cryogenic-rated steel pressure bottles',
    pressure: '41.3 MPa (6,000 psi) stored nitrogen/oxygen reserve',
    flowRate: '30 minutes sustained emergency 29.6 kPa purge flow',
    functionDesc: 'Mounted beneath the PLSS, the SOP automatically activates if primary suit pressure drops below 23.4 kPa (3.4 psi). It delivers a constant high-flow stream of pure oxygen to sustain astronaut respiration and buy time to reach the airlock.',
    failureMitigation: 'Autonomous pressure-activated regulator: no manual intervention required during suit breach.',
  },
  lcvg: {
    id: 'lcvg',
    name: 'Liquid Cooling & Ventilation Garment',
    category: 'THERMAL REGULATION',
    position: [0, 0.05, 0],
    materials: 'Spandex body mesh with 91.5 meters (300 ft) of woven ethyl vinyl tubing',
    pressure: 'Closed hydronic loop (100–120 kPa water pressure)',
    flowRate: '1.8 kg/min chilled water (4.5°C to 21°C adjustable by crew)',
    functionDesc: 'Worn directly against astronaut skin. Because vacuum has no convection, astronauts would quickly overheat in a sealed spacesuit. Chilled water absorbs metabolic heat through conductive body contact and transfers it to the sublimator.',
    failureMitigation: 'Crew can switch thermal comfort valve between Min, Med, and Max cooling to avoid hypothermia or overheating.',
  },
  gloves: {
    id: 'gloves',
    name: 'Phase VI EVA Work Gloves',
    category: 'TACTILE WORK INTERFACE',
    position: [0.55, 0.35, 0.2],
    materials: 'Laser-scanned silicone palm dips, Nomex weave, internal resistive heaters',
    pressure: 'Pressurized rotary wrist bearings with RTV silicone bladder seals',
    flowRate: 'Active 12V DC heating elements embedded in fingertips',
    functionDesc: 'Custom-tailored to each astronaut hands. Astronaut hands suffer immense fatigue fighting against 29.6 kPa internal balloon pressure. Phase VI gloves incorporate rotary bearings for wrist articulation and micro-heaters to prevent frostbite during orbital shadow.',
    failureMitigation: 'Dual wrist tether rings rated for 450 N load prevent tool drop and carabiner snag.',
  },
};

function ExplodedSpacesuitScene({
  activeSubsystem,
  explodedView,
  lcvgVisible,
}: {
  activeSubsystem: SuitSubsystem;
  explodedView: boolean;
  lcvgVisible: boolean;
}) {
  const explodeOffset = explodedView ? 0.35 : 0;

  return (
    <group position={[0, -0.2, 0]}>
      {/* HELMET & EVVA */}
      <group
        position={[0, 1.25 + explodeOffset * 1.2, 0]}
        onClick={(e) => e.stopPropagation()}
      >
        <mesh>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial
            color={activeSubsystem === 'helmet' ? '#42D9F5' : '#DCE5EE'}
            roughness={0.2}
            transparent
            opacity={lcvgVisible ? 0.4 : 0.95}
          />
        </mesh>
        {/* Gold Visor */}
        <mesh position={[0, 0, 0.12]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.24, 24, 24, 0, Math.PI]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
      </group>

      {/* HARD UPPER TORSO (HUT) */}
      <group
        position={[0, 0.7 + explodeOffset * 0.4, 0]}
        onClick={(e) => e.stopPropagation()}
      >
        <mesh>
          <boxGeometry args={[0.72, 0.65, 0.48]} />
          <meshStandardMaterial
            color={activeSubsystem === 'hut' ? '#42D9F5' : '#CCD8E6'}
            roughness={0.3}
            transparent
            opacity={lcvgVisible ? 0.3 : 1}
          />
        </mesh>

        {/* Display and Control Module (DCM) on Chest */}
        <mesh position={[0, 0.05, 0.26]}>
          <boxGeometry args={[0.34, 0.26, 0.08]} />
          <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* DCM Gauges */}
        <mesh position={[-0.08, 0.05, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* PRIMARY LIFE SUPPORT SYSTEM (PLSS) */}
      <group
        position={[0, 0.75 + explodeOffset * 0.4, -0.42 - explodeOffset * 1.5]}
        onClick={(e) => e.stopPropagation()}
      >
        <mesh>
          <boxGeometry args={[0.62, 0.82, 0.32]} />
          <meshStandardMaterial
            color={activeSubsystem === 'plss' ? '#38BDF8' : '#BBC8D8'}
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
        {/* MetOx CO2 scrubber canister cylinder */}
        <mesh position={[0.18, 0.1, 0.14]}>
          <cylinderGeometry args={[0.07, 0.07, 0.4, 16]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} />
        </mesh>
        {/* Oxygen supply tank */}
        <mesh position={[-0.18, 0.1, 0.14]}>
          <cylinderGeometry args={[0.08, 0.08, 0.45, 16]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.8} />
        </mesh>
      </group>

      {/* SECONDARY OXYGEN PACK (SOP) */}
      <group
        position={[0, 0.22, -0.42 - explodeOffset * 1.5]}
        onClick={(e) => e.stopPropagation()}
      >
        <mesh>
          <boxGeometry args={[0.56, 0.2, 0.26]} />
          <meshStandardMaterial
            color={activeSubsystem === 'sop' ? '#EF4444' : '#475569'}
            roughness={0.5}
            metalness={0.6}
          />
        </mesh>
        {/* Emergency High-Pressure Dual Tanks */}
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
          <meshStandardMaterial color="#DC2626" metalness={0.7} />
        </mesh>
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
          <meshStandardMaterial color="#DC2626" metalness={0.7} />
        </mesh>
      </group>

      {/* LCVG COOLING TUBES (INTERNAL VIEW) */}
      {lcvgVisible && (
        <group position={[0, 0.3, 0]}>
          {/* Internal blue cooling manifold silhouette */}
          <mesh>
            <cylinderGeometry args={[0.26, 0.24, 0.9, 16]} />
            <meshStandardMaterial
              color="#0284C7"
              wireframe
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Torso spiral water lines */}
          {[-0.3, -0.15, 0, 0.15, 0.3].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.27, 0.012, 8, 32]} />
              <meshBasicMaterial color="#38BDF8" />
            </mesh>
          ))}
        </group>
      )}

      {/* LOWER TORSO & LEGS */}
      <group position={[0, 0.15 - explodeOffset * 0.3, 0]}>
        <mesh position={[-0.18, -0.45, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.8, 16]} />
          <meshStandardMaterial color="#D8E2EC" roughness={0.5} />
        </mesh>
        <mesh position={[0.18, -0.45, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.8, 16]} />
          <meshStandardMaterial color="#D8E2EC" roughness={0.5} />
        </mesh>
        {/* Boots */}
        <mesh position={[-0.18, -0.9, 0.08]}>
          <boxGeometry args={[0.18, 0.14, 0.32]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[0.18, -0.9, 0.08]}>
          <boxGeometry args={[0.18, 0.14, 0.32]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* ARMS & PHASE VI GLOVES */}
      <group position={[0, 0.7 + explodeOffset * 0.4, 0]}>
        {/* Left Arm */}
        <mesh
          position={[-0.45 - explodeOffset * 0.8, -0.05, 0.1]}
          rotation={[0.3, 0, -0.2]}
        >
          <cylinderGeometry args={[0.11, 0.09, 0.55, 16]} />
          <meshStandardMaterial color="#D8E2EC" roughness={0.5} />
        </mesh>
        {/* Right Arm */}
        <mesh
          position={[0.45 + explodeOffset * 0.8, -0.05, 0.1]}
          rotation={[0.3, 0, 0.2]}
        >
          <cylinderGeometry args={[0.11, 0.09, 0.55, 16]} />
          <meshStandardMaterial color="#D8E2EC" roughness={0.5} />
        </mesh>

        {/* Phase VI Glove Left */}
        <mesh
          position={[-0.55 - explodeOffset * 0.9, -0.35, 0.2]}
          onClick={() => {}}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={activeSubsystem === 'gloves' ? '#42D9F5' : '#334155'}
            roughness={0.7}
          />
        </mesh>
        {/* Phase VI Glove Right */}
        <mesh
          position={[0.55 + explodeOffset * 0.9, -0.35, 0.2]}
          onClick={() => {}}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={activeSubsystem === 'gloves' ? '#42D9F5' : '#334155'}
            roughness={0.7}
          />
        </mesh>
      </group>
    </group>
  );
}

export const SpacesuitComponents3D: React.FC = () => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<SuitSubsystem>('plss');
  const [explodedView, setExplodedView] = useState(false);
  const [lcvgVisible, setLcvgVisible] = useState(false);

  const activeData = SUBSYSTEMS[selectedSubsystem];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-space-950 border border-space-800 shadow-2xl flex flex-col">
      {/* Top Header & Control Toolbar */}
      <div className="relative z-20 flex flex-col gap-3 p-4 bg-gradient-to-b from-space-900/95 via-space-950/95 to-space-950 border-b border-space-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                  EXTRAVEHICULAR MOBILITY UNIT (EMU) ARCHITECTURE
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  LESSON 02 3D LAB
                </span>
              </div>
              <p className="text-xs text-space-400 mt-0.5">
                Multi-Layer Modular Pressure Garment & Sub-Orbital Life Support
              </p>
            </div>
          </div>

          {/* View toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExplodedView(!explodedView)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                explodedView
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-lg shadow-cyan-500/25'
                  : 'bg-space-900 text-space-300 border-space-700 hover:text-white hover:border-space-600'
              }`}
            >
              {explodedView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{explodedView ? 'COLLAPSE VIEW' : 'EXPLODED VIEW'}</span>
            </button>

            <button
              onClick={() => setLcvgVisible(!lcvgVisible)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                lcvgVisible
                  ? 'bg-blue-500 text-white font-bold border-blue-400 shadow-lg shadow-blue-500/25'
                  : 'bg-space-900 text-space-300 border-space-700 hover:text-white hover:border-space-600'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{lcvgVisible ? 'HIDE LCVG TUBES' : 'SHOW LCVG (INTERNAL)'}</span>
            </button>
          </div>
        </div>

        {/* Subsystem Select Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-space-800/80">
          <span className="text-[10px] font-mono text-space-400 uppercase tracking-wider mr-1">
            SELECT SUBSYSTEM:
          </span>
          {(Object.keys(SUBSYSTEMS) as SuitSubsystem[]).map((key) => {
            const item = SUBSYSTEMS[key];
            const isSelected = selectedSubsystem === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedSubsystem(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300'
                    : 'bg-space-900/90 text-space-300 hover:bg-space-800 hover:text-white border border-space-800'
                }`}
              >
                {item.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[520px] lg:h-[620px] bg-space-950">
        <Canvas camera={{ position: [0, 0.4, 3.2], fov: 45 }} className="w-full h-full bg-space-950">
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 5, 4]} intensity={1.5} color="#FFFFFF" />
          <directionalLight position={[-4, 3, -4]} intensity={0.8} color="#60A5FA" />
          <Stars radius={60} depth={30} count={2000} factor={3} saturation={0} fade />

          <ExplodedSpacesuitScene
            activeSubsystem={selectedSubsystem}
            explodedView={explodedView}
            lcvgVisible={lcvgVisible}
          />

          <OrbitControls
            enablePan={false}
            minDistance={1.6}
            maxDistance={5.0}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </div>

      {/* Bottom Subsystem Inspector Panel */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-space-900/95 backdrop-blur-md border border-space-700/80 rounded-lg p-3.5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-cyan-950/90 text-cyan-300 border border-cyan-800/60">
                {activeData.category}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                {activeData.name}
              </h4>
            </div>
            <p className="text-xs text-space-300 leading-relaxed line-clamp-2">
              {activeData.functionDesc}
            </p>
          </div>

          {/* Engineering Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t lg:border-t-0 lg:border-l border-space-800 pt-2 lg:pt-0 lg:pl-4 text-left">
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Pressure Level</span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300">{activeData.pressure}</span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Mass / Gas Flow</span>
              <span className="text-[11px] font-mono font-semibold text-amber-300">{activeData.flowRate}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Safety Fail-Safe</span>
              <span className="text-[11px] font-mono font-semibold text-emerald-300">{activeData.failureMitigation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
