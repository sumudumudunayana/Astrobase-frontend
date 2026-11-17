import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  HeartPulse,
  Activity,
  Shield,
  Video,
  Layers,
  Droplet,
  CheckCircle,
} from 'lucide-react';

interface MedicalHotspot {
  id: string;
  title: string;
  position: [number, number, number];
  description: string;
  specs: Record<string, string>;
}

const HOTSPOTS: MedicalHotspot[] = [
  {
    id: 'mask',
    title: 'High-Flow 100% O2 Aviator Mask',
    position: [0.3, 0.75, 0.2],
    description: 'Demand-valve mask delivering positive-pressure 100% pure oxygen at 15 L/min to create an alveolar nitrogen gradient and wash dissolved nitrogen microbubbles from tissue.',
    specs: {
      'Oxygen Fraction': '100% Normobaric O2',
      'Delivery Rate': '15 Liters / minute continuous',
      'Clinical Purpose': 'Nitrogen desaturation & bubble resorption',
    },
  },
  {
    id: 'dcs_joint',
    title: 'Type II DCS Joint Microbubble Nodule',
    position: [0.75, 0.3, 0.15],
    description: 'Supersaturated nitrogen bubble formation in synovial fluids and periarticular tissues of right shoulder and elbow following prolonged 29.6 kPa spacewalk.',
    specs: {
      'Symptom Severity': 'Type II Musculoskeletal / Neurological',
      'Mottling': 'Cutis marmorata on right arm',
      'Primary Hazard': 'Venous gas embolism (VGE) escalation',
    },
  },
  {
    id: 'telemedicine',
    title: 'Flight Surgeon Telemedicine Terminal',
    position: [-0.9, 0.6, 0.3],
    description: 'Encrypted Space-to-Ground Medical Loop (SG-Med) streaming real-time 12-lead ECG, pulse oximetry, and high-definition video to NASA Flight Surgeons.',
    specs: {
      'Bandwidth': 'Dedicated Ku-band medical channel',
      'Telemetry': 'ECG, SpO2, NIBP, core body temp',
      'Command Authority': 'Flight Surgeon directs pharmaceutical protocol',
    },
  },
];

