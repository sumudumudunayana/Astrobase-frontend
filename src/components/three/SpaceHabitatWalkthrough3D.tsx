import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Home,
  Shield,
  Wrench,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface ZoneDef {
  id: string;
  name: string;
  category: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  description: string;
  maintenanceItem: string;
}

const HABITAT_ZONES: ZoneDef[] = [
  {
    id: 'ECLSS_RACK',
    name: 'ECLSS Utility Rack Core',
    category: 'LIFE SUPPORT',
    position: [-1.8, 0, 0],
    size: [1.2, 1.6, 1.2],
    color: '#42D9F5',
    description: 'Houses the OGA electrolyzer, CDRA molecular sieve, and water recycling distillation racks. High acoustic dampening applied.',
    maintenanceItem: 'HEPA air filter replacement & vacuum pump desiccant inspection.',
  },
  {
    id: 'CREW_QUARTERS',
    name: 'Crew Quarters & Storm Shelter',
    category: 'HABITATION & SLEEP',
    position: [0, 0.4, -1.2],
    size: [1.3, 1.3, 1.0],
    color: '#628CFF',
    description: 'Private soundproof sleeping berths surrounded by polyethylene water bladders acting as a Solar Particle Event (SPE) radiation shelter.',
    maintenanceItem: 'Personal ventilation fan duct check & acoustic liner fastener audit.',
  },
  {
    id: 'SCIENCE_LAB',
    name: 'Science & Bio-Rack Laboratory',
    category: 'EXPERIMENTATION',
    position: [1.8, 0, 0],
    size: [1.2, 1.6, 1.2],
    color: '#10B981',
    description: 'Microgravity gloveboxes, Advanced Plant Habitat trays, and centrifuge for biotechnology and materials crystallization experiments.',
    maintenanceItem: 'Glovebox vacuum seal test & microbial surface swab culturing.',
  },
  {
    id: 'AIRLOCK',
    name: 'Joint EVA Equipment Airlock',
    category: 'EVA & EGRESS',
    position: [0, -0.4, 1.4],
    size: [1.4, 1.2, 1.2],
    color: '#F5B942',
    description: 'Two-stage airlock (Equipment Lock and Crew Lock) with gas recovery pumps that reclaim 90% of cabin air before spacewalk depressurization.',
    maintenanceItem: 'Silicone hatch O-ring visual inspection & vacuum equalizing valve test.',
  },
];

