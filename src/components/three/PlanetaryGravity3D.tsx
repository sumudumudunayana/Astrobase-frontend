import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Activity,
  ArrowUp,
  Compass,
  Gauge,
  Sliders,
  Play,
  Layers,
  Wind,
} from 'lucide-react';

interface GravityBody {
  id: string;
  name: string;
  gravityMps2: number;
  pressureKpa: number;
  atmosphereName: string;
  terrainColor: string;
}

const BODIES: Record<string, GravityBody> = {
  Earth: {
    id: 'Earth',
    name: 'Earth (1.0g)',
    gravityMps2: 9.81,
    pressureKpa: 101.3,
    atmosphereName: '78% N2, 21% O2 (Dense)',
    terrainColor: '#15803D',
  },
  Mars: {
    id: 'Mars',
    name: 'Mars (0.38g)',
    gravityMps2: 3.72,
    pressureKpa: 0.636,
    atmosphereName: '95% CO2 (Thin, 6 mbar)',
    terrainColor: '#B45309',
  },
  Moon: {
    id: 'Moon',
    name: 'Moon (0.165g)',
    gravityMps2: 1.62,
    pressureKpa: 0.0000000001,
    atmosphereName: 'Hard Vacuum (<10^-10 Torr)',
    terrainColor: '#475569',
  },
};

