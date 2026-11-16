import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  ShieldAlert,
  Compass,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';

function BridgeConsoleScene({
  alertLevel,
  leadershipMode,
  decisionTimer,
}: {
  alertLevel: 'NOMINAL' | 'CAUTION' | 'CRITICAL';
  leadershipMode: 'DEMOCRATIC' | 'DIRECTIVE' | 'COACHING';
  decisionTimer: number;
}) {
  const beaconRef = useRef<THREE.Mesh>(null);
  const radarRingRef = useRef<THREE.Group>(null);
  const holographicPanelRef = useRef<THREE.Group>(null);

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'CRITICAL':
        return '#ef4444'; // Red
      case 'CAUTION':
        return '#f59e0b'; // Amber
      default:
        return '#06b6d4'; // Cyan
    }
  };

  const alertColor = getAlertColor();

  useFrame((state, delta) => {
    // Beacon rotation and pulsing
    if (beaconRef.current) {
      beaconRef.current.rotation.y += delta * (alertLevel === 'CRITICAL' ? 6 : 2);
    }

    // Urgency Radar Ring sweep
    if (radarRingRef.current) {
      radarRingRef.current.rotation.z += delta * (alertLevel === 'CRITICAL' ? 3 : 1);
    }

    // Holographic float
    if (holographicPanelRef.current) {
      holographicPanelRef.current.position.y =
        1.1 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
    }
  });

  return (
    <group>
      {/* Cockpit Floor Platform */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[4.4, 0.2, 4.0]} />
        <meshStandardMaterial color="#0b1320" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Grid Floor Lines */}
      <gridHelper args={[4.4, 12, '#1e293b', '#0f172a']} position={[0, -0.49, 0]} />

      {/* Commander Command Chair Base */}
      <mesh position={[0, -0.2, -0.4]}>
        <cylinderGeometry args={[0.4, 0.45, 0.5, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Chair Seat Back */}
      <mesh position={[0, 0.45, -0.65]}>
        <boxGeometry args={[0.55, 0.8, 0.12]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Commander Hologram Profile */}
      <mesh position={[0, 0.35, -0.35]}>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshStandardMaterial
          color={alertColor}
          transparent
          opacity={0.75}
          emissive={alertColor}
          emissiveIntensity={alertLevel === 'CRITICAL' ? 0.6 : 0.2}
        />
      </mesh>

      {/* Horseshoe Command Console Wrap */}
      <group position={[0, 0, 0.6]}>
        {/* Main Curved Console Table */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[2.8, 0.7, 0.8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Console Screen Top */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[2.6, 0.05, 0.7]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive={alertColor}
            emissiveIntensity={0.2}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Floating Holographic Situational Awareness HUD */}
      <group ref={holographicPanelRef} position={[0, 1.1, 0.6]}>
        <mesh>
          <planeGeometry args={[2.4, 1.1]} />
          <meshPhysicalMaterial
            color={alertColor}
            transparent
            opacity={0.35}
            transmission={0.7}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer HUD Border Frame */}
        <mesh>
          <ringGeometry args={[1.3, 1.34, 4]} />
          <meshBasicMaterial color={alertColor} side={THREE.DoubleSide} />
        </mesh>

        {/* Text inside 3D HUD */}
        <Text position={[0, 0.35, 0.02]} fontSize={0.12} color="#ffffff" anchorX="center">
          {alertLevel === 'CRITICAL'
            ? 'CRITICAL PRESSURE SURGE // O2 LOOP B'
            : alertLevel === 'CAUTION'
            ? 'TELEMETRY ADVISORY // VALVE 3 DELAY'
            : 'SYSTEM HEALTH // ALL NOMINAL'}
        </Text>
        <Text position={[0, 0.12, 0.02]} fontSize={0.09} color={alertColor} anchorX="center">
          STYLE: {leadershipMode} PROTOCOL
        </Text>
        <Text position={[0, -0.1, 0.02]} fontSize={0.11} color="#facc15" anchorX="center">
          DECISION WINDOW: {Math.max(0, decisionTimer)}s
        </Text>
        <Text position={[0, -0.32, 0.02]} fontSize={0.08} color="#94a3b8" anchorX="center">
          {leadershipMode === 'DIRECTIVE'
            ? 'COMMANDER AUTONOMY: HIGH // EXECUTE COMMAND IMMEDIATELY'
            : leadershipMode === 'DEMOCRATIC'
            ? 'CONSENSUS SOUGHT // CROSS-MONITORING CREW INPUT'
            : 'COACHING / MENTORING // CREW SKILL EXPANSION ACTIVE'}
        </Text>
      </group>

      {/* Flashing Warning Beacon Pillar */}
      <mesh position={[1.8, 0.5, -1.4]}>
        <cylinderGeometry args={[0.06, 0.08, 1.8, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh ref={beaconRef} position={[1.8, 1.45, -1.4]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={alertColor}
          emissive={alertColor}
          emissiveIntensity={alertLevel === 'CRITICAL' ? 1.8 : alertLevel === 'CAUTION' ? 1.0 : 0.3}
        />
      </mesh>

      {/* Decision Urgency Radar Sweep Ring */}
      <group ref={radarRingRef} position={[0, 0.3, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.3, 0.9, 32]} />
          <meshBasicMaterial
            color={alertColor}
            wireframe
            transparent
            opacity={alertLevel === 'CRITICAL' ? 0.7 : 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

export const LeadershipPressure3D: React.FC = () => {
  const [alertLevel, setAlertLevel] = useState<'NOMINAL' | 'CAUTION' | 'CRITICAL'>('CRITICAL');
  const [leadershipMode, setLeadershipMode] = useState<'DEMOCRATIC' | 'DIRECTIVE' | 'COACHING'>('DIRECTIVE');
  const [decisionTimer, setDecisionTimer] = useState<number>(45);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [decisionOutcome, setDecisionOutcome] = useState<string | null>(null);

  // Countdown timer simulation
  useEffect(() => {
    let interval: any;
    if (timerRunning && decisionTimer > 0) {
      interval = setInterval(() => {
        setDecisionTimer((t) => t - 1);
      }, 1000);
    } else if (decisionTimer === 0 && !decisionOutcome) {
      setDecisionOutcome('TIMEOUT: Unmade decision forced emergency automation to activate. Redundancy lost.');
    }
    return () => clearInterval(interval);
  }, [timerRunning, decisionTimer, decisionOutcome]);

  const executeDecision = (option: string) => {
    setTimerRunning(false);
    if (leadershipMode === 'DIRECTIVE' && alertLevel === 'CRITICAL') {
      setDecisionOutcome(
        `SUCCESSFUL COMMAND: Commander issued clear directive (${option}). Crew acknowledged and executed within 8 seconds. Chamber stabilized.`
      );
    } else if (leadershipMode === 'DEMOCRATIC' && alertLevel === 'CRITICAL') {
      setDecisionOutcome(
        `SUB-OPTIMAL DELAY: Open consensus discussion in a 45-second breach scenario wasted 22 seconds before action. Partial cabin decompression.`
      );
    } else {
      setDecisionOutcome(
        `EXECUTED: Directive applied under ${leadershipMode} leadership framework. Team aligned.`
      );
    }
  };

  const resetSimulation = () => {
    setDecisionTimer(45);
    setTimerRunning(true);
    setDecisionOutcome(null);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060c18] via-[#09152b] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/85 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/60 border border-red-500/40 rounded-lg text-red-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-400 tracking-wider uppercase">
                CRM MODULE 08 // LESSON 02
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-red-950 border border-red-700/50 text-red-300 rounded-full">
                DECISION-MAKING UNDER PRESSURE
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Command Bridge & Situational Leadership Engine
            </h2>
          </div>
        </div>

        {/* Timer Widget */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 ${
              decisionTimer < 15
                ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
                : 'bg-[#09172a] border-slate-700 text-cyan-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>CRITICAL WINDOW:</span>
            <span className="text-base font-bold">{decisionTimer}s</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 2.5, 4.2], fov: 48 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight
            position={[0, 3, 1]}
            intensity={alertLevel === 'CRITICAL' ? 2.2 : 1.2}
            color={alertLevel === 'CRITICAL' ? '#ef4444' : '#38bdf8'}
          />
          <directionalLight position={[4, 6, 2]} intensity={1.0} />
          <Suspense fallback={null}>
            <BridgeConsoleScene
              alertLevel={alertLevel}
              leadershipMode={leadershipMode}
              decisionTimer={decisionTimer}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2.5}
            maxDistance={7}
          />
        </Canvas>

        {/* Left Side: Leadership Mode Selector */}
        <div className="absolute top-20 left-4 z-10 w-72 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Leadership Style</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => setLeadershipMode('DIRECTIVE')}
              className={`w-full text-left p-2 rounded text-xs font-mono transition-all ${
                leadershipMode === 'DIRECTIVE'
                  ? 'bg-red-600/30 border border-red-500 text-red-200'
                  : 'bg-[#0f1d33] border border-transparent text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              <div className="font-bold">Directive / Authoritative</div>
              <div className="text-[10px] text-slate-400">Immediate command, zero ambiguity (Time-Critical)</div>
            </button>
            <button
              onClick={() => setLeadershipMode('DEMOCRATIC')}
              className={`w-full text-left p-2 rounded text-xs font-mono transition-all ${
                leadershipMode === 'DEMOCRATIC'
                  ? 'bg-cyan-600/30 border border-cyan-500 text-cyan-200'
                  : 'bg-[#0f1d33] border border-transparent text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              <div className="font-bold">Democratic / Consultative</div>
              <div className="text-[10px] text-slate-400">Gather crew input, build consensus (Routine/Planning)</div>
            </button>
            <button
              onClick={() => setLeadershipMode('COACHING')}
              className={`w-full text-left p-2 rounded text-xs font-mono transition-all ${
                leadershipMode === 'COACHING'
                  ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-200'
                  : 'bg-[#0f1d33] border border-transparent text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              <div className="font-bold">Coaching / Development</div>
              <div className="text-[10px] text-slate-400">Guide junior astronaut through problem-solving</div>
            </button>
          </div>
        </div>

        {/* Right Side: Emergency Situation & Decision Trigger */}
        <div className="absolute top-20 right-4 z-10 w-80 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Simulated Scenario</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                alertLevel === 'CRITICAL'
                  ? 'bg-red-950 text-red-400 border border-red-600'
                  : alertLevel === 'CAUTION'
                  ? 'bg-amber-950 text-amber-400 border border-amber-600'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-600'
              }`}
            >
              {alertLevel}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {alertLevel === 'CRITICAL'
              ? 'Rapid decompression in Airlock Outer Seal detected during EVA ingress. Secondary isolation valve must be commanded within 45s.'
              : alertLevel === 'CAUTION'
              ? 'Oxygen recycling loop pressure fluctuation. Potential sensor drift or valve sticking.'
              : 'All systems operating within nominal flight envelope.'}
          </p>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Command Actions:</div>
            <button
              onClick={() => executeDecision('Isolate Airlock Manifold & Switch to Secondary Loop')}
              disabled={!timerRunning}
              className="w-full py-2 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all flex items-center justify-between"
            >
              <span>1. Isolate Airlock & Switch Loop</span>
              <Zap className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => executeDecision('Hold Current Station & Run Full Diagnostic Cross-Check')}
              disabled={!timerRunning}
              className="w-full py-2 px-2.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-mono transition-all flex items-center justify-between"
            >
              <span>2. Hold & Run Full Diagnostic</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Outcome Feedback Message */}
          {decisionOutcome && (
            <div className="p-2.5 rounded bg-[#09172a] border border-cyan-800/60 text-xs text-cyan-200 font-mono mt-2">
              {decisionOutcome}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Trigger Crisis Level:</span>
          <button
            onClick={() => {
              setAlertLevel('NOMINAL');
              resetSimulation();
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              alertLevel === 'NOMINAL' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Nominal
          </button>
          <button
            onClick={() => {
              setAlertLevel('CAUTION');
              resetSimulation();
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              alertLevel === 'CAUTION' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Caution
          </button>
          <button
            onClick={() => {
              setAlertLevel('CRITICAL');
              resetSimulation();
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono ${
              alertLevel === 'CRITICAL' ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Critical Alert
          </button>
          <button
            onClick={resetSimulation}
            className="ml-2 px-2.5 py-1 rounded text-xs font-mono bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Timer
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Key Principle: Use </span>
          <span className="text-red-400 font-bold">Directive</span>
          <span> for immediate danger, </span>
          <span className="text-cyan-400 font-bold">Democratic</span>
          <span> for complex diagnosis.</span>
        </div>
      </div>
    </div>
  );
};
