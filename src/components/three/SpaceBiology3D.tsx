import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sun,
  Layers,
  Leaf,
  Activity,
} from 'lucide-react';

function PlantHabitatScene({
  isMicrogravity,
  isLedLightOn,
  zoomCellView,
}: {
  isMicrogravity: boolean;
  isLedLightOn: boolean;
  zoomCellView: boolean;
}) {
  const rootMesh = useRef<THREE.Group>(null);
  const amyloplastGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Statolith motion inside columella cell
    if (amyloplastGroup.current) {
      if (isMicrogravity) {
        amyloplastGroup.current.children.forEach((p, idx) => {
          p.position.y = Math.sin(state.clock.elapsedTime * 1.5 + idx) * 0.15;
          p.position.x = Math.cos(state.clock.elapsedTime * 1.2 + idx) * 0.15;
        });
      } else {
        // Sediment tightly onto cell basal membrane
        amyloplastGroup.current.children.forEach((p, idx) => {
          p.position.y = -0.32 + (idx % 2) * 0.06;
          p.position.x = ((idx % 3) - 1) * 0.12;
        });
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {!zoomCellView ? (
        /* ========================================================
           FULL SEEDLING IN ADVANCED PLANT HABITAT (APH)
           ======================================================== */
        <group>
          {/* Transparent Acrylic Growth Cassette */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3.2, 3.4, 0.4]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.15}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>

          {/* Agar Nutrient Substrate Layer */}
          <mesh position={[0, -0.6, -0.05]}>
            <boxGeometry args={[3.0, 2.0, 0.25]} />
            <meshStandardMaterial color="#064e3b" transparent opacity={0.6} roughness={0.6} />
          </mesh>

          {/* Overhead LED Growth Lighting Array */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[3.0, 0.1, 0.5]} />
            <meshStandardMaterial
              color={isLedLightOn ? '#f43f5e' : '#334155'}
              emissive={isLedLightOn ? '#f43f5e' : '#000000'}
              emissiveIntensity={isLedLightOn ? 1.0 : 0}
            />
          </mesh>
          {isLedLightOn && (
            <pointLight position={[0, 1.4, 0.3]} intensity={2.5} distance={3.5} color="#fb7185" />
          )}

          {/* Arabidopsis Seedling Central Hub */}
          <group position={[0, 0.3, 0.05]}>
            {/* Seed Coat Kernel */}
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>

            {/* Vegetative Shoots & Green Cotyledon Leaves */}
            <group position={[0, 0.1, 0]}>
              <mesh position={[-0.15, 0.12, 0]} rotation={[0, 0, -0.4]}>
                <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
                <meshStandardMaterial color="#22c55e" />
              </mesh>
              <mesh position={[-0.24, 0.24, 0]} rotation={[0, 0, -0.5]}>
                <sphereGeometry args={[0.09, 12, 8]} scale={[1.4, 0.3, 1]} />
                <meshStandardMaterial color="#16a34a" />
              </mesh>

              <mesh position={[0.15, 0.12, 0]} rotation={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
                <meshStandardMaterial color="#22c55e" />
              </mesh>
              <mesh position={[0.24, 0.24, 0]} rotation={[0, 0, 0.5]}>
                <sphereGeometry args={[0.09, 12, 8]} scale={[1.4, 0.3, 1]} />
                <meshStandardMaterial color="#16a34a" />
              </mesh>
            </group>

            {/* Root System (Gravitropic Downward vs Microgravity Skewed) */}
            <group ref={rootMesh}>
              {isMicrogravity ? (
                /* Waved, skewed root trajectory */
                <group>
                  <mesh position={[0.1, -0.25, 0]} rotation={[0, 0, -0.5]}>
                    <cylinderGeometry args={[0.03, 0.035, 0.5, 8]} />
                    <meshStandardMaterial color="#fef08a" />
                  </mesh>
                  <mesh position={[0.3, -0.65, 0]} rotation={[0, 0, 0.3]}>
                    <cylinderGeometry args={[0.025, 0.03, 0.55, 8]} />
                    <meshStandardMaterial color="#fef08a" />
                  </mesh>
                  <mesh position={[0.45, -1.05, 0]} rotation={[0, 0, -0.4]}>
                    <cylinderGeometry args={[0.018, 0.025, 0.5, 8]} />
                    <meshStandardMaterial color="#fef08a" />
                  </mesh>
                  <Html center position={[0.65, -1.1, 0]} className="pointer-events-none select-none whitespace-nowrap">
                    <div className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-[10px] font-mono font-bold text-amber-300">
                      Circumnutational Skewing (46°)
                    </div>
                  </Html>
                </group>
              ) : (
                /* Strict 1G downward gravitropic root */
                <group>
                  <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 0.6, 8]} />
                    <meshStandardMaterial color="#fef08a" />
                  </mesh>
                  <mesh position={[0, -0.85, 0]}>
                    <cylinderGeometry args={[0.028, 0.035, 0.6, 8]} />
                    <meshStandardMaterial color="#fef08a" />
                  </mesh>
                  <mesh position={[0, -1.35, 0]}>
                    <cylinderGeometry args={[0.02, 0.028, 0.5, 8]} />
                    <meshStandardMaterial color="#fef08a" />
                  </mesh>
                  <Html center position={[0.65, -1.35, 0]} className="pointer-events-none select-none whitespace-nowrap">
                    <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono font-bold text-emerald-300">
                      Positive Gravitropism (+89.8°)
                    </div>
                  </Html>
                </group>
              )}
            </group>
          </group>
        </group>
      ) : (
        /* ========================================================
           MICROSCOPIC CROSS-SECTION: ROOT CAP COLUMELLA CELL
           ======================================================== */
        <group>
          {/* Cell Membrane & Cell Wall */}
          <mesh>
            <boxGeometry args={[2.4, 1.8, 1.2]} />
            <meshStandardMaterial color="#0f766e" transparent opacity={0.35} wireframe={false} />
          </mesh>
          <mesh>
            <boxGeometry args={[2.42, 1.82, 1.22]} />
            <meshBasicMaterial color="#2dd4bf" wireframe />
          </mesh>

          {/* Central Nucleus */}
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial color="#6366f1" transparent opacity={0.8} />
          </mesh>
          <Html center position={[0, 0.75, 0]} className="pointer-events-none select-none whitespace-nowrap">
            <div className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
              Cell Nucleus
            </div>
          </Html>

          {/* Starch-Filled Statoliths (Amyloplasts) */}
          <group ref={amyloplastGroup}>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[((i % 3) - 1) * 0.3, -0.3, 0]}>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshStandardMaterial color="#eab308" roughness={0.3} />
              </mesh>
            ))}
          </group>

          {/* Statolith State Text */}
          <Html center position={[0, -1.15, 0]} className="pointer-events-none select-none whitespace-nowrap">
            <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isMicrogravity
                ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
            }`}>
              {isMicrogravity
                ? 'STATOLITHS FLOATING // ZERO SEDIMENTATION PRESSURE'
                : 'STATOLITHS SEDIMENTED ON BASAL MEMBRANE // AUXIN EFFLUX ACTIVE'}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

export const SpaceBiology3D: React.FC = () => {
  const [isMicrogravity, setIsMicrogravity] = useState(true);
  const [isLedLightOn, setIsLedLightOn] = useState(true);
  const [zoomCellView, setZoomCellView] = useState(false);

  return (
    <div className="w-full rounded-2xl bg-[#050b14] border border-cyan-800/40 p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              EXP-04 // ADVANCED PLANT HABITAT (APH)
            </span>
            <span className="text-xs font-mono text-slate-400">
              Arabidopsis thaliana Gravitropism & Statolith Biomechanics
            </span>
          </div>
          <h3 className="text-base font-bold text-white font-mono tracking-wide">
            Root Gravitropism, Shoot Phototropism & Cellular Amyloplast Sensing
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-cyan-300 border border-cyan-800/60">
            Agar Nutrient: Murashige-Skoog
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0b1526] text-emerald-400 border border-emerald-800/60">
            RH: 70% // Temp: 22.5°C
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-xl bg-gradient-to-b from-[#020610] to-[#07111f] border border-slate-800 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 4.4], fov: 48 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} color="#bae6fd" />
          <Suspense fallback={null}>
            <PlantHabitatScene
              isMicrogravity={isMicrogravity}
              isLedLightOn={isLedLightOn}
              zoomCellView={zoomCellView}
            />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} minDistance={2.0} maxDistance={7.0} />
        </Canvas>

        {/* Live Botanical Status Overlay */}
        <div className="absolute top-3 left-3 bg-[#07111f]/90 border border-cyan-800/80 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-300 backdrop-blur pointer-events-none">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            PHYSIOLOGICAL TELEMETRY
          </div>
          <div>Gravity Regime: <span className="text-white font-bold">{isMicrogravity ? 'Microgravity (10^-4 g)' : 'Terrestrial (1.0 g)'}</span></div>
          <div>Root Orientation: <span className={isMicrogravity ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{isMicrogravity ? 'Circumnutational Waving (46° skew)' : 'Strict Orthogonal (+89.8°)'}</span></div>
          <div>Amyloplast Status: <span className="text-cyan-300 font-bold">{isMicrogravity ? 'Suspended in Cytosol' : 'Sedimented Basally (Auxin Flow Active)'}</span></div>
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded border border-slate-800">
          DRAG TO ROTATE // SCROLL TO ZOOM
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-cyan-400 font-semibold block uppercase">
            1. Gravity Environment
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsMicrogravity(true)}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                isMicrogravity ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40' : 'bg-[#0f1b2d] text-slate-300'
              }`}
            >
              Microgravity (ISS)
            </button>
            <button
              onClick={() => setIsMicrogravity(false)}
              className={`py-2 px-2 rounded text-xs font-mono font-semibold transition-all ${
                !isMicrogravity ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40' : 'bg-[#0f1b2d] text-slate-300'
              }`}
            >
              Ground (1.0g)
            </button>
          </div>
        </div>

        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-amber-400 font-semibold block uppercase">
            2. Illumination Array
          </span>
          <button
            onClick={() => setIsLedLightOn(!isLedLightOn)}
            className={`w-full py-2 px-3 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isLedLightOn ? 'bg-rose-700 text-white' : 'bg-[#0f1b2d] text-slate-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{isLedLightOn ? 'Photoperiod LEDs: ACTIVE' : 'Photoperiod LEDs: DARK'}</span>
          </button>
        </div>

        <div className="bg-[#081220] border border-slate-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-mono text-purple-400 font-semibold block uppercase">
            3. Microscopic Inspection
          </span>
          <button
            onClick={() => setZoomCellView(!zoomCellView)}
            className={`w-full py-2 px-3 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
              zoomCellView ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40' : 'bg-[#0f1b2d] text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{zoomCellView ? 'View: Columella Cell (Zoomed)' : 'View: Macro Seedling Cassette'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
