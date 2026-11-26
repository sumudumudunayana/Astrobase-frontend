import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Atom,
  BarChart3,
  Dna,
  Globe2,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  Clock,
  Award,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { spaceScienceApi } from '../services/api/spaceScienceApi';
import type {
  ScientificExperiment,
  ScientificDataset,
  ResearchReport,
  RunExperimentResponse,
  SubmitReportResponse,
} from '../types/training';
import { toast } from 'sonner';

// 3D Simulations
import { SpaceExperiment3D } from '../components/three/SpaceExperiment3D';
import { MicrogravityResearch3D } from '../components/three/MicrogravityResearch3D';
import { SpaceBiology3D } from '../components/three/SpaceBiology3D';
import { PlanetaryResearch3D } from '../components/three/PlanetaryResearch3D';
import { DataCollection3D } from '../components/three/DataCollection3D';
import { ScientificReporting3D } from '../components/three/ScientificReporting3D';

type LabStation = 'EXPERIMENT' | 'MICROGRAVITY' | 'BIOLOGY' | 'PLANETARY' | 'ANALYSIS' | 'REPORT';

export const SpaceScienceLabPage: React.FC = () => {
  const [activeStation, setActiveStation] = useState<LabStation>('EXPERIMENT');
  const [experiments, setExperiments] = useState<ScientificExperiment[]>([]);
  const [currentExp, setCurrentExp] = useState<ScientificExperiment | null>(null);
  const [datasets, setDatasets] = useState<ScientificDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<ScientificDataset | null>(null);
  const [report, setReport] = useState<ResearchReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<RunExperimentResponse | null>(null);
  const [reportFeedback, setReportFeedback] = useState<SubmitReportResponse | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string }>>([
    {
      q: 'Why do protein crystals grow better in microgravity?',
      a: 'On Earth, buoyancy-driven natural convection creates turbulent plumes that perturb growing crystal faces, and gravitational sedimentation drops crystals onto the container floor. In microgravity, convection and sedimentation are suppressed, so protein molecules arrive exclusively via slow, ordered diffusion, resulting in fewer lattice dislocations and superior X-ray diffraction resolution (< 1.3 Å).',
    },
  ]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const templates = await spaceScienceApi.getTemplates();
        setExperiments(templates.preconfiguredExperiments);
        if (templates.preconfiguredExperiments.length > 0) {
          setCurrentExp(templates.preconfiguredExperiments[0]);
        }
        setDatasets(templates.availableDatasets);
        if (templates.availableDatasets.length > 0) {
          setSelectedDataset(templates.availableDatasets[0]);
        }
        setReport(templates.defaultReportTemplate);
      } catch (err) {
        console.error('Failed to load science laboratory templates:', err);
        toast.error('Could not load laboratory environment templates.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const handleSelectExperiment = async (type: string) => {
    const match = experiments.find((e) => e.type === type);
    if (match) {
      setCurrentExp(match);
      setLastRunResult(null);
    }
  };

  const handleRunSimulation = async () => {
    if (!currentExp) return;
    setIsRunning(true);
    try {
      const response = await spaceScienceApi.runExperiment({
        experimentId: currentExp.experimentId,
        type: currentExp.type,
        researchQuestion: currentExp.researchQuestion,
        hypothesis: currentExp.hypothesis,
        variables: currentExp.variables,
        conditions: currentExp.conditions,
        equipment: currentExp.equipment,
      });

      setLastRunResult(response);
      setCurrentExp((prev) =>
        prev
          ? {
              ...prev,
              measurements: response.measurements,
              observations: response.observations,
              statisticalSummaries: response.statisticalSummaries,
              resultsSummary: response.resultsSummary,
              status: 'COMPLETED',
            }
          : prev
      );
      toast.success('Simulation executed! Scientific telemetry collected.');
    } catch (err) {
      console.error(err);
      toast.error('Simulation execution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!report) return;
    setIsSubmittingReport(true);
    try {
      const res = await spaceScienceApi.submitReport({
        reportId: report.reportId,
        title: report.title,
        experimentId: report.experimentId,
        learnerId: report.authorLearnerId,
        sections: report.sections,
        references: report.references,
      });

      setReportFeedback(res);
      if (res.isApproved) {
        toast.success(`Peer Review Approved! Score: ${res.score}/100 (${res.percentage}%)`);
      } else {
        toast.warning(`Peer Review Revision Requested: Score ${res.score}/100.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit research report.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleAskAi = () => {
    if (!aiQuery.trim()) return;
    const lower = aiQuery.toLowerCase();
    let reply =
      'According to NASA Physical Sciences protocols, experimental variables must be tightly isolated with synchronous ground controls to verify that observed variations are solely attributable to the microgravity regime.';

    if (lower.includes('marangoni') || lower.includes('surface tension')) {
      reply =
        'Marangoni convection is mass transfer driven by surface tension gradients resulting from temperature or solute concentration differentials across a liquid interface. In microgravity, where buoyancy is absent, Marangoni flow becomes the primary driver of fluid circulation.';
    } else if (lower.includes('statolith') || lower.includes('plant') || lower.includes('gravitropism')) {
      reply =
        'In plant root cap columella cells, dense starch-filled amyloplasts (statoliths) act as gravity sensors. In microgravity, they float freely rather than sedimenting onto basal membranes, causing root trajectories to skew in waving circumnutation unless guided by directional LED illumination (phototropism).';
    } else if (lower.includes('clay') || lower.includes('mars') || lower.includes('spectroscopy')) {
      reply =
        'Hydrated phyllosilicates (smectite clays) on Mars display diagnostic infrared absorption bands at 1.4 µm (O-H stretch) and 1.9 µm (H2O molecule combination band). These bands confirm prolonged aqueous interaction, indicative of past habitable lacustrine environments.';
    } else if (lower.includes('report') || lower.includes('imrad')) {
      reply =
        'A rigorous scientific report follows the IMRAD architecture (Introduction, Methodology, Results, And Discussion). Ensure your hypothesis is falsifiable, experimental conditions are reproducible, all data points have physical units, and limitations are transparently acknowledged.';
    }

    setAiAnswers((prev) => [{ q: aiQuery, a: reply }, ...prev]);
    setAiQuery('');
  };

  return (
    <div className="min-h-screen bg-[#050914] text-white p-4 md:p-8 space-y-6 select-none">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-900/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <Link to="/academy" className="hover:text-white transition-colors">
              Training Academy
            </Link>
            <span>/</span>
            <Link to="/academy/space-science" className="hover:text-cyan-400 transition-colors">
              Module 07
            </Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Space Science Laboratory</span>
          </div>
          <h1 className="text-2xl font-black font-mono tracking-wide text-white flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            <span>SPACE SCIENCE RESEARCH LABORATORY</span>
          </h1>
        </div>

        {/* AI Assistant Quick Toggle */}
        <button
          onClick={() => setShowAiAssistant(!showAiAssistant)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            showAiAssistant
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
              : 'bg-[#0f172a] text-slate-300 border border-purple-800/60 hover:bg-[#1e1b4b]'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-400" />
          <span>AI RESEARCH TUTOR</span>
        </button>
      </div>

      {/* Station Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { key: 'EXPERIMENT', label: '1. Experiment Station', icon: FlaskConical },
          { key: 'MICROGRAVITY', label: '2. Microgravity Lab 3D', icon: Atom },
          { key: 'BIOLOGY', label: '3. Space Biology Lab 3D', icon: Dna },
          { key: 'PLANETARY', label: '4. Planetary Research 3D', icon: Globe2 },
          { key: 'ANALYSIS', label: '5. Data Analysis Workspace', icon: BarChart3 },
          { key: 'REPORT', label: '6. Scientific Report Builder', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStation === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveStation(tab.key as LabStation)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 scale-105'
                  : 'bg-[#0a101d] text-slate-400 border border-slate-800 hover:text-white hover:bg-[#0f172a]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Station Content Area */}
      <div className="space-y-6">
        {/* ========================================================
            STATION 1: EXPERIMENT STATION
           ======================================================== */}
        {activeStation === 'EXPERIMENT' && (
          <div className="space-y-6">
            {/* Experiment Picker Banner */}
            <div className="bg-[#081220] border border-cyan-800/40 p-5 rounded-2xl space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Select Active Research Investigation
              </span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { type: 'CRYSTAL_GROWTH', title: 'Lysozyme Crystal', icon: Atom },
                  { type: 'FLUID_PHYSICS', title: 'Capillary Flow', icon: FlaskConical },
                  { type: 'PLANT_BIOLOGY', title: 'Arabidopsis Roots', icon: Dna },
                  { type: 'MICROBIAL_BEHAVIOR', title: 'Bacterial Biofilm', icon: Sparkles },
                  { type: 'PLANETARY_SAMPLE', title: 'Regolith Core', icon: Globe2 },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleSelectExperiment(item.type)}
                    className={`p-3 rounded-xl border text-left space-y-2 transition-all ${
                      currentExp?.type === item.type
                        ? 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950/50'
                        : 'bg-[#0f172a]/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-cyan-400" />
                    <div className="font-mono text-xs font-bold text-white">{item.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Glovebox Workbench */}
            <SpaceExperiment3D selectedExperimentType={currentExp?.type} />

            {/* Experiment Parameters & Execution Controls */}
            {currentExp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#081220] border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 uppercase">
                      Experiment Configuration & Hypothesis
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {currentExp.experimentId}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-slate-400 font-mono block">Research Question:</span>
                    <p className="text-slate-200 bg-[#0f172a] p-3 rounded-lg border border-slate-800">
                      {currentExp.researchQuestion}
                    </p>

                    <span className="text-slate-400 font-mono block pt-1">Falsifiable Hypothesis:</span>
                    <p className="text-cyan-200 bg-[#0f172a] p-3 rounded-lg border border-cyan-900/40 font-mono">
                      {currentExp.hypothesis}
                    </p>
                  </div>

                  <button
                    disabled={isRunning}
                    onClick={handleRunSimulation}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isRunning ? 'EXECUTING ORBITAL SIMULATION...' : 'EXECUTE EXPERIMENT RUN'}</span>
                  </button>
                </div>

                {/* Simulation Execution Telemetry & Observations */}
                <div className="bg-[#081220] border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                      Live Telemetry & Observations
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Status: {currentExp.status}
                    </span>
                  </div>

                  {currentExp.measurements.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-mono text-xs space-y-2">
                      <Atom className="w-8 h-8 mx-auto opacity-40 animate-pulse text-cyan-400" />
                      <p>Awaiting simulation execution.</p>
                      <p className="text-[11px] text-slate-600">
                        Click 'Execute Experiment Run' to collect authoritative microgravity data.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {currentExp.observations.map((obs) => (
                        <div
                          key={obs.observationId}
                          className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-cyan-400 font-bold uppercase">{obs.category}</span>
                            <span className="text-slate-400">{obs.timestampHours} Hours MET</span>
                          </div>
                          <p className="text-xs text-slate-200">{obs.description}</p>
                          <span className="text-[11px] text-emerald-400 font-mono block">
                            Significance: {obs.significance}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            STATION 2: MICROGRAVITY LABORATORY 3D
           ======================================================== */}
        {activeStation === 'MICROGRAVITY' && (
          <div className="space-y-4">
            <MicrogravityResearch3D />
          </div>
        )}

        {/* ========================================================
            STATION 3: SPACE BIOLOGY LABORATORY 3D
           ======================================================== */}
        {activeStation === 'BIOLOGY' && (
          <div className="space-y-4">
            <SpaceBiology3D />
          </div>
        )}

        {/* ========================================================
            STATION 4: PLANETARY RESEARCH 3D
           ======================================================== */}
        {activeStation === 'PLANETARY' && (
          <div className="space-y-4">
            <PlanetaryResearch3D />
          </div>
        )}

        {/* ========================================================
            STATION 5: DATA ANALYSIS WORKSPACE
           ======================================================== */}
        {activeStation === 'ANALYSIS' && (
          <div className="space-y-6">
            <DataCollection3D />

            {selectedDataset && (
              <div className="bg-[#081220] border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-mono text-sm font-bold text-white">
                      {selectedDataset.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedDataset.description}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#0f172a] text-xs font-mono text-cyan-300 border border-cyan-800">
                    Location: {selectedDataset.targetEnvironment}
                  </span>
                </div>

                {/* Tabular Dataset Comparison */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-[#0f172a] text-slate-400 uppercase">
                      <tr>
                        <th className="p-3">Sample Index</th>
                        <th className="p-3">Time (Hours)</th>
                        <th className="p-3 text-amber-400">Ground Control 1.0g</th>
                        <th className="p-3 text-cyan-400">Spaceflight 10^-4g</th>
                        <th className="p-3">Delta Comparison</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedDataset.groundControlData.map((pt, i) => {
                        const spacePt = selectedDataset.spaceflightData[i] || { y: 0 };
                        const delta = Math.round((spacePt.y - pt.y) * 100) / 100;
                        return (
                          <tr key={i} className="hover:bg-[#0f172a]/50">
                            <td className="p-3 text-slate-400">Sample #{i + 1}</td>
                            <td className="p-3 text-white font-bold">{pt.x}</td>
                            <td className="p-3 text-amber-300">{pt.y} Å</td>
                            <td className="p-3 text-cyan-300 font-bold">{spacePt.y} Å</td>
                            <td className="p-3 text-emerald-400">
                              {delta < 0 ? `${delta} Å (Resolution Superior)` : `+${delta} Å`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            STATION 6: SCIENTIFIC REPORT BUILDER
           ======================================================== */}
        {activeStation === 'REPORT' && (
          <div className="space-y-6">
            <ScientificReporting3D />

            {report && (
              <div className="bg-[#081220] border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                      Formal Research Manuscript Editor
                    </span>
                    <h3 className="text-lg font-bold text-white font-mono">
                      {report.title}
                    </h3>
                  </div>

                  <button
                    disabled={isSubmittingReport}
                    onClick={handleSubmitReport}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold tracking-wide shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingReport ? 'SUBMITTING TO PEER REVIEW...' : 'SUBMIT REPORT FOR EVALUATION'}</span>
                  </button>
                </div>

                {/* Peer Review Rubric Result Dialog */}
                {reportFeedback && (
                  <div
                    className={`p-5 rounded-xl border space-y-3 ${
                      reportFeedback.isApproved
                        ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100'
                        : 'bg-amber-950/40 border-amber-500/80 text-amber-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-sm font-bold">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <span>
                          {reportFeedback.isApproved
                            ? 'PEER REVIEW ACCEPTED: PUBLICATION GRADE ACHIEVED'
                            : 'PEER REVIEW FEEDBACK: REVISIONS REQUIRED'}
                        </span>
                      </div>
                      <span className="text-base font-black font-mono">
                        Score: {reportFeedback.score}/100 ({reportFeedback.percentage}%)
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-mono text-slate-300 block font-semibold">Strengths:</span>
                      {reportFeedback.strengths.map((s, i) => (
                        <p key={i} className="text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>

                    {reportFeedback.suggestedImprovements.length > 0 && (
                      <div className="space-y-1 text-xs pt-1">
                        <span className="font-mono text-slate-300 block font-semibold">Recommendations:</span>
                        {reportFeedback.suggestedImprovements.map((imp, i) => (
                          <p key={i} className="text-amber-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{imp}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section Editors */}
                <div className="space-y-4">
                  {report.sections.map((sec, idx) => (
                    <div
                      key={sec.sectionId}
                      className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-400 font-bold uppercase">{sec.title}</span>
                        <span className="text-slate-400">
                          {sec.content.split(' ').filter(Boolean).length} words
                        </span>
                      </div>
                      <textarea
                        value={sec.content}
                        rows={3}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReport((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sections: prev.sections.map((s, i) =>
                                    i === idx ? { ...s, content: val } : s
                                  ),
                                }
                              : prev
                          );
                        }}
                        className="w-full bg-[#070d17] border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating AI Research Assistant Drawer */}
      {showAiAssistant && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-[#0b1326] border border-purple-500/80 rounded-2xl shadow-2xl p-4 space-y-3 z-50 backdrop-blur">
          <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-xs font-bold text-white">AI RESEARCH TUTOR</span>
            </div>
            <button
              onClick={() => setShowAiAssistant(false)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-slate-300">
            Ask any question regarding microgravity physics, variable isolation, statoliths, or report structure.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. What is Marangoni convection?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
              className="flex-1 bg-[#060c18] border border-purple-900 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleAskAi}
              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold"
            >
              Ask
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {aiAnswers.map((item, idx) => (
              <div key={idx} className="bg-[#0f172a] p-2.5 rounded-lg border border-purple-900/40 text-xs space-y-1">
                <span className="text-purple-300 font-bold block">{item.q}</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
