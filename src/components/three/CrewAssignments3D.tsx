import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Clock,
  Award,
  Layers,
} from 'lucide-react';
import type { CrewMemberProfile } from '../../types/training';

// 3D Spacecraft Flight Deck / Habitat Stations
const HabitatCockpitStations: React.FC<{
  selectedCrewId: string;
  onSelectStation: (id: string) => void;
}> = ({ selectedCrewId, onSelectStation }) => {
  const cockpitRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (cockpitRef.current) {
      cockpitRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const stations = [
    { id: 'c1', label: 'CDR Console', pos: [-1.4, 0, 1.0], color: '#38bdf8' },
    { id: 'c2', label: 'PILOT Console', pos: [1.4, 0, 1.0], color: '#06b6d4' },
    { id: 'c3', label: 'SCIENCE Bench', pos: [-1.4, 0, -1.2], color: '#a855f7' },
    { id: 'c4', label: 'ENG Rack', pos: [1.4, 0, -1.2], color: '#f59e0b' },
  ];

  return (
    <group ref={cockpitRef}>
      {/* Cockpit deck floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <cylinderGeometry args={[2.8, 3.2, 0.4, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Outer pressurized module bulkhead ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
        <ringGeometry args={[2.9, 3.1, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>

      {/* 4 Workstations */}
      {stations.map((st) => {
        const isSelected = selectedCrewId === st.id;
        return (
          <group
            key={st.id}
            position={[st.pos[0], st.pos[1], st.pos[2]]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStation(st.id);
            }}
          >
            {/* Operator chair & console */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.9, 0.6, 0.8]} />
              <meshStandardMaterial
                color={isSelected ? '#0284c7' : '#334155'}
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
            {/* Console display monitor */}
            <mesh position={[0, 0.45, -0.3]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.7, 0.4, 0.05]} />
              <meshStandardMaterial
                color={st.color}
                emissive={st.color}
                emissiveIntensity={isSelected ? 0.9 : 0.4}
              />
            </mesh>
            {/* Operator Station Tag */}
            <Text position={[0, 0.8, 0]} fontSize={0.16} color="#ffffff" anchorX="center">
              {st.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export const CrewAssignments3D: React.FC = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMemberProfile[]>([
    {
      crewId: 'c1',
      name: 'Commander Sarah Vance',
      role: 'COMMANDER',
      specialization: 'Mission Command & Descent Landing',
      maxWorkloadHoursPerSol: 8,
      assignedWorkloadHours: 6.5,
      backupCrewId: 'c2',
      backupCrewName: 'Pilot Marcus Chen',
      certifications: ['Command Pilot', 'Lunar Lander Level 3', 'EVA Lead'],
      healthStatus: 'NOMINAL',
    },
    {
      crewId: 'c2',
      name: 'Lieutenant Marcus Chen',
      role: 'PILOT',
      specialization: 'Orbital Navigation & GNC Propulsion',
      maxWorkloadHoursPerSol: 8,
      assignedWorkloadHours: 6.0,
      backupCrewId: 'c1',
      backupCrewName: 'Commander Sarah Vance',
      certifications: ['Orbital Rendezvous', 'Trajectory Astrodynamics', 'Docking'],
      healthStatus: 'NOMINAL',
    },
    {
      crewId: 'c3',
      name: 'Dr. Elena Rostova',
      role: 'SCIENCE_SPECIALIST',
      specialization: 'Planetary Geology & Astrobiology',
      maxWorkloadHoursPerSol: 8,
      assignedWorkloadHours: 7.0,
      backupCrewId: 'c4',
      backupCrewName: 'Dr. Tariq Al-Mansoor',
      certifications: ['Field Sampling', 'Spectroscopy', 'Planetary Protection Cat V'],
      healthStatus: 'NOMINAL',
    },
    {
      crewId: 'c4',
      name: 'Dr. Tariq Al-Mansoor',
      role: 'FLIGHT_ENGINEER',
      specialization: 'ECLSS, Cryogenics & Power Systems',
      maxWorkloadHoursPerSol: 8,
      assignedWorkloadHours: 5.5,
      backupCrewId: 'c3',
      backupCrewName: 'Dr. Elena Rostova',
      certifications: ['ECLSS Maintenance', 'Robotic Manipulator Arm', 'Cryo Loops'],
      healthStatus: 'NOMINAL',
    },
  ]);

  const [selectedCrewId, setSelectedCrewId] = useState<string>('c1');
  const selectedCrew = crewMembers.find((c) => c.crewId === selectedCrewId) || crewMembers[0];

  const handleAdjustHours = (delta: number) => {
    setCrewMembers((prev) =>
      prev.map((c) =>
        c.crewId === selectedCrewId
          ? {
              ...c,
              assignedWorkloadHours: Math.max(2.0, Math.min(12.0, parseFloat((c.assignedWorkloadHours + delta).toFixed(1)))),
            }
          : c
      )
    );
  };

  const isFatigueRisk = selectedCrew.assignedWorkloadHours > selectedCrew.maxWorkloadHoursPerSol;

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              CREW RESOURCE MANAGEMENT & WORKLOAD BALANCING
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 03 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Max 8.0h/Sol Workload Cap // Cross-Training Redundancy // Certified Backup Designation
            </p>
          </div>
        </div>

        {/* Total Crew Indicator */}
        <div className="flex items-center gap-2 bg-[#050914] px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs font-mono">
          <span className="text-[#64748b]">CREW COMPLEMENT:</span>
          <span className="text-white font-bold">{crewMembers.length} Astronauts</span>
        </div>
      </div>

      {/* 3D Habitat Cockpit Canvas */}
      <div className="relative w-full h-[460px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 4.5, 5.0], fov: 48 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 10, 6]} intensity={1.8} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <HabitatCockpitStations
              selectedCrewId={selectedCrewId}
              onSelectStation={(id) => setSelectedCrewId(id)}
            />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3.5}
            maxDistance={14}
          />
        </Canvas>

        {/* Selected Astronaut In-Canvas HUD */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1.5 min-w-[270px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">ACTIVE STATION:</span>
            <span className="font-bold text-cyan-400">{selectedCrew.role}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>NAME:</span>
            <span className="text-white font-bold">{selectedCrew.name}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>WORKLOAD:</span>
            <span
              className={`font-bold ${
                isFatigueRisk ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {selectedCrew.assignedWorkloadHours}h / 8.0h max
            </span>
          </div>
          <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFatigueRisk ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (selectedCrew.assignedWorkloadHours / 8.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fatigue Warning Banner */}
        {isFatigueRisk && (
          <div className="absolute top-4 right-4 p-3 rounded-xl bg-rose-950/90 backdrop-blur-md border border-rose-500 text-rose-200 text-xs font-mono flex items-center gap-2 max-w-[300px]">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-rose-300">FATIGUE VIOLATION ({selectedCrew.assignedWorkloadHours}h)</p>
              <p className="text-[11px] text-rose-200/80">
                Exceeds 8.0h maximum limit. Human error probability spikes during critical operations.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Station & Crew Workload Matrix */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Crew Roster Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            Astronaut Complement ({crewMembers.length})
          </label>
          <div className="space-y-2">
            {crewMembers.map((crew) => {
              const isOver = crew.assignedWorkloadHours > crew.maxWorkloadHoursPerSol;
              return (
                <button
                  key={crew.crewId}
                  onClick={() => setSelectedCrewId(crew.crewId)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                    selectedCrewId === crew.crewId
                      ? 'bg-cyan-950/70 border-cyan-500 text-white'
                      : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{crew.name}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isOver ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {crew.assignedWorkloadHours}h / 8h
                    </span>
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">
                    Role: {crew.role} // Backup: {crew.backupCrewName.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Astronaut Inspector */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-purple-400" />
              Specialization & Certifications
            </label>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-[#64748b]">SPECIALTY:</span>
                <p className="text-white font-semibold mt-0.5">{selectedCrew.specialization}</p>
              </div>
              <div>
                <span className="text-[#64748b]">ACTIVE CERTIFICATIONS:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCrew.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300 text-[10px]"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]">
                <span className="text-[#64748b]">DESIGNATED BACKUP:</span>
                <span className="text-cyan-300 font-bold">{selectedCrew.backupCrewName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
            <span className="text-xs font-mono text-[#94a3b8]">Adjust Daily Hours:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleAdjustHours(-0.5)}
                className="px-2.5 py-1 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-slate-200 rounded font-mono text-xs"
              >
                -0.5h
              </button>
              <button
                onClick={() => handleAdjustHours(0.5)}
                className="px-2.5 py-1 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-slate-200 rounded font-mono text-xs"
              >
                +0.5h
              </button>
            </div>
          </div>
        </div>

        {/* CRM Guidelines & Redundancy Rules */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            Crew Redundancy Architecture
          </label>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Piloting Redundancy:</span>
              <span className="text-emerald-400 font-bold">CDR &lt;-&gt; PILOT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Science / Tech Redundancy:</span>
              <span className="text-emerald-400 font-bold">SCI &lt;-&gt; ENG</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Biometric Health Status:</span>
              <span className="text-white font-bold">ALL NOMINAL</span>
            </div>
            <p className="text-[11px] text-[#64748b] pt-1 border-t border-[#1e293b]">
              Crew Resource Management (CRM): Every single operational function has a cross-trained
              second-in-command to guarantee mission continuity in case of illness or injury.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
