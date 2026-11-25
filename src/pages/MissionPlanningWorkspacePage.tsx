import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Layers,
  Calendar,
  Users,
  Zap,
  ShieldAlert,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  RotateCcw,
  Clock,
  Award,
  ChevronRight,
  Target,
  Sliders,
  Globe2,
} from 'lucide-react';
import { missionPlanningApi } from '../services/api/missionPlanningApi';
import type {
  MissionPlan,
  ValidatePlanResponse,
} from '../types/training';
import { toast } from 'sonner';

// 3D Visual Simulation Environments
import { MissionObjectives3D } from '../components/three/MissionObjectives3D';
import { MissionTimeline3D } from '../components/three/MissionTimeline3D';
import { CrewAssignments3D } from '../components/three/CrewAssignments3D';
import { ResourceAllocation3D } from '../components/three/ResourceAllocation3D';
import { RiskMitigation3D } from '../components/three/RiskMitigation3D';
import { MissionComms3D } from '../components/three/MissionComms3D';

type WorkspaceTab = 'overview' | 'timeline' | 'crew' | 'resources' | 'risks' | 'comms';

export const MissionPlanningWorkspacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidatePlanResponse | null>(null);

  // Load default template on mount
  useEffect(() => {
    const loadInitialPlan = async () => {
      try {
        setIsLoading(true);
        const defaultPlan = await missionPlanningApi.getDefaultPlan('Moon');
        setPlan(defaultPlan);
      } catch (err) {
        console.error('Failed to load initial mission plan:', err);
        toast.error('Could not connect to Mission Planning backend.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialPlan();
  }, []);

  const handleValidatePlan = async () => {
    if (!plan) return;
    setIsValidating(true);
    try {
      const result = await missionPlanningApi.validatePlan({
        planId: plan.planId,
        objectives: plan.objectives,
        timelineTasks: plan.timelineTasks,
        crewAssignments: plan.crewAssignments,
        resourceAllocations: plan.resourceAllocations,
        riskRegister: plan.riskRegister,
      });
      setValidationResult(result);
      setPlan((prev) => (prev ? { ...prev, readinessScore: result.readinessScore } : null));

      if (result.isFlightReady) {
        toast.success(`Mission Plan Approved! Readiness Score: ${result.readinessScore}%`);
      } else {
        toast.warning(`Flight Deficiencies Found. Score: ${result.readinessScore}%`);
      }
    } catch (err) {
      console.error('Plan validation error:', err);
      toast.error('Validation request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    try {
      await missionPlanningApi.savePlan(plan);
      toast.success('Mission Plan saved to flight operations database.');
    } catch (err) {
      console.error('Plan save error:', err);
      toast.error('Could not save mission plan.');
    }
  };

  const handleDestinationSwitch = async (dest: 'Moon' | 'Mars') => {
    try {
      setIsLoading(true);
      const newPlan = await missionPlanningApi.getDefaultPlan(dest);
      setPlan(newPlan);
      setValidationResult(null);
    } catch (err) {
      console.error('Failed to switch destination:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen bg-[#050914] text-white flex flex-col items-center justify-center p-4">
        <Compass className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-lg font-mono text-cyan-300">INITIALIZING MISSION PLANNING WORKSPACE...</h2>
        <p className="text-xs font-mono text-[#64748b] mt-1">Synchronizing Systems Engineering Requirements</p>
      </div>
    );
  }

  const primaryCount = plan.objectives.filter((o) => o.category === 'PRIMARY').length;

  return (
    <div className="min-h-screen bg-[#050914] text-white p-4 md:p-8 space-y-6 select-none">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <Link to="/academy" className="hover:text-white transition-colors">
            Training Academy
          </Link>
          <span>/</span>
          <Link to="/academy/mission-planning" className="hover:text-white transition-colors">
            Module 06: Mission Planning
          </Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Interactive Planning Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDestinationSwitch('Moon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              plan.targetDestination === 'Moon'
                ? 'bg-cyan-950 border-cyan-500 text-white'
                : 'bg-[#0b1329] border-[#1e293b] text-[#94a3b8] hover:text-white'
            }`}
          >
            Moon (Artemis Base)
          </button>
          <button
            onClick={() => handleDestinationSwitch('Mars')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              plan.targetDestination === 'Mars'
                ? 'bg-orange-950 border-orange-500 text-white'
                : 'bg-[#0b1329] border-[#1e293b] text-[#94a3b8] hover:text-white'
            }`}
          >
            Mars (Ares Outpost)
          </button>
        </div>
      </div>

      {/* Workspace Banner & Readiness Gauge */}
      <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {plan.missionCode}
              </span>
              <h1 className="text-xl font-bold font-mono text-white">{plan.title}</h1>
            </div>
            <p className="text-xs text-[#94a3b8] font-mono mt-1">
              Destination: {plan.targetDestination} // Mission Status: {plan.status}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSavePlan}
            className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-slate-200 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            SAVE PLAN
          </button>
          <button
            onClick={handleValidatePlan}
            disabled={isValidating}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            {isValidating ? 'VALIDATING...' : 'VALIDATE FLIGHT PLAN'}
          </button>
        </div>
      </div>

      {/* Validation Feedback Banner */}
      {validationResult && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs space-y-2 animate-in fade-in ${
            validationResult.isFlightReady
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
              : 'bg-amber-950/70 border-amber-500/60 text-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-white">
              {validationResult.isFlightReady ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              {validationResult.isFlightReady
                ? 'FLIGHT READINESS APPROVED'
                : 'FLIGHT OPERATIONAL DEFICIENCIES DETECTED'}
            </span>
            <span className="font-bold text-white text-sm">
              Readiness Score: {validationResult.readinessScore}%
            </span>
          </div>
          <p className="text-slate-300">{validationResult.flightDirectorRemarks}</p>

          {validationResult.validationErrors.length > 0 && (
            <div className="space-y-1 pt-1 text-rose-300">
              <span className="font-bold">Errors requiring resolution:</span>
              <ul className="list-disc pl-5 space-y-0.5">
                {validationResult.validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Non-Destructive Workspace Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1e293b]">
        {[
          { key: 'overview', label: '1. Mission Overview', icon: Target },
          { key: 'timeline', label: '2. Mission Timeline', icon: Calendar },
          { key: 'crew', label: '3. Crew Assignment', icon: Users },
          { key: 'resources', label: '4. Resource Management', icon: Zap },
          { key: 'risks', label: '5. Risk Management', icon: ShieldAlert },
          { key: 'comms', label: '6. Communication Center', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as WorkspaceTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-500 text-white font-bold shadow-md shadow-cyan-950/40'
                  : 'bg-[#070b14] border-[#1e293b] text-[#94a3b8] hover:text-white hover:border-slate-600'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-[#64748b]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Mission Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <MissionObjectives3D />
          <div className="p-6 bg-[#070b14] border border-[#1e293b] rounded-2xl space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Mission Objectives & Requirements ({plan.objectives.length})
            </h3>
            <p className="text-xs text-[#94a3b8] font-mono leading-relaxed">
              {plan.briefingSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {plan.objectives.map((obj) => (
                <div
                  key={obj.objectiveId}
                  className="p-4 rounded-xl bg-[#0b1329] border border-[#1e293b] space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{obj.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        obj.category === 'PRIMARY'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {obj.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{obj.description}</p>
                  <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[#64748b] text-[10px]">
                    <span>Metric: {obj.successCriterion}</span>
                    <span className="font-bold text-cyan-400">{obj.weightPercent}% Weight</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="p-6 bg-[#070b14] border border-[#1e293b] rounded-2xl space-y-3">
            <h3 className="text-sm font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Technical & Safety Constraints ({plan.constraints.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.constraints.map((c) => (
                <div
                  key={c.constraintId}
                  className="p-3 rounded-xl bg-[#0b1329] border border-[#1e293b] text-xs font-mono space-y-1"
                >
                  <span className="text-[10px] font-bold text-amber-400 uppercase">{c.type}</span>
                  <p className="text-slate-200 font-semibold">{c.description}</p>
                  <p className="text-cyan-300 text-[11px]">Limit: {c.limitValue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mission Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <MissionTimeline3D />
          <div className="p-6 bg-[#070b14] border border-[#1e293b] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mission Timeline Phases ({plan.timelineTasks.length} Milestones)
              </h3>
              <span className="text-xs font-mono text-[#64748b]">
                Gantt Sequencing & Critical Path
              </span>
            </div>

            <div className="space-y-3">
              {plan.timelineTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="p-4 rounded-xl bg-[#0b1329] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{task.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        Phase: {task.phase}
                      </span>
                    </div>
                    <div className="text-[#64748b] text-[11px]">
                      Assigned Role: <span className="text-cyan-300">{task.assignedCrewRole}</span> // Start: Minute {task.startMinute}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white font-bold ml-1">{task.durationMinutes} min</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : task.status === 'ACTIVE'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Crew Assignment */}
      {activeTab === 'crew' && (
        <div className="space-y-6">
          <CrewAssignments3D />
          <div className="p-6 bg-[#070b14] border border-[#1e293b] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Flight Crew Responsibility Board ({plan.crewAssignments.length} Astronauts)
              </h3>
              <span className="text-xs font-mono text-[#64748b]">Max 8.0h Workload Rule</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.crewAssignments.map((crew) => {
                const isOver = crew.assignedWorkloadHours > crew.maxWorkloadHoursPerSol;
                return (
                  <div
                    key={crew.crewId}
                    className="p-4 rounded-xl bg-[#0b1329] border border-[#1e293b] space-y-3 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">{crew.name}</span>
                        <span className="ml-2 text-cyan-400 font-semibold">[{crew.role}]</span>
                      </div>
                      <span
                        className={`font-bold ${
                          isOver ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {crew.assignedWorkloadHours}h / 8.0h
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px]">{crew.specialization}</p>

                    <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isOver ? 'bg-rose-500' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(100, (crew.assignedWorkloadHours / 8.0) * 100)}%` }}
                      />
                    </div>

                    <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-[#64748b]">
                      <span>Backup: {crew.backupCrewName}</span>
                      <span>Health: {crew.healthStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Resource Management */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <ResourceAllocation3D />
          <div className="p-6 bg-[#070b14] border border-[#1e293b] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Consumables & Power Allocation ({plan.resourceAllocations.length} Subsystems)
              </h3>
              <span className="text-xs font-mono text-[#64748b]">Emergency Reserve Rule: &ge; 25%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.resourceAllocations.map((res) => {
                const reservePct = (res.emergencyReserve / res.totalAvailable) * 100.0;
                const isCompliant = reservePct >= res.minRequiredReservePercent;

                return (
                  <div
                    key={res.resourceType}
                    className="p-4 rounded-xl bg-[#0b1329] border border-[#1e293b] space-y-3 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{res.resourceType}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCompliant
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        Reserve: {res.emergencyReserve} {res.unit} ({reservePct.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-[#94a3b8]">
                      <span>Planned Allocation:</span>
                      <span className="text-white font-bold">{res.plannedAllocation} {res.unit}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#94a3b8]">
                      <span>Total Vehicle Capacity:</span>
                      <span className="text-cyan-400 font-bold">{res.totalAvailable} {res.unit}</span>
                    </div>

                    <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isCompliant ? 'bg-cyan-400' : 'bg-rose-500'}`}
                        style={{ width: `${(res.plannedAllocation / res.totalAvailable) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Risk Management */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          <RiskMitigation3D />
          <div className="p-6 bg-[#070b14] border border-[#1e293b] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Continuous Risk Management (CRM) Register ({plan.riskRegister.length} Hazards)
              </h3>
              <span className="text-xs font-mono text-[#64748b]">5x5 Threat Matrix</span>
            </div>

            <div className="space-y-3">
              {plan.riskRegister.map((risk) => (
                <div
                  key={risk.riskId}
                  className="p-4 rounded-xl bg-[#0b1329] border border-[#1e293b] space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{risk.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        risk.riskScore >= 15
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      Risk Score: {risk.riskScore} ({risk.priority})
                    </span>
                  </div>

                  <div className="pt-1 text-[#94a3b8] text-[11px]">
                    <span className="font-bold text-emerald-400">Mitigation:</span> {risk.mitigationStrategy}
                  </div>
                  <div className="text-[#94a3b8] text-[11px]">
                    <span className="font-bold text-amber-400">Abort Contingency:</span> {risk.contingencyPlan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Communication Center */}
      {activeTab === 'comms' && (
        <div className="space-y-6">
          <MissionComms3D />
          <div className="p-6 bg-[#070b14] border border-[#1e293b] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Deep Space Network (DSN) Transcripts ({plan.commsLog.length})
              </h3>
              <span className="text-xs font-mono text-[#64748b]">
                Latency: {plan.targetDestination === 'Mars' ? '180s' : '1.3s'}
              </span>
            </div>

            <div className="space-y-2.5">
              {plan.commsLog.map((msg) => (
                <div
                  key={msg.messageId}
                  className="p-3.5 rounded-xl bg-[#0b1329] border border-[#1e293b] space-y-1 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">
                      {msg.sender} &rarr; {msg.recipient} [{msg.subject}]
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
        </div>
      )}
    </div>
  );
};
