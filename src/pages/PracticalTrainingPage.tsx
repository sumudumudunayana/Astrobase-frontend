import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Zap,
  HeartPulse,
  Compass,
  Droplets,
  Sprout,
  ShieldCheck,
  Award,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { observatoryApi } from '../services/api/observatoryApi';
import type {
  CsaPracticalTrainingState,
  SubmitPracticalTrainingResponse,
} from '../types/observatory';
import { CentrifugeTrainer3D } from '../components/three/CentrifugeTrainer3D';
import { CanadarmRobotics3D } from '../components/three/CanadarmRobotics3D';

type TrainingStation = 'CENTRIFUGE' | 'ROBOTICS' | 'VESTIBULAR' | 'FOOD_PRODUCTION';

export const PracticalTrainingPage: React.FC = () => {
  const [activeStation, setActiveStation] = useState<TrainingStation>('CENTRIFUGE');
  const [state, setState] = useState<CsaPracticalTrainingState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [evaluationResult, setEvaluationResult] = useState<SubmitPracticalTrainingResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Station 4: Food Production parameters
  const [ledFarRed, setLedFarRed] = useState<number>(1.2);
  const [nutrientFlow, setNutrientFlow] = useState<number>(2.0);

  const loadState = async () => {
    setIsLoading(true);
    try {
      const data = await observatoryApi.getTrainingState();
      setState(data);
    } catch (err) {
      console.error('Failed to load practical training telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const handleEvaluateDrill = async (station: string, customParams?: any) => {
    setIsSubmitting(true);
    setEvaluationResult(null);
    try {
      const req = {
        stationType: station,
        gLoadApplied: customParams?.gLoad || 4.5,
        agsmEngaged: customParams?.agsm !== undefined ? customParams.agsm : true,
        armAlignmentDeviationMm: customParams?.deviation || 12.0,
        ledFarRedRatio: ledFarRed,
        strainingCadenceSeconds: 3,
      };
      const res = await observatoryApi.evaluateDrill(req);
      setEvaluationResult(res);
    } catch (err) {
      console.error('Failed to evaluate drill:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] text-white p-4 md:p-8 space-y-6 select-none">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Link to="/academy" className="hover:text-white transition-colors">
              Academy
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Astronaut Practical Training Center</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold font-mono text-white tracking-wide mt-1">
            Flight Physiology & Spacecraft Operations Facility
          </h1>
        </div>

        <Link
          to="/observatory"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#09172a] hover:bg-[#12243d] border border-cyan-800/60 text-cyan-300 font-mono text-xs font-semibold shadow-lg transition-all"
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>OPEN NASA OBSERVATORY</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Hero Overview Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0b162b] via-[#070e1c] to-[#0a1829] border border-cyan-800/40 p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-bold uppercase">
              CSA & NASA ASCAN FLIGHT CERTIFICATION
            </span>
            <span className="text-xs font-mono text-slate-400">Phase 01 Practical Readiness</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Hands-on physical conditioning and mission-critical hardware mastery based on Canadian Space Agency (CSA)
            and NASA flight training standards: High-G Centrifuge cardiovascular tolerance, Canadarm2/3 robotics,
            multi-axis vestibular conditioning, and Deep Space Food Challenge bioregenerative systems.
          </p>
        </div>

        {state && (
          <div className="bg-[#09172a] p-4 rounded-xl border border-slate-800 flex items-center gap-4 whitespace-nowrap">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Overall Readiness</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {state.overallReadinessScore}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-600/40 text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* 4 Station Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => {
            setActiveStation('CENTRIFUGE');
            setEvaluationResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeStation === 'CENTRIFUGE'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Station 1: High-G Human Centrifuge</span>
        </button>

        <button
          onClick={() => {
            setActiveStation('ROBOTICS');
            setEvaluationResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeStation === 'ROBOTICS'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Station 2: Canadarm2 Robotics</span>
        </button>

        <button
          onClick={() => {
            setActiveStation('VESTIBULAR');
            setEvaluationResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeStation === 'VESTIBULAR'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Station 3: Vestibular Conditioning (MAT)</span>
        </button>

        <button
          onClick={() => {
            setActiveStation('FOOD_PRODUCTION');
            setEvaluationResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeStation === 'FOOD_PRODUCTION'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Station 4: CSA Food Production Toolkit</span>
        </button>
      </div>

      {/* Evaluation Result Toast / Banner */}
      {evaluationResult && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs space-y-1.5 shadow-lg ${
            evaluationResult.isSuccess
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
              : 'bg-red-950/70 border-red-500/60 text-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              {evaluationResult.isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              {evaluationResult.isSuccess ? 'DRILL CERTIFIED (PASSED)' : 'REMEDIAL DRILL REQUIRED'}
            </span>
            <span className="font-bold">Score: {evaluationResult.score}%</span>
          </div>
          <p>{evaluationResult.physiologicalOutcome}</p>
          <p className="text-slate-300 text-[11px]">{evaluationResult.feedback}</p>
          {evaluationResult.certificationBadgesAwarded.length > 0 && (
            <div className="flex gap-2 pt-1">
              {evaluationResult.certificationBadgesAwarded.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-500 text-emerald-300 text-[10px] font-bold"
                >
                  ★ {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Interactive Stations */}
      {activeStation === 'CENTRIFUGE' && (
        <div className="space-y-4">
          <CentrifugeTrainer3D />
          <div className="bg-[#09172a] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Certify Launch Acceleration Tolerance</h4>
              <p className="text-xs text-slate-400 font-mono">
                Submit centrifuge session telemetry (+6.0 Gz sustained with AGSM) for authoritative evaluation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEvaluateDrill('CENTRIFUGE', { gLoad: 6.2, agsm: true })}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all"
              >
                Submit +6.2Gz Straining Test
              </button>
              <button
                onClick={() => handleEvaluateDrill('CENTRIFUGE', { gLoad: 6.5, agsm: false })}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700 text-red-300 font-mono text-xs transition-all"
              >
                Simulate Passive Seat (Test G-LOC)
              </button>
            </div>
          </div>
        </div>
      )}

      {activeStation === 'ROBOTICS' && (
        <div className="space-y-4">
          <CanadarmRobotics3D />
          <div className="bg-[#09172a] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Certify Canadarm2 Capture Envelope</h4>
              <p className="text-xs text-slate-400 font-mono">
                Submit current robotic snare alignment to certify free-flying cargo vehicle capture.
              </p>
            </div>
            <button
              onClick={() => handleEvaluateDrill('ROBOTICS', { deviation: 14.0 })}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all"
            >
              Submit Grapple Alignment (14mm offset)
            </button>
          </div>
        </div>
      )}

      {activeStation === 'VESTIBULAR' && (
        <div className="bg-[#09172a] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-purple-400 uppercase font-bold">
                CSA Vestibular Conditioning Suite
              </span>
              <h3 className="text-xl font-bold font-mono text-white mt-1">
                Multi-Axis Trainer (MAT) & Coriolis Illusion Suppression
              </h3>
            </div>
            <button
              onClick={() => handleEvaluateDrill('VESTIBULAR')}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg"
            >
              Execute Readaptation Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0b192e] border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-bold block">1. Otolith-Semicircular Conflict</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                In microgravity, otolith organs no longer signal downward gravity, causing conflict whenever the head rotates.
                Controlled MAT conditioning trains visual dominance.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0b192e] border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold block">2. Coriolis Cross-Coupling</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tilting the head while rolling creates a false sensation of pitching or tumbling. CSA pilots practice
                systematic head rotations to habituate the vestibular nuclei.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0b192e] border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-amber-400 font-bold block">3. Space Motion Sickness (SMS)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Affects up to 70% of astronauts in the first 72 hours. Anti-motion sickness pharmaceuticals (promethazine)
                are managed with scheduled vestibular stabilization.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeStation === 'FOOD_PRODUCTION' && (
        <div className="bg-[#09172a] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-bold">
                CSA Deep Space Food Challenge Toolkit
              </span>
              <h3 className="text-xl font-bold font-mono text-white mt-1">
                Bioregenerative Food Production & Crop Spectrum Balancing
              </h3>
            </div>
            <button
              onClick={() => handleEvaluateDrill('BIO_FOOD')}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg"
            >
              Evaluate Crop Yield & Nutrition
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Astronauts require 2,800 to 3,200 kcal/day with fortified Vitamin C and B-complex vitamins, which degrade
            rapidly under cosmic radiation. Closed-loop hydroponics and microgreens provide continuous fresh nutrients.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-[#0b192e] border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase block">
                Photosynthetically Active Radiation (PAR)
              </span>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Far-Red Light Enhancement:</span>
                  <span className="text-white font-bold">{ledFarRed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={ledFarRed}
                  onChange={(e) => setLedFarRed(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono">
                  Optimal CSA ratio: 1.0x to 1.5x Far-Red relative to 4.5:1 Red/Blue LED mix
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0b192e] border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase block">
                Nutrient Film Delivery
              </span>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Hydroponic Flow Rate:</span>
                  <span className="text-white font-bold">{nutrientFlow} L/min</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={nutrientFlow}
                  onChange={(e) => setNutrientFlow(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono">
                  Controlled flow prevents capillary fluid stagnation in microgravity root modules
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
