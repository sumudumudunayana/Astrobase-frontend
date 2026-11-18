import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Activity,
  Layers,
  ChevronRight,
  Play,
  Pause,
  Rocket,
} from 'lucide-react';
import type { MissionTimelineTask } from '../../types/training';

// 3D Orbital Trajectory Arc with Progressing Spacecraft
const TrajectoryArc: React.FC<{
  progress: number;
}> = ({ progress }) => {
  const shipRef = useRef<THREE.Group>(null);

  // Generate elliptical transfer trajectory points
  const points: [number, number, number][] = [];
  const totalSteps = 60;
  for (let i = 0; i <= totalSteps; i++) {
    const t = (i / totalSteps) * Math.PI;
    const x = Math.sin(t) * 5.0 - 2.5;
    const y = Math.sin(t * 2) * 0.8;
    const z = Math.cos(t) * 3.5;
    points.push([x, y, z]);
  }

  useFrame(() => {
    if (shipRef.current) {
      const idx = Math.min(
        totalSteps - 1,
        Math.floor((progress / 100) * (totalSteps - 1))
      );
      const pt = points[idx] || [0, 0, 0];
      shipRef.current.position.set(pt[0], pt[1], pt[2]);
    }
  });

  return (
    <group>
      {/* Departure Body (Earth) */}
      <mesh position={[-2.5, 0, 3.5]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#0284c7" roughness={0.5} />
      </mesh>
      <Text position={[-2.5, 1.0, 3.5]} fontSize={0.25} color="#38bdf8" anchorX="center">
        Earth Departure
      </Text>

      {/* Arrival Body (Moon / Destination) */}
      <mesh position={[-2.5, 0, -3.5]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
      <Text position={[-2.5, 0.8, -3.5]} fontSize={0.25} color="#cbd5e1" anchorX="center">
        Lunar Destination
      </Text>

      {/* Trajectory Flight Path */}
      <Line points={points} color="#38bdf8" lineWidth={3} dashed dashScale={3} dashSize={0.5} gapSize={0.2} />

      {/* Progressing Spacecraft Model */}
      <group ref={shipRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.5, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} />
        </mesh>
        {/* Engine glow */}
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>
    </group>
  );
};

export const MissionTimeline3D: React.FC = () => {
  const [tasks, setTasks] = useState<MissionTimelineTask[]>([
    {
      taskId: 't1',
      phase: 'PRE_LAUNCH',
      title: 'T-24h Subsystem Cryo Loading & Checkout',
      startMinute: 0,
      durationMinutes: 180,
      dependsOnTaskIds: [],
      assignedCrewRole: 'COMMANDER',
      status: 'COMPLETED',
    },
    {
      taskId: 't2',
      phase: 'LAUNCH_TRANSIT',
      title: 'Trans-Lunar Injection (TLI) Trajectory Burn',
      startMinute: 240,
      durationMinutes: 90,
      dependsOnTaskIds: ['t1'],
      assignedCrewRole: 'PILOT',
      status: 'COMPLETED',
    },
    {
      taskId: 't3',
      phase: 'ORBITAL_INSERTION',
      title: 'Lunar Orbit Insertion & Descent Gate',
      startMinute: 420,
      durationMinutes: 120,
      dependsOnTaskIds: ['t2'],
      assignedCrewRole: 'PILOT',
      status: 'ACTIVE',
    },
    {
      taskId: 't4',
      phase: 'SURFACE_OPS',
      title: 'EVA 01: Power Array & Antenna Setup',
      startMinute: 600,
      durationMinutes: 360,
      dependsOnTaskIds: ['t3'],
      assignedCrewRole: 'FLIGHT_ENGINEER',
      status: 'PENDING',
    },
    {
      taskId: 't5',
      phase: 'SURFACE_OPS',
      title: 'EVA 02: Science Core Drilling & Traverse',
      startMinute: 1020,
      durationMinutes: 420,
      dependsOnTaskIds: ['t4'],
      assignedCrewRole: 'SCIENCE_SPECIALIST',
      status: 'PENDING',
    },
  ]);

  const [selectedTaskId, setSelectedTaskId] = useState<string>('t3');
  const [bufferPercent, setBufferPercent] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [flightProgress, setFlightProgress] = useState<number>(45);

  const selectedTask = tasks.find((t) => t.taskId === selectedTaskId) || tasks[0];
  const totalMissionMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const bufferMinutes = Math.round((bufferPercent / 100) * totalMissionMinutes);

  const handleAdjustDuration = (delta: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === selectedTaskId
          ? { ...t, durationMinutes: Math.max(30, t.durationMinutes + delta) }
          : t
      )
    );
  };

  return (
    <div className="w-full flex flex-col bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
      {/* Telemetry Header */}
      <div className="px-5 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
              MISSION TIMELINE SEQUENCING & BUFFER ALLOCATION
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Lesson 02 Simulation
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Critical Path Analysis // Dependency Predecessors // Contingency Operational Buffers
            </p>
          </div>
        </div>

        {/* Progress & Playback */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#050914] px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs font-mono">
            <span className="text-[#64748b]">MISSION ELAPSED:</span>
            <span className="text-cyan-400 font-bold">{flightProgress}%</span>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-[#0d152a] hover:bg-[#1e293b] text-[#94a3b8] hover:text-white rounded-xl border border-[#1e293b] transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D Trajectory Canvas */}
      <div className="relative w-full h-[460px] bg-[#030712] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 8, 8], fov: 46 }}>
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[8, 12, 6]} intensity={1.7} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={2400} factor={4} saturation={0} fade />

          <Suspense fallback={null}>
            <TrajectoryArc progress={flightProgress} />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={4.0}
            maxDistance={18}
          />
        </Canvas>

        {/* In-Canvas Critical Path Telemetry HUD */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#090d1a]/85 backdrop-blur-md border border-[#1e293b] text-xs font-mono space-y-1.5 min-w-[270px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">CRITICAL PATH STATUS:</span>
            <span className="font-bold text-emerald-400">NOMINAL SEQUENCE</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>TOTAL OPS DURATION:</span>
            <span className="text-white font-bold">{Math.round(totalMissionMinutes / 60)} hrs</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#94a3b8]">
            <span>CONTINGENCY BUFFER:</span>
            <span className="text-amber-400 font-bold">+{bufferMinutes} min ({bufferPercent}%)</span>
          </div>
          <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full" style={{ width: `${bufferPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Gantt Timeline Strip & Task Editor */}
      <div className="p-5 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Timeline Sequence List */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Operational Phases ({tasks.length})
          </label>
          <div className="space-y-1.5">
            {tasks.map((task) => (
              <button
                key={task.taskId}
                onClick={() => setSelectedTaskId(task.taskId)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedTaskId === task.taskId
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#0f172a]/60 border-[#1e293b] text-[#94a3b8] hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate">{task.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400'
                        : task.status === 'ACTIVE'
                        ? 'bg-cyan-950 text-cyan-400 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5">
                  Phase: {task.phase} // Duration: {task.durationMinutes}m // Role: {task.assignedCrewRole}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Task Configuration */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Task Duration & Dependency Inspector
            </label>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-[#64748b]">TASK:</span>
                <p className="text-white font-semibold mt-0.5">{selectedTask.title}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748b]">DURATION:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustDuration(-30)}
                    className="px-2 py-0.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-slate-200 rounded"
                  >
                    -30m
                  </button>
                  <span className="text-cyan-300 font-bold">{selectedTask.durationMinutes} min</span>
                  <button
                    onClick={() => handleAdjustDuration(30)}
                    className="px-2 py-0.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-slate-200 rounded"
                  >
                    +30m
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[#64748b]">PREREQUISITE DEPENDENCIES:</span>
                <p className="text-slate-300 mt-0.5">
                  {selectedTask.dependsOnTaskIds.length > 0
                    ? `Requires completion of: ${selectedTask.dependsOnTaskIds.join(', ')}`
                    : 'Initial milestone (No predecessor requirements)'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#050914] border border-[#1e293b] text-[11px] text-[#94a3b8]">
            Finish-to-Start (FS) rule: Task cannot begin until previous dependent orbital burn is verified complete.
          </div>
        </div>

        {/* Buffer Margin Controls */}
        <div className="space-y-3 bg-[#0d152a] p-3.5 rounded-xl border border-[#1e293b]/70">
          <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            Contingency Buffer Margin
          </label>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[#94a3b8] mb-1">
                <span>Operational Timeline Buffer:</span>
                <span className="text-amber-400 font-bold">{bufferPercent}% (+{bufferMinutes}m)</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="5"
                value={bufferPercent}
                onChange={(e) => setBufferPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="space-y-1.5 text-[11px] text-[#64748b]">
              <div className="flex justify-between">
                <span>Recommended Buffer (Nominal):</span>
                <span className="text-slate-300">15% – 20%</span>
              </div>
              <div className="flex justify-between">
                <span>Complex Surface EVA Buffer:</span>
                <span className="text-slate-300">25% (High friction)</span>
              </div>
            </div>

            <p className="text-[10px] text-[#64748b] pt-1 border-t border-[#1e293b]">
              Time buffers absorb unforeseen delay events without compressing critical pre-re-entry checklists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
