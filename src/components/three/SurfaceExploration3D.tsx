import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  Compass,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Activity,
  Shield,
  Layers,
  Battery,
  Wind,
  Clock,
  Eye,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

interface Waypoint {
  id: string;
  name: string;
  position: [number, number, number];
  elevationMeters: number;
  slopeDeg: number;
  scienceValue: string;
  sampleType: string;
  walkbackTimeMin: number;
}

const WAYPOINTS: Waypoint[] = [
  {
    id: 'base',
    name: 'Hab Alpha (Lander Base)',
    position: [0, 0.1, 0],
    elevationMeters: 0,
    slopeDeg: 1.2,
    scienceValue: 'Primary Habitation & Life Support Station',
    sampleType: 'Stationary Reference Core',
    walkbackTimeMin: 0,
  },
  {
    id: 'wp1',
    name: 'Waypoint 01 – Regolith Outcrop',
    position: [3.5, 0.35, 1.8],
    elevationMeters: 14,
    slopeDeg: 6.4,
    scienceValue: 'Basaltic boulder cluster from impact ejecta',
    sampleType: 'Anorthosite / Pyroxene Breccia',
    walkbackTimeMin: 18,
  },
  {
    id: 'wp2',
    name: 'Waypoint 02 – Crater Ridge Rim',
    position: [1.2, 0.9, -4.2],
    elevationMeters: 42,
    slopeDeg: 13.8,
    scienceValue: 'Subsurface stratigraphy exposed along crater scarp',
    sampleType: 'Impact Melt Breccia',
    walkbackTimeMin: 36,
  },
  {
    id: 'wp3',
    name: 'Waypoint 03 – Permanently Shadowed Depression',
    position: [-4.0, -0.4, -2.1],
    elevationMeters: -28,
    slopeDeg: 18.2, // Exceeds 15 deg safe rover limit
    scienceValue: 'Volatile-rich cryogenic trap with potential H2O ice',
    sampleType: 'Cryogenic Volatile Core',
    walkbackTimeMin: 52,
  },
  {
    id: 'wp4',
    name: 'Waypoint 04 – Olivine Mound',
    position: [-2.8, 0.2, 3.6],
    elevationMeters: 8,
    slopeDeg: 4.8,
    scienceValue: 'Mantle material uplifted during heavy bombardment',
    sampleType: 'Mantle Dunite / Olivine',
    walkbackTimeMin: 28,
  },
];

