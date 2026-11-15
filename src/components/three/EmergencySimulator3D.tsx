import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  AlertTriangle,
  Flame,
  Wind,
  Shield,
  Zap,
  Activity,
  Rocket,
  Sun,
  Lock,
  Unlock,
} from 'lucide-react';
import type { EmergencyScenario } from '../../types/training';

interface EmergencySimulator3DProps {
  scenario: EmergencyScenario | null;
  onSelectCompartment?: (compartment: string) => void;
}

// Particle effect for active hazard
function HazardParticles({ emergencyType, active }: { emergencyType: string; active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 350;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      if (emergencyType === 'PRESSURE_LOSS') {
        array[i * 3 + 2] += 2.5 * delta;
        if (array[i * 3 + 2] > 2.5) array[i * 3 + 2] = 0;
      } else if (emergencyType === 'FIRE_SMOKE') {
        array[i * 3 + 1] += 0.5 * delta;
        if (array[i * 3 + 1] > 1.2) array[i * 3 + 1] = -0.5;
      } else if (emergencyType === 'RADIATION_EVENT') {
        array[i * 3] += 3.5 * delta;
        if (array[i * 3] > 3.0) array[i * 3] = -3.0;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  let particleColor = '#38BDF8';
  if (emergencyType === 'FIRE_SMOKE') particleColor = '#94A3B8';
  else if (emergencyType === 'OXYGEN_LEAK') particleColor = '#F59E0B';
  else if (emergencyType === 'RADIATION_EVENT') particleColor = '#FBBF24';

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={particleColor}
        transparent
        opacity={0.7}
        blending={emergencyType === 'FIRE_SMOKE' ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

function MultiModuleHabitat({
  scenario,
  selectedCompartment,
  onSelectCompartment,
}: {
  scenario: EmergencyScenario | null;
  selectedCompartment: string;
  onSelectCompartment: (c: string) => void;
}) {
  const emergencyType = scenario?.emergencyType || 'PRESSURE_LOSS';
  const hatchSealed = scenario?.systemStatus?.isolationHatchClosed ?? false;
  const alarmActive = scenario?.systemStatus?.masterAlarmActive ?? true;

  return (
    <group>
      {/* 1. NODE 2 (Harmony) - Left Module */}
      <group
        position={[-2.4, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCompartment('Node 2');
        }}
      >
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.0, 1.0, 1.8, 24, 1, true]} />
          <meshStandardMaterial
            color={
              selectedCompartment === 'Node 2'
                ? '#0284C7'
                : emergencyType === 'PRESSURE_LOSS' && !hatchSealed
                ? '#EF4444'
                : '#1E293B'
            }
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Endcap Bulkhead */}
        <mesh position={[-0.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[1.0, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Module Label Beacon */}
        {emergencyType === 'PRESSURE_LOSS' && alarmActive && (
          <pointLight position={[0, 0.6, 0]} color="#EF4444" intensity={2.0} distance={3} />
        )}
      </group>

      {/* Bulkhead Hatch 1 (between Node 2 & Destiny) */}
      <group position={[-1.5, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.5, 1.05, 20]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh
          position={[0, hatchSealed ? 0 : 0.6, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <circleGeometry args={[0.48, 20]} />
          <meshStandardMaterial
            color={hatchSealed ? '#10B981' : '#F59E0B'}
            metalness={0.7}
          />
        </mesh>
      </group>

      {/* 2. DESTINY LABORATORY - Center Module */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCompartment('Destiny Lab');
        }}
      >
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.0, 1.0, 2.0, 24, 1, true]} />
          <meshStandardMaterial
            color={
              selectedCompartment === 'Destiny Lab'
                ? '#0284C7'
                : emergencyType === 'FIRE_SMOKE' || emergencyType === 'OXYGEN_LEAK'
                ? '#DC2626'
                : '#0F172A'
            }
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Internal Equipment Racks */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[1.6, 0.4, 0.8]} />
          <meshStandardMaterial color="#1E293B" metalness={0.6} />
        </mesh>
        {/* Fire / Smoke Visual Light */}
        {emergencyType === 'FIRE_SMOKE' && (
          <pointLight position={[0, 0.2, 0]} color="#F97316" intensity={2.5} distance={3} />
        )}
      </group>

      {/* Bulkhead Hatch 2 (between Destiny & Node 1) */}
      <group position={[1.0, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.5, 1.05, 20]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh
          position={[0, hatchSealed ? 0 : 0.6, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <circleGeometry args={[0.48, 20]} />
          <meshStandardMaterial color={hatchSealed ? '#10B981' : '#F59E0B'} />
        </mesh>
      </group>

      {/* 3. NODE 1 (Unity / Core) - Right Module */}
      <group
        position={[2.0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCompartment('Node 1');
        }}
      >
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.0, 1.0, 1.8, 24, 1, true]} />
          <meshStandardMaterial
            color={selectedCompartment === 'Node 1' ? '#0284C7' : '#1E293B'}
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Endcap Bulkhead */}
        <mesh position={[0.9, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[1.0, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      </group>

      {/* 4. DOCKED EMERGENCY RETURN CAPSULE (Attached to Node 2) */}
      <group position={[-3.8, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.7, 1.3, 20]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.3} roughness={0.3} />
        </mesh>
        {/* Docking Ring */}
        <mesh position={[0.65, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.35, 0.55, 16]} />
          <meshStandardMaterial color="#64748B" metalness={0.9} />
        </mesh>
      </group>

      {/* Active Hazard Particles */}
      <HazardParticles emergencyType={emergencyType} active={true} />
    </group>
  );
}

export const EmergencySimulator3D: React.FC<EmergencySimulator3DProps> = ({
  scenario,
  onSelectCompartment,
}) => {
  const [selectedCompartment, setSelectedCompartment] = useState('Destiny Lab');

  const handleSelect = (c: string) => {
    setSelectedCompartment(c);
    onSelectCompartment?.(c);
  };

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden bg-[#030712] border border-[#1E2E4A] shadow-2xl">
      <Canvas camera={{ position: [0, 2.8, 5.8], fov: 45 }}>
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 8, 4]} intensity={1.2} />
        <directionalLight position={[-6, -4, -2]} intensity={0.3} color="#38BDF8" />
        <Stars radius={60} depth={40} count={2500} factor={2} fade speed={1} />

        <Suspense fallback={null}>
          <MultiModuleHabitat
            scenario={scenario}
            selectedCompartment={selectedCompartment}
            onSelectCompartment={handleSelect}
          />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>

      {/* Top Left Compartment Indicator */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-[#0B1528]/90 backdrop-blur-md border border-[#1E2E4A] rounded-xl p-3 shadow-xl">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
            SELECTED COMPARTMENT
          </span>
          <span className="text-sm font-bold text-cyan-300 font-mono block mt-0.5">
            {selectedCompartment.toUpperCase()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Click module shell or use Flight Control HUD
          </span>
        </div>
      </div>
    </div>
  );
};
