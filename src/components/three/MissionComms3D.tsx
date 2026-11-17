import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  Activity,
  Globe2,
  Compass,
} from 'lucide-react';
import type { MissionCommsMessage } from '../../types/training';

// 3D Deep Space Network (DSN) 70m Parabolic Dish & Spacecraft Receiver
const DSNStationAndSatellite: React.FC<{
  isTransmitting: boolean;
  targetBody: 'Moon' | 'Mars';
}> = ({ isTransmitting, targetBody }) => {
  const dishRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Gentle dish tracking sweep
    if (dishRef.current) {
      dishRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  const satPos: [number, number, number] = targetBody === 'Mars' ? [4.5, 3.0, -4.0] : [3.0, 2.5, -2.5];

  return (
    <group>
      {/* Ground DSN Facility Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.0, -1.2, 0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.2, 0.4, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* 70-meter Parabolic Dish Structure */}
      <group position={[-3.0, -0.6, 0]} ref={dishRef}>
        {/* Pedestal */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.45, 1.0, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Main Dish Reflector */}
        <group position={[0, 1.2, 0]} rotation={[0.6, 0.4, 0]}>
          <mesh>
            <cylinderGeometry args={[1.6, 0.2, 0.4, 32, 1, true]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          {/* Subreflector tripod feed */}
          <mesh position={[0, 0.6, 0]}>
            <coneGeometry args={[0.2, 0.4, 16]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      <Text position={[-3.0, 1.8, 0]} fontSize={0.22} color="#38bdf8" anchorX="center">
        DSN Goldstone (70m Dish)
      </Text>

      {/* Distant Spacecraft in Orbit */}
      <group position={satPos}>
        <mesh>
          <boxGeometry args={[0.5, 0.4, 0.4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
        </mesh>
        {/* Solar panels */}
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.7, 0.25, 0.05]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} />
        </mesh>
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.7, 0.25, 0.05]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} />
        </mesh>
        <Text position={[0, 0.6, 0]} fontSize={0.2} color="#f59e0b" anchorX="center">
          {targetBody === 'Mars' ? 'Ares Outpost (Mars Orbit)' : 'Artemis Crew (Lunar Surface)'}
        </Text>
      </group>

      {/* Microwave Transmission Beam */}
      {isTransmitting && (
        <Line
          points={[[-3.0, 0.6, 0], satPos]}
          color="#38bdf8"
          lineWidth={4}
          dashed
          dashScale={2}
          dashSize={0.4}
          gapSize={0.2}
        />
      )}
    </group>
  );
};

export const MissionComms3D: React.FC = () => {
  const [targetBody, setTargetBody] = useState<'Moon' | 'Mars'>('Moon');
  const [messages, setMessages] = useState<MissionCommsMessage[]>([
    {
      messageId: 'm1',
      sender: 'CAPCOM',
      recipient: 'COMMANDER',
      priority: 'ROUTINE',
      subject: 'Descent Gate Clearance',
      messageText: 'Artemis, Houston CAPCOM. Telemetry verifies descent stage helium pressure nominal. You are GO for powered descent initiation (PDI).',
      simulatedDelaySeconds: 1.3,
      sentAtUtc: 'MET 74:15:20',
      isReadBackConfirmed: true,
    },
    {
      messageId: 'm2',
      sender: 'COMMANDER',
      recipient: 'CAPCOM',
      priority: 'ROUTINE',
      subject: 'PDI Read-Back',
      messageText: 'Houston, Artemis copies GO for PDI. Radar altimeter locked at 15 km, master arm energized, thrusters burning.',
      simulatedDelaySeconds: 1.3,
      sentAtUtc: 'MET 74:15:24',
      isReadBackConfirmed: true,
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('Verify secondary oxygen loop pressure prior to hatch ingress.');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [transitCountdown, setTransitCountdown] = useState<number>(0);

  const delaySec = targetBody === 'Moon' ? 1.3 : 180.0; // Mars 3-min delay simulated

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isTransmitting) return;

    setIsTransmitting(true);
    setTransitCountdown(Math.ceil(delaySec));

    const countdownInterval = setInterval(() => {
      setTransitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setIsTransmitting(false);
      setMessages((prev) => [
        ...prev,
        {
          messageId: `msg-${Date.now()}`,
          sender: 'CAPCOM',
          recipient: 'CREW',
          priority: 'PRIORITY',
          subject: 'Flight Directive',
          messageText: inputMessage,
          simulatedDelaySeconds: delaySec,
          sentAtUtc: 'MET 74:18:02',
          isReadBackConfirmed: true,
        },
      ]);
    }, Math.min(3500, delaySec * 1000));
  };

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              DEEP SPACE NETWORK & FLIGHT VOICE LOOP
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 04 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              CAPCOM Voice Conduit // 3-Way Read-Back Syntax // Interplanetary Latency Buffer
            </p>
          </div>
        </div>

        {/* Destination Toggle */}
        <div className="flex items-center gap-1.5 bg-[#050914] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setTargetBody('Moon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              targetBody === 'Moon'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Moon (~1.3s DSN)
          </button>
          <button
            onClick={() => setTargetBody('Mars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              targetBody === 'Mars'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Mars (~180s Buffer)
          </button>
        </div>
      </div>

      {/* 3D Antenna & Spacecraft Canvas */}
      <div className="relative w-full h-[460px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 4.0, 9.0], fov: 46 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 15, 8]} intensity={1.7} castShadow />
          <directionalLight position={[-8, 4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <DSNStationAndSatellite
              isTransmitting={isTransmitting}
              targetBody={targetBody}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={4.0}
            maxDistance={20}
          />
        </Canvas>

        {/* In-Canvas Latency Banner */}
        {isTransmitting && (
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-amber-950/90 backdrop-blur-md border border-amber-500 text-amber-200 text-xs font-mono flex items-center gap-2 animate-pulse">
            <Radio className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-300">MICROWAVE PACKET IN FLIGHT...</p>
              <p className="text-[11px] text-amber-200/80">
                Speed-of-light propagation delay: {delaySec}s ({targetBody} orbital range)
              </p>
            </div>
          </div>
        )}

        {/* Read-Back Compliance Badge */}
        <div className="absolute top-4 right-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1 min-w-[240px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">READ-BACK STATUS:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>VOICE CONDUIT:</span>
            <span className="text-white font-bold">CAPCOM ONLY</span>
          </div>
        </div>
      </div>

      {/* Voice Loop Console & Message Dispatcher */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Communications Log */}
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Air-to-Ground Voice Loop Transcript ({messages.length})
          </label>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.messageId}
                className="p-2.5 rounded-xl bg-[#050914] border border-[#1e293b] text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">
                    {msg.sender} &rarr; {msg.recipient} [{msg.sentAtUtc}]
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Read-Back Confirmed
                  </span>
                </div>
                <p className="text-slate-200">{msg.messageText}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Instruction */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
              <Send className="w-4 h-4 text-amber-400" />
              CAPCOM Dispatch Packet
            </label>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-xl bg-[#050914] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={isTransmitting || !inputMessage.trim()}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-950/50"
          >
            <Send className="w-3.5 h-3.5" />
            {isTransmitting ? `UPLINKING (${transitCountdown}s)...` : `DISPATCH OVER DSN (${delaySec}s)`}
          </button>
        </div>
      </div>
    </div>
  );
};
