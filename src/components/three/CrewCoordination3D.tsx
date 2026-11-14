import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  Users,
  Radio,
  Share2,
  Activity,
  ShieldCheck,
  Maximize2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface StationProps {
  position: [number, number, number];
  color: string;
  name: string;
  role: string;
  isSelected: boolean;
  onClick: () => void;
  status: string;
}

function CrewStation({ position, color, name, role, isSelected, onClick, status }: StationProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      {/* Console Pedestal */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 0.7, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : '#1e293b'}
          metalness={0.7}
          roughness={0.3}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {/* Holographic Station Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.58, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.9 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crew Hologram Avatar */}
      <mesh position={[0, 0.45, 0]}>
        <capsuleGeometry args={[0.18, 0.45, 8, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
        />
      </mesh>

      {/* Visor */}
      <mesh position={[0, 0.62, 0.12]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Text Label */}
      <Text position={[0, 1.0, 0]} fontSize={0.14} color="#f8fafc" anchorX="center">
        {name}
      </Text>
      <Text position={[0, 0.85, 0]} fontSize={0.10} color="#94a3b8" anchorX="center">
        {role}
      </Text>
      <Text position={[0, -0.85, 0]} fontSize={0.09} color={status === 'SYNCHRONIZED' ? '#4ade80' : '#facc15'} anchorX="center">
        [{status}]
      </Text>
    </group>
  );
}

function CommunicationDataLink({
  start,
  end,
  color,
  active,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  active: boolean;
}) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={active ? 2 : 1}
      transparent
      opacity={active ? 0.75 : 0.15}
    />
  );
}

function CoordinationScene({
  selectedStation,
  setSelectedStation,
  commsActive,
  handoverActive,
}: {
  selectedStation: string;
  setSelectedStation: (station: string) => void;
  commsActive: boolean;
  handoverActive: boolean;
}) {
  // Station Positions in Habitation Module
  const commanderPos: [number, number, number] = [0, 0, -1.8];
  const pilotPos: [number, number, number] = [-1.8, 0, 0];
  const sciencePos: [number, number, number] = [1.8, 0, 0];
  const engineerPos: [number, number, number] = [0, 0, 1.8];

  return (
    <group>
      {/* Central Module Floor Disk */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.8, 2.9, 0.1, 32]} />
        <meshStandardMaterial color="#091322" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Concentric Grid Rings on Deck */}
      <mesh position={[0, -0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.05, 32]} />
        <meshBasicMaterial color="#1e3a8a" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.25, 32]} />
        <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} />
      </mesh>

      {/* Central Holographic Hub */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={handoverActive ? '#f59e0b' : '#38bdf8'}
          emissive={handoverActive ? '#f59e0b' : '#38bdf8'}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* 4 Crew Stations */}
      <CrewStation
        position={commanderPos}
        color="#38bdf8"
        name="CDR. Sarah Stone"
        role="Commander"
        isSelected={selectedStation === 'CDR'}
        onClick={() => setSelectedStation('CDR')}
        status="SYNCHRONIZED"
      />
      <CrewStation
        position={pilotPos}
        color="#a855f7"
        name="PLT. Alex Torres"
        role="Flight Pilot"
        isSelected={selectedStation === 'PLT'}
        onClick={() => setSelectedStation('PLT')}
        status={handoverActive ? 'HANDOVER IN PROG' : 'SYNCHRONIZED'}
      />
      <CrewStation
        position={sciencePos}
        color="#10b981"
        name="DR. Elena Rostova"
        role="Science Lead"
        isSelected={selectedStation === 'SCI'}
        onClick={() => setSelectedStation('SCI')}
        status="SYNCHRONIZED"
      />
      <CrewStation
        position={engineerPos}
        color="#f59e0b"
        name="ENG. Marcus Vance"
        role="Flight Engineer"
        isSelected={selectedStation === 'ENG'}
        onClick={() => setSelectedStation('ENG')}
        status={handoverActive ? 'VERIFYING CHECK' : 'SYNCHRONIZED'}
      />

      {/* Inter-Station Communication Links */}
      <CommunicationDataLink
        start={[commanderPos[0], 0.4, commanderPos[2]]}
        end={[pilotPos[0], 0.4, pilotPos[2]]}
        color="#38bdf8"
        active={commsActive}
      />
      <CommunicationDataLink
        start={[commanderPos[0], 0.4, commanderPos[2]]}
        end={[sciencePos[0], 0.4, sciencePos[2]]}
        color="#10b981"
        active={commsActive}
      />
      <CommunicationDataLink
        start={[pilotPos[0], 0.4, pilotPos[2]]}
        end={[engineerPos[0], 0.4, engineerPos[2]]}
        color="#f59e0b"
        active={commsActive}
      />
      <CommunicationDataLink
        start={[sciencePos[0], 0.4, sciencePos[2]]}
        end={[engineerPos[0], 0.4, engineerPos[2]]}
        color="#a855f7"
        active={commsActive}
      />
    </group>
  );
}

