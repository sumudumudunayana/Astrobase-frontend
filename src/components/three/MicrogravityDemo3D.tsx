import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Info, Sparkles, Scale, Compass } from 'lucide-react';

interface GravityMode {
  id: string;
  name: string;
  gValue: number; // m/s^2
  relativeG: string;
  color: string;
  description: string;
}

const GRAVITY_MODES: GravityMode[] = [
  {
    id: 'microgravity',
    name: 'Microgravity (LEO)',
    gValue: 0.0,
    relativeG: '10⁻⁶ g',
    color: '#42D9F5',
    description: 'Continuous orbital free fall. Spacecraft and contents accelerate together toward Earth at 8.9 m/s², canceling normal contact force (N = 0).',
  },
  {
    id: 'moon',
    name: 'Lunar Surface',
    gValue: 1.62,
    relativeG: '0.166 g',
    color: '#94A3B8',
    description: 'One-sixth of Earth gravity. Objects fall slowly, allowing high-bounding human locomotion and low floor impact energy.',
  },
  {
    id: 'mars',
    name: 'Martian Surface',
    gValue: 3.72,
    relativeG: '0.376 g',
    color: '#F5B942',
    description: 'Roughly 38% of Earth gravity. Sufficient to settle fluids and loose dust, easing atmospheric convection.',
  },
  {
    id: 'earth',
    name: 'Earth (Sea Level)',
    gValue: 9.81,
    relativeG: '1.0 g',
    color: '#10B981',
    description: 'Standard 1 g terrestrial baseline. Objects rapidly drop to the floor deck and remain firmly grounded.',
  },
];