// 3D Terrain with Procedural Craters & Undulations
const SurfaceTerrain: React.FC<{
  overlayMode: 'topo' | 'slope' | 'multispectral';
}> = ({ overlayMode }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const getTerrainColor = () => {
    switch (overlayMode) {
      case 'slope':
        return '#f97316'; // Orange-amber thermal slope gradient
      case 'multispectral':
        return '#8b5cf6'; // Violet multispectral false-color
      default:
        return '#78716c'; // Natural lunar/Martian stone grey
    }
  };

  return (
    <group>
      {/* Base ground plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[26, 26, 64, 64]} />
        <meshStandardMaterial
          color={getTerrainColor()}
          wireframe={overlayMode !== 'topo'}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Primary Crater Depression */}
      <mesh position={[1.2, -0.1, -4.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 3.2, 32]} />
        <meshStandardMaterial
          color={overlayMode === 'slope' ? '#ef4444' : '#57534e'}
          wireframe={overlayMode !== 'topo'}
        />
      </mesh>

      {/* Permanently Shadowed Region Cold Trap */}
      <mesh position={[-4.0, -0.2, -2.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial
          color={overlayMode === 'multispectral' ? '#06b6d4' : '#1c1917'}
          roughness={1.0}
        />
      </mesh>

      {/* Walk-Back Safety Radius Limit Ring (7km equivalent scaled) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[6.4, 6.5, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Lander / Base Mesh
const BaseHabitat: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Central pressurized module */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 1.2, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Dome top */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Landing legs */}
      {[-0.7, 0.7].map((x, i) =>
        [-0.7, 0.7].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x * 1.1, 0.25, z * 1.1]}>
            <cylinderGeometry args={[0.04, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        ))
      )}
      {/* High-gain comms dish */}
      <mesh position={[0, 1.7, 0]} rotation={[0.4, 0, 0.2]}>
        <coneGeometry args={[0.4, 0.2, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
};

// Traversal Waypoint Marker
const WaypointPin: React.FC<{
  wp: Waypoint;
  isSelected: boolean;
  onSelect: (wp: Waypoint) => void;
}> = ({ wp, isSelected, onSelect }) => {
  const pinRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (pinRef.current) {
      pinRef.current.position.y = wp.position[1] + 0.3 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    }
  });

  const isDangerousSlope = wp.slopeDeg > 15;

  return (
    <group position={[wp.position[0], 0, wp.position[2]]} onClick={() => onSelect(wp)}>
      {/* Ground anchor beacon */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.1, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : isDangerousSlope ? '#ef4444' : '#10b981'}
        />
      </mesh>

      {/* Floating pin icon */}
      <group ref={pinRef}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.22, 0.5, 12]} />
          <meshStandardMaterial
            color={isSelected ? '#38bdf8' : isDangerousSlope ? '#f97316' : '#059669'}
            emissive={isSelected ? '#0284c7' : '#000000'}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial
            color={isSelected ? '#ffffff' : isDangerousSlope ? '#fecdd3' : '#a7f3d0'}
          />
        </mesh>
      </group>

      {/* Waypoint Label */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.28}
        color={isSelected ? '#38bdf8' : '#e2e8f0'}
        anchorX="center"
        anchorY="middle"
      >
        {wp.name.split(' – ')[0]}
      </Text>
    </group>
  );
};

// Traverse Route Renderer
const RouteLine: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
  return (
    <Line
      points={points}
      color="#38bdf8"
      lineWidth={3}
      dashed
      dashScale={2}
      dashSize={0.4}
      gapSize={0.2}
    />
  );
};

