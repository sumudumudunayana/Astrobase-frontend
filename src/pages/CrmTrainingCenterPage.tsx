import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  Radar,
  HeartPulse,
  MessageSquare,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Activity,
  CheckCircle2,
  RefreshCw,
  Send,
  Zap,
  Sliders,
  Bed,
  FileText,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { crmApi } from '../services/api/crmApi';
import type {
  CrmTrainingCenterState,
  CrmCrewMember,
  CrmTask,
  CrmLeadershipScenario,
  CrmConflictScenario,
  CrmSituationalTelemetry,
  CrmMissionDebrief,
  ExecuteCrmActionRequest,
} from '../types/training';
import { CrewAssignments3D } from '../components/three/CrewAssignments3D';
import { CrewCoordination3D } from '../components/three/CrewCoordination3D';
import { LeadershipPressure3D } from '../components/three/LeadershipPressure3D';
import { SituationalAwareness3D } from '../components/three/SituationalAwareness3D';
import { CrewFatigue3D } from '../components/three/CrewFatigue3D';
import { ConflictResolution3D } from '../components/three/ConflictResolution3D';
import { MissionDebriefing3D } from '../components/three/MissionDebriefing3D';

type StationTab = 'CREW' | 'COORDINATION' | 'LEADERSHIP' | 'AWARENESS' | 'WELLNESS' | 'CONFLICT' | 'DEBRIEF';

