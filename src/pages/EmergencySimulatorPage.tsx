import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Shield,
  Gauge,
  Radio,
  Clock,
  Wind,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Flame,
  Zap,
  HeartPulse,
  Users,
  Award,
  ArrowRight,
  Maximize2,
  Send,
  Lock,
  Unlock,
  AlertOctagon,
  Layers,
} from 'lucide-react';
import { EmergencySimulator3D } from '../components/three/EmergencySimulator3D';
import { emergencyApi } from '../services/api/emergencyApi';
import type {
  EmergencyScenario,
  EmergencyActionResponse,
  EmergencyCompleteResponse,
  EmergencyCommMessage,
} from '../types/training';
import { toast } from 'sonner';

export const EmergencySimulatorPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<EmergencyScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<EmergencyScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [commText, setCommText] = useState('');
  const [isSendingComm, setIsSendingComm] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Debrief Modal
  const [showDebrief, setShowDebrief] = useState(false);
  const [debriefResult, setDebriefResult] = useState<EmergencyCompleteResponse | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Load scenarios on mount
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setIsLoading(true);
        const data = await emergencyApi.getScenarios();
        setScenarios(data);
        if (data.length > 0) {
          const started = await emergencyApi.startScenario(data[0].scenarioId);
          setActiveScenario(started);
          setSecondsRemaining(Math.round(started.timeLimitSeconds));
          setActionLog([`Simulation initialized: ${started.title}`]);
        }
      } catch (err) {
        console.error('Failed to load emergency scenarios:', err);
        toast.error('Failed to connect to Mission Control telemetry.');
      } finally {
        setIsLoading(false);
      }
    };
    loadScenarios();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  // Handle switching scenario
  const handleSelectScenario = async (scenario: EmergencyScenario) => {
    try {
      setIsLoading(true);
      const started = await emergencyApi.startScenario(scenario.scenarioId);
      setActiveScenario(started);
      setSecondsRemaining(Math.round(started.timeLimitSeconds));
      setIsTimerRunning(true);
      setShowDebrief(false);
      setDebriefResult(null);
      setActionLog([`Emergency Scenario selected: ${started.title}`]);
      toast.info(`Switched to: ${started.scenarioCode}`);
    } catch (err) {
      console.error('Error switching scenario:', err);
      toast.error('Failed to load emergency drill.');
    } finally {
      setIsLoading(false);
    }
  };

  // Execute an action
  const handleExecuteAction = async (actionCode: string) => {
    if (!activeScenario || isExecutingAction) return;

    try {
      setIsExecutingAction(true);
      const result: EmergencyActionResponse = await emergencyApi.executeAction(
        activeScenario.scenarioId,
        { actionCode }
      );

      // Mutate active scenario state locally with authoritative result
      setActiveScenario((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          environment: result.environment,
          systemStatus: result.systemStatus,
          crewStatus: result.crewStatus,
          objectives: prev.objectives,
        };
      });

      setActionLog((prev) => [result.feedbackMessage, ...prev.slice(0, 8)]);
      toast.success(result.feedbackMessage);

      if (result.isResolved) {
        toast.success('Emergency hazard stabilized! All critical flight rules met.');
      }
    } catch (err) {
      console.error('Action execution failed:', err);
      toast.error('Action failed to execute on spacecraft bus.');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Send message on radio loop
  const handleSendCommunication = async (textToSend?: string) => {
    const msg = textToSend || commText;
    if (!activeScenario || !msg.trim() || isSendingComm) return;

    try {
      setIsSendingComm(true);
      const userMsg: EmergencyCommMessage = {
        messageId: Date.now().toString(),
        sender: 'CREW',
        channel: 'SPACE_TO_GROUND_1',
        text: msg,
        timestampUtc: new Date().toISOString(),
      };

      // Append crew message locally
      setActiveScenario((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          commHistory: [...prev.commHistory, userMsg],
        };
      });

      setCommText('');

      const reply = await emergencyApi.sendCommunication(activeScenario.scenarioId, {
        messageText: msg,
        targetRecipient: 'CAPCOM',
      });

      // Append CapCom reply
      setActiveScenario((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          commHistory: [...prev.commHistory, reply],
        };
      });
    } catch (err) {
      console.error('Communication error:', err);
      toast.error('Radio loop packet transmission failure.');
    } finally {
      setIsSendingComm(false);
    }
  };

  // Complete Drill
  const handleCompleteScenario = async () => {
    if (!activeScenario || isCompleting) return;

    try {
      setIsCompleting(true);
      const response = await emergencyApi.completeScenario(activeScenario.scenarioId, {
        executedChecklistItems: activeScenario.objectives,
        evacuationUndocked: activeScenario.systemStatus.evacuationVehicleReady,
      });

      setDebriefResult(response);
      setShowDebrief(true);
      setIsTimerRunning(false);
    } catch (err) {
      console.error('Error completing drill:', err);
      toast.error('Failed to submit emergency evaluation.');
    } finally {
      setIsCompleting(false);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="min-h-screen bg-[#050914] text-white flex flex-col">
      {/* Top Mission Control Header */}
      <header className="h-16 border-b border-[#1E2E4A] bg-[#070D1A]/95 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/academy/emergency"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h1 className="text-sm md:text-base font-bold font-mono tracking-wider text-white">
                EMERGENCY FLIGHT OPERATIONS CENTER
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                LIVE DRILL
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Authoritative Simulation Engine • Flight Rules Hierarchy: Life Safety &gt; Vehicle &gt; Mission
            </p>
          </div>
        </div>

        {/* Timer & Completion Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">T-REMAINING:</span>
            <span
              className={`font-bold ${
                secondsRemaining < 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={handleCompleteScenario}
            disabled={isCompleting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
          >
            <Award className="w-4 h-4" />
            COMPLETE DRILL &amp; DEBRIEF
          </button>
        </div>
      </header>

      {/* Scenario Selector Ribbon */}
      <div className="bg-[#0B1528] border-b border-[#1E2E4A] px-4 py-2 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          DRILL SELECTOR:
        </span>
        {scenarios.map((sc) => {
          const isSelected = activeScenario?.scenarioId === sc.scenarioId;
          return (
            <button
              key={sc.scenarioId}
              onClick={() => handleSelectScenario(sc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {sc.scenarioCode}: {sc.title.split('–')[1] || sc.title}
            </button>
          );
        })}
      </div>

      {/* Main Mission Control Grid */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1920px] mx-auto w-full">
        {/* Left Column: 3D Visualization + Actions (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* 3D Canvas Box */}
          <div className="h-[460px] lg:h-[540px] w-full rounded-2xl overflow-hidden bg-space-950 border border-space-800 shadow-2xl relative">
            <EmergencySimulator3D scenario={activeScenario} />
          </div>

          {/* Action Protocol Console */}
          <div className="bg-[#070D1A] border border-[#1E2E4A] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-white">
                  EMERGENCY ACTION PROTOCOL CONSOLE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                SELECT AUTHORIZED FLIGHT INTERVENTIONS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleExecuteAction('SILENCE_ALARM')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                Silence Master Alarm
              </button>

              <button
                onClick={() => handleExecuteAction('DON_MASK')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-emerald-300 flex items-center gap-2 transition-all"
              >
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                Don 100% O2 Mask
              </button>

              <button
                onClick={() => handleExecuteAction('SEAL_HATCH')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Seal Module Hatches
              </button>

              <button
                onClick={() => handleExecuteAction('SHUTDOWN_VENTILATION')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-300 flex items-center gap-2 transition-all"
              >
                <Wind className="w-3.5 h-3.5 text-rose-400" />
                Stop IMV Ventilation
              </button>

              <button
                onClick={() => handleExecuteAction('DISCHARGE_EXTINGUISHER')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 flex items-center gap-2 transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Discharge PFE Mist
              </button>

              <button
                onClick={() => handleExecuteAction('ENGAGE_TOXIC_SCRUBBER')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold text-slate-300 hover:text-indigo-300 flex items-center gap-2 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Start Toxic Scrubber
              </button>

              <button
                onClick={() => handleExecuteAction('ISOLATE_O2_VALVE')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Isolate O2 Valve
              </button>

              <button
                onClick={() => handleExecuteAction('INJECT_NITROGEN_DILUTION')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-emerald-300 flex items-center gap-2 transition-all"
              >
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                Inject N2 Dilution
              </button>

              <button
                onClick={() => handleExecuteAction('DEPLOY_WATER_WALLS')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Deploy Water Walls
              </button>

              <button
                onClick={() => handleExecuteAction('EXECUTE_LOAD_SHED')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 flex items-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Shed Payload Loads
              </button>

              <button
                onClick={() => handleExecuteAction('ENGAGE_BUS_CROSSTIE')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Cross-Tie Power Bus
              </button>

              <button
                onClick={() => handleExecuteAction('DECLARE_MAYDAY')}
                className="px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-800 hover:bg-rose-900/60 text-xs font-bold text-rose-300 flex items-center gap-2 transition-all"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Declare MAYDAY
              </button>
            </div>

            {/* Recent Action Log */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span className="text-cyan-400 font-bold">LAST ACTION:</span>
              <span className="text-slate-200 truncate">{actionLog[0] || 'Awaiting action.'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry, Crew, Comms (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Environmental Telemetry Panel */}
          <div className="bg-[#070D1A] border border-[#1E2E4A] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-white">
                  ENVIRONMENTAL TELEMETRY
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {activeScenario?.environment?.pressureTrend || 'STABLE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">CABIN PRESSURE</span>
                <span
                  className={`text-xl font-mono font-bold ${
                    (activeScenario?.environment?.cabinPressureKpa ?? 101.3) < 90
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {(activeScenario?.environment?.cabinPressureKpa ?? 101.3).toFixed(1)} kPa
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">O2 FRACTION</span>
                <span
                  className={`text-xl font-mono font-bold ${
                    (activeScenario?.environment?.oxygenPercent ?? 20.9) > 24.1
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {(activeScenario?.environment?.oxygenPercent ?? 20.9).toFixed(1)}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">SMOKE DENSITY</span>
                <span
                  className={`text-xl font-mono font-bold ${
                    (activeScenario?.environment?.smokeObscurationPercent ?? 0) > 10
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {(activeScenario?.environment?.smokeObscurationPercent ?? 0).toFixed(1)}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">RADIATION RATE</span>
                <span
                  className={`text-xl font-mono font-bold ${
                    (activeScenario?.environment?.radiationDoseRateMicroSvHr ?? 22) > 100
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {(activeScenario?.environment?.radiationDoseRateMicroSvHr ?? 22).toFixed(0)} μSv/h
                </span>
              </div>
            </div>
          </div>

          {/* Crew Status Roster */}
          <div className="bg-[#070D1A] border border-[#1E2E4A] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-white">
                  CREW MUSTER &amp; VITALS
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">4 ACTIVE</span>
            </div>

            <div className="space-y-2">
              {(activeScenario?.crewStatus ?? []).map((crew) => (
                <div
                  key={crew.crewMemberId}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-white block">{crew.name}</span>
                    <span className="text-[10px] text-slate-400">{crew.role}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold block ${
                        crew.heartRateBpm > 100 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {crew.heartRateBpm} BPM • SpO2: {crew.spO2Percent}%
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        crew.maskEquipped
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {crew.maskEquipped ? 'MASK ON' : 'MASK OFF'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Space-to-Ground Comms Console */}
          <div className="bg-[#070D1A] border border-[#1E2E4A] rounded-2xl p-4 shadow-xl flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-white">
                  SPACE-TO-GROUND COMMS LOOP
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">SG-1 DIRECT</span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px] pr-1">
              {(activeScenario?.commHistory ?? []).map((m, i) => {
                const isCrew = m.sender === 'CREW';
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs font-mono ${
                      isCrew
                        ? 'bg-cyan-950/40 border border-cyan-800/60 ml-4'
                        : 'bg-slate-900/80 border border-slate-800 mr-4'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-cyan-400 block mb-0.5">
                      {m.sender}:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{m.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Transmitter Pills */}
            <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSendCommunication('All crew have donned emergency oxygen masks.')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              >
                &quot;Masks Donned&quot;
              </button>
              <button
                onClick={() => handleSendCommunication('Node 2 isolation hatch closed and dogs locked.')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              >
                &quot;Hatch Sealed&quot;
              </button>
              <button
                onClick={() => handleSendCommunication('Mayday declared. Moving to emergency return vehicle.')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800"
              >
                &quot;MAYDAY / Egress&quot;
              </button>
            </div>

            {/* Comms Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCommunication();
              }}
              className="mt-2 flex gap-2"
            >
              <input
                type="text"
                value={commText}
                onChange={(e) => setCommText(e.target.value)}
                placeholder="Transmit voice/data message to CapCom..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSendingComm}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Flight Director Debrief Modal */}
      {showDebrief && debriefResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative select-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    debriefResult.isPassed
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    FLIGHT DIRECTOR DEBRIEFING &amp; EVALUATION
                  </h3>
                  <span className="text-xs font-mono text-cyan-300">
                    {debriefResult.emergencyCertification}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">SCORE:</span>
                <span
                  className={`text-2xl font-bold ${
                    debriefResult.isPassed ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {debriefResult.score} / 100
                </span>
              </div>
            </div>

            {/* Debrief Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">PROTOCOL ADHERENCE</span>
                <span className="text-lg font-mono font-bold text-cyan-300">
                  {debriefResult.protocolAdherencePercent}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">CREW SURVIVAL</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {debriefResult.crewSurvivalScore}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">RESPONSE TIME</span>
                <span className="text-lg font-mono font-bold text-amber-400">
                  {debriefResult.elapsedSeconds}s
                </span>
              </div>
            </div>

            {/* Flight Director Notes */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 my-4 text-xs font-mono text-slate-300 leading-relaxed">
              <span className="text-cyan-400 font-bold block mb-1">DIRECTOR COMMENTARY:</span>
              {debriefResult.flightDirectorDebrief}
            </div>

            {/* Recommendations */}
            <div className="my-4">
              <span className="text-xs font-mono font-bold text-white block mb-2">
                OPERATIONAL RECOMMENDATIONS:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
                {debriefResult.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowDebrief(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close &amp; Resume Drill
              </button>
              <Link
                to="/academy/emergency"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                Return to Module 04
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
