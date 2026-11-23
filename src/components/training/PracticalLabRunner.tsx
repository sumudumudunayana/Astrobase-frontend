import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  RotateCcw,
  Gauge,
  Terminal,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import type {
  PracticalExercise,
  SubmitExerciseResponse,
} from '../../types/training';
import { trainingApi } from '../../services/api/trainingApi';
import { toast } from 'sonner';

interface PracticalLabRunnerProps {
  exercise: PracticalExercise;
  onCompleted?: () => void;
}

export const PracticalLabRunner: React.FC<PracticalLabRunnerProps> = ({
  exercise,
  onCompleted,
}) => {
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmitExerciseResponse | null>(null);

  // Parse JSON payloads with fallbacks
  const initialConditions = React.useMemo(() => {
    try {
      return JSON.parse(exercise.initialConditions || '{}');
    } catch {
      return {};
    }
  }, [exercise.initialConditions]);

  const availableActions = React.useMemo(() => {
    try {
      return JSON.parse(exercise.availableActions || '[]');
    } catch {
      return [];
    }
  }, [exercise.availableActions]);

  const evaluationCriteria = React.useMemo(() => {
    try {
      return JSON.parse(exercise.evaluationCriteria || '{}');
    } catch {
      return {};
    }
  }, [exercise.evaluationCriteria]);

  const handleSelectOption = (actionKey: string, value: string) => {
    if (result) return; // Prevent changing after submission
    setDecisions((prev) => ({
      ...prev,
      [actionKey]: value,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(decisions).length === 0) {
      toast.error('Please configure your engineering actions before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await trainingApi.submitPracticalExercise(
        exercise.practicalExerciseId,
        {
          actionHistory: JSON.stringify(decisions),
          decisions,
        }
      );
      setResult(response);
      if (response.isPassed) {
        toast.success(`Lab ${exercise.exerciseNumber} Passed! Score: ${response.score}/100`);
      } else {
        toast.warning(`Lab evaluated: Score ${response.score}/100. Review debriefing and retry.`);
      }
      if (onCompleted) {
        onCompleted();
      }
    } catch (err: any) {
      console.error('Failed to submit practical exercise:', err);
      toast.error(err.response?.data?.message || 'Failed to submit practical exercise telemetry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setDecisions({});
  };

  return (
    <section className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1E2E4A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/30">
              PRACTICAL LAB 0{exercise.exerciseNumber}
            </span>
            {exercise.hasAttempt && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111E32] text-[#10B981] border border-[#10B981]/30">
                BEST: {exercise.bestScore}/100 {exercise.isPassed ? '✓' : ''}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#F5B942]" />
            {exercise.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <Terminal className="w-4 h-4 text-[#42D9F5]" />
          <span>FLIGHT SIMULATOR v2.4</span>
        </div>
      </div>

      {/* Scenario Briefing & Objective */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-4 rounded-xl bg-[#0B1424] border border-[#1E2E4A] space-y-2">
          <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold block">
            MISSION SCENARIO INJECTION:
          </span>
          <p className="text-sm text-[#E2E8F0] leading-relaxed">
            {exercise.scenario}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111E32] border border-[#1E2E4A] space-y-2 text-xs">
          <span className="font-mono text-[#F5B942] uppercase tracking-wider font-semibold block">
            CORE LEARNING OBJECTIVE:
          </span>
          <p className="text-[#94A3B8] leading-relaxed">
            {exercise.learningObjective}
          </p>
        </div>
      </div>

      {/* Initial Conditions Telemetry Matrix */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider block">
          INITIAL TELEMETRY READOUTS:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {Object.entries(initialConditions).map(([key, val]) => (
            <div
              key={key}
              className="p-3 rounded-lg bg-[#0B1424] border border-[#1E2E4A] space-y-1"
            >
              <span className="text-[10px] text-[#64748B] uppercase block truncate">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-white font-bold block truncate">
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Available Student Actions / Decision Matrix */}
      <div className="space-y-4 pt-2 border-t border-[#1E2E4A]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
            ENGINEERING ACTION PROTOCOL:
          </span>
          <span className="text-[10px] font-mono text-[#94A3B8]">
            SELECT MITIGATION STEPS
          </span>
        </div>

        <div className="space-y-4">
          {availableActions.map((action: any, index: number) => {
            const actionId = action.id || `action_${index}`;
            const selectedVal = decisions[actionId];

            return (
              <div
                key={actionId}
                className="p-4 rounded-xl bg-[#0B1424] border border-[#1E2E4A] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    Step {index + 1}: {action.title || action.label}
                  </span>
                  {action.category && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111E32] text-[#42D9F5]">
                      {action.category}
                    </span>
                  )}
                </div>

                {action.description && (
                  <p className="text-xs text-[#94A3B8]">{action.description}</p>
                )}

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {(action.options || []).map((opt: any) => {
                    const optKey = typeof opt === 'string' ? opt : opt.value || opt.id;
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    const isSelected = selectedVal === optKey;

                    return (
                      <button
                        key={optKey}
                        disabled={Boolean(result)}
                        onClick={() => handleSelectOption(actionId, optKey)}
                        className={`p-3 rounded-lg text-left text-xs font-mono transition-all border ${
                          isSelected
                            ? 'bg-[#42D9F5]/20 border-[#42D9F5] text-[#42D9F5] shadow-[0_0_10px_rgba(66,217,245,0.2)] font-bold'
                            : 'bg-[#111E32] border-[#1E2E4A] text-[#94A3B8] hover:text-white hover:border-[#42D9F5]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#42D9F5] bg-[#42D9F5]'
                                : 'border-[#64748B]'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#050914]" />
                            )}
                          </span>
                          <span className="leading-snug">{optLabel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission & Debriefing Outcome */}
      {!result ? (
        <div className="pt-2 border-t border-[#1E2E4A] flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(decisions).length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#F5B942] text-[#050914] font-mono text-xs font-bold hover:bg-[#F5B942]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(245,185,66,0.3)] flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#050914] border-t-transparent rounded-full animate-spin" />
                <span>EVALUATING ACTION MATRIX...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>TRANSMIT ACTION TO FLIGHT DIRECTOR</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Evaluation Debriefing Card */
        <div
          className={`p-5 rounded-xl border space-y-4 animate-in fade-in duration-300 ${
            result.isPassed
              ? 'bg-[#10B981]/10 border-[#10B981]/40'
              : 'bg-[#EF4444]/10 border-[#EF4444]/40'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {result.isPassed ? (
                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              )}
              <div>
                <h4 className="text-base font-bold text-white">
                  {result.isPassed
                    ? 'EXERCISE PASSED – MISSION STABILIZED'
                    : 'MISSION CONTINGENCY UNRESOLVED'}
                </h4>
                <p className="text-xs font-mono text-[#94A3B8]">
                  EVALUATION SCORE: {result.score} / 100 // STATUS: {result.isPassed ? 'CERTIFIED' : 'RETRY REQUIRED'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="px-3 py-1.5 rounded-lg bg-[#111E32] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RE-RUN LAB SCENARIO</span>
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1424] border border-[#1E2E4A] space-y-2 text-xs">
            <span className="font-mono text-[#42D9F5] uppercase tracking-wider block font-bold">
              SYSTEM OUTCOME & TELEMETRY RESPONSE:
            </span>
            <p className="text-[#E2E8F0] leading-relaxed">{result.systemOutcome}</p>

            <span className="font-mono text-[#F5B942] uppercase tracking-wider block font-bold pt-2 border-t border-[#1E2E4A]">
              FLIGHT DIRECTOR DEBRIEFING:
            </span>
            <p className="text-[#94A3B8] leading-relaxed italic">{result.debriefing}</p>
          </div>
        </div>
      )}
    </section>
  );
};

