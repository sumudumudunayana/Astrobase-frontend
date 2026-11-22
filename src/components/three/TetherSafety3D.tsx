import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  ShieldAlert,
  Link2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Sliders,
  CheckCircle2,
  Activity,
} from 'lucide-react';

function DynamicTetherLine({
  startPos,
  endPos,
  isBroken,
  tension,
}: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  isBroken: boolean;
  tension: number;
}) {
  if (isBroken) {
    // Show severed line hanging
    return (
      <group>
        <mesh position={[startPos[0] + 0.3, startPos[1] - 0.2, startPos[2]]}>
          <cylinderGeometry args={[0.008, 0.008, 0.6, 8]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
      </group>
    );
  }

  // Create curved catenary or straight line depending on tension
  const points = [];
  const segments = 12;
  const sag = Math.max(0, 0.4 - tension * 0.015);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = startPos[0] + (endPos[0] - startPos[0]) * t;
    const y = startPos[1] + (endPos[1] - startPos[1]) * t - Math.sin(t * Math.PI) * sag;
    const z = startPos[2] + (endPos[2] - startPos[2]) * t;
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.012, 8, false);

  const tetherColor = tension > 25 ? '#EF4444' : tension > 15 ? '#F59E0B' : '#FACC15';

  return (
    <mesh geometry={tubeGeometry}>
      <meshBasicMaterial color={tetherColor} />
    </mesh>
  );
}

