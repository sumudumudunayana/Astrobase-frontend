import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  Radar,
  HeartPulse,
  MessageSquare,
  GitBranch,
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Activity,
  Layers,
} from 'lucide-react';
import { trainingApi } from '../services/api/trainingApi';
import type { TrainingModule, LessonSummary } from '../types/training';
import { CrewCoordination3D } from '../components/three/CrewCoordination3D';

export const CrmPage: React.FC = () => {
  const [moduleData, setModuleData] = useState<TrainingModule | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const moduleId = '80808080-8080-8080-8080-808080808080'; // Module 08 Seeded GUID

  const fetchModuleAndLessons = async () => {
    setIsLoading(true);
    try {
      const [mod, lessonList] = await Promise.all([
        trainingApi.getModuleById(moduleId),
        trainingApi.getModuleLessons(moduleId),
      ]);
      setModuleData(mod);
      setLessons(lessonList);
    } catch (err) {
      console.error('Failed to load Module 08 details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleAndLessons();
  }, []);

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const lessonIcons = [
    <Users key="1" className="w-4 h-4 text-cyan-400" />,
    <Compass key="2" className="w-4 h-4 text-red-400" />,
    <Radar key="3" className="w-4 h-4 text-purple-400" />,
    <HeartPulse key="4" className="w-4 h-4 text-rose-400" />,
    <MessageSquare key="5" className="w-4 h-4 text-amber-400" />,
    <GitBranch key="6" className="w-4 h-4 text-teal-400" />,
    <Award key="7" className="w-4 h-4 text-emerald-400" />,
  ];

  return (
    <div className="min-h-screen bg-[#050914] text-white p-4 md:p-8 space-y-8 select-none">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <Link to="/academy" className="hover:text-white transition-colors">
            Training Academy
          </Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">
            Module 08: Leadership & Crew Resource Management
          </span>
        </div>

        <Link
          to="/crm/training-center"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <Users className="w-4 h-4" />
          <span>ENTER CRM TRAINING CENTER</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Hero Overview Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0b162b] via-[#070e1c] to-[#150f24] border border-cyan-800/40 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-semibold tracking-wider uppercase">
              Module 08 // Professional Skills
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1e293b] text-slate-300 font-mono text-xs">
              Difficulty: Intermediate / Advanced Foundation
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1e293b] text-slate-300 font-mono text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              7 Hours Est.
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
            Leadership & Crew Resource Management
          </h1>

          <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed">
            Develop world-class astronautic leadership, multi-station team coordination, situational awareness,
            error prevention, fatigue countermeasures, and interpersonal mediation. Build the human-factor
            resilience essential for long-duration deep space exploration.
          </p>

          {/* Progress Bar */}
          <div className="pt-2 max-w-md space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">Curriculum Completion</span>
              <span className="text-cyan-400 font-bold">
                {completedCount} / {lessons.length} Lessons ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3D Interactive Lab Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              Interactive 3D Cockpit Coordination Environment
            </h2>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">
            Full-width 3D Multi-Station Simulation
          </span>
        </div>
        <CrewCoordination3D />
      </div>

      {/* 7 Structured Lessons Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              Course Syllabus & Practical Flight Labs (7 Lessons)
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Learn → Practice → Demonstrate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.length > 0 ? (
            lessons.map((lesson, idx) => (
              <Link
                key={lesson.lessonId}
                to={`/lessons/${lesson.lessonId}?tab=3d-sim`}
                className="group relative rounded-xl bg-[#091122] border border-slate-800/80 hover:border-cyan-500/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                      LESSON 0{lesson.lessonNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      {lesson.isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.estimatedDurationMinutes}m
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-[#0f1d33] border border-slate-800 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-700 transition-colors">
                      {lessonIcons[idx % lessonIcons.length]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <span>Launch 3D Simulation</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-slate-400 font-mono">
              Loading Module 08 lessons...
            </div>
          )}
        </div>
      </div>

      {/* CRM Training Center Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-950/50 via-[#0a192f] to-[#071324] border border-cyan-700/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Dedicated Multi-Station Simulator</span>
          </div>
          <h3 className="text-xl font-bold text-white font-mono">
            Crew Resource Management Training Center
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Take command of integrated deep space mission scenarios: Lunar Research Expedition and Mars Deep Space Transit.
            Coordinate crew tasks, resolve high-stress conflicts, diagnose telemetry anomalies, manage circadian shifts, and review authoritative post-flight debriefs.
          </p>
        </div>

        <Link
          to="/crm/training-center"
          className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-900/40 transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2"
        >
          <span>ENTER TRAINING CENTER</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
