import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { WebGLFallback } from '../shared/WebGLFallback';

// Rotating Planet with Atmosphere Shader
function Planet() {
  const planetRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Planetary Body (Earth-like / Lunar aesthetic) */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshStandardMaterial
          color="#16325B"
          roughness={0.7}
          metalness={0.2}
          emissive="#0A192F"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Atmospheric Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.24, 48, 48]} />
        <meshStandardMaterial
          color="#E2F1E7"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric Halo Glow */}
      <mesh>
        <sphereGeometry args={[2.36, 32, 32]} />
        <meshBasicMaterial
          color="#42D9F5"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Orbiting Space Station / Modular Craft
function SpaceStation() {
  const orbitGroupRef = useRef<THREE.Group>(null!);
  const stationRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y += delta * 0.12;
      orbitGroupRef.current.rotation.z = Math.sin(orbitGroupRef.current.rotation.y * 0.5) * 0.15;
    }
    if (stationRef.current) {
      stationRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={orbitGroupRef}>
      <group ref={stationRef} position={[3.6, 0.4, 0]} scale={0.32}>
        {/* Main Pressurized Habitat Module */}
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.3, 2.2, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Cupola Observation Dome */}
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#42D9F5" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Service Truss Structure */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.12, 0.12]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Solar Array Wings - Left */}
        <mesh position={[-2.2, 0, 0]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[1.6, 0.7, 0.03]} />
          <meshStandardMaterial
            color="#1E3A8A"
            emissive="#1E40AF"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Solar Array Wings - Right */}
        <mesh position={[2.2, 0, 0]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[1.6, 0.7, 0.03]} />
          <meshStandardMaterial
            color="#1E3A8A"
            emissive="#1E40AF"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Radiator Panels & Beacon */}
        <pointLight color="#42D9F5" intensity={1.5} distance={3} />
      </group>
    </group>
  );
}

// Gentle Mouse Parallax Camera Controller
function CameraRig({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [prefersReducedMotion]);

  useFrame((state, delta) => {
    if (prefersReducedMotion) return;
    const targetX = mouse.current.x * 0.6;
    const targetY = mouse.current.y * 0.4 + 0.3;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2.5, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2.5, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export const HeroSpaceScene: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPrefersReducedMotion(true);
    }
  }, []);

  if (hasWebGL === false) {
    return (
      <WebGLFallback
        title="Orbital Command Fallback View"
        description="High-definition 3D rendering unavailable on this device. Displaying tactical 2D mission environment."
        heightClass="h-96"
      />
    );
  }

  return (
    <div className="w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden relative border border-[#1E2E4A]/80 bg-gradient-to-b from-[#050914] via-[#091322] to-[#050914] shadow-2xl">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#42D9F5] text-sm font-mono tracking-widest animate-pulse">INITIALIZING ORBITAL SIMULATION...</div>}>
        <Canvas
          camera={{ position: [0, 0.5, 6.2], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Ambient & Key Lights */}
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 4, 3]} intensity={1.6} color="#FFFFFF" castShadow />
          <directionalLight position={[-4, -2, -2]} intensity={0.4} color="#42D9F5" />
          <pointLight position={[0, -3, 2]} intensity={0.5} color="#628CFF" />

          {/* Deep Starfield */}
          <Stars radius={60} depth={30} count={3500} factor={4} saturation={0.5} fade speed={1.2} />

          {/* Planetary and Station Models */}
          <Planet />
          <SpaceStation />

          {/* Camera Parallax */}
          <CameraRig prefersReducedMotion={prefersReducedMotion} />
        </Canvas>
      </Suspense>

      {/* Overlay Telemetry HUD */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1424]/80 border border-[#42D9F5]/30 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
        <span className="text-xs font-mono text-[#42D9F5] tracking-wider uppercase">LEO ORBIT // 408 KM ALTITUDE</span>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none text-right font-mono text-[11px] text-[#94A3B8]/80 hidden sm:block">
        <p>ORBITAL VELOCITY: 7.66 KM/S</p>
        <p>INCLINATION: 51.64°</p>
      </div>
    </div>
  );
};

