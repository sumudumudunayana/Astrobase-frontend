import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  Wrench,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Footprints,
  Sliders,
  Check,
} from 'lucide-react';

export const EVAToolHandling3D: React.FC = () => {
  const [isApfrLocked, setIsApfrLocked] = useState(false);
  const [isToolTethered, setIsToolTethered] = useState(true);
  const [torqueSetting, setTorqueSetting] = useState(15.0); // ft-lbs
  const [boltProgress, setBoltProgress] = useState(0); // 0 to 100%
  const [isDrivingBolt, setIsDrivingBolt] = useState(false);
  const [lostToolWarning, setLostToolWarning] = useState(false);

  const handleDriveBolt = () => {
    if (!isToolTethered) {
      setLostToolWarning(true);
      return;
    }
    setIsDrivingBolt(true);
    const interval = setInterval(() => {
      setBoltProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDrivingBolt(false);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleReset = () => {
    setBoltProgress(0);
    setIsDrivingBolt(false);
    setLostToolWarning(false);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-space-950 border border-space-800 shadow-2xl flex flex-col">
      {/* Top Header & Control Toolbar */}
      <div className="relative z-20 flex flex-col gap-3 p-4 bg-gradient-to-b from-space-900/95 via-space-950/95 to-space-950 border-b border-space-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                  PISTOL GRIP TOOL (PGT) & APFR RESTRAINT
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  LESSON 05 3D LAB
                </span>
              </div>
              <p className="text-xs text-space-400 mt-0.5">
                Zero-G Counter-Torque Dynamics • Microgravity Tool Management
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-space-900 border border-space-700 text-space-300 hover:text-white transition-colors cursor-pointer"
              title="Reset simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsApfrLocked(!isApfrLocked)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                isApfrLocked
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 shadow-md shadow-emerald-950/40'
                  : 'bg-space-900 text-space-300 border-space-700 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{isApfrLocked ? 'APFR BOOTS LOCKED' : 'LOCK BOOTS IN APFR'}</span>
            </button>

            <button
              onClick={() => setIsToolTethered(!isToolTethered)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
                isToolTethered
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                  : 'bg-red-950/80 text-red-300 border-red-700 animate-pulse'
              }`}
            >
              {isToolTethered ? 'TOOL TETHER SECURE' : 'TOOL UNTETHERED!'}
            </button>
          </div>
        </div>

        {/* Torque & Drive Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-space-800/80">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-space-400 uppercase tracking-wider">
              PGT TORQUE LIMIT:
            </span>
            <span className="font-mono font-bold text-xs text-amber-300">
              {torqueSetting.toFixed(1)} ft-lbs
            </span>
          </div>

          <div className="flex-1 max-w-xs">
            <input
              type="range"
              min="2.0"
              max="30.0"
              step="1.0"
              value={torqueSetting}
              onChange={(e) => setTorqueSetting(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <button
            onClick={handleDriveBolt}
            disabled={isDrivingBolt || boltProgress >= 100}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              boltProgress >= 100
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
            }`}
          >
            {boltProgress >= 100
              ? 'BOLT FULLY TORQUED'
              : isDrivingBolt
              ? 'DRIVING BOLT...'
              : 'ACTUATE PGT POWER DRIVER'}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[520px] lg:h-[620px] bg-space-950">
        <Canvas camera={{ position: [2.2, 1.8, 3.2], fov: 45 }} className="w-full h-full bg-space-950">
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 5, 4]} intensity={1.5} color="#FFFFFF" />
          <directionalLight position={[-3, -2, -3]} intensity={0.5} color="#60A5FA" />
          <Stars radius={50} depth={20} count={1500} factor={2} />

          {/* Worksite: Truss Segment */}
          <group position={[0, -0.2, 0]}>
            {/* Spacecraft Truss Mounting Plate */}
            <mesh position={[0, 0, -0.6]}>
              <boxGeometry args={[2.4, 1.6, 0.15]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Orbital Replaceable Unit (ORU) Box */}
            <mesh position={[0, 0.2, -0.3]}>
              <boxGeometry args={[1.0, 0.8, 0.45]} />
              <meshStandardMaterial color="#0284C7" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* ORU Fastener Bolt (Driven by PGT) */}
            <group position={[0.35, 0.45, -0.05]}>
              <mesh rotation={[Math.PI / 2, 0, (boltProgress / 100) * Math.PI * 4]}>
                <cylinderGeometry args={[0.04, 0.04, 0.1, 6]} />
                <meshStandardMaterial
                  color={boltProgress >= 100 ? '#10B981' : '#F59E0B'}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            </group>

            {/* APFR (Articulating Portable Foot Restraint) Stand */}
            <group position={[-0.4, -0.7, 0.4]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
                <meshStandardMaterial color="#94A3B8" metalness={0.7} />
              </mesh>
              {/* Footplate boots interface */}
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.4, 0.05, 0.35]} />
                <meshStandardMaterial
                  color={isApfrLocked ? '#10B981' : '#F59E0B'}
                  metalness={0.5}
                />
              </mesh>
            </group>

            {/* Astronaut Model standing in APFR or floating */}
            <group
              position={[-0.4, isApfrLocked ? 0 : 0.2, 0.4]}
              rotation={[isApfrLocked ? 0 : 0.1, 0, isApfrLocked ? 0 : -0.1]}
            >
              {/* Torso */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.55, 0.5, 0.36]} />
                <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
              </mesh>
              {/* Helmet */}
              <mesh position={[0, 0.9, 0]}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color="#E2E8F0" />
              </mesh>
              {/* Visor */}
              <mesh position={[0, 0.9, 0.08]} rotation={[0.1, 0, 0]}>
                <sphereGeometry args={[0.16, 16, 16, 0, Math.PI]} />
                <meshStandardMaterial color="#F59E0B" metalness={0.95} />
              </mesh>

              {/* Extended Right Hand holding Pistol Grip Tool */}
              <group position={[0.4, 0.45, -0.2]}>
                {/* PGT Tool Body */}
                <mesh>
                  <boxGeometry args={[0.12, 0.18, 0.22]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                {/* PGT Digital Display Collar */}
                <mesh position={[0, 0.09, 0.05]}>
                  <boxGeometry args={[0.08, 0.03, 0.08]} />
                  <meshBasicMaterial color="#38BDF8" />
                </mesh>
                {/* PGT Driver Socket */}
                <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
                  <meshStandardMaterial color="#94A3B8" metalness={0.9} />
                </mesh>
              </group>
            </group>
          </group>

          <OrbitControls
            enablePan={false}
            minDistance={1.8}
            maxDistance={5.5}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </div>

      {/* Bottom Tool Specs and Physics Panel */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-space-900/95 backdrop-blur-md border border-space-700/80 rounded-lg p-3.5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  !isApfrLocked
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {!isApfrLocked ? 'NEWTON THIRD LAW WARNING' : 'COUNTER-TORQUE ANCHORED'}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Microgravity Reaction Dynamics
              </h4>
            </div>
            <p className="text-xs text-space-300 leading-relaxed line-clamp-2">
              {!isApfrLocked
                ? 'Without locking boots into the APFR foot restraint, applying torque with the PGT will cause the astronaut body to rotate in the opposite direction rather than turning the bolt!'
                : 'Boots securely locked into the APFR. Reaction forces are transmitted through the mechanical plate into the primary station truss structure, allowing precise fastener torque.'}
            </p>
          </div>

          {/* Telemetry / Tool Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t lg:border-t-0 lg:border-l border-space-800 pt-2 lg:pt-0 lg:pl-4 text-left">
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Selected Torque</span>
              <span className="text-[11px] font-mono font-semibold text-amber-300">
                {torqueSetting.toFixed(1)} ft-lbs
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Fastener Lock</span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  boltProgress >= 100 ? 'text-emerald-400' : 'text-cyan-300'
                }`}
              >
                {boltProgress}% Torqued
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Tool Tether</span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  isToolTethered ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isToolTethered ? 'Locked (No Drift)' : 'DANGER: DRIFT'}
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">APFR Rigid Ring</span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  isApfrLocked ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isApfrLocked ? 'Rigid (3-Axis)' : 'Free Floating'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
