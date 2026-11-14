import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  GitBranch,
  Percent,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface BranchNodeProps {
  position: [number, number, number];
  title: string;
  probLabel: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  confidence: number;
}

function DecisionBranchNode({
  position,
  title,
  probLabel,
  color,
  isSelected,
  onClick,
  confidence,
}: BranchNodeProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      {/* Node Sphere */}
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.7 : 0.3}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Confidence Ring Envelope */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.3 + (confidence / 400), 32]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={isSelected ? 0.8 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Node Labels */}
      <Text position={[0, 0.45, 0]} fontSize={0.11} color="#f8fafc" anchorX="center">
        {title}
      </Text>
      <Text position={[0, 0.32, 0]} fontSize={0.09} color={color} anchorX="center">
        {probLabel}
      </Text>
    </group>
  );
}

function DecisionTreeScene({
  completeness,
  selectedBranch,
  setSelectedBranch,
}: {
  completeness: number; // 20 to 100
  selectedBranch: 'A' | 'B' | 'C';
  setSelectedBranch: (b: 'A' | 'B' | 'C') => void;
}) {
  const treeRef = useRef<THREE.Group>(null);

  // Dynamic probabilities depending on information completeness
  const confA = Math.round(30 + completeness * 0.2); // Aggressive
  const confB = Math.round(75 + completeness * 0.2); // Abort
  const confC = Math.round(50 + completeness * 0.45); // Staged Diagnostic

  useFrame((state, delta) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  // Coordinates
  const rootPos: [number, number, number] = [0, -1.0, 0];
  const branchAPos: [number, number, number] = [-1.8, 0.8, 0];
  const branchBPos: [number, number, number] = [0, 1.2, 0];
  const branchCPos: [number, number, number] = [1.8, 0.8, 0];

  return (
    <group ref={treeRef}>
      {/* Root Node: Decision Trigger Event */}
      <group position={rootPos}>
        <mesh>
          <octahedronGeometry args={[0.28]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.6}
            wireframe
          />
        </mesh>
        <Text position={[0, -0.45, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
          DECISION TRIGGER: THERMAL ANOMALY
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.09} color="#94a3b8" anchorX="center">
          Telemetry Completeness: {completeness}%
        </Text>
      </group>

      {/* Connecting Branch Vectors */}
      {/* Line to Branch A */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...rootPos),
            new THREE.Vector3(...branchAPos),
          ])}
        />
        <lineBasicMaterial attach="material" color="#ef4444" linewidth={2} />
      </line>

      {/* Line to Branch B */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...rootPos),
            new THREE.Vector3(...branchBPos),
          ])}
        />
        <lineBasicMaterial attach="material" color="#10b981" linewidth={2} />
      </line>

      {/* Line to Branch C */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...rootPos),
            new THREE.Vector3(...branchCPos),
          ])}
        />
        <lineBasicMaterial attach="material" color="#38bdf8" linewidth={2} />
      </line>

      {/* 3 Outcome Branches */}
      <DecisionBranchNode
        position={branchAPos}
        title="Option A: Proceed with Burn"
        probLabel={`Success Conf: ${confA}%`}
        color="#ef4444"
        isSelected={selectedBranch === 'A'}
        onClick={() => setSelectedBranch('A')}
        confidence={confA}
      />
      <DecisionBranchNode
        position={branchBPos}
        title="Option B: Abort to Safe Orbit"
        probLabel={`Safety Conf: ${confB}%`}
        color="#10b981"
        isSelected={selectedBranch === 'B'}
        onClick={() => setSelectedBranch('B')}
        confidence={confB}
      />
      <DecisionBranchNode
        position={branchCPos}
        title="Option C: Staged Diagnostic"
        probLabel={`Calculated Conf: ${confC}%`}
        color="#38bdf8"
        isSelected={selectedBranch === 'C'}
        onClick={() => setSelectedBranch('C')}
        confidence={confC}
      />
    </group>
  );
}

