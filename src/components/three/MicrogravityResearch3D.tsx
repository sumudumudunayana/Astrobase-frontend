import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

function MicrogravityComparisonScene({
  gravityG,
  experimentType,
}: {
  gravityG: number;
  experimentType: 'FLUID' | 'CRYSTAL' | 'FLAME';
}) {
  const earthDroplet = useRef<THREE.Mesh>(null);
  const spaceDroplet = useRef<THREE.Mesh>(null);
  const crystalSpace = useRef<THREE.Group>(null);
  const crystalGround = useRef<THREE.Group>(null);
  const plumeGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Rotation of space crystal
    if (crystalSpace.current) {
      crystalSpace.current.rotation.y += delta * 0.5;
      crystalSpace.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }

    // Plumes rising on ground side
    if (plumeGroup.current) {
      plumeGroup.current.children.forEach((p, idx) => {
        p.position.y += delta * (0.8 + idx * 0.1);
        if (p.position.y > 1.2) {
          p.position.y = -0.5;
        }
      });
    }

    // Gentle floating motion for space droplet
    if (spaceDroplet.current) {
      spaceDroplet.current.rotation.y += delta * 0.3;
      spaceDroplet.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Divider Barrier between Terrestrial and Orbital chambers */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 3.2, 2.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ========================================================
          LEFT CHAMBER: TERRESTRIAL 1.0G (EARTH GRAVITY)
         ======================================================== */}
      <group position={[-1.8, 0, 0]}>
        {/* Chamber Floor */}
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[2.8, 0.1, 2.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        <Html center position={[0, 1.35, 0]} className="pointer-events-none select-none whitespace-nowrap">
          <div className="px-2 py-0.5 rounded bg-[#09172a]/90 border border-slate-700 text-[11px] font-mono font-bold text-slate-300">
            EARTH 1.0G CHAMBER
          </div>
        </Html>

        {experimentType === 'FLUID' && (
          <group position={[0, -0.6, 0]}>
            {/* Gravity-sagged flattened droplet on surface */}
            <mesh ref={earthDroplet} position={[0, 0.15, 0]} scale={[1.4, 0.35 * Math.max(0.3, gravityG), 1.4]}>
              <sphereGeometry args={[0.5, 32, 16]} />
              <meshStandardMaterial
                color="#0284c7"
                emissive="#0369a1"
                emissiveIntensity={0.3}
                transparent
                opacity={0.85}
                roughness={0.1}
                metalness={0.2}
              />
            </mesh>
            {/* Contact angle puddle boundary */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.65, 0.72, 32]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>

            {/* Rising thermal buoyant convection plume particles */}
            <group ref={plumeGroup} position={[0, 0.2, 0]}>
              {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} position={[(Math.sin(i * 1.5) * 0.15), -0.3 + (i * 0.2), 0]}>
                  <sphereGeometry args={[0.03, 8, 8]} />
                  <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
                </mesh>
              ))}
            </group>
          </group>
        )}

        {experimentType === 'CRYSTAL' && (
          <group position={[0, -0.8, 0]}>
            {/* Settled disordered micro-crystals on container floor */}
            <group ref={crystalGround}>
              {Array.from({ length: 6 }).map((_, i) => (
                <mesh
                  key={i}
                  position={[
                    (i % 3 - 1) * 0.28,
                    0.08 + (i > 3 ? 0.08 : 0),
                    (Math.floor(i / 3) - 0.5) * 0.28,
                  ]}
                  rotation={[0.3 * i, 0.5 * i, 0]}
                >
                  <octahedronGeometry args={[0.16, 0]} />
                  <meshStandardMaterial color="#64748b" roughness={0.6} />
                </mesh>
              ))}
            </group>
            <Html center position={[0, -0.25, 0]} className="pointer-events-none select-none whitespace-nowrap">
              <div className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                Sedimentation Clump // High Dislocations
              </div>
            </Html>
          </group>
        )}

        {experimentType === 'FLAME' && (
          <group position={[0, -0.4, 0]}>
            {/* Teardrop-shaped buoyant rising flame */}
            <mesh position={[0, 0.2, 0]} scale={[0.5, 1.2, 0.5]}>
              <coneGeometry args={[0.4, 0.8, 16]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <Html center position={[0, -0.3, 0]} className="pointer-events-none select-none whitespace-nowrap">
              <div className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                Buoyant Teardrop // Sooting
              </div>
            </Html>
          </group>
        )}
      </group>

      {/* ========================================================
          RIGHT CHAMBER: ORBITAL MICROGRAVITY (10^-4 g)
         ======================================================== */}
      <group position={[1.8, 0, 0]}>
        {/* Chamber Floor */}
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[2.8, 0.1, 2.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        <Html center position={[0, 1.35, 0]} className="pointer-events-none select-none whitespace-nowrap">
          <div className="px-2 py-0.5 rounded bg-[#09172a]/90 border border-cyan-700 text-[11px] font-mono font-bold text-cyan-300">
            MICROGRAVITY (10^-4 g)
          </div>
        </Html>

        {experimentType === 'FLUID' && (
          <group position={[0, 0, 0]}>
            {/* Perfect suspended floating spherical droplet */}
            <mesh ref={spaceDroplet}>
              <sphereGeometry args={[0.55, 32, 32]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.4}
                transparent
                opacity={0.88}
                roughness={0.05}
                metalness={0.15}
              />
            </mesh>

            {/* Marangoni Surface Tension Circulation Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.62, 0.02, 16, 32]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
            </mesh>
            <Html center position={[0, -0.75, 0]} className="pointer-events-none select-none whitespace-nowrap">
              <div className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                Spherical Surface Tension Dominance
              </div>
            </Html>
          </group>
        )}

        {experimentType === 'CRYSTAL' && (
          <group position={[0, 0, 0]} ref={crystalSpace}>
            {/* Suspended high-symmetry macromolecular crystal */}
            <mesh>
              <dodecahedronGeometry args={[0.62, 0]} />
              <meshStandardMaterial
                color="#7dd3fc"
                emissive="#0284c7"
                emissiveIntensity={0.5}
                metalness={0.2}
                roughness={0.1}
                transparent
                opacity={0.92}
              />
            </mesh>
            {/* Internal lattice wireframe */}
            <mesh scale={[0.58, 0.58, 0.58]}>
              <octahedronGeometry args={[0.58, 1]} />
              <meshBasicMaterial color="#e0f2fe" wireframe />
            </mesh>
            <Html center position={[0, -0.85, 0]} className="pointer-events-none select-none whitespace-nowrap">
              <div className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Diffusion-Grown Lattice // 1.18 Å Resolution
              </div>
            </Html>
          </group>
        )}

        {experimentType === 'FLAME' && (
          <group position={[0, 0, 0]}>
            {/* Perfectly spherical blue/orange flame with radial diffusion */}
            <mesh>
              <sphereGeometry args={[0.48, 32, 32]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
            </mesh>
            <mesh scale={[0.6, 0.6, 0.6]}>
              <sphereGeometry args={[0.48, 32, 32]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.85} />
            </mesh>
            <Html center position={[0, -0.75, 0]} className="pointer-events-none select-none whitespace-nowrap">
              <div className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                Soot-Free Spherical Diffusion Flame
              </div>
            </Html>
          </group>
        )}
      </group>
    </group>
  );
}

export const MicrogravityResearch3D: React.FC = () => {
  const [gravityG, setGravityG] = useState<number>(0.0001);
  const [experimentType, setExperimentType] = useState<'FLUID' | 'CRYSTAL' | 'FLAME'>('FLUID');

  return (
    <div className="w-full rounded-2xl bg-[#050b14] border border-cyan-800/40 p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXP-02 // DUAL-CHAMBER MICROGRAVITY COMPARATOR
            </span>
            <span className="text-xs font-mono text-slate-400">
              Comparing 1.0g Terrestrial vs 10^-4g Orbital Regimes
            </span>
          </div>
          <h3 className="text-base font-bold text-white font-mono tracking-wide">
            Interfacial Fluids, Macromolecular Crystals & Spherical Combustion
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-cyan-300 border border-cyan-800/60">
            Bo Number: {gravityG < 0.05 ? '< 0.001 (Capillary Dominated)' : '14.8 (Gravity Dominated)'}
          </span>
        </div>
      </div>

      {/* 3D Simulation Canvas */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-xl bg-gradient-to-b from-[#020610] to-[#07111f] border border-slate-800 overflow-hidden">
        <Canvas camera={{ position: [0, 0.2, 4.6], fov: 48 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} color="#bae6fd" />
          <directionalLight position={[-4, 6, 4]} intensity={1.0} color="#fed7aa" />
          <Suspense fallback={null}>
            <MicrogravityComparisonScene gravityG={gravityG} experimentType={experimentType} />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} minDistance={2.5} maxDistance={7.5} />
        </Canvas>

        {/* Real-time comparison HUD */}
        <div className="absolute top-3 right-3 bg-[#07111f]/90 border border-cyan-800/80 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-300 backdrop-blur pointer-events-none max-w-xs">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            SCIENTIFIC TELEMETRY
          </div>
          <div>Gravity Setting: <span className="text-white font-bold">{gravityG} g</span></div>
          <div>Convection: <span className={gravityG < 0.05 ? 'text-emerald-400' : 'text-amber-400'}>{gravityG < 0.05 ? 'Suppressed (Pure Diffusion)' : 'Turbulent Natural Plumes'}</span></div>
          <div>Diffraction Limit: <span className="text-cyan-300">{gravityG < 0.05 ? '1.18 Å (Sub-Atomic)' : '1.82 Å (Lattice Strain)'}</span></div>
        </div>

        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded border border-slate-800">
          LEFT: EARTH 1G // RIGHT: ORBITAL 10^-4G // DRAG TO ROTATE
        </div>
      </div>

      {/* Control Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Experiment Selector */}
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-cyan-400 font-semibold block uppercase">
            Select Physical Phenomenon
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setExperimentType('FLUID')}
              className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all ${
                experimentType === 'FLUID'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Fluid Droplet
            </button>
            <button
              onClick={() => setExperimentType('CRYSTAL')}
              className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all ${
                experimentType === 'CRYSTAL'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Crystal Lattice
            </button>
            <button
              onClick={() => setExperimentType('FLAME')}
              className={`py-2 px-3 rounded text-xs font-mono font-semibold transition-all ${
                experimentType === 'FLAME'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-[#0f1b2d] text-slate-300 hover:bg-[#16253c]'
              }`}
            >
              Combustion Sphere
            </button>
          </div>
        </div>

        {/* Gravity Acceleration Regulator */}
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
              Chamber Gravitational Vector
            </span>
            <span className="text-xs font-mono font-bold text-white">{gravityG} g</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setGravityG(1.0)}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                gravityG === 1.0 ? 'bg-amber-600 text-white' : 'bg-[#0f1b2d] text-slate-300'
              }`}
            >
              Earth (1.0g)
            </button>
            <button
              onClick={() => setGravityG(0.38)}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                gravityG === 0.38 ? 'bg-amber-600 text-white' : 'bg-[#0f1b2d] text-slate-300'
              }`}
            >
              Mars (0.38g)
            </button>
            <button
              onClick={() => setGravityG(0.166)}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                gravityG === 0.166 ? 'bg-amber-600 text-white' : 'bg-[#0f1b2d] text-slate-300'
              }`}
            >
              Moon (0.166g)
            </button>
            <button
              onClick={() => setGravityG(0.0001)}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                gravityG === 0.0001 ? 'bg-cyan-600 text-white' : 'bg-[#0f1b2d] text-slate-300'
              }`}
            >
              ISS (10^-4g)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
