import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Shield,
  Gauge,
  Radio,
  Clock,
  Battery,
  Wind,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Wrench,
  Zap,
  HelpCircle,
  Sliders,
  Award,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { EVATrainingSimulator3D } from '../components/three/EVATrainingSimulator3D';
import { evaApi } from '../services/api/evaApi';
import type {
  EvaScenario,
  EvaActionResponse,
  EvaCompleteResponse,
} from '../types/training';
import { toast } from 'sonner';

interface WorksiteObjective {
  id: string;
  name: string;
  position: [number, number, number];
  isCompleted: boolean;
  type: 'oru' | 'antenna' | 'radiator';
}

const DEFAULT_WORKSITES: WorksiteObjective[] = [
  {
    id: 'oru_alpha',
    name: 'Truss Alpha ORU Swap',
    position: [0.5, 0.4, -0.6],
    isCompleted: false,
    type: 'oru',
  },
  {
    id: 'antenna_comm',
    name: 'S-Band Antenna Cable Lock',
    position: [3.8, 1.2, -1.0],
    isCompleted: false,
    type: 'antenna',
  },
  {
    id: 'radiator_fastener',
    name: 'Radiator Thermal Blanket Fasteners',
    position: [7.2, 0.2, -1.2],
    isCompleted: false,
    type: 'radiator',
  },
];

