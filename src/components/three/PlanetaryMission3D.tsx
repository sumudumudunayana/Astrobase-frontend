import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { RoverTelemetry, ScientificSample } from '../../types/training';

interface PlanetaryMission3DProps {
  telemetry: RoverTelemetry;
  samples: ScientificSample[];
  targetBody: 'Mars' | 'Moon' | string;
  isDrilling: boolean;
  drillProgress: number;
}

// 3D Mission Rover Representation
const MissionRover: React.FC<{
  telemetry: RoverTelemetry;
  isDrilling: boolean;
  drillProgress: number;
}> = ({ telemetry, isDrilling, drillProgress }) => {
  const roverRef = useRef<THREE.Group>(null);
  const drillBitRef = useRef<THREE.Mesh>(null);
  const wheelsRef = useRef<(THREE.Group | null)[]>([]);
  const prevPosRef = useRef({ x: 0, z: 0 });
  const wheelAngleRef = useRef(0);
  const dustParticlesRef = useRef<THREE.Points>(null);

  const posX = telemetry.x ?? telemetry.positionX ?? 0;
  const posZ = telemetry.z ?? telemetry.positionZ ?? 0;
  const heading = telemetry.headingDeg ?? telemetry.headingDegrees ?? 0;

  useFrame((state, delta) => {
    if (roverRef.current) {
      // Smooth lerp to telemetry coordinates
      const currentX = roverRef.current.position.x;
      const currentZ = roverRef.current.position.z;
      roverRef.current.position.x = THREE.MathUtils.lerp(
        currentX,
        posX,
        0.1
      );
      roverRef.current.position.z = THREE.MathUtils.lerp(
        currentZ,
        posZ,
        0.1
      );
      roverRef.current.rotation.y = THREE.MathUtils.lerp(
        roverRef.current.rotation.y,
        (heading * Math.PI) / 180,
        0.1
      );

      // Distance moved calculation
      const dx = roverRef.current.position.x - prevPosRef.current.x;
      const dz = roverRef.current.position.z - prevPosRef.current.z;
      const dist = Math.hypot(dx, dz);
      prevPosRef.current = { x: roverRef.current.position.x, z: roverRef.current.position.z };

      if (dist > 0.0002) {
        wheelAngleRef.current += (dist / 0.24) * 4;
      }

      wheelsRef.current.forEach((wheel) => {
        if (wheel) {
          wheel.rotation.x = wheelAngleRef.current;
        }
      });
    }

    // High-speed coring drill spin and vibration
    if (drillBitRef.current && isDrilling) {
      drillBitRef.current.rotation.y += delta * 32;
      drillBitRef.current.position.x = (Math.random() - 0.5) * 0.008;
    }

    // Drill dust particle agitation
    if (dustParticlesRef.current && isDrilling) {
      const positions = dustParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.random() * 0.015;
        if (positions[i + 1] > 0.35) {
          positions[i + 1] = 0.02;
          positions[i] = (Math.random() - 0.5) * 0.2;
          positions[i + 2] = (Math.random() - 0.5) * 0.2;
        }
      }
      dustParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Prepare initial dust particle positions
  const dustCount = 45;
  const dustPositions = React.useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = Math.random() * 0.25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return pos;
  }, []);

  return (
    <group ref={roverRef} position={[posX, 0.45, posZ]}>
      {/* Central Equipment Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.6, 0.5, 2.2]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Gold foil under-deck */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.5, 0.1, 2.1]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* MMRTG Power Generator */}
      <group position={[0, 0.55, 1.3]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.26, 0.8, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      </group>

      {/* Remote Sensing Mast with NavCam */}
      <group position={[0.45, 0.6, -0.8]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.35, 0.2, 0.25]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {/* NavCam stereo lenses */}
        <mesh position={[-0.08, 1.2, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.08, 1.2, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Robotic Arm Turret with Coring Drill */}
      <group position={[-0.45, 0.35, -1.0]}>
        <mesh position={[0, 0, -0.3]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, -0.2, -0.6]}>
          <boxGeometry args={[0.25, 0.25, 0.3]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} />
        </mesh>
        {/* Drill bit extending down and spinning when drilling */}
        {isDrilling && (
          <group position={[0, -0.5 - (drillProgress / 100) * 0.3, -0.6]}>
            <mesh ref={drillBitRef}>
              <cylinderGeometry args={[0.04, 0.04, 0.4, 12]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} />
            </mesh>
            {/* Contact dust cloud during core drilling */}
            <points ref={dustParticlesRef} position={[0, -0.2, 0]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[dustPositions, 3]}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.035}
                color="#f59e0b"
                transparent
                opacity={0.8}
              />
            </points>
          </group>
        )}
      </group>

      {/* 6 Independent Wheels with Animated Rotation & Treads */}
      {[-0.85, 0.85].map((x, sideIdx) =>
        [-0.9, 0.1, 1.1].map((z, wheelIdx) => {
          const index = sideIdx * 3 + wheelIdx;
          return (
            <group
              key={`${sideIdx}-${wheelIdx}`}
              ref={(el) => {
                wheelsRef.current[index] = el;
              }}
              position={[x, 0, z]}
            >
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.24, 0.24, 0.22, 20]} />
                <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
              </mesh>
              {/* Visible Wheel Treads */}
              <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.05, 0.02, 0.2]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              <mesh position={[0, -0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.05, 0.02, 0.2]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>
          );
        })
      )}

      {/* High-Gain Comms Antenna */}
      <mesh position={[-0.4, 0.7, 0.4]} rotation={[-0.3, 0.2, 0]}>
        <cylinderGeometry args={[0.26, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
};

// Surface Terrain with Crater Formations and Science Targets
const MissionSurfaceTerrain: React.FC<{
  targetBody: 'Mars' | 'Moon';
  samples: ScientificSample[];
}> = ({ targetBody, samples }) => {
  const isMars = targetBody === 'Mars';
  const groundColor = isMars ? '#994d22' : '#78716c';

  return (
    <group>
      {/* Planetary ground surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[45, 45, 48, 48]} />
        <meshStandardMaterial color={groundColor} roughness={0.9} />
      </mesh>

      {/* Natural Craters */}
      <mesh position={[6, 0.05, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 3.5, 32]} />
        <meshStandardMaterial color={isMars ? '#7c2d12' : '#57534e'} />
      </mesh>
      <mesh position={[-8, 0.05, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 2.8, 32]} />
        <meshStandardMaterial color={isMars ? '#7c2d12' : '#57534e'} />
      </mesh>

      {/* Boulder obstacles */}
      <mesh position={[3, 0.25, -2]} castShadow>
        <dodecahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color={isMars ? '#5c1d0a' : '#44403c'} roughness={0.9} />
      </mesh>
      <mesh position={[-3.5, 0.35, -4]} castShadow>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color={isMars ? '#5c1d0a' : '#44403c'} roughness={0.9} />
      </mesh>
      <mesh position={[2, 0.2, 5]} castShadow>
        <dodecahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color={isMars ? '#5c1d0a' : '#44403c'} roughness={0.9} />
      </mesh>

      {/* Scientific Drill Target Beacons */}
      {samples.map((sample, idx) => {
        const coords = sample.locationCoords || [(idx % 2 === 0 ? 4 : -4), (idx * 3 - 3)];
        const sampleLabel = sample.targetName || sample.sampleName || `Sample ${idx + 1}`;
        const collected = !!sample.isCollected;

        return (
          <group
            key={sample.sampleId || idx}
            position={[coords[0], 0, coords[1]]}
          >
            {/* Target Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
              <ringGeometry args={[0.3, 0.5, 24]} />
              <meshBasicMaterial
                color={collected ? '#10b981' : '#38bdf8'}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Target Rock Outcrop */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <dodecahedronGeometry args={[0.35, 1]} />
              <meshStandardMaterial
                color={collected ? '#10b981' : '#f59e0b'}
                emissive={collected ? '#047857' : '#b45309'}
                emissiveIntensity={0.4}
              />
            </mesh>
            {/* Beacon Text Label */}
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.25}
              color={collected ? '#34d399' : '#38bdf8'}
              anchorX="center"
            >
              {sampleLabel.split(' ')[0]}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export const PlanetaryMission3D: React.FC<PlanetaryMission3DProps> = ({
  telemetry,
  samples,
  targetBody,
  isDrilling,
  drillProgress,
}) => {
  const posX = telemetry.x ?? telemetry.positionX ?? 0;
  const posZ = telemetry.z ?? telemetry.positionZ ?? 0;

  return (
    <div className="relative w-full h-[520px] bg-[#030712] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [posX, 6, posZ + 8], fov: 46 }}>
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 8]} intensity={1.7} castShadow />
        <directionalLight
          position={[-10, 5, -5]}
          intensity={0.3}
          color={targetBody === 'Mars' ? '#ea580c' : '#38bdf8'}
        />
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade />

        <Suspense fallback={null}>
          <MissionRover
            telemetry={telemetry}
            isDrilling={isDrilling}
            drillProgress={drillProgress}
          />
          <MissionSurfaceTerrain targetBody={targetBody === 'Mars' ? 'Mars' : 'Moon'} samples={samples} />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3.5}
          maxDistance={25}
          target={[posX, 0.5, posZ]}
        />
      </Canvas>
    </div>
  );
};