function MedicalSickbayAssembly({
  restrained,
  o2Administered,
  telemedicineActive,
  ivAdministered,
  hyperbaricActive,
  selectedHotspot,
  onSelectHotspot,
}: {
  restrained: boolean;
  o2Administered: boolean;
  telemedicineActive: boolean;
  ivAdministered: boolean;
  hyperbaricActive: boolean;
  selectedHotspot: MedicalHotspot | null;
  onSelectHotspot: (h: MedicalHotspot) => void;
}) {
  return (
    <group>
      {/* Sickbay Module Backing Wall */}
      <mesh position={[0, 0, -0.6]}>
        <boxGeometry args={[3.2, 2.4, 0.2]} />
        <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Zero-G Medical Restraint Board (Horizontal Couch) */}
      <mesh position={[0.2, 0.1, 0]}>
        <boxGeometry args={[1.8, 0.12, 0.7]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Patient Restraint Straps */}
      {restrained && (
        <group position={[0.2, 0.22, 0]}>
          {[-0.5, 0, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]}>
              <boxGeometry args={[0.08, 0.1, 0.72]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
          ))}
        </group>
      )}

      {/* Patient Mannequin Body */}
      <group position={[0.2, 0.22, 0]}>
        {/* Torso */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.16, 0.45]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>
        {/* Head */}
        <mesh position={[-0.55, 0.05, 0]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color="#FBD5BD" />
        </mesh>
        {/* Legs */}
        <mesh position={[0.7, -0.02, 0]}>
          <boxGeometry args={[0.7, 0.14, 0.38]} />
          <meshStandardMaterial color="#CBD5E1" />
        </mesh>
        {/* Arms */}
        <mesh position={[0.1, 0, -0.28]}>
          <boxGeometry args={[0.6, 0.1, 0.1]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>
        {/* Right Arm (Affected by DCS) */}
        <mesh
          position={[0.1, 0, 0.28]}
          onClick={() => onSelectHotspot(HOTSPOTS[1])}
        >
          <boxGeometry args={[0.6, 0.1, 0.1]} />
          <meshStandardMaterial
            color={hyperbaricActive ? '#E2E8F0' : '#FCA5A5'}
            emissive={hyperbaricActive ? '#000000' : '#EF4444'}
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* 100% Oxygen Aviator Mask on Face */}
        {o2Administered && (
          <mesh
            position={[-0.58, 0.1, 0]}
            onClick={() => onSelectHotspot(HOTSPOTS[0])}
          >
            <boxGeometry args={[0.14, 0.12, 0.14]} />
            <meshStandardMaterial color="#0284C7" metalness={0.7} />
          </mesh>
        )}
      </group>

      {/* Telemedicine Monitor Screen (Top Left) */}
      <group position={[-0.9, 0.6, 0.2]} onClick={() => onSelectHotspot(HOTSPOTS[2])}>
        <mesh>
          <boxGeometry args={[0.7, 0.5, 0.08]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>
        {/* Screen Display */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.64, 0.44]} />
          <meshBasicMaterial color={telemedicineActive ? '#0369A1' : '#334155'} />
        </mesh>
      </group>

      {/* IV Infusion Bag & Stand */}
      {ivAdministered && (
        <group position={[-0.4, 0.8, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.25, 12]} />
            <meshStandardMaterial color="#38BDF8" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.1, 6]} />
            <meshStandardMaterial color="#CBD5E1" />
          </mesh>
        </group>
      )}

      {/* Hyperbaric Chamber Outline / Airlock Hatch Indicator */}
      {hyperbaricActive && (
        <mesh position={[0.2, 0.2, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 2.0, 24, 1, true]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#059669"
            emissiveIntensity={0.3}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hotspots */}
      {HOTSPOTS.map((h) => {
        const isSelected = selectedHotspot?.id === h.id;
        return (
          <group key={h.id} position={h.position} onClick={() => onSelectHotspot(h)}>
            <mesh>
              <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#38BDF8' : '#F59E0B'}
                emissive={isSelected ? '#0284C7' : '#B45309'}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export const MedicalEmergency3D: React.FC = () => {
  const [restrained, setRestrained] = useState(false);
  const [o2Administered, setO2Administered] = useState(false);
  const [telemedicineActive, setTelemedicineActive] = useState(false);
  const [ivAdministered, setIvAdministered] = useState(false);
  const [hyperbaricActive, setHyperbaricActive] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<MedicalHotspot | null>(HOTSPOTS[0]);

  // Derived Telemetry
  const heartRateBpm = hyperbaricActive ? 76 : o2Administered ? 94 : 118;
  const spO2 = hyperbaricActive ? 99 : o2Administered ? 98 : 92;
  const washoutPercent = hyperbaricActive ? 94 : o2Administered ? 55 : 12;

  const handleReset = () => {
    setRestrained(false);
    setO2Administered(false);
    setTelemedicineActive(false);
    setIvAdministered(false);
    setHyperbaricActive(false);
    setSelectedHotspot(HOTSPOTS[0]);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                POST-EVA DECOMPRESSION SICKNESS (DCS)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                CRITICAL LAB 06
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              CHeCS Sickbay • Type II Bends Protocol & Hyperbaric Treatment
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRestrained(!restrained)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              restrained
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {restrained ? 'PATIENT RESTRAINED' : 'SECURE RESTRAINTS'}
          </button>

          <button
            onClick={() => setO2Administered(!o2Administered)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              o2Administered
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 animate-bounce'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {o2Administered ? '100% O2 MASK ON' : 'ADMINISTER 100% O2'}
          </button>

          <button
            onClick={() => setTelemedicineActive(!telemedicineActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              telemedicineActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {telemedicineActive ? 'FLIGHT SURGEON CONNECTED' : 'TELEMEDICINE LINK'}
          </button>

          <button
            onClick={() => setHyperbaricActive(!hyperbaricActive)}
            disabled={!o2Administered}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !o2Administered
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : hyperbaricActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {hyperbaricActive ? 'HYPERBARIC ACTIVE (+50 kPa)' : 'START RECOMPRESSION'}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="h-[480px] lg:h-[540px] w-full relative">
        <Canvas camera={{ position: [0, 1.4, 3.2], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={1.2} />
          <directionalLight position={[-4, -2, -2]} intensity={0.3} color="#38BDF8" />
          <Stars radius={50} depth={30} count={2000} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <MedicalSickbayAssembly
              restrained={restrained}
              o2Administered={o2Administered}
              telemedicineActive={telemedicineActive}
              ivAdministered={ivAdministered}
              hyperbaricActive={hyperbaricActive}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={1.8}
            maxDistance={6}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>

        {/* Real-time Telemetry HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-xl p-3 shadow-xl min-w-[210px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              PATIENT VITALS HUD
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  heartRateBpm > 100
                    ? 'text-rose-400 animate-pulse'
                    : heartRateBpm > 85
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {heartRateBpm}
              </span>
              <span className="text-xs font-mono text-slate-400">BPM</span>
              <span className="text-[10px] font-mono text-slate-500">
                (SpO2: {spO2}%)
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">N2 WASHOUT:</span>
              <span
                className={`font-bold ${
                  washoutPercent > 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {washoutPercent}% COMPLETE
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">CLINICAL STATUS:</span>
              <span
                className={`font-bold ${
                  hyperbaricActive
                    ? 'text-emerald-400'
                    : o2Administered
                    ? 'text-cyan-300'
                    : 'text-rose-400'
                }`}
              >
                {hyperbaricActive
                  ? 'RECOVERING'
                  : o2Administered
                  ? 'STABILIZING'
                  : 'ACUTE DCS BENDS'}
              </span>
            </div>

            <div className="mt-1 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">FLIGHT SURGEON:</span>
              <span
                className={`font-bold ${
                  telemedicineActive ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {telemedicineActive ? 'ONLINE (SG-MED)' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Hotspot Deep-Dive Overlay */}
        {selectedHotspot && (
          <div className="absolute bottom-4 right-4 z-10 max-w-sm bg-[#0B1528]/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedHotspot.title}
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedHotspot.description}</p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-1 gap-1">
              {Object.entries(selectedHotspot.specs).map(([key, val]) => (
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