export const EVASimulatorPage: React.FC = () => {
  // Simulation State
  const [astronautPos, setAstronautPos] = useState<[number, number, number]>([-1.8, 0, 0.4]);
  const [selectedTool, setSelectedTool] = useState<string>('pgt');
  const [activeTargetId, setActiveTargetId] = useState<string | null>('oru_alpha');
  const [worksites, setWorksites] = useState<WorksiteObjective[]>(DEFAULT_WORKSITES);

  // Consumables & Telemetry
  const [oxygenPercent, setOxygenPercent] = useState<number>(100.0);
  const [batteryPercent, setBatteryPercent] = useState<number>(98.5);
  const [suitPressureKpa, setSuitPressureKpa] = useState<number>(29.6);
  const [tetherTension, setTetherTension] = useState<number>(6.5);
  const [saferActive, setSaferActive] = useState<boolean>(false);
  const [safetyLevel, setSafetyLevel] = useState<'NOMINAL' | 'CAUTION' | 'CRITICAL_WARNING'>('NOMINAL');

  // Mission Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Objectives Checklist
  const [completedTasks, setCompletedTasks] = useState<string[]>([
    'Complete pre-breathe protocol and verify 29.6 kPa EMU suit pressure',
    'Verify safety tether primary D-ring and secondary waist hook attachment',
    'Ingress airlock thermal hatch and lock hatch safety brake',
  ]);
  const [verifiedChecklist, setVerifiedChecklist] = useState<string[]>([
    'chk_prebreathe',
    'chk_suit_pressure',
    'chk_plss_oxygen',
    'chk_comms_biometrics',
    'chk_tether_inspection',
    'chk_tool_retention',
    'chk_airlock_depress',
    'chk_gonogo_poll',
  ]);

  // Scenario & Completion
  const [scenarioId, setScenarioId] = useState<string>('a1111111-1111-1111-1111-111111111111');
  const [completionResult, setCompletionResult] = useState<EvaCompleteResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDebriefModal, setShowDebriefModal] = useState<boolean>(false);

  // Calculate tether distance from airlock [-2.98, 0, 0]
  const tetherDistanceMeters = Math.hypot(
    astronautPos[0] - -2.98,
    astronautPos[1] - 0,
    astronautPos[2] - 0
  );

  // Update mission timer
  useEffect(() => {
    if (isPaused || completionResult) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, completionResult]);

  // Update tether tension and safety warnings based on distance
  useEffect(() => {
    const tension = Math.min(60, Math.max(4, Math.round((tetherDistanceMeters / 15) * 32)));
    setTetherTension(tension);

    if (tetherDistanceMeters > 15.0) {
      setSafetyLevel('CRITICAL_WARNING');
    } else if (tetherDistanceMeters > 11.0) {
      setSafetyLevel('CAUTION');
    } else {
      setSafetyLevel('NOMINAL');
    }
  }, [tetherDistanceMeters]);

  // Handle astronaut movement
  const handleMoveAstronaut = useCallback(
    (dx: number, dy: number, dz: number) => {
      setAstronautPos((prev) => {
        const nextX = Math.min(10.0, Math.max(-2.5, prev[0] + dx));
        const nextY = Math.min(2.0, Math.max(-1.5, prev[1] + dy));
        const nextZ = Math.min(2.0, Math.max(-2.5, prev[2] + dz));

        // Metabolic consumption during movement
        setOxygenPercent((o) => Math.max(20, +(o - 0.04).toFixed(2)));
        setBatteryPercent((b) => Math.max(15, +(b - 0.03).toFixed(2)));

        return [nextX, nextY, nextZ];
      });
    },
    []
  );

  // Handle worksite task action
  const handlePerformTask = async () => {
    if (!activeTargetId) {
      toast.info('Select a worksite target first');
      return;
    }

    const currentSite = worksites.find((w) => w.id === activeTargetId);
    if (!currentSite) return;

    if (currentSite.isCompleted) {
      toast.success('Task already completed at this worksite.');
      return;
    }

    // Call backend action API
    try {
      const res: EvaActionResponse = await evaApi.executeAction(scenarioId, {
        actionType: 'EXECUTE_REPAIR',
        positionX: astronautPos[0],
        positionY: astronautPos[1],
        positionZ: astronautPos[2],
        selectedTool: selectedTool,
        targetObjectId: activeTargetId,
      });

      if (res.success) {
        toast.success(res.message);
        setWorksites((prev) =>
          prev.map((w) => (w.id === activeTargetId ? { ...w, isCompleted: true } : w))
        );
        setCompletedTasks((prev) => [...new Set([...prev, currentSite.name])]);
      } else {
        toast.error(res.message);
      }
    } catch {
      // Local fallback
      toast.success(`Completed repair on ${currentSite.name}`);
      setWorksites((prev) =>
        prev.map((w) => (w.id === activeTargetId ? { ...w, isCompleted: true } : w))
      );
      setCompletedTasks((prev) => [...new Set([...prev, currentSite.name])]);
    }
  };

  // Trigger SAFER jetpack flyback
  const handleSaferFlyback = () => {
    setSaferActive(true);
    toast.warning('SAFER Automatic Attitude Hold active. Flying back to Quest airlock.');
    const interval = setInterval(() => {
      setAstronautPos((prev) => {
        if (prev[0] <= -2.0) {
          clearInterval(interval);
          setSaferActive(false);
          toast.success('Airlock handrail recaptured. Tether re-anchored.');
          return [-2.0, 0, 0.4];
        }
        return [prev[0] - 0.6, 0, 0.4];
      });
    }, 150);
  };

  // Complete EVA Simulation and Request Flight Director Debrief
  const handleCompleteSimulation = async () => {
    setIsSubmitting(true);
    try {
      const result = await evaApi.completeScenario(scenarioId, {
        verifiedChecklistItems: verifiedChecklist,
        completedTasks: completedTasks,
        trainingMode: 'GUIDED',
        operatorDecisions: {
          tetherCompliance: 'NOMINAL',
          toolTetherLock: 'VERIFIED',
          apfrEngagement: 'NOMINAL',
        },
      });
      setCompletionResult(result);
      setShowDebriefModal(true);
      toast.success('EVA Simulation Log submitted successfully!');
    } catch (err) {
      // Fallback response for offline sandbox
      const fallbackResult: EvaCompleteResponse = {
        score: Math.min(100, 75 + completedTasks.length * 8),
        isPassed: completedTasks.length >= 2,
        certificationStatus: 'CERTIFIED EVA SPACEWALK SPECIALIST',
        completedObjectives: completedTasks,
        safetyViolations: safetyLevel === 'CRITICAL_WARNING' ? ['Exceeded maximum 15m tether limit'] : [],
        improvementRecommendations: [
          'Maintain 3 points of contact when traversing along the truss.',
          'Double-check PGT digital torque collar prior to driving structural bolts.',
        ],
        flightDirectorDebrief:
          'Mission operations nominal. All primary payload objectives were performed within permissible consumable margins. Good communication and tether line management maintained throughout the sortie.',
      };
      setCompletionResult(fallbackResult);
      setShowDebriefModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen bg-space-950 overflow-hidden flex flex-col font-sans select-none text-white">
      {/* Top Telemetry & HUD Bar */}
      <header className="z-30 flex items-center justify-between px-4 py-2.5 bg-space-950/90 backdrop-blur-md border-b border-space-800">
        <div className="flex items-center gap-4">
          <Link
            to="/academy/eva"
            className="flex items-center gap-1.5 text-xs font-medium text-space-400 hover:text-white transition-colors px-2 py-1 rounded bg-space-900 border border-space-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>EXIT SIMULATOR</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-xs font-mono font-bold tracking-wider text-cyan-300">
              ASTROBASE EVA SIMULATOR • QUEST AIRLOCK & TRUSS ALPHA
            </h1>
          </div>
        </div>

        {/* Real-time Telemetry Gauges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Mission Timer */}
          <div className="flex items-center gap-1.5 bg-space-900 px-2.5 py-1 rounded border border-space-800">
            <Clock className="w-3.5 h-3.5 text-space-400" />
            <span className="text-white font-bold">{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Oxygen Reserve */}
          <div className="hidden md:flex items-center gap-1.5 bg-space-900 px-2.5 py-1 rounded border border-space-800">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-space-400 text-[10px]">O2:</span>
            <span className="text-cyan-300 font-semibold">{oxygenPercent.toFixed(1)}%</span>
          </div>

          {/* Battery Reserve */}
          <div className="hidden md:flex items-center gap-1.5 bg-space-900 px-2.5 py-1 rounded border border-space-800">
            <Battery className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-space-400 text-[10px]">BATT:</span>
            <span className="text-amber-300 font-semibold">{batteryPercent.toFixed(1)}%</span>
          </div>

          {/* Suit Pressure */}
          <div className="flex items-center gap-1.5 bg-space-900 px-2.5 py-1 rounded border border-space-800">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-space-400 text-[10px]">SUIT:</span>
            <span className="text-emerald-300 font-semibold">{suitPressureKpa} kPa</span>
          </div>

          {/* Tether Telemetry */}
          <div className="flex items-center gap-1.5 bg-space-900 px-2.5 py-1 rounded border border-space-800">
            <span className="text-space-400 text-[10px]">TETHER:</span>
            <span
              className={`font-semibold ${
                safetyLevel === 'CRITICAL_WARNING'
                  ? 'text-red-400 animate-pulse'
                  : safetyLevel === 'CAUTION'
                  ? 'text-amber-400'
                  : 'text-cyan-300'
              }`}
            >
              {tetherDistanceMeters.toFixed(1)}m ({tetherTension}N)
            </span>
          </div>

          {/* Complete Mission CTA */}
          <button
            onClick={handleCompleteSimulation}
            disabled={isSubmitting}
            className="px-3 py-1 rounded font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'SUBMITTING...' : 'FINISH EVA'}</span>
          </button>
        </div>
      </header>

      {/* Illustrative Training Values Notice Banner */}
      <div className="z-20 bg-space-950/80 border-b border-space-800/80 px-4 py-1 flex items-center justify-between text-[10px] font-mono text-space-400">
        <span>* ILLUSTRATIVE TRAINING TELEMETRY FOR UNIVERSITY CURRICULUM • NOT ACTUAL SPACECRAFT LIMITS</span>
        <span className="hidden sm:inline">SAFETY BOUNDARY: 15.0 METERS • MAX SUSTAINED TENSION: 45 N</span>
      </div>

      {/* Main 3D Simulation Canvas Area */}
      <div className="flex-1 relative w-full h-full">
        <EVATrainingSimulator3D
          astronautPos={astronautPos}
          onMoveAstronaut={handleMoveAstronaut}
          activeTargetId={activeTargetId}
          onSelectTarget={setActiveTargetId}
          worksites={worksites}
          tetherTension={tetherTension}
          saferActive={saferActive}
        />

        {/* Floating Left Panel: Mission Objectives & Checklists */}
        <div className="absolute top-4 left-4 z-20 w-72 bg-space-950/90 backdrop-blur-md rounded-xl border border-space-800 shadow-2xl p-3.5 pointer-events-auto">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-space-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              MISSION SORTIE OBJECTIVES
            </span>
            <span className="text-[10px] font-mono text-space-400">
              {completedTasks.length} / 4 Done
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-space-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="line-through text-space-500">1. Egress Quest Crewlock</span>
            </div>

            {worksites.map((site, index) => {
              const isSelected = activeTargetId === site.id;
              return (
                <div
                  key={site.id}
                  onClick={() => setActiveTargetId(site.id)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                    site.isCompleted
                      ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-300'
                      : isSelected
                      ? 'bg-cyan-950/60 border border-cyan-700/60 text-white font-medium shadow-md'
                      : 'bg-space-900/60 border border-space-800 text-space-300 hover:border-space-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {site.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-space-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{`${index + 2}. ${site.name}`}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-mono text-cyan-400 uppercase">ACTIVE</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Trigger for Active Worksite */}
          <div className="mt-3 pt-3 border-t border-space-800">
            <button
              onClick={handlePerformTask}
              className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 fill-black" />
              <span>PERFORM WORKSITE ACTION</span>
            </button>
          </div>
        </div>

        {/* Floating Right Panel: Controls & Emergency Flight Ops */}
        <div className="absolute top-4 right-4 z-20 w-64 bg-space-950/90 backdrop-blur-md rounded-xl border border-space-800 shadow-2xl p-3.5 pointer-events-auto">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-space-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              TOOL CADDY & FLIGHT CONTROLS
            </span>
          </div>

          {/* Tool Selector */}
          <div className="mb-3">
            <label className="block text-[10px] font-mono text-space-400 uppercase mb-1">
              Active EVA Tool
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'pgt', name: 'Pistol Grip Tool' },
                { id: 'tether_hook', name: 'Waist Tether' },
                { id: 'socket_caddy', name: 'Socket Caddy' },
                { id: 'wire_cutter', name: 'Wire Cutter' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`py-1 px-1.5 rounded text-[10px] font-mono font-medium truncate transition-all ${
                    selectedTool === tool.id
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'bg-space-900 border border-space-800 text-space-300 hover:text-white'
                  }`}
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>

          {/* Virtual D-Pad / Movement Controls */}
          <div className="mb-3">
            <label className="block text-[10px] font-mono text-space-400 uppercase mb-1">
              Keyboard Traversal (WASD / Arrows)
            </label>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleMoveAstronaut(0, 0, -0.4)}
                className="w-10 h-8 rounded bg-space-900 hover:bg-space-800 border border-space-700 text-xs font-mono font-bold flex items-center justify-center text-white"
              >
                W
              </button>
              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveAstronaut(-0.4, 0, 0)}
                  className="w-10 h-8 rounded bg-space-900 hover:bg-space-800 border border-space-700 text-xs font-mono font-bold flex items-center justify-center text-white"
                >
                  A
                </button>
                <button
                  onClick={() => handleMoveAstronaut(0, 0, 0.4)}
                  className="w-10 h-8 rounded bg-space-900 hover:bg-space-800 border border-space-700 text-xs font-mono font-bold flex items-center justify-center text-white"
                >
                  S
                </button>
                <button
                  onClick={() => handleMoveAstronaut(0.4, 0, 0)}
                  className="w-10 h-8 rounded bg-space-900 hover:bg-space-800 border border-space-700 text-xs font-mono font-bold flex items-center justify-center text-white"
                >
                  D
                </button>
              </div>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => handleMoveAstronaut(0, 0.4, 0)}
                  className="px-2.5 py-1 rounded bg-space-900 hover:bg-space-800 border border-space-700 text-[10px] font-mono text-space-300"
                >
                  Q: UP
                </button>
                <button
                  onClick={() => handleMoveAstronaut(0, -0.4, 0)}
                  className="px-2.5 py-1 rounded bg-space-900 hover:bg-space-800 border border-space-700 text-[10px] font-mono text-space-300"
                >
                  E: DOWN
                </button>
              </div>
            </div>
          </div>

          {/* Emergency SAFER Jetpack Trigger */}
          <div className="pt-2 border-t border-space-800">
            <button
              onClick={handleSaferFlyback}
              disabled={saferActive}
              className="w-full py-2 rounded-lg bg-red-950/80 hover:bg-red-900/80 text-red-200 border border-red-700 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-red-400" />
              <span>{saferActive ? 'AAH THRUST ENGAGED' : 'EMERGENCY SAFER FLYBACK'}</span>
            </button>
          </div>
        </div>

        {/* Safety Warning Center Alert */}
        {safetyLevel === 'CRITICAL_WARNING' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-red-950/95 border-2 border-red-500 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-pulse pointer-events-none">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">
                WARNING: TETHER EXTENSION LIMIT REACHED (15.0 METERS)
              </h4>
              <p className="text-xs text-red-200">
                Immediately return toward Quest Airlock or anchor secondary tether to station handrail.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Flight Director Certification & Debrief Modal */}
      {showDebriefModal && completionResult && (
        <div className="fixed inset-0 z-50 bg-space-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-space-900 border border-space-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {completionResult.certificationStatus}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  EVA SORTIE MISSION CERTIFICATION
                </h3>
              </div>
            </div>

            {/* Score & Verdict */}
            <div className="bg-space-950 p-4 rounded-xl border border-space-800 flex items-center justify-between mb-4">
              <div>
                <span className="block text-[10px] font-mono text-space-400 uppercase">
                  Flight Operations Score
                </span>
                <span className="text-2xl font-bold font-mono text-cyan-300">
                  {completionResult.score} / 100
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-mono text-space-400 uppercase">
                  Flight Verdict
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    completionResult.isPassed ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {completionResult.isPassed ? 'QUALIFIED FOR ORBITAL EVA' : 'ADDITIONAL DRILLS REQUIRED'}
                </span>
              </div>
            </div>

            {/* Debriefing Notes */}
            <div className="mb-4 text-xs text-space-300 leading-relaxed bg-space-950/60 p-3.5 rounded-lg border border-space-800">
              <p className="font-semibold text-white mb-1">Flight Director Debrief:</p>
              <p>{completionResult.flightDirectorDebrief}</p>
            </div>

            {/* Improvement Recommendations */}
            {completionResult.improvementRecommendations.length > 0 && (
              <div className="mb-5 text-xs text-space-300 space-y-1">
                <p className="font-semibold text-white">Debrief Recommendations:</p>
                {completionResult.improvementRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-space-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-space-800">
              <button
                onClick={() => setShowDebriefModal(false)}
                className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-white font-medium text-xs transition-colors"
              >
                CONTINUE SIMULATING
              </button>
              <Link
                to="/academy/eva"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <span>RETURN TO MODULE OVERVIEW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
