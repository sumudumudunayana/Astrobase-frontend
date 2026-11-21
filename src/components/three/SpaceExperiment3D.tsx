import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  Shield,
  Activity,
  Atom,
  FlaskConical,
  Dna,
  Sparkles,
  Globe2,
} from 'lucide-react';

interface SpaceExperiment3DProps {
  selectedExperimentType?: string;
}

type SpecimenMode = 'CRYSTAL' | 'FLUID' | 'CELLS' | 'BIOFILM' | 'REGOLITH';

function GloveboxWorkstation({
  mode,
  isNegativePressure,
}: {
  mode: SpecimenMode;
  isNegativePressure: boolean;
}) {
  const sampleRef = useRef<THREE.Group>(null);
  const scannerRef = useRef<THREE.Group>(null);
  const particleGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Gentle levitation and multi-axis rotation of specimen
    if (sampleRef.current) {
      sampleRef.current.rotation.y += delta * 0.45;
      sampleRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
      sampleRef.current.position.y = -0.05 + Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
    }

    // Laser scanner head sweeping back and forth
    if (scannerRef.current) {
      scannerRef.current.position.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.9;
    }

    // Negative pressure laminar airflow stream toward exhaust
    if (particleGroup.current && isNegativePressure) {
      particleGroup.current.children.forEach((p, idx) => {
        p.position.y -= delta * (0.35 + (idx % 3) * 0.12);
        p.position.z -= delta * 0.15;
        if (p.position.y < -0.85 || p.position.z < -0.9) {
          p.position.y = 0.8;
          p.position.z = 0.4;
        }
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          ISPR PAYLOAD RACK GLOVEBOX HOUSING (OPEN VIEWING CHAMBER)
         ======================================================== */}
      {/* 1. Floor Inspection Bed */}
      <mesh position={[0, -1.25, 0]}>
        <boxGeometry args={[4.2, 0.15, 2.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* 2. Rear Back Wall with HEPA Intake Grille */}
      <mesh position={[0, 0, -1.15]}>
        <boxGeometry args={[4.2, 2.4, 0.1]} />
        <meshStandardMaterial color="#0a1220" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* HEPA Exhaust Filter Grille */}
      <mesh position={[0, -0.4, -1.09]}>
        <planeGeometry args={[1.6, 0.7]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.3} wireframe />
      </mesh>

      {/* 3. Roof Panel with Recessed Lighting Bank */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[4.2, 0.15, 2.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Overhead LED Illuminator Strip */}
      <mesh position={[0, 1.16, 0]}>
        <boxGeometry args={[3.2, 0.05, 1.2]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.9} />
      </mesh>
      <pointLight position={[0, 1.0, 0.2]} intensity={2.8} distance={4.5} color="#bae6fd" />

      {/* 4. Left Solid Wall with Utility Ports */}
      <mesh position={[-2.05, 0, 0]}>
        <boxGeometry args={[0.1, 2.4, 2.4]} />
        <meshStandardMaterial color="#0b1526" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 5. Right Solid Wall with Pass-Through Airlock */}
      <mesh position={[2.05, 0, 0]}>
        <boxGeometry args={[0.1, 2.4, 2.4]} />
        <meshStandardMaterial color="#0b1526" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 6. Four Corner Structural Support Struts */}
      {[-1.95, 1.95].map((x) =>
        [-1.05, 1.05].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0, z]}>
            <cylinderGeometry args={[0.04, 0.04, 2.4, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* 7. Front Viewing Bezel Frame */}
      {/* Top Frame Bezel */}
      <mesh position={[0, 1.1, 1.15]}>
        <boxGeometry args={[4.0, 0.18, 0.06]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Bottom Frame Bezel */}
      <mesh position={[0, -1.1, 1.15]}>
        <boxGeometry args={[4.0, 0.18, 0.06]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Left Frame Bezel */}
      <mesh position={[-1.95, 0, 1.15]}>
        <boxGeometry args={[0.15, 2.2, 0.06]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Right Frame Bezel */}
      <mesh position={[1.95, 0, 1.15]}>
        <boxGeometry args={[0.15, 2.2, 0.06]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Front Transparent Polycarbonate Glass Pane */}
      <mesh position={[0, 0, 1.15]}>
        <planeGeometry args={[3.8, 2.1]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.14}
          roughness={0.05}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dual Hermetic Glove Ports */}
      <group position={[-0.8, -0.45, 1.18]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.65} />
        </mesh>
      </group>

      <group position={[0.8, -0.45, 1.18]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* ========================================================
          CENTRAL WORKBENCH & SPECIMEN TURNTABLE
         ======================================================== */}
      {/* Specimen Turntable Base */}
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.25, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Glowing Turntable Ring */}
      <mesh position={[0, -0.81, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.76, 32]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Active Floating Specimen Group */}
      <group ref={sampleRef} position={[0, -0.05, 0]}>
        {mode === 'CRYSTAL' && (
          <group>
            {/* Macromolecular Protein Crystal */}
            <mesh>
              <dodecahedronGeometry args={[0.48, 0]} />
              <meshStandardMaterial
                color="#7dd3fc"
                emissive="#0284c7"
                emissiveIntensity={0.65}
                metalness={0.2}
                roughness={0.1}
                transparent
                opacity={0.92}
              />
            </mesh>
            {/* Crystalline Internal Lattice Lines */}
            <mesh scale={[0.85, 0.85, 0.85]}>
              <octahedronGeometry args={[0.48, 1]} />
              <meshBasicMaterial color="#e0f2fe" wireframe />
            </mesh>
          </group>
        )}

        {mode === 'FLUID' && (
          <group>
            {/* Perfectly spherical fluid droplet suspended in microgravity */}
            <mesh>
              <sphereGeometry args={[0.46, 32, 32]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0891b2"
                emissiveIntensity={0.6}
                roughness={0.05}
                metalness={0.15}
                transparent
                opacity={0.88}
              />
            </mesh>
            {/* Equatorial Marangoni surface tension loop */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.52, 0.02, 16, 32]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
            </mesh>
          </group>
        )}

        {mode === 'CELLS' && (
          <group>
            {/* Advanced Plant Habitat (APH) Seedling & Roots */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#854d0e" />
            </mesh>
            {/* Green Cotyledon leaves */}
            <mesh position={[-0.2, 0.25, 0]} rotation={[0, 0, -0.4]}>
              <sphereGeometry args={[0.15, 16, 16]} scale={[1.4, 0.4, 0.8]} />
              <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0.2, 0.25, 0]} rotation={[0, 0, 0.4]}>
              <sphereGeometry args={[0.15, 16, 16]} scale={[1.4, 0.4, 0.8]} />
              <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.3} />
            </mesh>
            {/* Skewed root trajectory */}
            <mesh position={[0.1, -0.22, 0]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.035, 0.045, 0.5, 12]} />
              <meshStandardMaterial color="#fef08a" emissive="#ca8a04" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0.25, -0.55, 0]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.025, 0.035, 0.45, 12]} />
              <meshStandardMaterial color="#fef08a" emissive="#ca8a04" emissiveIntensity={0.2} />
            </mesh>
          </group>
        )}

        {mode === 'BIOFILM' && (
          <group>
            {/* Bacterial Biofilm Culture Plate */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.06, 32]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
            <mesh position={[0, -0.11, 0]}>
              <cylinderGeometry args={[0.46, 0.46, 0.02, 32]} />
              <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.7} />
            </mesh>
            {/* Biofilm colony nodules */}
            {[-0.2, 0, 0.18].map((x, i) =>
              [-0.15, 0.12].map((z, j) => (
                <mesh key={`${i}-${j}`} position={[x, -0.08, z]}>
                  <sphereGeometry args={[0.06, 12, 12]} />
                  <meshStandardMaterial color="#d8b4fe" emissive="#9333ea" emissiveIntensity={0.8} />
                </mesh>
              ))
            )}
          </group>
        )}

        {mode === 'REGOLITH' && (
          <group>
            {/* Stratified Core Sample Segment */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.9, 32]} />
              <meshStandardMaterial color="#d97706" emissive="#92400e" emissiveIntensity={0.4} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.282, 0.282, 0.3, 32]} />
              <meshStandardMaterial color="#78716c" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.28, 0]}>
              <cylinderGeometry args={[0.282, 0.282, 0.3, 32]} />
              <meshStandardMaterial color="#0d9488" emissive="#0f766e" emissiveIntensity={0.3} roughness={0.7} />
            </mesh>
          </group>
        )}
      </group>

      {/* ========================================================
          MOVING OVERHEAD SPECTROMETER / LASER SCANNER
         ======================================================== */}
      <group ref={scannerRef} position={[0, 0.85, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.2, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Laser Emitter Aperture */}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.05, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Animated Laser Scanning Beam */}
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.015, 0.08, 0.8, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* ========================================================
          NEGATIVE PRESSURE LAMINAR AIRFLOW STREAM PARTICLES
         ======================================================== */}
      {isNegativePressure && (
        <group ref={particleGroup} position={[0, 0, 0.2]}>
          {Array.from({ length: 24 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                ((i % 6) - 2.5) * 0.45,
                ((i % 4) - 1.5) * 0.4,
                ((i % 2) - 0.5) * 0.5,
              ]}
            >
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export const SpaceExperiment3D: React.FC<SpaceExperiment3DProps> = ({
  selectedExperimentType,
}) => {
  const [mode, setMode] = useState<SpecimenMode>('CRYSTAL');
  const [isNegativePressure, setIsNegativePressure] = useState(true);
  const [indepVar, setIndepVar] = useState<'GRAVITY' | 'TEMPERATURE' | 'CONCENTRATION'>('GRAVITY');

  // Synchronize when parent passes selected experiment
  useEffect(() => {
    if (selectedExperimentType) {
      if (selectedExperimentType === 'CRYSTAL_GROWTH') setMode('CRYSTAL');
      else if (selectedExperimentType === 'FLUID_PHYSICS') setMode('FLUID');
      else if (selectedExperimentType === 'PLANT_BIOLOGY') setMode('CELLS');
      else if (selectedExperimentType === 'MICROBIAL_BEHAVIOR') setMode('BIOFILM');
      else if (selectedExperimentType === 'PLANETARY_SAMPLE') setMode('REGOLITH');
    }
  }, [selectedExperimentType]);

  return (
    <div className="w-full rounded-2xl bg-[#050b14] border border-cyan-800/40 p-4 space-y-4 select-none">
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXP-01 // FLIGHT LABORATORY GLOVEBOX (MSG)
            </span>
            <span className="text-xs font-mono text-slate-400">
              NASA International Standard Payload Rack (ISPR)
            </span>
          </div>
          <h3 className="text-base font-bold text-white font-mono tracking-wide">
            Scientific Experiment Workbench & Microgravity Isolation Chamber
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0b1526] text-xs font-mono text-cyan-300 border border-cyan-800/60">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONTAINMENT: LEVEL 2</span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0b1526] text-xs font-mono text-emerald-300 border border-emerald-800/60">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>PRESSURE: -45 Pa (NOMINAL)</span>
          </span>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-xl bg-gradient-to-b from-[#020610] to-[#07111f] border border-slate-800 overflow-hidden">
        <Canvas camera={{ position: [0, 0.2, 4.4], fov: 46 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[4, 7, 5]} intensity={1.8} color="#e0f2fe" />
          <directionalLight position={[-4, -2, -2]} intensity={0.5} color="#0284c7" />
          <Suspense fallback={null}>
            <GloveboxWorkstation mode={mode} isNegativePressure={isNegativePressure} />
          </Suspense>
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={2.2}
            maxDistance={7.5}
            target={[0, 0, 0]}
          />
        </Canvas>

        {/* Floating Telemetry Badge Overlay */}
        <div className="absolute top-3 left-3 bg-[#07111f]/90 border border-cyan-800/80 rounded-lg p-2.5 text-xs font-mono space-y-1 text-slate-300 backdrop-blur pointer-events-none">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            WORKBENCH TELEMETRY
          </div>
          <div>
            Specimen Type: <span className="text-white font-bold">{mode}</span>
          </div>
          <div>
            Chamber Containment: <span className="text-emerald-400 font-bold">Hermetically Sealed</span>
          </div>
          <div>
            Diffraction Sensor: <span className="text-cyan-300 font-bold">Active (450nm Monochromator)</span>
          </div>
          <div>
            Negative P: <span className={isNegativePressure ? 'text-emerald-400' : 'text-rose-400'}>{isNegativePressure ? 'ACTIVE (-45 Pa)' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded border border-slate-800">
          DRAG TO ROTATE // SCROLL TO ZOOM // DUAL GLOVE PORTS
        </div>
      </div>

      {/* Interactive Controls & Variable Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Specimen Mode Selection */}
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-cyan-400 font-semibold block uppercase">
            1. Specimen Chamber Payload
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setMode('CRYSTAL')}
              className={`py-2 px-1 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
                mode === 'CRYSTAL'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              <Atom className="w-3 h-3 text-cyan-300" />
              <span>Crystal</span>
            </button>
            <button
              onClick={() => setMode('FLUID')}
              className={`py-2 px-1 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
                mode === 'FLUID'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              <FlaskConical className="w-3 h-3 text-cyan-300" />
              <span>Fluid</span>
            </button>
            <button
              onClick={() => setMode('CELLS')}
              className={`py-2 px-1 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
                mode === 'CELLS'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              <Dna className="w-3 h-3 text-cyan-300" />
              <span>Plant</span>
            </button>
            <button
              onClick={() => setMode('BIOFILM')}
              className={`py-2 px-1 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
                mode === 'BIOFILM'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-300" />
              <span>Biofilm</span>
            </button>
            <button
              onClick={() => setMode('REGOLITH')}
              className={`col-span-2 py-2 px-1 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
                mode === 'REGOLITH'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              <Globe2 className="w-3 h-3 text-amber-300" />
              <span>Regolith Core</span>
            </button>
          </div>
        </div>

        {/* Variable Isolation: Independent Variable */}
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-amber-400 font-semibold block uppercase">
            2. Independent Variable
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setIndepVar('GRAVITY')}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                indepVar === 'GRAVITY'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Gravity (g)
            </button>
            <button
              onClick={() => setIndepVar('TEMPERATURE')}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                indepVar === 'TEMPERATURE'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setIndepVar('CONCENTRATION')}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                indepVar === 'CONCENTRATION'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Precipitant
            </button>
          </div>
        </div>

        {/* Dependent Variable & Safety Contactor */}
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-purple-400 font-semibold block uppercase">
            3. Containment Pressure
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNegativePressure(!isNegativePressure)}
              className={`w-full py-2.5 px-3 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isNegativePressure
                  ? 'bg-emerald-700/80 text-emerald-100 border border-emerald-500 shadow-md shadow-emerald-950/40'
                  : 'bg-rose-900/60 text-rose-200 border border-rose-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isNegativePressure ? 'NEGATIVE PRESSURE: ENGAGED (-45 Pa)' : 'NEGATIVE PRESSURE: OFF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
