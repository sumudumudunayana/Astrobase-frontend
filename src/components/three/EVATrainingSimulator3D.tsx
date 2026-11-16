import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface WorksiteObjective {
  id: string;
  name: string;
  position: [number, number, number];
  isCompleted: boolean;
  type: 'oru' | 'antenna' | 'radiator';
}

interface EVATrainingSimulator3DProps {
  astronautPos: [number, number, number];
  onMoveAstronaut: (dx: number, dy: number, dz: number) => void;
  activeTargetId: string | null;
  onSelectTarget: (id: string) => void;
  worksites: WorksiteObjective[];
  tetherTension: number;
  saferActive: boolean;
}

function EarthBackdrop() {
  const earthRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group position={[0, -26, -18]}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[20, 64, 64]} />
        <meshStandardMaterial color="#173F6E" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Atmosphere rim */}
      <mesh scale={[1.025, 1.025, 1.025]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function SpaceStationTruss() {
  return (
    <group position={[-5, 0, 0]}>
      {/* Quest Airlock Module */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 4.0, 32]} />
        <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Outer Egress Hatch Ring */}
      <mesh position={[2.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.9, 0.08, 16, 32]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} />
      </mesh>

      {/* Long Integrated Truss Segment */}
      <group position={[6.0, 0, -1.2]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[1.2, 14.0, 1.2]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.9}
            roughness={0.2}
            wireframe={false}
          />
        </mesh>
        {/* Yellow Handrail Guide along truss */}
        <mesh position={[0, 0, 0.65]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 13.5, 16]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.4} />
        </mesh>
      </group>

      {/* Solar Array Wings */}
      <group position={[12.0, 2.5, -2.5]} rotation={[0.4, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 6.0, 0.1]} />
          <meshStandardMaterial color="#0B2A4A" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function DynamicSimulatorTether({
  anchorPos,
  astronautPos,
  tension,
}: {
  anchorPos: [number, number, number];
  astronautPos: [number, number, number];
  tension: number;
}) {
  const points: THREE.Vector3[] = [];
  const segments = 16;
  const sag = Math.max(0.05, 0.5 - tension * 0.012);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = anchorPos[0] + (astronautPos[0] - anchorPos[0]) * t;
    const y = anchorPos[1] + (astronautPos[1] - anchorPos[1]) * t - Math.sin(t * Math.PI) * sag;
    const z = anchorPos[2] + (astronautPos[2] - anchorPos[2]) * t;
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 24, 0.014, 8, false);

  const tetherColor = tension > 30 ? '#EF4444' : tension > 18 ? '#F59E0B' : '#FACC15';

  return (
    <mesh geometry={tubeGeometry}>
      <meshBasicMaterial color={tetherColor} />
    </mesh>
  );
}

