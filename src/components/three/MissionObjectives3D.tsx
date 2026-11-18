import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Target,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Activity,
  Layers,
  Shield,
  Plus,
  Sliders,
  Globe2,
} from 'lucide-react';
import type { MissionObjective, MissionConstraint } from '../../types/training';

// 3D Orbital Target Body (Moon / Mars) with Objective Beacons
const ObjectiveOrbitGlobe: React.FC<{
  targetBody: 'Moon' | 'Mars';
  objectives: MissionObjective[];
  selectedObjId: string;
  onSelectObj: (id: string) => void;
}> = ({ targetBody, objectives, selectedObjId, onSelectObj }) => {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05;
    }
  });

  const isMars = targetBody === 'Mars';

  return (
    <group>
      {/* Central Target Body Sphere */}
      <mesh ref={globeRef} receiveShadow castShadow>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshStandardMaterial
          color={isMars ? '#c2410c' : '#94a3b8'}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Orbital Orbit Ring */}
      <mesh rotation={[-Math.PI / 3, 0.2, 0]}>
        <ringGeometry args={[2.7, 2.75, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Surface Objective Beacons */}
      {objectives.map((obj, idx) => {
        const phi = (idx * Math.PI) / (objectives.length || 1) - Math.PI / 2;
        const theta = (idx * 1.5);
        const radius = 2.15;
        const x = radius * Math.cos(phi) * Math.sin(theta);
        const y = radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.cos(theta);
        const isSelected = selectedObjId === obj.objectiveId;
        const isPrimary = obj.category === 'PRIMARY';

        return (
          <group key={obj.objectiveId} position={[x, y, z]} onClick={() => onSelectObj(obj.objectiveId)}>
            <mesh>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial
                color={isSelected ? '#38bdf8' : isPrimary ? '#eab308' : '#10b981'}
                emissive={isSelected ? '#0284c7' : isPrimary ? '#854d0e' : '#047857'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <Text
              position={[0, 0.22, 0]}
              fontSize={0.1}
              color={isSelected ? '#38bdf8' : '#ffffff'}
              anchorX="center"
            >
              {obj.category === 'PRIMARY' ? 'P' : 'S'}{idx + 1}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export const MissionObjectives3D: React.FC = () => {
  const [targetBody, setTargetBody] = useState<'Moon' | 'Mars'>('Moon');
  const [objectives, setObjectives] = useState<MissionObjective[]>([
    {
      objectiveId: 'obj-1',
      title: 'Surface Habitation & Power Array Deployment',
      category: 'PRIMARY',
      description: 'Deploy 12 kW solar tracking array and establish life-support pressure loop.',
      successCriterion: 'Continuous electrical power >= 10 kW for 72 consecutive hours.',
      isMandatory: true,
      isAchieved: true,
      weightPercent: 40,
    },
    {
      objectiveId: 'obj-2',
      title: 'Cryogenic Volatile Ice Core Extraction',
      category: 'PRIMARY',
      description: 'Acquire 2 cylindrical core samples from permanently shadowed crater floor.',
      successCriterion: 'Two 6-cm cores hermetically sealed with zero organic contamination.',
      isMandatory: true,
      isAchieved: false,
      weightPercent: 40,
    },
    {
      objectiveId: 'obj-3',
      title: 'Geological Field Traverse (8 km)',
      category: 'SECONDARY',
      description: 'Traverse candidate impact ejecta ridges and map surface slope gradients.',
      successCriterion: 'Multi-spectral imagery of 12 designated waypoints within walk-back limit.',
      isMandatory: false,
      isAchieved: false,
      weightPercent: 20,
    },
  ]);

  const [selectedObjId, setSelectedObjId] = useState<string>('obj-1');
  const [walkbackLimitKm, setWalkbackLimitKm] = useState<number>(7.5);
  const [maxSlopeDeg, setMaxSlopeDeg] = useState<number>(15.0);

  const selectedObj = objectives.find((o) => o.objectiveId === selectedObjId) || objectives[0];
  const primaryCount = objectives.filter((o) => o.category === 'PRIMARY').length;
  const isScopeValid = primaryCount >= 2;

  const handleToggleCategory = (id: string) => {
    setObjectives((prev) =>
      prev.map((o) =>
        o.objectiveId === id
          ? { ...o, category: o.category === 'PRIMARY' ? 'SECONDARY' : 'PRIMARY' }
          : o
      )
    );
  };

  const handleToggleAchieved = (id: string) => {
    setObjectives((prev) =>
      prev.map((o) => (o.objectiveId === id ? { ...o, isAchieved: !o.isAchieved } : o))
    );
  };

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Telemetry Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              MISSION OBJECTIVES & OPERATIONAL BOUNDARIES
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 01 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Primary vs Secondary Hierarchy // Quantifiable Success Criteria // Walk-back Envelope
            </p>
          </div>
        </div>

        {/* Body Selector */}
        <div className="flex items-center gap-1.5 bg-[#050914] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setTargetBody('Moon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              targetBody === 'Moon'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Moon (Artemis)
          </button>
          <button
            onClick={() => setTargetBody('Mars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              targetBody === 'Mars'
                ? 'bg-orange-700 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Mars (Jezero)
          </button>
        </div>
      </div>

      {/* 3D Target Body Canvas */}
      <div className="relative w-full h-[460px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 1.2, 5.2], fov: 46 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 6]} intensity={1.7} castShadow />
          <directionalLight position={[-6, -4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <ObjectiveOrbitGlobe
              targetBody={targetBody}
              objectives={objectives}
              selectedObjId={selectedObjId}
              onSelectObj={(id) => setSelectedObjId(id)}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3.2}
            maxDistance={12}
          />
        </Canvas>

        {/* In-Canvas Scope Verification Badge */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1.5 min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">MISSION SCOPE STATUS:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                isScopeValid
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                  : 'bg-rose-950 text-rose-400 border border-rose-600'
              }`}
            >
              {isScopeValid ? 'SCOPE NOMINAL' : 'INSUFFICIENT PRIMARY'}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>PRIMARY OBJECTIVES:</span>
            <span className="text-white font-bold">{primaryCount} (Req: &ge; 2)</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>PLSS WALK-BACK RADIUS:</span>
            <span className="text-cyan-400 font-bold">{walkbackLimitKm} km max</span>
          </div>
        </div>
      </div>

      {/* Control Station & Objective Matrix */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Objectives List */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Configured Objectives ({objectives.length})
          </label>
          <div className="space-y-2">
            {objectives.map((obj) => (
              <button
                key={obj.objectiveId}
                onClick={() => setSelectedObjId(obj.objectiveId)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedObjId === obj.objectiveId
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate">{obj.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      obj.category === 'PRIMARY'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {obj.category}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748b] mt-1 truncate">
                  Metric: {obj.successCriterion}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Objective Inspector & Editor */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Objective Specification
            </label>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-[#64748b]">TITLE:</span>
                <p className="text-white font-semibold mt-0.5">{selectedObj.title}</p>
              </div>
              <div>
                <span className="text-[#64748b]">SUCCESS CRITERION:</span>
                <p className="text-cyan-300 mt-0.5">{selectedObj.successCriterion}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]">
                <span className="text-[#64748b]">WEIGHT:</span>
                <span className="text-white font-bold">{selectedObj.weightPercent}%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleToggleCategory(selectedObj.objectiveId)}
              className="flex-1 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-slate-200 font-mono text-xs transition-colors"
            >
              Toggle Priority ({selectedObj.category === 'PRIMARY' ? 'Demote to Secondary' : 'Promote to Primary'})
            </button>
            <button
              onClick={() => handleToggleAchieved(selectedObj.objectiveId)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
                selectedObj.isAchieved
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-[#0f172a] text-[#94a3b8] border-[#1e293b]'
              }`}
            >
              {selectedObj.isAchieved ? 'Verified' : 'Verify'}
            </button>
          </div>
        </div>

        {/* Operational Constraints & Flight Rules */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            Flight Operational Constraints
          </label>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[#94a3b8] mb-1">
                <span>Max Walk-Back Radius:</span>
                <span className="text-white font-bold">{walkbackLimitKm} km</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.5"
                value={walkbackLimitKm}
                onChange={(e) => setWalkbackLimitKm(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#94a3b8] mb-1">
                <span>Max Surface Slope:</span>
                <span className="text-white font-bold">{maxSlopeDeg}°</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="25.0"
                step="1.0"
                value={maxSlopeDeg}
                onChange={(e) => setMaxSlopeDeg(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="p-2 rounded-lg bg-[#050914] border border-[#1e293b] text-[10px] text-[#64748b]">
              Flight Rule: Secondary objectives are immediately suspended if rover telemetry
              exceeds 15° slope or walk-back consumable margin drops below 45 minutes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
