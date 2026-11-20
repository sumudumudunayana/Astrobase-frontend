import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  RotateCcw,
  Sliders,
  Shield,
  FileCheck,
} from 'lucide-react';
import type { MissionRisk } from '../../types/training';

// 3D 5x5 Holographic Risk Matrix Grid
const RiskMatrixGrid3D: React.FC<{
  risks: MissionRisk[];
  selectedRiskId: string;
  onSelectRisk: (id: string) => void;
}> = ({ risks, selectedRiskId, onSelectRisk }) => {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.05;
    }
  });

  return (
    <group ref={gridRef} position={[-2.5, -2.0, 0]}>
      {/* 5x5 Floor Grid Cells */}
      {[1, 2, 3, 4, 5].map((l) =>
        [1, 2, 3, 4, 5].map((c) => {
          const score = l * c;
          const isCritical = score >= 15;
          const isModerate = score >= 8 && score < 15;
          const cellColor = isCritical ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';

          return (
            <mesh
              key={`${l}-${c}`}
              position={[l * 1.0, c * 0.9, 0]}
            >
              <planeGeometry args={[0.9, 0.8]} />
              <meshStandardMaterial
                color={cellColor}
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })
      )}

      {/* Axis Labels */}
      <Text position={[3.0, -0.4, 0]} fontSize={0.24} color="#38bdf8" anchorX="center">
        LIKELIHOOD (1 = Rare &rarr; 5 = Near Certain)
      </Text>
      <Text position={[-0.6, 2.7, 0]} rotation={[0, 0, Math.PI / 2]} fontSize={0.24} color="#f59e0b" anchorX="center">
        CONSEQUENCE (1 &rarr; 5 = Catastrophic)
      </Text>

      {/* Risk Markers */}
      {risks.map((risk) => {
        const isSelected = selectedRiskId === risk.riskId;
        const posX = risk.likelihood * 1.0;
        const posY = risk.consequence * 0.9;
        const score = risk.likelihood * risk.consequence;
        const isCrit = score >= 15;

        return (
          <group
            key={risk.riskId}
            position={[posX, posY, 0.2]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectRisk(risk.riskId);
            }}
          >
            <mesh>
              <sphereGeometry args={[isSelected ? 0.22 : 0.16, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#38bdf8' : isCrit ? '#f43f5e' : '#f59e0b'}
                emissive={isSelected ? '#0284c7' : '#000000'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <Text position={[0, 0.35, 0]} fontSize={0.16} color="#ffffff" anchorX="center">
              {risk.title.split(' ')[0]} ({score})
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export const RiskMitigation3D: React.FC = () => {
  const [risks, setRisks] = useState<MissionRisk[]>([
    {
      riskId: 'r1',
      title: 'Coolant Radiator Micrometeoroid Puncture',
      category: 'TECHNICAL',
      likelihood: 3,
      consequence: 5,
      riskScore: 15,
      priority: 'CRITICAL',
      mitigationStrategy: 'Dual redundant cooling loops with automated pyro-valves and sublimator cross-ties.',
      contingencyPlan: 'Isolate damaged loop, power down non-essential scientific payloads, and abort to re-entry if temperature exceeds 32°C.',
      hasMitigationPlan: true,
      status: 'MITIGATED',
    },
    {
      riskId: 'r2',
      title: 'Solar Particle Event (SPE) Radiation Storm During EVA',
      category: 'ENVIRONMENTAL',
      likelihood: 2,
      consequence: 5,
      riskScore: 10,
      priority: 'MODERATE',
      mitigationStrategy: 'Deep space weather satellite early warnings (GOES/SWPC) giving >= 45 min alert window.',
      contingencyPlan: 'Immediate emergency abort to habitat storm shelter surrounded by water tanks and regolith bags.',
      hasMitigationPlan: true,
      status: 'MITIGATED',
    },
    {
      riskId: 'r3',
      title: 'Regolith Dust Ingress Jamming Suit Airlock Seals',
      category: 'ENVIRONMENTAL',
      likelihood: 4,
      consequence: 3,
      riskScore: 12,
      priority: 'MODERATE',
      mitigationStrategy: 'Electrostatic dust-repulsion coatings on suits and high-velocity nitrogen air showers.',
      contingencyPlan: 'Secondary inflatable silicone bladder hatch seal deployment and manual vacuum cleaning.',
      hasMitigationPlan: true,
      status: 'MITIGATED',
    },
  ]);

  const [selectedRiskId, setSelectedRiskId] = useState<string>('r1');
  const selectedRisk = risks.find((r) => r.riskId === selectedRiskId) || risks[0];

  const handleUpdateScores = (likelihood: number, consequence: number) => {
    setRisks((prev) =>
      prev.map((r) => {
        if (r.riskId === selectedRiskId) {
          const score = likelihood * consequence;
          const priority = score >= 15 ? 'CRITICAL' : score >= 8 ? 'MODERATE' : 'LOW';
          return {
            ...r,
            likelihood,
            consequence,
            riskScore: score,
            priority,
          };
        }
        return r;
      })
    );
  };

  const criticalCount = risks.filter((r) => r.riskScore >= 12).length;
  const mitigatedCriticalCount = risks.filter((r) => r.riskScore >= 12 && r.hasMitigationPlan).length;
  const isFlightApproved = criticalCount === mitigatedCriticalCount;

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              5x5 RISK MATRIX & CONTINGENCY MITIGATION PLANNER
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 07 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Continuous Risk Management (CRM) // Likelihood vs Consequence // Fail-Safe Redundancy
            </p>
          </div>
        </div>

        {/* Flight Approval Status */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 ${
              isFlightApproved
                ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                : 'bg-rose-950 text-rose-400 border-rose-600 animate-pulse'
            }`}
          >
            {isFlightApproved ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {isFlightApproved ? 'ALL HIGH RISKS MITIGATED' : 'UNMITIGATED HIGH RISKS'}
          </span>
        </div>
      </div>

      {/* 3D 5x5 Matrix Canvas */}
      <div className="relative w-full h-[460px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 48 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 6]} intensity={1.8} castShadow />
          <directionalLight position={[-6, -4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <RiskMatrixGrid3D
              risks={risks}
              selectedRiskId={selectedRiskId}
              onSelectRisk={(id) => setSelectedRiskId(id)}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={4.0}
            maxDistance={14}
          />
        </Canvas>

        {/* Selected Risk Overlay */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1.5 min-w-[270px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">SELECTED HAZARD:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                selectedRisk.riskScore >= 15
                  ? 'bg-rose-950 text-rose-400 border border-rose-600'
                  : 'bg-amber-950 text-amber-400 border border-amber-600'
              }`}
            >
              Score: {selectedRisk.riskScore} ({selectedRisk.priority})
            </span>
          </div>
          <p className="text-white font-bold">{selectedRisk.title}</p>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>LIKELIHOOD: {selectedRisk.likelihood}/5</span>
            <span>CONSEQUENCE: {selectedRisk.consequence}/5</span>
          </div>
        </div>
      </div>

      {/* Control Station & Mitigation Plan Editor */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risks Register List */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Active Risk Register ({risks.length})
          </label>
          <div className="space-y-2">
            {risks.map((risk) => (
              <button
                key={risk.riskId}
                onClick={() => setSelectedRiskId(risk.riskId)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedRiskId === risk.riskId
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate">{risk.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      risk.riskScore >= 15
                        ? 'bg-rose-950 text-rose-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    Score: {risk.riskScore}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5">
                  L: {risk.likelihood} // C: {risk.consequence} // Status: {risk.status}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Risk Tuning & Mitigations */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Threat Severity Sliders
            </label>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[#94a3b8] mb-1">
                  <span>Likelihood (1=Rare to 5=Frequent):</span>
                  <span className="text-white font-bold">{selectedRisk.likelihood}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={selectedRisk.likelihood}
                  onChange={(e) => handleUpdateScores(parseInt(e.target.value), selectedRisk.consequence)}
                  className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#94a3b8] mb-1">
                  <span>Consequence (1=Minor to 5=Catastrophic):</span>
                  <span className="text-white font-bold">{selectedRisk.consequence}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={selectedRisk.consequence}
                  onChange={(e) => handleUpdateScores(selectedRisk.likelihood, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1e293b] text-xs font-mono space-y-1">
            <span className="text-[#64748b]">APPROVED MITIGATION:</span>
            <p className="text-emerald-300 text-[11px] leading-relaxed">{selectedRisk.mitigationStrategy}</p>
          </div>
        </div>

        {/* Contingency Abort Plan */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-amber-400" />
            Contingency Abort Plan
          </label>
          <div className="space-y-2 text-xs font-mono">
            <p className="text-slate-200 text-[11px] leading-relaxed">
              {selectedRisk.contingencyPlan}
            </p>
            <div className="p-2 rounded-lg bg-[#050914] border border-[#1e293b] text-[10px] text-[#64748b]">
              NASA Continuous Risk Management (CRM): Flight readiness requires fail-safe design
              redundancy and unambiguous abort triggers for all hazards scoring &ge; 12.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
