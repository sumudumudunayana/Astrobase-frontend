import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Wrench,
  Target,
  CheckCircle2,
  Droplets,
  Sliders,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

function CanadarmRoboticsScene({
  joint1Angle,
  joint2Angle,
  isUnderwaterMode,
  isGrappled,
}: {
  joint1Angle: number;
  joint2Angle: number;
  isUnderwaterMode: boolean;
  isGrappled: boolean;
}) {
  const armBaseRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const targetCapsuleRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Gentle water or microgravity drift on target capsule
    if (targetCapsuleRef.current && !isGrappled) {
      targetCapsuleRef.current.position.y = 1.0 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
    }
  });

  return (
    <group>
      {/* ========================================================
          ENVIRONMENT (Underwater Neutral Buoyancy or Orbit)
         ======================================================== */}
      {isUnderwaterMode ? (
        <group>
          {/* NBL Pool Tile Floor */}
          <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 7.0]} />
            <meshStandardMaterial color="#0c4a6e" roughness={0.4} />
          </mesh>
          {/* Water Surface Plane */}
          <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 7.0]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.3}
              transmission={0.8}
              roughness={0.1}
            />
          </mesh>
        </group>
      ) : (
        /* Orbital Dark Void Floor Grid */
        <group>
          <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 7.0]} />
            <meshStandardMaterial color="#091222" metalness={0.8} />
          </mesh>
          <gridHelper args={[7.0, 14, '#1e293b', '#0f172a']} position={[0, -1.19, 0]} />
        </group>
      )}

      {/* ========================================================
          SPACE STATION MODULE (Base Mount)
         ======================================================== */}
      <group position={[-1.8, -0.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.7, 0.7, 2.2, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Canadarm Base Baseplate */}
        <mesh position={[0.7, 0, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.6]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <Text position={[0, 1.0, 0]} fontSize={0.12} color="#38bdf8" anchorX="center">
          ISS MODULE BASE
        </Text>
      </group>

      {/* ========================================================
          CANADARM2 / CANADARM3 ROBOTIC ARM ASSEMBLY
         ======================================================== */}
      <group position={[-1.0, -0.2, 0]}>
        {/* Shoulder Joint Pivot */}
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>

        {/* Boom Segment 1 (Shoulder to Elbow) */}
        <group rotation={[0, 0, (joint1Angle * Math.PI) / 180]}>
          <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.8, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
          </mesh>
          <Text position={[0.9, 0.22, 0]} fontSize={0.09} color="#0f172a" anchorX="center">
            CANADARM2 (CSA)
          </Text>

          {/* Elbow Joint Pivot */}
          <group ref={elbowRef} position={[1.8, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.3} />
            </mesh>

            {/* Boom Segment 2 (Elbow to Wrist) */}
            <group rotation={[0, 0, (joint2Angle * Math.PI) / 180]}>
              <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.07, 0.07, 1.6, 16]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
              </mesh>

              {/* Latching End Effector (LEE) Snare Head */}
              <group ref={wristRef} position={[1.6, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.14, 0.16, 0.35, 16]} />
                  <meshStandardMaterial
                    color={isGrappled ? '#10b981' : '#f59e0b'}
                    emissive={isGrappled ? '#10b981' : '#f59e0b'}
                    emissiveIntensity={0.5}
                  />
                </mesh>

                {/* Snare Wires */}
                <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.1, 0.02, 8, 24]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>

                <Text position={[0, 0.3, 0]} fontSize={0.09} color={isGrappled ? '#10b981' : '#facc15'} anchorX="center">
                  {isGrappled ? 'GRAPPLE LOCKED' : 'END EFFECTOR'}
                </Text>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ========================================================
          TARGET RESUPPLY CAPSULE (Cygnus / Dragon with Grapple Fixture)
         ======================================================== */}
      <group ref={targetCapsuleRef} position={[1.6, 0.9, 0]}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.6, 1.2, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Flight Releasable Grapple Fixture (FRGF) Target Pin */}
        <mesh position={[-0.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
        {/* Target Reticle Pin Center */}
        <mesh position={[-0.68, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
        </mesh>

        <Text position={[0, 0.85, 0]} fontSize={0.11} color="#f8fafc" anchorX="center">
          CARGO CAPSULE
        </Text>
        <Text position={[-0.8, -0.2, 0]} fontSize={0.08} color="#f59e0b" anchorX="center">
          FRGF PIN
        </Text>
      </group>
    </group>
  );
}

export const CanadarmRobotics3D: React.FC = () => {
  const [joint1Angle, setJoint1Angle] = useState<number>(20);
  const [joint2Angle, setJoint2Angle] = useState<number>(45);
  const [isUnderwaterMode, setIsUnderwaterMode] = useState<boolean>(false);
  const [isGrappled, setIsGrappled] = useState<boolean>(false);

  // Calculate approximate distance to target pin
  const alignmentErrorMm = Math.round(
    Math.abs(joint1Angle - 28) * 4.2 + Math.abs(joint2Angle - 40) * 3.8
  );

  const attemptGrapple = () => {
    if (alignmentErrorMm < 25) {
      setIsGrappled(true);
    } else {
      setIsGrappled(false);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Wrench className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                CANADIAN SPACE AGENCY (CSA) ROBOTICS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 border border-cyan-700/50 text-cyan-300 rounded-full">
                CANADARM2 / CANADARM3 OPS
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              6-DOF Robotic Arm Kinematics & Grapple Latching
            </h2>
          </div>
        </div>

        {/* Alignment Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Alignment Offset:</span>
            <span
              className={`font-bold ${
                alignmentErrorMm < 25 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {alignmentErrorMm} mm
            </span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 2.5, 4.8], fov: 48 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={isUnderwaterMode ? 0.9 : 0.6} color={isUnderwaterMode ? '#0284c7' : '#ffffff'} />
          <pointLight position={[0, 4, 2]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[4, 6, 3]} intensity={0.9} />
          <Suspense fallback={null}>
            <CanadarmRoboticsScene
              joint1Angle={joint1Angle}
              joint2Angle={joint2Angle}
              isUnderwaterMode={isUnderwaterMode}
              isGrappled={isGrappled}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.0}
            minDistance={2.5}
            maxDistance={7.5}
          />
        </Canvas>

        {/* Left Side: Joint Controls */}
        <div className="absolute top-20 left-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-3">
          <div className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span>Joint Angle Kinematics</span>
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Shoulder Pitch:</span>
              <span className="text-white font-bold">{joint1Angle}°</span>
            </div>
            <input
              type="range"
              min="-20"
              max="70"
              step="1"
              value={joint1Angle}
              onChange={(e) => {
                setJoint1Angle(Number(e.target.value));
                setIsGrappled(false);
              }}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Elbow Pitch:</span>
              <span className="text-white font-bold">{joint2Angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={joint2Angle}
              onChange={(e) => {
                setJoint2Angle(Number(e.target.value));
                setIsGrappled(false);
              }}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={attemptGrapple}
            className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isGrappled
                ? 'bg-emerald-600 text-white'
                : alignmentErrorMm < 25
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white animate-pulse'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>
              {isGrappled
                ? 'CAPTURE VERIFIED (3 SNARES CLOSED)'
                : alignmentErrorMm < 25
                ? 'DRIVE SNARE MOTOR (READY)'
                : 'OUT OF CAPTURE ENVELOPE'}
            </span>
          </button>
        </div>

        {/* Right Side: Training Environment Mode */}
        <div className="absolute top-20 right-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2.5">
          <div className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            Training Facility Selection
          </div>

          <button
            onClick={() => setIsUnderwaterMode(!isUnderwaterMode)}
            className={`w-full p-2.5 rounded-lg text-xs font-mono text-left transition-all ${
              isUnderwaterMode
                ? 'bg-sky-600/30 border border-sky-400 text-sky-200'
                : 'bg-[#0f1d33] border border-slate-700 text-slate-300'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>{isUnderwaterMode ? 'NBL Neutral Buoyancy Pool' : 'On-Orbit Microgravity'}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isUnderwaterMode
                ? 'Neutral buoyancy underwater facility replicates weightlessness via lead weights & foam ballasts.'
                : 'Real zero-g orbital vacuum space environment with solar glare and thruster plume restrictions.'}
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Info Strip */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="text-xs font-mono text-slate-400">
          <span>CSA Standard: </span>
          <span className="text-cyan-300 font-bold">End Effector Snare Tolerance &lt; 25 mm</span>
          <span> to prevent kinetic collision with the visiting spacecraft.</span>
        </div>

        <button
          onClick={() => {
            setJoint1Angle(28);
            setJoint2Angle(40);
            setIsGrappled(true);
          }}
          className="px-2.5 py-1 rounded text-xs font-mono bg-cyan-600 text-white font-bold"
        >
          Auto-Align to Grapple Target
        </button>
      </div>
    </div>
  );
};