export const DecisionUnderUncertainty3D: React.FC = () => {
  const [completeness, setCompleteness] = useState<number>(65);
  const [selectedBranch, setSelectedBranch] = useState<'A' | 'B' | 'C'>('C');

  const getBranchDetails = () => {
    switch (selectedBranch) {
      case 'A':
        return {
          title: 'Option A: Immediate Nominal Burn',
          risk: 'HIGH CRITICAL',
          crewSafety: '62% Margin',
          missionSuccess: '94% if system holds',
          rationale:
            'Commander commits to planned trajectory without verifying root cause of thermal spike. Severe risk of engine manifold rupture if telemetry artifact was an actual valve seal degradation.',
        };
      case 'B':
        return {
          title: 'Option B: Conservative Safe Abort',
          risk: 'VERY LOW',
          crewSafety: '99% Guaranteed Safe',
          missionSuccess: '0% Primary Objective (Abort)',
          rationale:
            'Safest course of action protecting crew life above all. Relinquishes lunar descent opportunity, placing spacecraft in high elliptical contingency orbit for extensive ground troubleshooting.',
        };
      case 'C':
        return {
          title: 'Option C: Staged Diagnostic & Delayed Burn',
          risk: 'MODERATE / BALANCED',
          crewSafety: '92% High Margin',
          missionSuccess: '88% Primary Objective Preserved',
          rationale:
            'AstroBase CRM Best Practice: Insert into interim elliptical orbit. Use secondary sensors and flight engineer manual cross-checks to verify heater relay before committing main propulsion.',
        };
    }
  };

  const details = getBranchDetails();

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <GitBranch className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                CRM MODULE 08 // LESSON 06
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 border border-cyan-700/50 text-cyan-300 rounded-full">
                DECISION-MAKING UNDER UNCERTAINTY
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Bayesian Decision Tree & Probability Matrix Simulator
            </h2>
          </div>
        </div>

        {/* Selected Branch Badge */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Selected Course:</span>
          <span className="text-cyan-400 font-bold bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700">
            {details.title}
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 0.5, 4.2], fov: 48 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 3, 2]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[4, 5, 2]} intensity={0.8} />
          <Suspense fallback={null}>
            <DecisionTreeScene
              completeness={completeness}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 1.8}
            minDistance={2.0}
            maxDistance={7.0}
          />
        </Canvas>

        {/* Telemetry Completeness Control (Top Left) */}
        <div className="absolute top-20 left-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2.5">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Telemetry Completeness</span>
            <span className="text-cyan-400 font-bold">{completeness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={completeness}
            onChange={(e) => setCompleteness(Number(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Fog of War (20%)</span>
            <span>Partial (60%)</span>
            <span>Full (100%)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            In human spaceflight, commanders rarely have 100% information before mission-critical burns. Decision models must balance risk vs delay.
          </p>
        </div>

        {/* Selected Branch Evaluation Matrix (Top Right) */}
        <div className="absolute top-20 right-4 z-10 w-80 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span>Branch Analysis</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                details.risk.includes('CRITICAL')
                  ? 'bg-red-950 text-red-400 border border-red-700'
                  : details.risk.includes('LOW')
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-700'
              }`}
            >
              {details.risk}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white">{details.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{details.rationale}</p>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#09172a] p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Crew Safety Margin:</span>
              <span className="text-emerald-400 font-bold">{details.crewSafety}</span>
            </div>
            <div className="bg-[#09172a] p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Mission Success:</span>
              <span className="text-cyan-400 font-bold">{details.missionSuccess}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Information Strip */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Select Decision Path:</span>
          <button
            onClick={() => setSelectedBranch('A')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              selectedBranch === 'A' ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Option A (Burn)
          </button>
          <button
            onClick={() => setSelectedBranch('B')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              selectedBranch === 'B' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Option B (Abort)
          </button>
          <button
            onClick={() => setSelectedBranch('C')}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              selectedBranch === 'C' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Option C (Staged Diagnostic)
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>NASA SP-2016-6105 Standard: </span>
          <span className="text-cyan-300 font-bold">Never trade known safety for uncertain timeline recovery</span>
        </div>
      </div>
    </div>
  );
};
