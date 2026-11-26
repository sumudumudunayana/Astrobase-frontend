import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Compass,
  Radio,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  Lock,
  Layers,
  Activity,
  Battery,
  Disc,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Camera,
  MapPin,
  Award,
  Globe2,
  Sliders,
} from 'lucide-react';
import { PlanetaryMission3D } from '../components/three/PlanetaryMission3D';
import { planetaryApi } from '../services/api/planetaryApi';
import type {
  PlanetaryMission,
  RoverTelemetry,
  ScientificSample,
  PlanetaryMissionCompleteResponse,
} from '../types/training';
import { toast } from 'sonner';

export const PlanetarySimulatorPage: React.FC = () => {
  const [missions, setMissions] = useState<PlanetaryMission[]>([]);
  const [activeMission, setActiveMission] = useState<PlanetaryMission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [isDrilling, setIsDrilling] = useState(false);
  const [drillProgress, setDrillProgress] = useState(0);

  // Command uplink queue with simulated communication delay
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isUplinking, setIsUplinking] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  // Mission debrief modal
  const [showDebrief, setShowDebrief] = useState(false);
  const [debriefResult, setDebriefResult] = useState<PlanetaryMissionCompleteResponse | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Load missions on mount
  useEffect(() => {
    const loadMissions = async () => {
      try {
        setIsLoading(true);
        const data = await planetaryApi.getMissions();
        if (data && data.length > 0) {
          setMissions(data);
          const started = await planetaryApi.startMission(data[0].missionId);
          setActiveMission(started);
          const commDelay =
            started.roverTelemetry?.commDelaySeconds ??
            started.telemetry?.commDelaySec ??
            3.5;
          setActionLog([
            `Surface Mission Initialized: ${started.title}`,
            `Communication Latency: ${commDelay}s round-trip buffer.`,
          ]);
        }
      } catch (err) {
        console.warn('Backend unavailable, initializing autonomous local simulation mode:', err);
        // Fallback default mission
        const defaultTelemetry: RoverTelemetry = {
          roverName: 'AstroBase Explorer I',
          batteryPercent: 98,
          powerDrawWatts: 320,
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          headingDegrees: 0,
          speedMps: 0.05,
          distanceTraveledMeters: 0,
          commSignalPercent: 95,
          commDelaySeconds: 3.5,
          mastCameraPitch: 0,
          mastCameraYaw: 0,
          roboticArmExtended: false,
          obstacleAhead: false,
          terrainSlopeWarning: 'NOMINAL (<5 deg)',
          subsystemWarnings: [],
          x: 0,
          z: 0,
          headingDeg: 0,
          batteryPct: 98,
          distanceTraversedMeters: 0,
          commDelaySec: 3.5,
        };

        const defaultSamples: ScientificSample[] = [
          {
            sampleId: 's1',
            sampleCode: 'SMP-01',
            targetName: 'Deltaic Mudstone Core',
            rockType: 'Lacustrine Smectite',
            targetBody: 'Mars',
            collectionMethod: 'PERCUSSIVE_CORE_DRILL',
            massGrams: 14.5,
            contaminationProtocolStatus: 'STERILE',
            scientificSignificance: 'Ancient lake bed with high biosignature preservation potential.',
            collectedAtUtc: new Date().toISOString(),
            isCollected: false,
            locationCoords: [4, -3],
            sampleName: 'Deltaic Mudstone Core',
            depthCm: 6.5,
            contaminationCheckPass: true,
          },
          {
            sampleId: 's2',
            sampleCode: 'SMP-02',
            targetName: 'Crater Floor Olivine Core',
            rockType: 'Cumulate Olivine Basalt',
            targetBody: 'Mars',
            collectionMethod: 'PERCUSSIVE_CORE_DRILL',
            massGrams: 16.2,
            contaminationProtocolStatus: 'STERILE',
            scientificSignificance: 'Igneous bedrock marking crystallization age of crater floor.',
            collectedAtUtc: new Date().toISOString(),
            isCollected: false,
            locationCoords: [-5, 4],
            sampleName: 'Crater Floor Olivine Core',
            depthCm: 6.8,
            contaminationCheckPass: true,
          },
        ];

        const defaultMission: PlanetaryMission = {
          missionId: 'b1111111-1111-1111-1111-111111111111',
          missionCode: 'MARS-SURF-01',
          title: 'Mars Jezero Delta Astrobiology Traverse',
          targetBody: 'Mars',
          landingSiteName: 'Octavia E. Butler Landing (Jezero Crater)',
          briefing: 'Investigate ancient delta sediments and extract core samples.',
          estimatedDurationMinutes: 45,
          objectives: ['Perform landing site survey', 'Extract lacustrine mudstone core', 'Verify zero organic contamination'],
          roverTelemetry: defaultTelemetry,
          collectedSamples: defaultSamples,
          observations: [],
          candidateLandingSites: [],
          telemetry: defaultTelemetry,
          samples: defaultSamples,
          status: 'IN_PROGRESS',
        };
        setMissions([defaultMission]);
        setActiveMission(defaultMission);
        setActionLog([
          `Surface Mission Initialized: ${defaultMission.title}`,
          `Autonomous Telemetry Nominal (3.5s Mars Comms Buffer).`,
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMissions();
  }, []);

  // Handle Rover Motion Action with Comm Delay Buffer
  const handleRoverAction = async (actionType: 'DRIVE_FORWARD' | 'DRIVE_REVERSE' | 'TURN_LEFT' | 'TURN_RIGHT' | 'PAN_MAST') => {
    if (!activeMission || isUplinking || isExecutingAction) return;

    const currentTelemetry = activeMission.telemetry || activeMission.roverTelemetry;
    const delaySec = currentTelemetry.commDelaySec || currentTelemetry.commDelaySeconds || 3.5;
    setIsUplinking(true);
    setPendingCommand(`${actionType} (${delaySec}s latency buffer)`);

    try {
      const response = await planetaryApi.executeRoverAction(activeMission.missionId, {
        actionType: actionType.startsWith('TURN') ? 'TURN' : 'DRIVE',
        moveDistanceMeters: actionType === 'DRIVE_REVERSE' ? -1.0 : 1.5,
        turnDegrees: actionType === 'TURN_LEFT' ? -25 : actionType === 'TURN_RIGHT' ? 25 : 0,
      });

      setTimeout(() => {
        setIsUplinking(false);
        setPendingCommand(null);
        setActiveMission((prev) =>
          prev
            ? {
                ...prev,
                telemetry: response.telemetry,
                roverTelemetry: response.telemetry,
              }
            : null
        );
        setActionLog((prev) => [
          `Uplink executed: ${actionType} -> ${response.feedbackMessage}`,
          ...prev.slice(0, 6),
        ]);
      }, delaySec * 1000);
    } catch (err) {
      // Local fallback execution
      setTimeout(() => {
        setIsUplinking(false);
        setPendingCommand(null);
        setActiveMission((prev) => {
          if (!prev) return null;
          const t = prev.telemetry || prev.roverTelemetry;
          let newX = t.x ?? t.positionX ?? 0;
          let newZ = t.z ?? t.positionZ ?? 0;
          let newHeading = t.headingDeg ?? t.headingDegrees ?? 0;
          const rad = (newHeading * Math.PI) / 180;

          if (actionType === 'DRIVE_FORWARD') {
            newX -= Math.sin(rad) * 1.2;
            newZ -= Math.cos(rad) * 1.2;
          } else if (actionType === 'DRIVE_REVERSE') {
            newX += Math.sin(rad) * 0.8;
            newZ += Math.cos(rad) * 0.8;
          } else if (actionType === 'TURN_LEFT') {
            newHeading = (newHeading - 25 + 360) % 360;
          } else if (actionType === 'TURN_RIGHT') {
            newHeading = (newHeading + 25) % 360;
          }

          const updatedTel: RoverTelemetry = {
            ...t,
            x: newX,
            z: newZ,
            positionX: newX,
            positionZ: newZ,
            headingDeg: newHeading,
            headingDegrees: newHeading,
            batteryPct: Math.max(10, (t.batteryPct ?? t.batteryPercent ?? 98) - 0.4),
            batteryPercent: Math.max(10, (t.batteryPct ?? t.batteryPercent ?? 98) - 0.4),
            distanceTraversedMeters: (t.distanceTraversedMeters ?? t.distanceTraveledMeters ?? 0) + 1.2,
            distanceTraveledMeters: (t.distanceTraversedMeters ?? t.distanceTraveledMeters ?? 0) + 1.2,
          };

          return {
            ...prev,
            telemetry: updatedTel,
            roverTelemetry: updatedTel,
          };
        });
        setActionLog((prev) => [`Command verified: ${actionType}`, ...prev.slice(0, 6)]);
      }, delaySec * 1000);
    }
  };

  // Handle Rock Sample Coring & Sealing
  const handleSampleCoring = async (sampleId: string) => {
    if (!activeMission || isDrilling) return;

    setIsDrilling(true);
    setDrillProgress(10);
    setActionLog((prev) => ['Robotic arm deployed. Starting rotary percussive drill...', ...prev.slice(0, 6)]);

    const interval = setInterval(() => {
      setDrillProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 20;
      });
    }, 400);

    setTimeout(async () => {
      try {
        const response = await planetaryApi.executeSampleAction(activeMission.missionId, {
          targetId: sampleId,
          toolType: 'PERCUSSIVE_CORE_DRILL',
          applyHermeticSeal: true,
          verifyContaminationBarrier: true,
        });

        setActiveMission((prev) => {
          if (!prev) return null;
          const currentList = prev.samples || prev.collectedSamples || [];
          const updated = currentList.map((s) =>
            s.sampleId === sampleId ? { ...s, isCollected: true } : s
          );
          return {
            ...prev,
            samples: updated,
            collectedSamples: updated,
          };
        });
        setActionLog((prev) => [
          `Sample acquired: ${response.feedbackMessage}`,
          ...prev.slice(0, 6),
        ]);
        toast.success('Core sample successfully drilled and hermetically sealed!');
      } catch (err) {
        // Local fallback
        setActiveMission((prev) => {
          if (!prev) return null;
          const currentList = prev.samples || prev.collectedSamples || [];
          const updated = currentList.map((s) =>
            s.sampleId === sampleId ? { ...s, isCollected: true } : s
          );
          return {
            ...prev,
            samples: updated,
            collectedSamples: updated,
          };
        });
        setActionLog((prev) => [
          `Core drilled & sealed in titanium sample tube: ${sampleId}`,
          ...prev.slice(0, 6),
        ]);
        toast.success('Core sample hermetically sealed.');
      } finally {
        setIsDrilling(false);
      }
    }, 2400);
  };

  // Complete Mission and Trigger Debrief
  const handleCompleteMission = async () => {
    if (!activeMission) return;
    setIsCompleting(true);
    const sampleList = activeMission.samples || activeMission.collectedSamples || [];
    const collectedIds = sampleList.filter((s) => s.isCollected).map((s) => s.sampleId);

    try {
      const result = await planetaryApi.completeMission(activeMission.missionId, {
        targetBody: activeMission.targetBody,
        completedObjectives: activeMission.objectives || [],
        collectedSampleIds: collectedIds,
        finalScienceReportSummary: 'Surface traverse completed with verified zero-contamination sample curation.',
      });
      setDebriefResult(result);
      setShowDebrief(true);
    } catch (err) {
      // Local fallback debrief
      const collectedCount = sampleList.filter((s) => s.isCollected).length;
      const score = Math.min(100, 60 + collectedCount * 20);
      setDebriefResult({
        missionId: activeMission.missionId,
        score,
        isPassed: score >= 70,
        passed: score >= 70,
        certificationTitle: 'CERTIFIED_PLANETARY_EXPLORER_TIER_1',
        elapsedSeconds: 1840,
        scientificYieldScore: 92,
        roverHealthScore: 96,
        samplesCollectedCount: collectedCount,
        completedObjectives: ['Surface Traverse Completed', 'Core Sample Sealed'],
        keyDiscoveries: ['Smectite clay lacustrine strata in Jezero crater paleolake.'],
        scientificRecommendations: ['Prioritize sample return for mass spectrometry analysis on Earth.'],
        flightDirectorDebrief: 'Excellent surface traverse execution. AutoNav avoided terrain hazards and samples were sealed without biological contamination.',
        flightDirectorComments: 'Flight Director: Planetary surface exploration certification approved. Nominal sample return readiness.',
        debriefNotes: 'Autonomous mobility and percussive coring verified compliant with Category V Planetary Protection requirements.',
        completedAt: new Date().toISOString(),
      });
      setShowDebrief(true);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSwitchMission = async (missionId: string) => {
    try {
      setIsLoading(true);
      const started = await planetaryApi.startMission(missionId);
      setActiveMission(started);
      setActionLog([`Mission selected: ${started.title}`]);
    } catch (err) {
      const m = missions.find((x) => x.missionId === missionId);
      if (m) setActiveMission(m);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !activeMission) {
    return (
      <div className="min-h-screen bg-[#050914] text-white flex flex-col items-center justify-center p-4">
        <Globe2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-lg font-mono text-cyan-300">ESTABLISHING PLANETARY SURFACE TELEMETRY...</h2>
        <p className="text-xs font-mono text-[#64748b] mt-1">Deep Space Network Uplink</p>
      </div>
    );
  }

  const sampleList = activeMission.samples || activeMission.collectedSamples || [];
  const collectedCount = sampleList.filter((s) => s.isCollected).length;
  const currentTelemetry = activeMission.telemetry || activeMission.roverTelemetry;
  const batteryPct = currentTelemetry.batteryPct ?? currentTelemetry.batteryPercent ?? 98;
  const distTraveled = currentTelemetry.distanceTraversedMeters ?? currentTelemetry.distanceTraveledMeters ?? 0;
  const commDelay = currentTelemetry.commDelaySec ?? currentTelemetry.commDelaySeconds ?? 3.5;

  return (
    <div className="min-h-screen bg-[#050914] text-white p-4 md:p-8 space-y-6 select-none">
      {/* Top Breadcrumb & Mission Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <Link to="/academy" className="hover:text-white transition-colors">
            Training Academy
          </Link>
          <span>/</span>
          <Link to="/academy/planetary" className="hover:text-white transition-colors">
            Module 05: Planetary Science
          </Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Surface Exploration Simulator</span>
        </div>

        {/* Mission Switcher */}
        <div className="flex items-center gap-2">
          {missions.map((m) => (
            <button
              key={m.missionId}
              onClick={() => handleSwitchMission(m.missionId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                activeMission.missionId === m.missionId
                  ? 'bg-cyan-950 border-cyan-500 text-white'
                  : 'bg-[#0b1329] border-[#1e293b] text-[#94a3b8] hover:text-white'
              }`}
            >
              {m.targetBody}: {m.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Viewport & Telemetry HUD */}
      <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        {/* Telemetry Bar */}
        <div className="px-6 py-3.5 bg-[#0b1329] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                {activeMission.title}
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                  {activeMission.targetBody} Surface
                </span>
              </h1>
              <p className="text-xs text-[#94a3b8] font-mono">
                Landing Site: {activeMission.landingSiteName}
              </p>
            </div>
          </div>

          {/* Critical Flight Telemetry Readouts */}
          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span className="text-[#94a3b8]">BATTERY:</span>
              <span className="text-emerald-400 font-bold">
                {batteryPct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-[#94a3b8]">ODOMETRY:</span>
              <span className="text-white font-bold">
                {distTraveled.toFixed(1)} m
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span className="text-[#94a3b8]">DSN LATENCY:</span>
              <span className="text-amber-400 font-bold">
                {commDelay}s
              </span>
            </div>
          </div>
        </div>

        {/* 3D Surface Canvas */}
        <div className="relative">
          <PlanetaryMission3D
            telemetry={currentTelemetry}
            samples={sampleList}
            targetBody={activeMission.targetBody}
            isDrilling={isDrilling}
            drillProgress={drillProgress}
          />

          {/* In-Canvas Latency Command Banner */}
          {isUplinking && pendingCommand && (
            <div className="absolute top-4 left-4 p-3 rounded-xl bg-amber-950/90 backdrop-blur-md border border-amber-500 text-amber-200 text-xs font-mono flex items-center gap-2 animate-pulse">
              <Radio className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-300">UPLINKING TO ROVER...</p>
                <p className="text-[11px] text-amber-200/80">{pendingCommand}</p>
              </div>
            </div>
          )}

          {/* Drill Status In-Canvas Banner */}
          {isDrilling && (
            <div className="absolute top-4 right-4 p-3 rounded-xl bg-cyan-950/90 backdrop-blur-md border border-cyan-500 text-white text-xs font-mono min-w-[220px]">
              <div className="flex justify-between mb-1">
                <span className="text-cyan-300 font-bold">ROTARY PERCUSSIVE DRILL:</span>
                <span>{drillProgress}%</span>
              </div>
              <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${drillProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Telemetry Deck */}
        <div className="p-6 bg-[#0a1022] border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rover Driving Deck */}
          <div className="space-y-3 bg-[#0d152a] p-4 rounded-xl border border-[#1e293b]/70">
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              Surface Mobility Controls
            </label>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleRoverAction('DRIVE_FORWARD')}
                disabled={isUplinking || isDrilling}
                className="w-32 py-2 px-3 rounded-xl bg-cyan-950 border border-cyan-500 hover:bg-cyan-900 disabled:opacity-40 text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-cyan-950/50 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4 text-cyan-400" />
                FORWARD
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRoverAction('TURN_LEFT')}
                  disabled={isUplinking || isDrilling}
                  className="w-24 py-2 px-3 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-500 disabled:opacity-40 text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  STEER L
                </button>
                <button
                  onClick={() => handleRoverAction('TURN_RIGHT')}
                  disabled={isUplinking || isDrilling}
                  className="w-24 py-2 px-3 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-500 disabled:opacity-40 text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  STEER R
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
              <button
                onClick={() => handleRoverAction('DRIVE_REVERSE')}
                disabled={isUplinking || isDrilling}
                className="w-32 py-2 px-3 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-500 disabled:opacity-40 text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 text-cyan-400" />
                REVERSE
              </button>
            </div>
          </div>

          {/* Target Sample Acquisition Station */}
          <div className="space-y-3 bg-[#0d152a] p-4 rounded-xl border border-[#1e293b]/70 flex flex-col justify-between">
            <div>
              <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5 mb-2">
                <Disc className="w-4 h-4 text-amber-400" />
                Scientific Sample Collection ({collectedCount} / {sampleList.length})
              </label>
              <div className="space-y-2">
                {sampleList.map((sample) => {
                  const sampleName = sample.targetName || sample.sampleName || 'Sample Target';
                  const coords = sample.locationCoords || [0, 0];

                  return (
                    <div
                      key={sample.sampleId}
                      className="p-2.5 rounded-xl bg-[#050914] border border-[#1e293b] flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{sampleName}</div>
                        <div className="text-[10px] text-[#64748b]">
                          Coords: [{coords[0]}, {coords[1]}] // {sample.rockType}
                        </div>
                      </div>
                      {sample.isCollected ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold px-2 py-1 bg-emerald-950/70 border border-emerald-800 rounded-lg text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> SEALED
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSampleCoring(sample.sampleId)}
                          disabled={isDrilling || isUplinking}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500 hover:bg-cyan-900 disabled:opacity-40 text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          EXTRACT
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCompleteMission}
              disabled={isCompleting}
              className="w-full mt-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              COMPLETE MISSION & FLIGHT DEBRIEF
            </button>
          </div>

          {/* DSN Telemetry & Mission Control Log */}
          <div className="space-y-3 bg-[#0d152a] p-4 rounded-xl border border-[#1e293b]/70">
            <label className="text-xs font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              Deep Space Network (DSN) Log
            </label>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {actionLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded-lg bg-[#050914] border border-[#1e293b] text-[11px] font-mono text-[#94a3b8]"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flight Director Mission Debrief Modal */}
      {showDebrief && debriefResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0b1329] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border ${
                  debriefResult.isPassed || debriefResult.passed
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : 'bg-rose-950 border-rose-500 text-rose-400'
                }`}
              >
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-mono">
                  MISSION DEBRIEFING: {debriefResult.isPassed || debriefResult.passed ? 'SUCCESSFUL' : 'EVALUATION PENDING'}
                </h3>
                <p className="text-xs font-mono text-[#94a3b8]">
                  Surface Exploration Operations Command
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#050914] border border-[#1e293b] space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#94a3b8]">MISSION EVALUATION SCORE:</span>
                <span
                  className={`text-lg font-bold ${
                    debriefResult.isPassed || debriefResult.passed ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {debriefResult.score}%
                </span>
              </div>
              <div className="border-t border-[#1e293b] pt-2">
                <span className="text-[#64748b]">FLIGHT DIRECTOR ASSESSMENT:</span>
                <p className="text-slate-200 mt-1">
                  {debriefResult.flightDirectorComments || debriefResult.flightDirectorDebrief}
                </p>
              </div>
              <div className="border-t border-[#1e293b] pt-2">
                <span className="text-[#64748b]">OPERATION NOTES:</span>
                <p className="text-slate-200 mt-1">
                  {debriefResult.debriefNotes || (debriefResult.keyDiscoveries && debriefResult.keyDiscoveries.join(' '))}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/academy/planetary"
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold text-center transition-colors"
              >
                RETURN TO MODULE 05 OVERVIEW
              </Link>
              <button
                onClick={() => setShowDebrief(false)}
                className="px-4 py-2.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-mono text-xs transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