export const CrewCoordination3D: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [commsActive, setCommsActive] = useState<boolean>(true);
  const [handoverActive, setHandoverActive] = useState<boolean>(false);
  const [protocolStep, setProtocolStep] = useState<number>(1);

  const getStationDetails = () => {
    switch (selectedStation) {
      case 'CDR':
        return {
          title: 'Commander Flight Station (CDR)',
          name: 'Col. Sarah Stone',
          primary: 'Strategic Flight Authority & Cross-Station Synchronization',
          load: '78% Optimal',
          channel: 'Space-to-Ground + Command Loop',
          action: 'Maintaining high-level situational perspective and crew workload pacing.',
        };
      case 'PLT':
        return {
          title: 'Pilot Navigation Station (PLT)',
          name: 'Alex Torres',
          primary: 'Dynamic Flight Control, Trajectory & RCS Attitude',
          load: '82% High Precision',
          channel: 'Internal Pilot Loop',
          action: 'Executing trajectory trim burn with CDR cross-check validation.',
        };
      case 'SCI':
        return {
          title: 'Science Payload Station (SCI)',
          name: 'Dr. Elena Rostova',
          primary: 'Laboratory Experiment Automation & Telemetry Logging',
          load: '65% Standard',
          channel: 'Ground Science Loop',
          action: 'Monitoring microgravity biological incubator environmental telemetry.',
        };
      case 'ENG':
        return {
          title: 'Flight Systems & ECLSS Station (ENG)',
          name: 'Marcus Vance',
          primary: 'Life Support, Power Distribution & Thermal Loops',
          load: '71% Balanced',
          channel: 'Engineering Telemetry Intercom',
          action: 'Verifying oxygen generation assembly scrubbers and thermal radiators.',
        };
      default:
        return {
          title: 'All-Crew Integrated Habitation Deck',
          name: '4-Crew Complement',
          primary: 'Distributed Situational Awareness & Shared Mental Model',
          load: '74% Fleet Balanced',
          channel: 'Internal Intercom (Active)',
          action: 'Continuous cross-monitoring and 3-way closed loop communication enabled.',
        };
    }
  };

  const details = getStationDetails();

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050b14] via-[#091528] to-[#040810] border border-cyan-900/40 shadow-2xl flex flex-col">
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-[#06111f]/80 backdrop-blur-md border-b border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                CRM MODULE 08 // LESSON 01
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 border border-cyan-700/50 text-cyan-300 rounded-full">
                SYNCHRONIZED COCKPIT LAB
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Crew Coordination & Multi-Station Handover Simulation
            </h2>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700">
            <Radio className={`w-3.5 h-3.5 ${commsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-slate-300">Loop:</span>
            <span className={commsActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {commsActive ? '3-WAY CLOSED' : 'MUTED'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#09172a] px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">Cross-Check:</span>
            <span className="text-cyan-400 font-bold">MANDATORY</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          camera={{ position: [0, 3.8, 4.8], fov: 48 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 4, 0]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[5, 8, 3]} intensity={1.2} />
          <Suspense fallback={null}>
            <CoordinationScene
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
              commsActive={commsActive}
              handoverActive={handoverActive}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2.5}
            maxDistance={8}
          />
        </Canvas>

        {/* Station Selection HUD Overlay (Top Right) */}
        <div className="absolute top-20 right-4 z-10 w-64 bg-[#081220]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl space-y-2">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Station Focus</span>
            <span className="text-cyan-400">{selectedStation}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setSelectedStation('ALL')}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all ${
                selectedStation === 'ALL'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/50'
                  : 'bg-[#0f1d33] text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              All Crew Deck
            </button>
            <button
              onClick={() => setSelectedStation('CDR')}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all ${
                selectedStation === 'CDR'
                  ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-900/50'
                  : 'bg-[#0f1d33] text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              CDR Station
            </button>
            <button
              onClick={() => setSelectedStation('PLT')}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all ${
                selectedStation === 'PLT'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-900/50'
                  : 'bg-[#0f1d33] text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              Pilot Station
            </button>
            <button
              onClick={() => setSelectedStation('SCI')}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all ${
                selectedStation === 'SCI'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/50'
                  : 'bg-[#0f1d33] text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              Science Lab
            </button>
            <button
              onClick={() => setSelectedStation('ENG')}
              className={`col-span-2 px-2.5 py-1.5 rounded text-xs font-mono transition-all ${
                selectedStation === 'ENG'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-900/50'
                  : 'bg-[#0f1d33] text-slate-300 hover:bg-[#162a4a]'
              }`}
            >
              Engineering Station (ECLSS)
            </button>
          </div>
        </div>

        {/* Selected Station Telemetry Card (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 w-80 bg-[#071322]/95 backdrop-blur-md border border-cyan-800/40 rounded-xl p-3.5 shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{details.title}</h3>
              <p className="text-xs text-cyan-400 font-mono">{details.name}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 border border-cyan-700/60 text-cyan-300 rounded">
              {details.load}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-slate-400 font-mono text-[11px] block">Role Function:</span>
              <span className="text-slate-200">{details.primary}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[11px] block">Active Communication:</span>
              <span className="text-slate-200">{details.action}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Control Strip */}
      <div className="px-6 py-3 bg-[#06111f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommsActive(!commsActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
              commsActive
                ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>3-Way Readback Audio: {commsActive ? 'ACTIVE' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => {
              setHandoverActive(!handoverActive);
              if (!handoverActive) {
                setProtocolStep((prev) => (prev % 3) + 1);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
              handoverActive
                ? 'bg-amber-600/30 border border-amber-500 text-amber-300 animate-pulse'
                : 'bg-[#0e1d33] border border-cyan-900 text-cyan-300 hover:bg-[#142947]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Simulate Shift Handover {handoverActive ? `(Step ${protocolStep}/3)` : ''}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
            Drag to Orbit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            Scroll to Zoom
          </span>
        </div>
      </div>
    </div>
  );
};