function SpaceStationTrussAnchor() {
  return (
    <group position={[-2.8, 0, 0]}>
      {/* Aluminum Truss Frame */}
      <mesh>
        <boxGeometry args={[0.4, 2.5, 0.4]} />
        <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Slide Wire Cable */}
      <mesh position={[0.22, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 2.2, 8]} />
        <meshBasicMaterial color="#94A3B8" />
      </mesh>
      {/* Anodized Yellow Safety D-Ring Anchor */}
      <mesh position={[0.26, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.08, 0.018, 12, 24]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SpacewalkerWithSafer({
  position,
  saferActive,
}: {
  position: [number, number, number];
  saferActive: boolean;
}) {
  return (
    <group position={position}>
      {/* Upper Torso */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.65, 0.6, 0.44]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>
      {/* Helmet & Gold Visor */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.23, 20, 20]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.15, 0.1]} rotation={[0.1, 0, 0]}>
        <sphereGeometry args={[0.21, 20, 20, 0, Math.PI]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Lower Torso & Legs */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.26, 0.24, 0.4, 16]} />
        <meshStandardMaterial color="#CBD5E1" />
      </mesh>
      <mesh position={[-0.15, -0.35, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.7, 16]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>
      <mesh position={[0.15, -0.35, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.7, 16]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>

      {/* PLSS Backpack */}
      <mesh position={[0, 0.7, -0.34]}>
        <boxGeometry args={[0.56, 0.74, 0.28]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.3} />
      </mesh>

      {/* SAFER Jetpack (Simplified Aid for EVA Rescue) */}
      <mesh position={[0, 0.3, -0.36]}>
        <boxGeometry args={[0.52, 0.2, 0.24]} />
        <meshStandardMaterial
          color={saferActive ? '#0284C7' : '#334155'}
          metalness={0.6}
        />
      </mesh>

      {/* SAFER Nitrogen Cold-Gas Thruster Plumes */}
      {saferActive && (
        <>
          <pointLight position={[-0.28, 0.3, -0.36]} color="#38BDF8" intensity={2} distance={2} />
          <pointLight position={[0.28, 0.3, -0.36]} color="#38BDF8" intensity={2} distance={2} />
        </>
      )}

      {/* Waist Tether Retractor Box */}
      <mesh position={[-0.28, 0.22, 0.05]}>
        <boxGeometry args={[0.1, 0.12, 0.08]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>
    </group>
  );
}

export const TetherSafety3D: React.FC = () => {
  const [distanceMeters, setDistanceMeters] = useState(6.5);
  const [isBroken, setIsBroken] = useState(false);
  const [saferActive, setSaferActive] = useState(false);

  // Map real meters (0 - 18) to 3D scene X coordinates (-2.5 to 2.5)
  const astronautX = -2.5 + (distanceMeters / 18) * 5.0;
  const tetherTension = Math.max(2, Math.round((distanceMeters / 15) * 28));

  const isCritical = distanceMeters > 15.0 || isBroken;
  const isCaution = distanceMeters > 11.0 && !isCritical;

  const triggerSaferRescue = () => {
    setSaferActive(true);
    // Smoothly fly back to anchor
    const interval = setInterval(() => {
      setDistanceMeters((prev) => {
        if (prev <= 2.0) {
          clearInterval(interval);
          setSaferActive(false);
          setIsBroken(false);
          return 2.0;
        }
        return prev - 0.8;
      });
    }, 100);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-space-950 border border-space-800 shadow-2xl flex flex-col">
      {/* Top Header & Control Toolbar */}
      <div className="relative z-20 flex flex-col gap-3 p-4 bg-gradient-to-b from-space-900/95 via-space-950/95 to-space-950 border-b border-space-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                isCritical
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                  TETHER SAFETY & SAFER RESCUE SYSTEM
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  LESSON 04 3D LAB
                </span>
              </div>
              <p className="text-xs text-space-400 mt-0.5">
                55-ft Retractable Steel Line • Dual Carabiners • SAFER Jetpack Flyback
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBroken(!isBroken)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
                isBroken
                  ? 'bg-red-950/80 text-red-300 border-red-700 animate-pulse'
                  : 'bg-space-900 text-space-300 border-space-700 hover:text-white'
              }`}
            >
              {isBroken ? 'TETHER SEVERED (EMERGENCY)' : 'SIMULATE TETHER BREAK'}
            </button>

            {(isCritical || isBroken) && (
              <button
                onClick={triggerSaferRescue}
                disabled={saferActive}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer animate-bounce"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>{saferActive ? 'AAH THRUSTING...' : 'FIRE SAFER JETPACK'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Distance Slider Control Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-space-800/80">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-space-400 uppercase tracking-wider">
              ASTRONAUT DISTANCE FROM AIRLOCK:
            </span>
            <span
              className={`font-mono font-bold text-xs ${
                isCritical ? 'text-red-400' : isCaution ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {distanceMeters.toFixed(1)} m / 16.7 m max
            </span>
          </div>

          <div className="flex-1 max-w-md">
            <input
              type="range"
              min="1"
              max="18"
              step="0.5"
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(parseFloat(e.target.value))}
              disabled={saferActive}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-space-500 mt-1">
              <span>0m (Airlock)</span>
              <span className="text-amber-400">11m (Caution)</span>
              <span className="text-red-400">15m (Limit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[520px] lg:h-[620px] bg-space-950">
        <Canvas camera={{ position: [0, 2.0, 5.0], fov: 45 }} className="w-full h-full bg-space-950">
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 6, 4]} intensity={1.5} color="#FFFFFF" />
          <directionalLight position={[-4, 2, -4]} intensity={0.6} color="#38BDF8" />
          <Stars radius={60} depth={30} count={2000} factor={3} />

          <SpaceStationTrussAnchor />

          {/* Dynamic tether wire */}
          <DynamicTetherLine
            startPos={[-2.54, 0.3, 0]}
            endPos={[astronautX - 0.28, 0.22, 0.05]}
            isBroken={isBroken}
            tension={tetherTension}
          />

          <SpacewalkerWithSafer
            position={[astronautX, 0, 0]}
            saferActive={saferActive}
          />

          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={8.0}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-space-900/95 backdrop-blur-md border border-space-700/80 rounded-lg p-3.5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  isCritical
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : isCaution
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isBroken
                  ? 'CRITICAL: TETHER SEVERED'
                  : isCritical
                  ? 'CRITICAL: EXTENSION LIMIT EXCEEDED'
                  : isCaution
                  ? 'CAUTION: APPROACHING REEL END'
                  : 'NOMINAL SAFETY ZONE'}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Tether Anchor & SAFER Nitrogen Budget
              </h4>
            </div>
            <p className="text-xs text-space-300 leading-relaxed line-clamp-2">
              {isBroken
                ? 'Astronaut is untethered and will drift away into orbital space at delta-V. Immediate activation of SAFER Automatic Attitude Hold (AAH) is mandated to arrest rotational tumble and thrust back to the truss structure.'
                : 'NASA rules require two independent tether connections whenever stationary, or continuous slide-wire engagement while in motion. Never allow tether tension to exceed 45 Newtons.'}
            </p>
          </div>

          {/* Readout Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t lg:border-t-0 lg:border-l border-space-800 pt-2 lg:pt-0 lg:pl-4 text-left">
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Tether Length</span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300">
                {distanceMeters.toFixed(1)} m
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Line Tension</span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  tetherTension > 25 ? 'text-red-400' : 'text-amber-300'
                }`}
              >
                {isBroken ? '0.0 N' : `${tetherTension} N`}
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">SAFER Nitrogen</span>
              <span className="text-[11px] font-mono font-semibold text-emerald-300">
                {saferActive ? '84% (Thrusting)' : '100% (3.05 m/s ΔV)'}
              </span>
            </div>
            <div className="bg-space-950/80 px-2.5 py-1.5 rounded border border-space-800">
              <span className="block text-[9px] font-mono text-space-400 uppercase">Redundant Hook</span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300">
                Dual-Locking Safe
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