function SimulatorAstronaut({
  position,
  saferActive,
}: {
  position: [number, number, number];
  saferActive: boolean;
}) {
  const astronautGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (astronautGroup.current && !saferActive) {
      // Gentle microgravity floating bob
      astronautGroup.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  return (
    <group ref={astronautGroup} position={position}>
      {/* Upper Torso */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.65, 0.6, 0.44]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>
      {/* Red stripes on upper arms for EV1 */}
      <mesh position={[-0.42, 0.7, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.55, 16]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>
      <mesh position={[-0.42, 0.78, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.08, 16]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
      <mesh position={[0.42, 0.7, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.55, 16]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>
      <mesh position={[0.42, 0.78, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.08, 16]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>

      {/* Helmet & Gold Visor */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.24, 20, 20]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.15, 0.12]} rotation={[0.1, 0, 0]}>
        <sphereGeometry args={[0.22, 20, 20, 0, Math.PI]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Legs & Boots */}
      <mesh position={[-0.16, -0.35, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.7, 16]} />
        <meshStandardMaterial color="#CBD5E1" />
      </mesh>
      <mesh position={[0.16, -0.35, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.7, 16]} />
        <meshStandardMaterial color="#CBD5E1" />
      </mesh>
      <mesh position={[-0.16, -0.75, 0.06]}>
        <boxGeometry args={[0.16, 0.12, 0.28]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0.16, -0.75, 0.06]}>
        <boxGeometry args={[0.16, 0.12, 0.28]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* PLSS Backpack */}
      <mesh position={[0, 0.7, -0.36]}>
        <boxGeometry args={[0.6, 0.78, 0.3]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.4} />
      </mesh>

      {/* SAFER Jetpack Unit */}
      <mesh position={[0, 0.26, -0.38]}>
        <boxGeometry args={[0.54, 0.22, 0.26]} />
        <meshStandardMaterial
          color={saferActive ? '#0284C7' : '#334155'}
          metalness={0.7}
        />
      </mesh>

      {/* Cold Gas Thruster Firing Flares */}
      {saferActive && (
        <>
          <pointLight position={[-0.3, 0.26, -0.4]} color="#38BDF8" intensity={3} distance={2.5} />
          <pointLight position={[0.3, 0.26, -0.4]} color="#38BDF8" intensity={3} distance={2.5} />
        </>
      )}

      {/* Chest Mounted Display & Control Module (DCM) */}
      <mesh position={[0, 0.72, 0.24]}>
        <boxGeometry args={[0.32, 0.24, 0.06]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
    </group>
  );
}

function WorksiteMarkers({
  worksites,
  activeTargetId,
  onSelectTarget,
}: {
  worksites: WorksiteObjective[];
  activeTargetId: string | null;
  onSelectTarget: (id: string) => void;
}) {
  return (
    <>
      {worksites.map((site) => {
        const isSelected = activeTargetId === site.id;
        return (
          <group key={site.id} position={site.position}>
            {/* 3D Model of the worksite target */}
            {site.type === 'oru' && (
              <mesh>
                <boxGeometry args={[0.9, 0.7, 0.5]} />
                <meshStandardMaterial
                  color={site.isCompleted ? '#10B981' : isSelected ? '#38BDF8' : '#F59E0B'}
                  metalness={0.8}
                />
              </mesh>
            )}
            {site.type === 'antenna' && (
              <group>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.4, 0.1, 0.5, 16]} />
                  <meshStandardMaterial
                    color={site.isCompleted ? '#10B981' : isSelected ? '#38BDF8' : '#818CF8'}
                    metalness={0.8}
                  />
                </mesh>
              </group>
            )}
            {site.type === 'radiator' && (
              <mesh>
                <boxGeometry args={[1.6, 0.8, 0.1]} />
                <meshStandardMaterial
                  color={site.isCompleted ? '#10B981' : isSelected ? '#38BDF8' : '#CBD5E1'}
                  metalness={0.9}
                />
              </mesh>
            )}

            {/* Interactive HTML Tag Marker */}
            <Html distanceFactor={14} center>
              <button
                onClick={() => onSelectTarget(site.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  site.isCompleted
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/80'
                    : isSelected
                    ? 'bg-cyan-500 text-black border border-cyan-200 scale-110 shadow-cyan-500/40'
                    : 'bg-space-900/90 text-space-200 border border-space-700 hover:border-cyan-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    site.isCompleted ? 'bg-emerald-400' : isSelected ? 'bg-black' : 'bg-amber-400'
                  }`}
                />
                {site.name}
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}

export const EVATrainingSimulator3D: React.FC<EVATrainingSimulator3DProps> = ({
  astronautPos,
  onMoveAstronaut,
  activeTargetId,
  onSelectTarget,
  worksites,
  tetherTension,
  saferActive,
}) => {
  // Setup keyboard event listeners for WASD translation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in text input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      const speed = 0.35;
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          onMoveAstronaut(0, 0, -speed);
          break;
        case 's':
        case 'arrowdown':
          onMoveAstronaut(0, 0, speed);
          break;
        case 'a':
        case 'arrowleft':
          onMoveAstronaut(-speed, 0, 0);
          break;
        case 'd':
        case 'arrowright':
          onMoveAstronaut(speed, 0, 0);
          break;
        case 'q':
          onMoveAstronaut(0, speed, 0);
          break;
        case 'e':
          onMoveAstronaut(0, -speed, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMoveAstronaut]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [2.5, 3.5, 8.0], fov: 45 }}
        className="w-full h-full bg-space-950"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 8, 5]} intensity={1.8} color="#FFFFFF" />
        <directionalLight position={[-6, -4, -4]} intensity={0.5} color="#38BDF8" />
        <Stars radius={120} depth={60} count={4000} factor={4} saturation={0} fade />

        <EarthBackdrop />
        <SpaceStationTruss />

        {/* Dynamic Safety Tether from Airlock Hatch [-2.98, 0, 0] to Astronaut */}
        <DynamicSimulatorTether
          anchorPos={[-2.98, 0, 0]}
          astronautPos={[astronautPos[0], astronautPos[1] + 0.22, astronautPos[2] - 0.28]}
          tension={tetherTension}
        />

        <SimulatorAstronaut position={astronautPos} saferActive={saferActive} />

        <WorksiteMarkers
          worksites={worksites}
          activeTargetId={activeTargetId}
          onSelectTarget={onSelectTarget}
        />

        <OrbitControls
          enablePan={true}
          minDistance={2.5}
          maxDistance={18.0}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
    </div>
  );
};

