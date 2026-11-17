import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Clock,
  Layers,
  RotateCcw,
  Shield,
  Sliders,
  Terminal,
} from 'lucide-react';
import type { MissionControlTelemetry } from '../../types/training';

// 3D Mission Control Center Floor & Giant Video Wall
const MissionControlRoom: React.FC<{
  anomalyActive: boolean;
  isPolledGo: boolean;
}> = ({ anomalyActive, isPolledGo }) => {
  const roomRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (roomRef.current) {
      roomRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <group ref={roomRef}>
      {/* MCC Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Front Video Wall Screen */}
      <group position={[0, 1.8, -4.5]}>
        {/* Giant Main Display Board */}
        <mesh>
          <boxGeometry args={[9.0, 4.0, 0.2]} />
          <meshStandardMaterial
            color="#020617"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Center Orbital Ground Track Display */}
        <mesh position={[0, 0.2, 0.12]}>
          <planeGeometry args={[4.8, 2.6]} />
          <meshStandardMaterial
            color="#0369a1"
            emissive="#0284c7"
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text position={[0, 1.2, 0.15]} fontSize={0.22} color="#ffffff" anchorX="center">
          ORBITAL GROUND TRACK // APOGEE 384,400 KM
        </Text>

        {/* Left Subsystem Status Panel */}
        <mesh position={[-3.3, 0.2, 0.12]}>
          <planeGeometry args={[1.5, 2.6]} />
          <meshStandardMaterial
            color={anomalyActive ? '#e11d48' : '#047857'}
            emissive={anomalyActive ? '#be123c' : '#059669'}
            emissiveIntensity={0.7}
          />
        </mesh>
        <Text position={[-3.3, 1.2, 0.15]} fontSize={0.16} color="#ffffff" anchorX="center">
          EECOM: {anomalyActive ? 'LOOP 2 LEAK' : 'NOMINAL'}
        </Text>

        {/* Right Polling Status Panel */}
        <mesh position={[3.3, 0.2, 0.12]}>
          <planeGeometry args={[1.5, 2.6]} />
          <meshStandardMaterial
            color={isPolledGo ? '#059669' : '#d97706'}
            emissive={isPolledGo ? '#10b981' : '#b45309'}
            emissiveIntensity={0.7}
          />
        </mesh>
        <Text position={[3.3, 1.2, 0.15]} fontSize={0.16} color="#ffffff" anchorX="center">
          POLL: {isPolledGo ? 'ALL GO' : 'PENDING'}
        </Text>
      </group>

      {/* Flight Controller Consoles Rows */}
      {[-2.0, 0.5].map((z, rowIdx) =>
        [-2.5, 0, 2.5].map((x, colIdx) => (
          <group key={`${rowIdx}-${colIdx}`} position={[x, -0.6, z]}>
            {/* Desk */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[1.8, 0.5, 0.7]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Monitor Banks */}
            <mesh position={[-0.4, 0.65, -0.1]} rotation={[-0.2, 0.1, 0]}>
              <boxGeometry args={[0.6, 0.35, 0.04]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0.4, 0.65, -0.1]} rotation={[-0.2, -0.1, 0]}>
              <boxGeometry args={[0.6, 0.35, 0.04]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};

interface MissionControl3DProps {
  externalTelemetry?: MissionControlTelemetry;
  onResolveAnomaly?: () => void;
  onExecutePoll?: () => void;
  showControlDeck?: boolean;
}

export const MissionControl3D: React.FC<MissionControl3DProps> = ({
  externalTelemetry,
  onResolveAnomaly,
  onExecutePoll,
  showControlDeck = true,
}) => {
  const [telemetry, setTelemetry] = useState<MissionControlTelemetry>(
    externalTelemetry || {
      missionId: 'LUNAR_EXPEDITION_01',
      targetBody: 'Moon',
      missionPhase: 'LUNAR_SURFACE_EVA_01',
      metHours: 74.5,
      cabinPressureKpa: 101.3,
      cabinO2Percent: 21.0,
      powerDrawKilowatts: 8.4,
      batteryReservePercent: 92.0,
      waterRemainingLiters: 412.0,
      deltaVRemainingMps: 1840.0,
      commsLinkStatus: 'DSN_GOLDSTONE_ACTIVE',
      commsLatencySeconds: 1.3,
      anomalyAlert: 'COOLANT_LOOP_2_PRESSURE_DROP',
      goNoGoStatus: 'PENDING_POLL',
    }
  );

  const [consoleStatuses, setConsoleStatuses] = useState<Record<string, 'GO' | 'NO_GO' | 'POLLING'>>({
    FLIGHT: 'GO',
    CAPCOM: 'GO',
    EECOM: externalTelemetry?.anomalyAlert === 'NONE' ? 'GO' : 'NO_GO',
    GNC: 'GO',
    FAO: 'GO',
    SURGEON: 'GO',
    INCO: 'GO',
  });

  React.useEffect(() => {
    if (externalTelemetry) {
      setTelemetry(externalTelemetry);
      if (externalTelemetry.anomalyAlert === 'NONE') {
        setConsoleStatuses((prev) => ({ ...prev, EECOM: 'GO' }));
      } else {
        setConsoleStatuses((prev) => ({ ...prev, EECOM: 'NO_GO' }));
      }
    }
  }, [externalTelemetry]);

  const anomalyActive = telemetry.anomalyAlert !== 'NONE';
  const isPolledGo = telemetry.goNoGoStatus === 'ALL_STATIONS_GO' || telemetry.goNoGoStatus === 'GO';

  const handleResolveAnomaly = () => {
    setTelemetry((prev) => ({
      ...prev,
      anomalyAlert: 'NONE',
      powerDrawKilowatts: 7.2,
      batteryReservePercent: 94.0,
    }));
    setConsoleStatuses((prev) => ({ ...prev, EECOM: 'GO' }));
    if (onResolveAnomaly) {
      onResolveAnomaly();
    }
  };

  const handleExecutePoll = () => {
    if (anomalyActive) {
      setTelemetry((prev) => ({ ...prev, goNoGoStatus: 'HOLD_NO_GO' }));
    } else {
      setTelemetry((prev) => ({ ...prev, goNoGoStatus: 'ALL_STATIONS_GO' }));
    }
    if (onExecutePoll) {
      onExecutePoll();
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              MISSION CONTROL CENTER (MCC) FLIGHT DIRECTOR CONSOLE
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 06 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Real-Time Subsystem Telemetry // Formal GO/NO-GO Polling Sequence // Anomaly Resolution
            </p>
          </div>
        </div>

        {/* Polling Outcome Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 ${
              isPolledGo
                ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                : anomalyActive
                ? 'bg-rose-950 text-rose-400 border-rose-600 animate-pulse'
                : 'bg-amber-950 text-amber-400 border-amber-600'
            }`}
          >
            {isPolledGo ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            STATUS: {telemetry.goNoGoStatus}
          </span>
        </div>
      </div>

      {/* 3D Mission Control Room Canvas */}
      <div className="relative w-full h-[460px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 2.5, 5.0], fov: 52 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 6]} intensity={1.8} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <MissionControlRoom
              anomalyActive={anomalyActive}
              isPolledGo={isPolledGo}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2.5}
            maxDistance={12}
          />
        </Canvas>

        {/* In-Canvas Anomaly Alert HUD */}
        {anomalyActive && (
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-rose-950/90 backdrop-blur-md border border-rose-500 text-rose-200 text-xs font-mono space-y-1 max-w-[320px] animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-bold text-white">EECOM TELEMETRY ALERT</span>
            </div>
            <p className="text-[11px] text-rose-200/90">
              Coolant Loop 2 pressure dropping (42 kPa vs 101 kPa nominal). Sublimator bypass required.
            </p>
          </div>
        )}
      </div>

      {/* Flight Control Deck & Action Panels */}
      {showControlDeck && (
        <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Discipline Console Polling Roll Call */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              Flight Control Consoles Poll
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(consoleStatuses).map(([name, stat]) => (
                <div
                  key={name}
                  className="p-2 rounded-xl bg-[#050914] border border-[#1e293b] flex items-center justify-between"
                >
                  <span className="text-slate-300 font-bold">{name}:</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      stat === 'GO'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                    }`}
                  >
                    {stat}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleExecutePoll}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-950/50 cursor-pointer"
            >
              EXECUTE FORMAL GO / NO-GO POLL
            </button>
          </div>

          {/* Anomaly Resolution Action Panel */}
          <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
            <div>
              <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Contingency Flight Action
              </label>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">ANOMALY:</span>
                  <span className="text-white font-bold">{telemetry.anomalyAlert}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">CABIN PRESSURE:</span>
                  <span className="text-cyan-300 font-bold">{telemetry.cabinPressureKpa} kPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">POWER DRAW:</span>
                  <span className="text-amber-400 font-bold">{telemetry.powerDrawKilowatts} kW</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleResolveAnomaly}
              disabled={!anomalyActive}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-950/50"
            >
              {anomalyActive ? 'ISOLATE LOOP 2 & CROSS-TIE EECOM' : 'ANOMALY ISOLATED & RESOLVED'}
            </button>
          </div>

          {/* Flight Rules Protocol */}
          <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-purple-400" />
              NASA Flight Director Rules
            </label>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Console Unanimity:</span>
                <span className="text-white font-bold">100% GO Required</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">NO-GO Handling:</span>
                <span className="text-rose-400 font-bold">Immediate Hold</span>
              </div>
              <p className="text-[11px] text-[#64748b] pt-1 border-t border-[#1e293b]">
                Flight Rules govern every contingency. Never make improvised decisions when established
                procedural workarounds exist in the Flight Operations manual.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