// Spacecraft Cabin Model
function SpacecraftCabin() {
  return (
    <group>
      {/* Outer Hull Cylindrical Section */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 4.5, 32, 1, true]} />
        <meshStandardMaterial color="#0F172A" side={THREE.BackSide} roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Cabin Deck Floor */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[3.2, 0.1, 4.2]} />
        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Floor Deck Warning Stripes */}
      <mesh position={[0, -1.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 0.15]} />
        <meshStandardMaterial color="#F5B942" roughness={0.3} />
      </mesh>

      {/* Observation Cupola Window on back bulkhead */}
      <group position={[0, 0.2, -2.2]}>
        <mesh>
          <ringGeometry args={[0.9, 1.15, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glass looking out */}
        <mesh>
          <circleGeometry args={[0.9, 32]} />
          <meshStandardMaterial
            color="#42D9F5"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Exterior View of Earth through Cupola */}
      <mesh position={[0, 0.2, -5]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#1D4ED8" emissive="#0C4A6E" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

// Floating Items with Simulated Physics & Gravity
interface FloatingObjectProps {
  initialPos: [number, number, number];
  type: 'wrench' | 'tablet' | 'water' | 'canister';
  color: string;
  scale?: number;
  isPaused: boolean;
  gravity: number; // m/s^2
}

function FloatingObject({ initialPos, type, color, scale = 1, isPaused, gravity }: FloatingObjectProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const pos = useRef<THREE.Vector3>(new THREE.Vector3(...initialPos));
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const floorY = -1.7; // Cabin floor height

  useFrame((state, delta) => {
    if (!meshRef.current || isPaused) return;

    const t = state.clock.getElapsedTime();

    if (gravity === 0) {
      // Microgravity drift: smooth sinusoidal motion
      const driftX = Math.sin(t * 0.7 + initialPos[0] * 2) * 0.15;
      const driftY = Math.cos(t * 0.5 + initialPos[1] * 2) * 0.2;
      const driftZ = Math.sin(t * 0.6 + initialPos[2] * 2) * 0.1;

      meshRef.current.position.set(
        initialPos[0] + driftX,
        initialPos[1] + driftY,
        initialPos[2] + driftZ
      );

      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.z += delta * 0.2;

      // Keep pos in sync
      pos.current.copy(meshRef.current.position);
      velocity.current.set(0, 0, 0);
    } else {
      // Gravity acceleration down
      velocity.current.y -= gravity * 0.6 * delta;
      pos.current.addScaledVector(velocity.current, delta);

      // Bounce on floor
      if (pos.current.y <= floorY) {
        pos.current.y = floorY;
        velocity.current.y = -velocity.current.y * 0.35; // restitution bounce
        if (Math.abs(velocity.current.y) < 0.1) velocity.current.y = 0;
      }

      meshRef.current.position.copy(pos.current);
      // Gentle damping rotation when grounded
      if (pos.current.y <= floorY + 0.05) {
        meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, 0, 4, delta);
      } else {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.3;
      }
    }
  });

  return (
    <group ref={meshRef} position={initialPos} scale={scale}>
      {type === 'wrench' && (
        <group>
          <mesh>
            <boxGeometry args={[0.08, 0.65, 0.03]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {type === 'tablet' && (
        <group>
          <mesh>
            <boxGeometry args={[0.38, 0.5, 0.03]} />
            <meshStandardMaterial color="#0F172A" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.34, 0.44]} />
            <meshStandardMaterial color="#42D9F5" emissive="#0369A1" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {type === 'water' && (
        <mesh>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial
            color="#38BDF8"
            transparent
            opacity={0.7}
            roughness={0.05}
            metalness={0.1}
          />
        </mesh>
      )}

      {type === 'canister' && (
        <group>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.48, 24]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial color="#F5B942" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export const MicrogravityDemo3D: React.FC = () => {
  const [selectedGravityId, setSelectedGravityId] = useState<string>('microgravity');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);

  const activeMode = GRAVITY_MODES.find((m) => m.id === selectedGravityId) || GRAVITY_MODES[0];

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    setIsPaused(false);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Gravity Environment Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2E4A] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#94A3B8] mr-2 uppercase tracking-wider">
            ENVIRONMENT:
          </span>
          {GRAVITY_MODES.map((mode) => {
            const isSelected = mode.id === selectedGravityId;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedGravityId(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5] shadow-[0_0_12px_rgba(66,217,245,0.25)]'
                    : 'bg-[#111E32]/60 text-[#94A3B8] border border-[#1E2E4A] hover:bg-[#111E32] hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? mode.color : '#64748B' }}
                />
                <span>{mode.name}</span>
                <span className="text-[10px] opacity-70">({mode.relativeG})</span>
              </button>
            );
          })}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#111E32] border border-[#1E2E4A] text-white hover:border-[#42D9F5] transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-[#10B981]" /> : <Pause className="w-3.5 h-3.5 text-[#F5B942]" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#111E32] border border-[#1E2E4A] text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas + Physics Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 h-[540px] lg:h-[580px] rounded-xl relative border border-[#1E2E4A] bg-[#070D1A] overflow-hidden shadow-2xl">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#42D9F5] font-mono text-xs">CALCULATING ACCELERATION VECTORS...</div>}>
            <Canvas key={resetKey} camera={{ position: [0, 0, 3.8], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[0, 1.8, 0]} intensity={2.0} color="#FFFFFF" />
              <directionalLight position={[0, 0, -3]} intensity={0.6} color="#42D9F5" />
              <Stars radius={40} depth={20} count={1000} factor={3} saturation={0.5} fade />

              <SpacecraftCabin />

              {/* Floating Test Items */}
              <FloatingObject
                initialPos={[-0.8, 0.4, -0.4]}
                type="wrench"
                color="#CBD5E1"
                scale={0.9}
                isPaused={isPaused}
                gravity={activeMode.gValue}
              />
              <FloatingObject
                initialPos={[0.7, 0.6, -0.2]}
                type="tablet"
                color="#0284C7"
                scale={0.9}
                isPaused={isPaused}
                gravity={activeMode.gValue}
              />
              <FloatingObject
                initialPos={[-0.1, 0.1, 0.2]}
                type="water"
                color="#38BDF8"
                scale={1.0}
                isPaused={isPaused}
                gravity={activeMode.gValue}
              />
              <FloatingObject
                initialPos={[0.8, -0.3, 0.1]}
                type="canister"
                color="#E2E8F0"
                scale={0.9}
                isPaused={isPaused}
                gravity={activeMode.gValue}
              />

              <OrbitControls
                enablePan={false}
                minDistance={2.5}
                maxDistance={5.0}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI * 0.75}
              />
            </Canvas>
          </Suspense>

          {/* Telemetry Badge on Canvas */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1424]/90 border border-[#1E2E4A] font-mono text-xs">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: activeMode.color }}
            />
            <span className="text-white font-semibold">g = {activeMode.gValue.toFixed(2)} m/s²</span>
            <span className="text-[#94A3B8]">({activeMode.relativeG})</span>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none text-right font-mono text-[11px] text-[#42D9F5] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#42D9F5]/20 backdrop-blur-sm">
            <span>CABIN DYNAMICS // LEO 408 KM</span>
          </div>
        </div>

        {/* Physics & Educational Science Explanation (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
                GRAVITATIONAL DYNAMICS
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                style={{
                  backgroundColor: '#111E32',
                  borderColor: activeMode.color,
                  color: activeMode.color,
                }}
              >
                {activeMode.name}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Why Do Objects Float in Orbit?
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
              {activeMode.description}
            </p>

            {/* Scientific Formulas & Principles */}
            <div className="p-3.5 rounded-lg bg-[#0B1424] border border-[#1E2E4A] space-y-2.5 text-xs font-mono mb-4">
              <div className="flex items-center justify-between text-[#E2E8F0] border-b border-[#1E2E4A] pb-1.5">
                <span>Apparent Weight:</span>
                <span className="text-[#42D9F5] font-bold">W = m(g - a)</span>
              </div>
              <div className="flex items-center justify-between text-[#E2E8F0] border-b border-[#1E2E4A] pb-1.5">
                <span>Free Fall Condition:</span>
                <span className="text-[#F5B942] font-bold">a = g  ⟹  N = 0</span>
              </div>
              <div className="flex items-center justify-between text-[#E2E8F0]">
                <span>Earth Gravity at 400 km:</span>
                <span className="text-[#10B981] font-bold">~8.9 m/s² (89% of 1g)</span>
              </div>
            </div>

            {/* Astronaut Training Insights */}
            <div className="border-t border-[#1E2E4A] pt-3 text-xs text-[#94A3B8] space-y-2">
              <h4 className="font-mono text-[#42D9F5] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#42D9F5]" />
                Educational Takeaway for Trainees:
              </h4>
              <p className="leading-relaxed">
                "Zero gravity" is a scientific misnomer. Gravity does not shut off in space. The ISS, astronauts, and inside objects are in permanent free fall toward Earth, but because the station moves sideways at 27,600 km/h, the Earth's surface curves away at the same rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
