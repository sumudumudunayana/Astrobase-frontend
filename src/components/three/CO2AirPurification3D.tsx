import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Flame,
  Filter,
  Activity,
  RotateCcw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Layers,
  Thermometer,
} from 'lucide-react';

interface ParticleProps {
  type: 'CO2' | 'PURIFIED';
  bedCycle: 'A_ADSORB' | 'B_ADSORB';
}

function DualAirStreamParticles({ type, bedCycle }: ParticleProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 60;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const x = -2.0 + t * 4.0;
      const spreadY = (Math.random() - 0.5) * 0.35;
      const spreadZ = (Math.random() - 0.5) * 0.35;
      pos[i * 3] = x;
      pos[i * 3 + 1] = (type === 'CO2' ? 0.35 : -0.35) + spreadY;
      pos[i * 3 + 2] = spreadZ;
    }
    return pos;
  }, [type]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      array[idx] += (type === 'CO2' ? 1.4 : 1.8) * delta;
      if (array[idx] > 2.0) {
        array[idx] = -2.0;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={type === 'CO2' ? '#F5B942' : '#42D9F5'}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const CO2AirPurification3D: React.FC = () => {
  const [bedCycle, setBedCycle] = useState<'A_ADSORB' | 'B_ADSORB'>('A_ADSORB');
  const [sabatierActive, setSabatierActive] = useState<boolean>(true);
  const [cabinCO2Ppm, setCabinCO2Ppm] = useState<number>(2400); // 2400 ppm ~ 1.8 mmHg
  const [activeComponent, setActiveComponent] = useState<string>('BED_A');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Derived calculations
  const bedATemp = bedCycle === 'A_ADSORB' ? 22 : 210; // °C (Adsorption at room temp, desorption heated)
  const bedBTemp = bedCycle === 'B_ADSORB' ? 22 : 210;
  const sabatierWaterProd = sabatierActive ? ((cabinCO2Ppm / 2400) * 0.38).toFixed(2) : '0.00'; // kg/hr

  const toggleCycle = () => {
    setBedCycle((prev) => (prev === 'A_ADSORB' ? 'B_ADSORB' : 'A_ADSORB'));
  };

  const handleResetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header telemetry summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B1424] rounded-xl border border-[#1E2E4A]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#42D9F5]" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            CDRA 4-BED MOLECULAR SIEVE & SABATIER SCRUBBER
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#94A3B8]">
            CABIN PCO2:{' '}
            <strong className={cabinCO2Ppm > 3800 ? 'text-[#EF4444]' : cabinCO2Ppm > 2800 ? 'text-[#F5B942]' : 'text-[#10B981]'}>
              {(cabinCO2Ppm * 0.00075).toFixed(2)} mmHg ({cabinCO2Ppm} ppm)
            </strong>
          </span>
          <span className="text-[#94A3B8]">
            CYCLE: <strong className="text-[#42D9F5]">{bedCycle === 'A_ADSORB' ? 'BED A ADSORB / BED B HEATED VENT' : 'BED B ADSORB / BED A HEATED VENT'}</strong>
          </span>
        </div>
      </div>

      {/* 3D Visualizer + Controller Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-8 relative h-[540px] lg:h-[600px] rounded-xl overflow-hidden bg-[#050914] border border-[#1E2E4A]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#42D9F5]">
                INITIALIZING CDRA 3D ENVIRONMENT...
              </div>
            }
          >
            <Canvas camera={{ position: [0, 2.2, 5.2], fov: 42 }}>
              <color attach="background" args={['#050914']} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 6, 3]} intensity={1.2} />
              <pointLight position={[-1.5, 1, 1]} intensity={bedCycle === 'B_ADSORB' ? 1.2 : 0.4} color="#F5B942" />
              <pointLight position={[1.5, 1, 1]} intensity={bedCycle === 'A_ADSORB' ? 1.2 : 0.4} color="#F5B942" />
              <Stars radius={40} depth={20} count={1000} factor={3} fade speed={0.4} />

              <group position={[0, -0.2, 0]}>
                {/* 1. Inflow Manifold & Moisture Pre-filters (Silica Gel / Zeolite 13X) */}
                <group position={[-3.0, 0, 0]}>
                  <mesh>
                    <cylinderGeometry args={[0.3, 0.3, 1.2, 24]} />
                    <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0, 0.15]}>
                    <ringGeometry args={[0.1, 0.28, 24]} />
                    <meshStandardMaterial color="#42D9F5" wireframe />
                  </mesh>
                  <Html position={[0, 0.95, 0]} center distanceFactor={8}>
                    <div className="bg-[#0B1424]/90 border border-[#42D9F5]/40 px-2 py-0.5 rounded text-[9px] font-mono text-[#42D9F5] whitespace-nowrap shadow-sm">
                      DESICCANT DRYER
                    </div>
                  </Html>
                </group>

                {/* 2. Sieve Bed A (Zeolite 5A) - Left Center */}
                <group
                  position={[-1.3, 0, 0]}
                  onClick={() => setActiveComponent('BED_A')}
                >
                  <mesh>
                    <cylinderGeometry args={[0.38, 0.38, 1.6, 24]} />
                    <meshStandardMaterial
                      color={activeComponent === 'BED_A' ? '#1E3A5F' : '#0F172A'}
                      metalness={0.8}
                      roughness={0.25}
                    />
                  </mesh>
                  {/* Heating element coil indicator around bed */}
                  <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 1.3, 24, 1, true]} />
                    <meshStandardMaterial
                      color={bedCycle === 'B_ADSORB' ? '#EF4444' : '#64748B'}
                      wireframe
                      emissive={bedCycle === 'B_ADSORB' ? '#EF4444' : '#000000'}
                      emissiveIntensity={bedCycle === 'B_ADSORB' ? 0.7 : 0}
                    />
                  </mesh>
                  <Html position={[0, 1.35, 0]} center distanceFactor={8}>
                    <div
                      className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap cursor-pointer border shadow-sm ${
                        bedCycle === 'A_ADSORB'
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                          : 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                      }`}
                    >
                      BED A // {bedCycle === 'A_ADSORB' ? 'ADSORBING' : '210°C BAKE'}
                    </div>
                  </Html>
                </group>

                {/* 3. Sieve Bed B (Zeolite 5A) - Right Center */}
                <group
                  position={[1.3, 0, 0]}
                  onClick={() => setActiveComponent('BED_B')}
                >
                  <mesh>
                    <cylinderGeometry args={[0.38, 0.38, 1.6, 24]} />
                    <meshStandardMaterial
                      color={activeComponent === 'BED_B' ? '#1E3A5F' : '#0F172A'}
                      metalness={0.8}
                      roughness={0.25}
                    />
                  </mesh>
                  {/* Heating element coil indicator around bed */}
                  <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 1.3, 24, 1, true]} />
                    <meshStandardMaterial
                      color={bedCycle === 'A_ADSORB' ? '#EF4444' : '#64748B'}
                      wireframe
                      emissive={bedCycle === 'A_ADSORB' ? '#EF4444' : '#000000'}
                      emissiveIntensity={bedCycle === 'A_ADSORB' ? 0.7 : 0}
                    />
                  </mesh>
                  <Html position={[0, 1.35, 0]} center distanceFactor={8}>
                    <div
                      className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap cursor-pointer border shadow-sm ${
                        bedCycle === 'B_ADSORB'
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                          : 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                      }`}
                    >
                      BED B // {bedCycle === 'B_ADSORB' ? 'ADSORBING' : '210°C BAKE'}
                    </div>
                  </Html>
                </group>

                {/* 4. Sabatier Carbon Dioxide Reduction Reactor - Far Right */}
                <group
                  position={[3.0, 0, 0]}
                  onClick={() => setActiveComponent('SABATIER')}
                >
                  <mesh>
                    <boxGeometry args={[0.8, 1.3, 0.7]} />
                    <meshStandardMaterial
                      color={activeComponent === 'SABATIER' ? '#1E3A5F' : '#111E32'}
                      metalness={0.7}
                      roughness={0.3}
                    />
                  </mesh>
                  {/* Ruthenium catalyst chamber core */}
                  <mesh position={[0, 0.1, 0.2]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
                    <meshStandardMaterial
                      color="#F59E0B"
                      metalness={0.9}
                      emissive={sabatierActive ? '#F59E0B' : '#000000'}
                      emissiveIntensity={sabatierActive ? 0.4 : 0}
                    />
                  </mesh>
                  <Html position={[0, 1.1, 0]} center distanceFactor={8}>
                    <div className="bg-[#0B1424]/90 border border-[#F5B942]/40 px-2 py-0.5 rounded text-[9px] font-mono text-[#F5B942] whitespace-nowrap shadow-sm">
                      SABATIER CORE
                    </div>
                  </Html>
                </group>

                {/* Animated Particles: Amber = CO2 Inflow, Cyan = Scrubbed Return */}
                <DualAirStreamParticles type="CO2" bedCycle={bedCycle} />
                <DualAirStreamParticles type="PURIFIED" bedCycle={bedCycle} />
              </group>

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={0.8}
                minDistance={2.5}
                maxDistance={7.0}
              />
            </Canvas>
          </Suspense>

          {/* Floating Controls Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#0B1424]/90 border border-[#1E2E4A] px-3 py-1.5 rounded-full backdrop-blur-md">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5 text-[#F5B942]" /> : <Play className="w-3.5 h-3.5" />}
              <span className="font-mono text-[11px]">{autoRotate ? 'TURNING' : 'ROTATE'}</span>
            </button>
            <span className="w-px h-3 bg-[#1E2E4A]" />
            <button
              onClick={handleResetCamera}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#42D9F5] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">RESET</span>
            </button>
          </div>

          <div className="absolute top-3 right-3 font-mono text-[10px] text-[#F5B942] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#F5B942]/20 backdrop-blur-sm pointer-events-none">
            CDRA / 4-BED ZEOLITE 5A
          </div>
        </div>

        {/* Interactive Controls & Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-4 rounded-xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
              <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                BED CYCLE CONTROLLER
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">VALVE INTERFACE</span>
            </div>

            {/* Cycle Flip Button */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#94A3B8] block">Molecular Sieve Cycle Switch:</span>
              <button
                onClick={toggleCycle}
                className="w-full py-2 px-3 rounded-lg bg-[#42D9F5]/20 border border-[#42D9F5] text-[#42D9F5] font-mono text-xs font-bold hover:bg-[#42D9F5]/30 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>FLIP ADSORB / DESORB BEDS</span>
              </button>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mt-2">
                <div className="p-2 rounded bg-[#0B1424] border border-[#1E2E4A]">
                  <span className="text-[#94A3B8] block">BED A TEMP</span>
                  <span className={bedCycle === 'A_ADSORB' ? 'text-[#10B981] font-bold' : 'text-[#EF4444] font-bold'}>
                    {bedATemp}°C ({bedCycle === 'A_ADSORB' ? 'Adsorbing' : 'Baking'})
                  </span>
                </div>
                <div className="p-2 rounded bg-[#0B1424] border border-[#1E2E4A]">
                  <span className="text-[#94A3B8] block">BED B TEMP</span>
                  <span className={bedCycle === 'B_ADSORB' ? 'text-[#10B981] font-bold' : 'text-[#EF4444] font-bold'}>
                    {bedBTemp}°C ({bedCycle === 'B_ADSORB' ? 'Adsorbing' : 'Baking'})
                  </span>
                </div>
              </div>
            </div>

            {/* Cabin CO2 Inflow Simulator */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Exhaled Cabin CO2 Level:</span>
                <span className="font-mono text-[#F5B942] font-bold">{cabinCO2Ppm} ppm</span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="200"
                value={cabinCO2Ppm}
                onChange={(e) => setCabinCO2Ppm(Number(e.target.value))}
                className="w-full accent-[#F5B942] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>1000 ppm (Nominal)</span>
                <span className="text-[#EF4444]">5000 ppm (Headache / Acidosis)</span>
              </div>
            </div>

            {/* Sabatier Loop Toggle */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E2E4A]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#F5B942]" />
                  Sabatier CO2 Reduction:
                </span>
                <button
                  onClick={() => setSabatierActive(!sabatierActive)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors ${
                    sabatierActive
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                      : 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                  }`}
                >
                  {sabatierActive ? 'ONLINE' : 'BYPASS'}
                </button>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Reacts CO2 + 4H2 → CH4 + 2H2O at 400°C over Ruthenium catalyst.
                Water Recovered: <strong className="text-[#42D9F5]">{sabatierWaterProd} kg/hr</strong>
              </p>
            </div>
          </div>

          {/* Subsystem Details Card */}
          <div className="glass-panel p-3.5 rounded-xl border border-[#1E2E4A] text-xs">
            <span className="font-mono text-[#42D9F5] block font-bold mb-1">
              ENGINEERING NOTE: {activeComponent}
            </span>
            {activeComponent === 'BED_A' || activeComponent === 'BED_B' ? (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Zeolite 5A Molecular Sieve:</strong> Synthetically created aluminosilicate crystal with exact 5-Angstrom pore windows that selectively physically trap CO2 molecules while allowing nitrogen and oxygen to pass through unhindered. Heated to ~210°C to release trapped CO2 to the space vacuum or Sabatier feed.
              </p>
            ) : (
              <p className="text-[#94A3B8] leading-relaxed">
                <strong>Sabatier Reactor:</strong> Without this reactor, venting captured CO2 into deep space loses irreversible amounts of oxygen atoms. By combining waste CO2 with OGA byproduct H2, water is regenerated and fed back into electrolysis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