export const CrmTrainingCenterPage: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string>('LUNAR_EXPEDITION_CRM');
  const [activeTab, setActiveTab] = useState<StationTab>('CREW');
  const [state, setState] = useState<CrmTrainingCenterState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  const [show3dSim, setShow3dSim] = useState<boolean>(true);

  // Load state on mount or scenario switch
  const loadState = async (scenarioCode: string) => {
    setIsLoading(true);
    try {
      const data = await crmApi.getState(scenarioCode);
      setState(data);
      if (data.crewRoster.length > 0 && !selectedCrewId) {
        setSelectedCrewId(data.crewRoster[0].crewId);
      }
    } catch (err) {
      console.error('Failed to load CRM state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState(activeScenario);
  }, [activeScenario]);

  // Execute an authoritative CRM action
  const handleExecuteAction = async (
    actionType: string,
    targetId?: string,
    parameterValue?: string,
    rationale?: string
  ) => {
    if (!state) return;
    setIsExecuting(true);
    setActionFeedback(null);
    try {
      const req: ExecuteCrmActionRequest = {
        scenarioId: state.activeScenarioCode,
        actionType,
        targetId,
        parameterValue,
        decisionRationale: rationale || 'Standard CRM Protocol Execution',
      };
      const res = await crmApi.executeAction(req);
      setActionFeedback(res.feedbackMessage);

      // Update local state with returned crew and tasks
      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          crewRoster: res.crew,
          activeTasks: res.tasks,
          latestDebrief: res.finalDebrief || prev.latestDebrief,
        };
      });
    } catch (err) {
      console.error('Failed to execute action:', err);
      setActionFeedback('Action failed to execute. Telemetry connection error.');
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedCrew = state?.crewRoster.find((c) => c.crewId === selectedCrewId) || state?.crewRoster[0];

  return (
    <div className="min-h-screen bg-[#050914] text-white p-4 md:p-8 space-y-6 select-none">
      {/* Header & Scenario Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Link to="/academy" className="hover:text-white transition-colors">
              Academy
            </Link>
            <span>/</span>
            <Link to="/academy/crm" className="hover:text-white transition-colors">
              Module 08: CRM
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Training Center</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold font-mono text-white tracking-wide mt-1">
            Crew Resource Management Command Center
          </h1>
        </div>

        {/* Scenario Switcher Controls */}
        <div className="flex items-center gap-2 bg-[#09172a] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveScenario('LUNAR_EXPEDITION_CRM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeScenario === 'LUNAR_EXPEDITION_CRM'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌙 Lunar Expedition (Artemis Base)
          </button>
          <button
            onClick={() => setActiveScenario('MARS_TRANSIT_CRM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeScenario === 'MARS_TRANSIT_CRM'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔴 Mars Transit (Deep Space)
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mission Metrics Bar */}
      {state && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-[#09172a] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Mission Profile</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{state.missionTitle}</span>
          </div>
          <div className="bg-[#09172a] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Target Body</span>
            <span className="text-xs font-mono font-bold text-white">{state.targetBody}</span>
          </div>
          <div className="bg-[#09172a] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Mission Elapsed Time</span>
            <span className="text-xs font-mono font-bold text-amber-400">{state.missionElapsedTimeHours} MET Hours</span>
          </div>
          <div className="bg-[#09172a] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Crew Complement</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{state.crewRoster.length} Astronauts</span>
          </div>
          <div className="bg-[#09172a] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Tasks</span>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {state.activeTasks.filter((t) => t.status !== 'COMPLETED').length} Pending
            </span>
          </div>
          <div className="bg-[#09172a] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">3D Lab Visualizer</span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {show3dSim ? 'EXPANDED' : 'COLLAPSED'}
              </span>
            </div>
            <button
              onClick={() => setShow3dSim(!show3dSim)}
              className="p-1.5 rounded-lg bg-[#0e1d33] hover:bg-cyan-700 text-cyan-300 transition-colors"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Optional 3D Lab Simulation Viewer */}
      {show3dSim && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
              Active Station 3D Simulation
            </span>
            <button
              onClick={() => setShow3dSim(false)}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Close Visualizer
            </button>
          </div>
          {activeTab === 'CREW' ? (
            <CrewAssignments3D />
          ) : activeTab === 'COORDINATION' ? (
            <CrewCoordination3D />
          ) : activeTab === 'LEADERSHIP' ? (
            <LeadershipPressure3D />
          ) : activeTab === 'AWARENESS' ? (
            <SituationalAwareness3D />
          ) : activeTab === 'WELLNESS' ? (
            <CrewFatigue3D />
          ) : activeTab === 'CONFLICT' ? (
            <ConflictResolution3D />
          ) : (
            <MissionDebriefing3D />
          )}
        </div>
      )}

      {/* 7 Station Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('CREW')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'CREW'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Crew Management</span>
        </button>

        <button
          onClick={() => setActiveTab('COORDINATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'COORDINATION'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>2. Team Coordination</span>
        </button>

        <button
          onClick={() => setActiveTab('LEADERSHIP')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'LEADERSHIP'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>3. Leadership Console</span>
        </button>

        <button
          onClick={() => setActiveTab('AWARENESS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'AWARENESS'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>4. Situational Awareness</span>
        </button>

        <button
          onClick={() => setActiveTab('WELLNESS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'WELLNESS'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>5. Crew Wellness & Fatigue</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFLICT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'CONFLICT'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>6. Conflict Resolution</span>
        </button>

        <button
          onClick={() => setActiveTab('DEBRIEF')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'DEBRIEF'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>7. Mission Debriefing</span>
        </button>
      </div>

      {/* Main Tab Panels Content */}
      {isLoading ? (
        <div className="py-24 text-center font-mono text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p>Syncing Crew Telemetry & Flight Simulation Engine...</p>
        </div>
      ) : !state ? (
        <div className="py-12 text-center text-red-400 font-mono">
          Unable to establish link with CRM Simulation Engine.
        </div>
      ) : (
        <div>
          {/* TAB 1: CREW MANAGEMENT */}
          {activeTab === 'CREW' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Crew Roster List */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Assigned Crew Complement
                </h3>
                <div className="space-y-2">
                  {state.crewRoster.map((crew) => (
                    <button
                      key={crew.crewId}
                      onClick={() => setSelectedCrewId(crew.crewId)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        selectedCrew?.crewId === crew.crewId
                          ? 'bg-[#0d223f] border-cyan-500 shadow-md shadow-cyan-950/50'
                          : 'bg-[#09172a] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{crew.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                          {crew.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
                        <span>Workload: {crew.workloadHoursToday}h / {crew.maxWorkloadHours}h</span>
                        <span
                          className={`font-bold ${
                            crew.fatigueScore > 50
                              ? 'text-red-400'
                              : crew.fatigueScore > 30
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          Fatigue: {crew.fatigueScore}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Astronaut Dossier & Metrics */}
              {selectedCrew && (
                <div className="lg:col-span-2 bg-[#09172a] border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold font-mono text-white">{selectedCrew.name}</h2>
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 border border-cyan-800 text-cyan-400">
                          {selectedCrew.callSign}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Role: {selectedCrew.role} // Spec: {selectedCrew.specialization}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleExecuteAction('ADJUST_REST_SCHEDULE', selectedCrew.crewId, 'REST_BREAK')
                        }
                        disabled={isExecuting}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold transition-all"
                      >
                        Enforce 2-Hr Rest Break
                      </button>
                    </div>
                  </div>

                  {/* Biological & Psych Status Gauges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#0b1b33] border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Fatigue Score</span>
                        <span className="font-bold text-white">{selectedCrew.fatigueScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            selectedCrew.fatigueScore > 50
                              ? 'bg-red-500'
                              : selectedCrew.fatigueScore > 30
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${selectedCrew.fatigueScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {selectedCrew.fatigueScore > 50 ? 'Requires Circadian Reset' : 'Within Flight Limit'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b1b33] border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Stress Level</span>
                        <span className="font-bold text-white">{selectedCrew.stressLevel}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${selectedCrew.stressLevel}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Physiological HRV Nominal
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b1b33] border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Morale Index</span>
                        <span className="font-bold text-white">{selectedCrew.moraleScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500"
                          style={{ width: `${selectedCrew.moraleScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        High Team Cohesion
                      </span>
                    </div>
                  </div>

                  {/* Operational Qualifications & Badges */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      Certified Competencies:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCrew.skillBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#0e1f38] border border-cyan-800/40 text-cyan-300 font-mono text-xs flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEAM COORDINATION & TASKS */}
          {activeTab === 'COORDINATION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Flight Task Board & Multi-Station Handover
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Tasks marked with Cross-Check require two-person verification before execution.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.activeTasks.map((task) => {
                  const assignedAstronaut = state.crewRoster.find((c) => c.crewId === task.assignedCrewId);
                  return (
                    <div
                      key={task.taskId}
                      className="bg-[#09172a] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              task.priority === 'CRITICAL'
                                ? 'bg-red-950 text-red-400 border border-red-700'
                                : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            }`}
                          >
                            {task.priority} // {task.phase}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{task.estimatedMinutes} Mins</span>
                        </div>

                        <h4 className="text-base font-bold text-white">{task.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-mono text-slate-400">
                          Assigned: <span className="text-cyan-300 font-bold">{assignedAstronaut?.name || 'Unassigned'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.requiresCrossCheck && (
                            <button
                              onClick={() => handleExecuteAction('VERIFY_CROSSCHECK', task.taskId)}
                              disabled={task.crossCheckCompleted || isExecuting}
                              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                                task.crossCheckCompleted
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                                  : 'bg-amber-950/70 text-amber-300 border border-amber-600 hover:bg-amber-900/50'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{task.crossCheckCompleted ? 'Cross-Checked' : 'Perform Cross-Check'}</span>
                            </button>
                          )}

                          {state.crewRoster.map((crew) => (
                            <button
                              key={crew.crewId}
                              onClick={() => handleExecuteAction('ASSIGN_TASK', task.taskId, crew.crewId)}
                              disabled={task.assignedCrewId === crew.crewId || isExecuting}
                              className="px-2 py-1 rounded text-[11px] font-mono bg-[#0c1a30] hover:bg-cyan-900 border border-slate-700 text-slate-300 disabled:opacity-40"
                              title={`Assign to ${crew.name}`}
                            >
                              {crew.callSign}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LEADERSHIP CONSOLE */}
          {activeTab === 'LEADERSHIP' && (
            <div className="space-y-6">
              {state.activeLeadershipEvents.map((evt) => (
                <div key={evt.scenarioId} className="bg-[#09172a] border border-cyan-800/40 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-red-950 border border-red-700 text-red-400 font-mono text-xs font-bold uppercase">
                        {evt.urgencyLevel}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Affected Subsystem: {evt.subsystemAffected}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-mono text-white">{evt.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{evt.situationContext}</p>

                  <div className="p-3 rounded-xl bg-[#0c1a30] border border-slate-800 text-xs font-mono text-cyan-300">
                    <strong>Flight Director Note:</strong> {evt.commanderGuidanceNote}
                  </div>

                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      Authoritative Commander Decision Options:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {evt.availableOptions.map((opt) => (
                        <div
                          key={opt.optionId}
                          className="p-4 rounded-xl bg-[#0b182d] border border-slate-800 space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-white text-sm">{opt.title}</h4>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  opt.riskLevel === 'LOW'
                                    ? 'bg-emerald-950 text-emerald-300'
                                    : opt.riskLevel === 'MODERATE'
                                    ? 'bg-amber-950 text-amber-300'
                                    : 'bg-red-950 text-red-300'
                                }`}
                              >
                                {opt.riskLevel} Risk
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{opt.description}</p>
                            <p className="text-[11px] text-cyan-300 mt-2 font-mono">
                              <strong>Expected Outcome:</strong> {opt.consequenceOutcome}
                            </p>
                          </div>

                          <button
                            onClick={() => handleExecuteAction('MAKE_DECISION', opt.optionId, evt.scenarioId, opt.operationalRationale)}
                            disabled={isExecuting}
                            className="mt-3 w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Command Option</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SITUATIONAL AWARENESS CENTER */}
          {activeTab === 'AWARENESS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Spacecraft Subsystems & Environmental Telemetry
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Continuous cross-monitoring for sensor drift, rate-of-change spikes, and alert thresholds.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {state.situationalTelemetry.map((item, idx) => {
                  const isWarning = item.severity === 'WARNING';
                  const isCaution = item.severity === 'CAUTION';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isWarning
                          ? 'bg-red-950/40 border-red-600'
                          : isCaution
                          ? 'bg-amber-950/40 border-amber-600'
                          : 'bg-[#09172a] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">{item.subsystemName}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isWarning ? 'bg-red-900 text-red-200' : isCaution ? 'bg-amber-900 text-amber-200' : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{item.parameterName}</h4>

                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono text-white">
                          {item.value} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                        </span>
                        <span className="text-xs font-mono text-cyan-400">{item.trend}</span>
                      </div>

                      <div className="mt-2 text-[10px] font-mono text-slate-500">
                        Nominal Envelope: {item.normalMin} - {item.normalMax} {item.unit}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Space-to-Ground Comm Feed */}
              <div className="bg-[#09172a] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                    Space-to-Ground Communications Loop
                  </span>
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {state.communicationFeed.map((log) => (
                    <div key={log.logId} className="p-2.5 rounded bg-[#0b192e] text-xs font-mono flex items-start gap-3">
                      <span className="text-cyan-400 font-bold whitespace-nowrap">MET +{log.timestampMetHours}h</span>
                      <span className="text-amber-400 font-semibold whitespace-nowrap">[{log.senderRole} → {log.recipientRole}]:</span>
                      <span className="text-slate-200">{log.messageText}</span>
                      {log.readBackConfirmed && (
                        <span className="text-emerald-400 ml-auto whitespace-nowrap">✓ Readback Verified</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WELLNESS & FATIGUE */}
          {activeTab === 'WELLNESS' && (
            <div className="space-y-6">
              <div className="bg-[#09172a] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-mono font-bold text-white uppercase">
                    Circadian Rhythm & Flight Rule Rest Periods
                  </h3>
                  <span className="text-xs font-mono text-cyan-400">NASA STD-3001 Compliance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In long-duration spaceflight, circadian desynchrony and chronic sleep restriction directly degrade
                  psychomotor vigilance, leading to missed alarms and computational errors. Astronauts are scheduled
                  for 8.5 hours of continuous sleep per flight day.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {state.crewRoster.map((crew) => (
                    <div key={crew.crewId} className="p-4 rounded-xl bg-[#0b192e] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{crew.name}</span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            crew.status === 'OVERLOADED' ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {crew.status}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        Shift Hours: {crew.workloadHoursToday}h / 9.0h Maximum Safe Duty
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleExecuteAction('ADJUST_REST_SCHEDULE', crew.crewId, 'REST_BREAK')}
                          disabled={isExecuting}
                          className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-cyan-300 text-xs font-mono transition-all"
                        >
                          Schedule Rest Cycle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CONFLICT RESOLUTION */}
          {activeTab === 'CONFLICT' && (
            <div className="space-y-6">
              {state.activeConflicts.map((conf) => (
                <div key={conf.conflictId} className="bg-[#09172a] border border-amber-800/40 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                      Interpersonal Contention Incident
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Involved: {conf.initiatingCrewName} & {conf.targetCrewName}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-mono text-white">{conf.title}</h3>
                  <p className="text-xs text-slate-300 font-mono bg-[#0c1a30] p-3 rounded-xl border border-slate-800">
                    "{conf.scenarioDialogue}"
                  </p>
                  <div className="text-xs font-mono text-slate-400">
                    <strong>Root Cause:</strong> {conf.underlyingRootCause}
                  </div>

                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      Select Mediation Strategy (DESC Model):
                    </span>
                    <div className="space-y-2">
                      {conf.choices.map((ch) => (
                        <button
                          key={ch.choiceId}
                          onClick={() => handleExecuteAction('RESOLVE_CONFLICT', ch.choiceId, conf.conflictId)}
                          disabled={isExecuting}
                          className="w-full text-left p-3 rounded-xl bg-[#0b182d] hover:bg-[#122442] border border-slate-800 hover:border-cyan-600 transition-all font-mono text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{ch.approachType} Approach</span>
                            <span
                              className={`text-[10px] font-bold ${
                                ch.deescalationPoints > 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {ch.deescalationPoints > 0 ? `+${ch.deescalationPoints}` : ch.deescalationPoints} Points
                            </span>
                          </div>
                          <p className="text-slate-300">{ch.dialogueText}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: MISSION DEBRIEFING */}
          {activeTab === 'DEBRIEF' && (
            <div className="space-y-6">
              {state.latestDebrief ? (
                <div className="bg-[#09172a] border border-cyan-800/40 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 uppercase font-bold">
                        Mission Evaluation Debrief
                      </span>
                      <h2 className="text-2xl font-bold font-mono text-white mt-1">
                        {state.latestDebrief.missionName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">Overall CRM Rating</span>
                        <span className="text-2xl font-mono font-bold text-emerald-400">
                          {state.latestDebrief.overallScore}%
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-xs font-bold">
                        {state.latestDebrief.isPassed ? 'MISSION CERTIFIED' : 'REMEDIAL REQUIRED'}
                      </div>
                    </div>
                  </div>

                  {/* 6 Dimension Score Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3 rounded-xl bg-[#0b192e] border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block">Team Coordination</span>
                      <span className="text-base font-bold font-mono text-cyan-400">
                        {state.latestDebrief.teamCoordinationScore}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0b192e] border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block">Leadership</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        {state.latestDebrief.leadershipUnderPressureScore}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0b192e] border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block">Situational Awareness</span>
                      <span className="text-base font-bold font-mono text-purple-400">
                        {state.latestDebrief.situationalAwarenessScore}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0b192e] border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block">Fatigue Mgmt</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {state.latestDebrief.fatigueManagementScore}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0b192e] border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block">Conflict Resolution</span>
                      <span className="text-base font-bold font-mono text-rose-400">
                        {state.latestDebrief.conflictResolutionScore}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0b192e] border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block">Decision-Making</span>
                      <span className="text-base font-bold font-mono text-teal-400">
                        {state.latestDebrief.decisionMakingScore}%
                      </span>
                    </div>
                  </div>

                  {/* Flight Director Summary */}
                  <div className="p-4 rounded-xl bg-[#0b1b33] border border-slate-800 space-y-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                      Flight Director Operational Summary
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {state.latestDebrief.flightDirectorSummary}
                    </p>
                  </div>

                  {/* Strengths & Lessons Learned */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#09172a] border border-emerald-900/40 space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                        Demonstrated Core Strengths
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {state.latestDebrief.keyStrengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-[#09172a] border border-amber-900/40 space-y-2">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                        Lessons Learned & Action Items
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {state.latestDebrief.lessonsLearned.map((les, idx) => (
                          <li key={idx}>{les}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 font-mono">
                  No mission debrief generated yet. Complete operational scenarios to trigger post-flight debriefing.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