function PhysicsSimulationScene({
  gravity,
  isJumping,
  onJumpComplete,
  isThrowing,
  terrainColor,
}: {
  gravity: number;
  isJumping: boolean;
  onJumpComplete: () => void;
  isThrowing: boolean;
  terrainColor: string;
}) {
  const astronautRef = useRef<THREE.Group>(null!);
  const rockRef = useRef<THREE.Mesh>(null!);

  // Jump physics variables
  const jumpTimeRef = useRef(0);
  const initialVelocity = 3.2; // m/s leg impulse

  // Rock throw physics variables
  const throwTimeRef = useRef(0);
  const throwVx = 4.0;
  const throwVy = 3.5;

  useFrame((_, delta) => {
    // 1. Jump Physics (Kinematics: y = v0*t - 0.5*g*t^2)
    if (isJumping && astronautRef.current) {
      jumpTimeRef.current += delta;
      const t = jumpTimeRef.current;
      const y = Math.max(0, initialVelocity * t - 0.5 * gravity * t * t);
      astronautRef.current.position.y = y;

      if (t > 0.1 && y <= 0.01) {
        astronautRef.current.position.y = 0;
        jumpTimeRef.current = 0;
        onJumpComplete();
      }
    }

    // 2. Ballistic Projectile Physics
    if (isThrowing && rockRef.current) {
      throwTimeRef.current += delta;
      const t = throwTimeRef.current;
      const x = throwVx * t - 1.0;
      const y = Math.max(0, 0.8 + throwVy * t - 0.5 * gravity * t * t);
      rockRef.current.position.x = x;
      rockRef.current.position.y = y;

      if (t > 0.2 && y <= 0.02) {
        throwTimeRef.current = 0;
      }
    }
  });

  return (
    <group>
      {/* Planetary Surface Terrain Plane */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color={terrainColor} roughness={0.9} />
      </mesh>

      {/* Grid Guide Marks */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 8]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Height Measurement Tower (0 to 3 meters) */}
      <group position={[-1.2, 1.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 3.0, 8]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
        {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((h) => (
          <mesh key={h} position={[0.1, h - 1.5, 0]}>
            <boxGeometry args={[0.18, 0.02, 0.02]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
        ))}
      </group>

      {/* Astronaut Character Model */}
      <group ref={astronautRef} position={[-0.4, 0, 0]}>
        {/* Boots */}
        <mesh position={[-0.12, 0.1, 0]}>
          <boxGeometry args={[0.14, 0.18, 0.22]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.12, 0.1, 0]}>
          <boxGeometry args={[0.14, 0.18, 0.22]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.12, 0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.38, 12]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>
        <mesh position={[0.12, 0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.38, 12]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[0.38, 0.42, 0.26]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>

        {/* PLSS Backpack */}
        <mesh position={[0, 0.75, -0.18]}>
          <boxGeometry args={[0.32, 0.38, 0.16]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.4} />
        </mesh>

        {/* Helmet */}
        <mesh position={[0, 1.04, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 1.04, 0.09]}>
          <sphereGeometry args={[0.14, 16, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Ballistic Rock Projectile */}
      <mesh ref={rockRef} position={[-0.4, 0.8, 0]}>
        <dodecahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color="#78716C" roughness={0.9} />
      </mesh>
    </group>
  );
}

export const PlanetaryGravity3D: React.FC = () => {
  const [selectedBodyKey, setSelectedBodyKey] = useState<string>('Mars');
  const [isJumping, setIsJumping] = useState(false);
  const [isThrowing, setIsThrowing] = useState(false);

  const activeBody = BODIES[selectedBodyKey] || BODIES.Mars;
  const v0 = 3.2; // m/s impulse
  const peakHeightM = (v0 * v0) / (2 * activeBody.gravityMps2);
  const hangTimeSec = (2 * v0) / activeBody.gravityMps2;

  const handleTriggerJump = () => {
    setIsJumping(true);
  };

  const handleTriggerThrow = () => {
    setIsThrowing(true);
    setTimeout(() => setIsThrowing(false), 4000);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#070D1A] border border-[#1E2E4A] shadow-2xl flex flex-col select-none">
      {/* Top Flex Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0B1528] to-[#070D1A] border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
                PLANETARY GRAVITY &amp; ATMOSPHERIC SIMULATOR
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                LESSON 02 3D LAB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kinematics • Parabolic Trajectories • Armstrong Limit Barometrics
            </p>
          </div>
        </div>

        {/* Planet Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(BODIES).map((k) => (
            <button
              key={k}
              onClick={() => {
                setSelectedBodyKey(k);
                setIsJumping(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBodyKey === k
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {BODIES[k].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="h-[480px] lg:h-[540px] w-full relative">
        <Canvas camera={{ position: [0, 1.8, 4.2], fov: 45 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 4]} intensity={1.2} />
          <directionalLight position={[-4, -2, -2]} intensity={0.3} color="#38BDF8" />
          <Stars radius={50} depth={30} count={2000} factor={2} fade speed={1} />

          <Suspense fallback={null}>
            <PhysicsSimulationScene
              gravity={activeBody.gravityMps2}
              isJumping={isJumping}
              onJumpComplete={() => setIsJumping(false)}
              isThrowing={isThrowing}
              terrainColor={activeBody.terrainColor}
            />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2.5}
            maxDistance={8.0}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Canvas>

        {/* Physics Telemetry HUD Overlay (Top-Left) */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-2xl p-4 shadow-xl min-w-[240px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
              GRAVITATIONAL KINEMATICS
            </span>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-bold text-cyan-300">
                {activeBody.gravityMps2.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400">m / s²</span>
              <span className="text-[10px] font-mono text-slate-500">
                ({(activeBody.gravityMps2 / 9.81).toFixed(2)}g)
              </span>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">JUMP PEAK:</span>
                <span className="text-emerald-400 font-bold">{peakHeightM.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">HANG TIME:</span>
                <span className="text-amber-400 font-bold">{hangTimeSec.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PRESSURE:</span>
                <span className="text-slate-200">
                  {activeBody.pressureKpa < 0.001
                    ? '<0.001 kPa'
                    : `${activeBody.pressureKpa.toFixed(2)} kPa`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ATMOSPHERE:</span>
                <span className="text-cyan-300 truncate max-w-[120px]">
                  {activeBody.atmosphereName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Action Control Toolbar (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-wrap items-center gap-2">
          <button
            onClick={handleTriggerJump}
            disabled={isJumping}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg ${
              isJumping
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
            {isJumping ? 'IN HANG TIME...' : 'EXECUTE JUMP TEST'}
          </button>

          <button
            onClick={handleTriggerThrow}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            THROW ROCK PROJECTILE
          </button>
        </div>
      </div>
    </div>
  );
};