export const SpaceHabitatWalkthrough3D: React.FC = () => {
  const [activeZoneId, setActiveZoneId] = useState<string>('ECLSS_RACK');
  const [completedInspections, setCompletedInspections] = useState<string[]>([]);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  const activeZone = HABITAT_ZONES.find((z) => z.id === activeZoneId) || HABITAT_ZONES[0];

  const handlePerformInspection = (zoneId: string) => {
    if (!completedInspections.includes(zoneId)) {
      setCompletedInspections((prev) => [...prev, zoneId]);
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header telemetry summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B1424] rounded-xl border border-[#1E2E4A]">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-[#42D9F5]" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            MODULAR SPACE HABITAT ARCHITECTURE & MAINTENANCE AUDIT
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#94A3B8]">
            AUDIT PROGRESS:{' '}
            <strong className="text-[#10B981]">
              {completedInspections.length} / {HABITAT_ZONES.length} MODULES INSPECTED
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-8 relative h-[540px] lg:h-[600px] rounded-xl overflow-hidden bg-[#050914] border border-[#1E2E4A]">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#42D9F5]">
                LOADING HABITAT WALKTHROUGH 3D MESH...
              </div>
            }
          >
            <Canvas camera={{ position: [0, 4.0, 5.0], fov: 45 }}>
              <color attach="background" args={['#050914']} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[4, 7, 5]} intensity={1.2} />
              <pointLight position={[0, 1, 0]} intensity={1.0} color="#42D9F5" />
              <Stars radius={40} depth={20} count={1000} factor={3} fade speed={0.4} />

              <group position={[0, 0, 0]}>
                {/* Central Node Connecting Tunnel */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.7, 0.7, 1.4, 24]} />
                  <meshStandardMaterial
                    color="#1E293B"
                    metalness={0.8}
                    roughness={0.2}
                    wireframe
                  />
                </mesh>

                {/* Render the 4 Modular Compartments */}
                {HABITAT_ZONES.map((zone) => {
                  const isSelected = zone.id === activeZoneId;
                  const isInspected = completedInspections.includes(zone.id);

                  return (
                    <group
                      key={zone.id}
                      position={zone.position}
                      onClick={() => setActiveZoneId(zone.id)}
                    >
                      <mesh castShadow receiveShadow>
                        <boxGeometry args={zone.size} />
                        <meshStandardMaterial
                          color={isSelected ? '#1E3A5F' : '#0B1424'}
                          metalness={0.7}
                          roughness={0.3}
                          emissive={isSelected ? zone.color : '#000000'}
                          emissiveIntensity={isSelected ? 0.35 : 0}
                        />
                      </mesh>

                      {/* Accent outline wireframe */}
                      <mesh>
                        <boxGeometry
                          args={[
                            zone.size[0] + 0.04,
                            zone.size[1] + 0.04,
                            zone.size[2] + 0.04,
                          ]}
                        />
                        <meshStandardMaterial
                          color={zone.color}
                          wireframe
                          transparent
                          opacity={isSelected ? 0.9 : 0.25}
                        />
                      </mesh>

                      {/* Hotspot 3D Marker Pill */}
                      <Html position={[0, zone.size[1] / 2 + 0.35, 0]} center distanceFactor={7}>
                        <div
                          className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all border whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#42D9F5] text-[#050914] font-bold shadow-[0_0_12px_rgba(66,217,245,0.6)]'
                              : isInspected
                              ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                              : 'bg-[#0B1424]/90 border-[#1E2E4A] text-[#94A3B8]'
                          }`}
                        >
                          {zone.name.split(' ')[0]} {isInspected ? '✓' : ''}
                        </div>
                      </Html>
                    </group>
                  );
                })}
              </group>

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={0.8}
                minDistance={3.0}
                maxDistance={8.5}
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

          <div className="absolute top-3 right-3 font-mono text-[10px] text-[#42D9F5] bg-[#0B1424]/80 px-2.5 py-1 rounded border border-[#42D9F5]/20 backdrop-blur-sm pointer-events-none">
            DEEP SPACE HABITAT / TRANSIT ARCHITECTURE
          </div>
        </div>

        {/* Interactive Controls & Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-4 rounded-xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
              <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                HABITAT INSPECTION SUITE
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">MAINTENANCE</span>
            </div>

            {/* Compartment Quick Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#94A3B8] block">Select Habitat Compartment:</span>
              <div className="grid grid-cols-2 gap-2">
                {HABITAT_ZONES.map((zone) => {
                  const isInspected = completedInspections.includes(zone.id);
                  const isSelected = zone.id === activeZoneId;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => setActiveZoneId(zone.id)}
                      className={`p-2 rounded text-left text-xs font-mono transition-all border ${
                        isSelected
                          ? 'bg-[#1E3A5F] border-[#42D9F5] text-white font-bold'
                          : 'bg-[#111E32] border-[#1E2E4A] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{zone.name.split(' ')[0]}</span>
                        {isInspected && <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Compartment Detail */}
            <div className="p-3 rounded-lg bg-[#0B1424] border border-[#1E2E4A] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#42D9F5] font-bold">{activeZone.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111E32] text-[#94A3B8] border border-[#1E2E4A]">
                  {activeZone.category}
                </span>
              </div>
              <p className="text-[#94A3B8] leading-relaxed">{activeZone.description}</p>
              <div className="border-t border-[#1E2E4A] pt-2">
                <span className="text-[10px] font-mono text-[#F5B942] block">
                  SCHEDULED MAINTENANCE PROTOCOL:
                </span>
                <p className="text-white font-medium mt-0.5">{activeZone.maintenanceItem}</p>
              </div>
            </div>

            {/* Execute Maintenance Action Button */}
            <div>
              <button
                onClick={() => handlePerformInspection(activeZoneId)}
                disabled={completedInspections.includes(activeZoneId)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                  completedInspections.includes(activeZoneId)
                    ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] cursor-default'
                    : 'bg-[#42D9F5] text-[#050914] border-[#42D9F5] hover:bg-[#42D9F5]/90'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>
                  {completedInspections.includes(activeZoneId)
                    ? 'MAINTENANCE CHECK PASSED ✓'
                    : 'LOG & EXECUTE COMPONENT AUDIT'}
                </span>
              </button>
            </div>
          </div>

          {/* Educational Note */}
          <div className="glass-panel p-3.5 rounded-xl border border-[#1E2E4A] text-xs">
            <span className="font-mono text-[#42D9F5] block font-bold mb-1">
              MICROBIAL & DUST MANAGEMENT:
            </span>
            <p className="text-[#94A3B8] leading-relaxed">
              Without gravity to settle dust particles and skin flakes onto the floor, floating particulates circulate continuously into air grilles. Biofilms can also propagate rapidly inside humid condensing heat exchangers. Strict weekly antibacterial wipedowns and particulate filter swaps are vital to prevent astronaut respiratory distress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