export const SurfaceExploration3D: React.FC = () => {
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint>(WAYPOINTS[1]);
  const [overlayMode, setOverlayMode] = useState<'topo' | 'slope' | 'multispectral'>('topo');
  const [traverseSpeedKmh, setTraverseSpeedKmh] = useState<number>(3.5); // EMU nominal walking speed
  const [plssReservePct, setPlssReservePct] = useState<number>(85);

  // Compute total route points from Base to Selected Waypoint
  const routePoints: [number, number, number][] = [
    WAYPOINTS[0].position,
    selectedWaypoint.position,
  ];

  // Straight line Euclidean distance in km (scaled)
  const dx = selectedWaypoint.position[0] - WAYPOINTS[0].position[0];
  const dz = selectedWaypoint.position[2] - WAYPOINTS[0].position[2];
  const distKm = parseFloat((Math.sqrt(dx * dx + dz * dz) * 0.85).toFixed(2));

  // Traversal time one-way
  const oneWayMinutes = Math.round((distKm / traverseSpeedKmh) * 60);
  const roundTripMinutes = oneWayMinutes * 2 + 25; // 25 min science EVA station stay
  const totalPLSSMinutes = Math.round((plssReservePct / 100) * 420); // 7-hour PLSS duration
  const marginMinutes = totalPLSSMinutes - roundTripMinutes;
  const isWalkbackSafe = marginMinutes >= 45; // 45 min NASA flight safety margin rule

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Telemetry Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              SURFACE TRAVERSE & WAYPOINT MAPPING
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 04 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              PLSS Walk-back Envelope // Remote Sensing Slope & Elevation Contours
            </p>
          </div>
        </div>

        {/* Remote Sensing Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-[#050914] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setOverlayMode('topo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              overlayMode === 'topo'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Topographic
          </button>
          <button
            onClick={() => setOverlayMode('slope')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              overlayMode === 'slope'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Slope Gradient
          </button>
          <button
            onClick={() => setOverlayMode('multispectral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              overlayMode === 'multispectral'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Multispectral
          </button>
        </div>
      </div>

      {/* Main 3D Interactive Canvas */}
      <div className="relative w-full h-[480px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 8, 9], fov: 48 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 15, 8]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 5, -5]} intensity={0.2} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <SurfaceTerrain overlayMode={overlayMode} />
            <BaseHabitat position={WAYPOINTS[0].position} />

            {/* Waypoints */}
            {WAYPOINTS.map((wp) => (
              <WaypointPin
                key={wp.id}
                wp={wp}
                isSelected={selectedWaypoint.id === wp.id}
                onSelect={(w) => setSelectedWaypoint(w)}
              />
            ))}

            {/* Route path */}
            <RouteLine points={routePoints} />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={4}
            maxDistance={22}
          />
        </Canvas>

        {/* In-Canvas Safety & Walkback HUD */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1.5 max-w-[280px]">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span>WALKBACK SAFETY MARGIN:</span>
            <span
              className={`font-bold ${
                isWalkbackSafe ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {marginMinutes} min ({isWalkbackSafe ? 'NOMINAL' : 'SAFETY VIOLATION'})
            </span>
          </div>
          <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isWalkbackSafe ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, (marginMinutes / 120) * 100))}%` }}
            />
          </div>
          <p className="text-[11px] text-[#64748b]">
            Red circle: Maximum safe return radius (45 min contingency buffer).
          </p>
        </div>

        {/* In-Canvas Slope Alert */}
        {selectedWaypoint.slopeDeg > 15 && (
          <div className="absolute top-4 right-4 p-3 rounded-xl bg-rose-950/90 backdrop-blur-md border border-rose-700/80 text-rose-200 text-xs font-mono flex items-center gap-2 max-w-[320px]">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-rose-300">STEEP SLOPE WARNING ({selectedWaypoint.slopeDeg}°)</p>
              <p className="text-[11px] text-rose-200/80">
                Exceeds nominal 15° surface traversal threshold. High wheel slip & rollover risk.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Station & Route Telemetry Panel */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Waypoint Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Select Exploration Target
          </label>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {WAYPOINTS.map((wp) => (
              <button
                key={wp.id}
                onClick={() => setSelectedWaypoint(wp)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between border ${
                  selectedWaypoint.id === wp.id
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="truncate">
                  <div className="font-semibold text-slate-200 truncate">{wp.name}</div>
                  <div className="text-[10px] text-[#64748b]">
                    Slope: {wp.slopeDeg}° // Elev: {wp.elevationMeters}m
                  </div>
                </div>
                {wp.slopeDeg > 15 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Target Scientific Details */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            Target Science & Geology
          </label>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[#64748b]">SCIENCE VALUE:</span>
              <p className="text-slate-200 mt-0.5">{selectedWaypoint.scienceValue}</p>
            </div>
            <div>
              <span className="text-[#64748b]">SAMPLE OBJECTIVE:</span>
              <p className="text-cyan-300 font-semibold mt-0.5">{selectedWaypoint.sampleType}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e293b]">
              <div>
                <span className="text-[#64748b]">ELEVATION:</span>
                <span className="ml-1 text-white font-bold">{selectedWaypoint.elevationMeters} m</span>
              </div>
              <div>
                <span className="text-[#64748b]">TERRAIN SLOPE:</span>
                <span
                  className={`ml-1 font-bold ${
                    selectedWaypoint.slopeDeg > 15 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedWaypoint.slopeDeg}°
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Consumables & Walk-back Flight Rules */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            Consumables & Mission Margins
          </label>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#64748b]">One-Way Distance:</span>
              <span className="text-white font-bold">{distKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Round-Trip Time:</span>
              <span className="text-cyan-300 font-bold">{roundTripMinutes} min (incl. 25m stay)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">PLSS Consumables Remaining:</span>
              <span className="text-white font-bold">{totalPLSSMinutes} min ({plssReservePct}%)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#1e293b]">
              <span className="text-[#64748b]">Contingency Walk-Back Buffer:</span>
              <span
                className={`font-bold ${
                  isWalkbackSafe ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {marginMinutes} min (Req: ≥ 45 min)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
