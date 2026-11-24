import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Award,
  Shield,
  Layers,
  AlertTriangle,
  Flame,
  Wind,
  Zap,
  HeartPulse,
  AlertOctagon,
  Play,
  RotateCcw,
  Sun,
  Activity,
  Compass,
} from 'lucide-react';
import { trainingApi } from '../services/api/trainingApi';
import type { TrainingModule, LessonSummary } from '../types/training';
import { CabinPressureLoss3D } from '../components/three/CabinPressureLoss3D';

export const EmergencyPage: React.FC = () => {
  const [moduleData, setModuleData] = useState<TrainingModule | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const moduleId = '66666666-6666-6666-6666-666666666666'; // Seeded Module 04 GUID

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
      console.error('Failed to load Module 04 details:', err);
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
    <Wind key="1" className="w-4 h-4 text-cyan-400" />,
    <Flame key="2" className="w-4 h-4 text-amber-400" />,
    <AlertTriangle key="3" className="w-4 h-4 text-rose-400" />,
    <Sun key="4" className="w-4 h-4 text-amber-300" />,
    <Zap key="5" className="w-4 h-4 text-cyan-300" />,
    <HeartPulse key="6" className="w-4 h-4 text-rose-400" />,
    <AlertOctagon key="7" className="w-4 h-4 text-red-500" />,
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
          <span className="text-rose-400 font-semibold">Module 04: Emergency Response & Safety</span>
        </div>

        <Link
          to="/emergency/simulator"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
        >
          <AlertOctagon className="w-4 h-4" />
          LAUNCH EMERGENCY SIMULATOR
        </Link>
      </div>

      {/* Module Banner Card */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#0B1528] via-[#070D1A] to-[#040711] border border-[#1E2E4A] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
              MODULE 04 // CRITICAL
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800">
              Intermediate / Advanced Foundation
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              6–8 Hours (420 Mins)
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
            Emergency Response &amp; Safety
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
            Learn how astronauts identify, assess, and respond to catastrophic hazards in spacecraft and planetary habitats.
            Master rapid depressurization hatch isolation, oxygen enrichment flammability protocols, microgravity fire suppression,
            space weather radiation storm shelters, equipment failure cross-ties, zero-g medical stabilization, and emergency spacecraft evacuation.
          </p>

          {/* Module Progress Bar */}
          <div className="pt-2 max-w-md">
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
              <span>CRITICAL CURRICULUM PROGRESS</span>
              <span className="text-cyan-300 font-bold">{progressPct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-rose-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 3D Lab Component Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base md:text-lg font-bold font-mono tracking-wide text-white uppercase">
              INTERACTIVE 3D AEROSPACE SAFETY LABORATORY
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:block">
            Drag to Rotate • Scroll to Zoom
          </span>
        </div>

        <CabinPressureLoss3D />
      </div>

      {/* Curriculum Roster: 7 Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-400" />
            <h2 className="text-base md:text-lg font-bold font-mono tracking-wide text-white uppercase">
              SEVEN EMERGENCY TRAINING LESSONS &amp; PRACTICAL LABS
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">7 LESSONS • 21 ASSESSMENTS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(lessons.length > 0
            ? lessons
            : [
                {
                  lessonId: '66666666-6666-6666-6666-666666666601',
                  lessonNumber: 1,
                  title: 'Cabin Pressure Loss',
                  description:
                    'Analyze rapid decompression versus slow micro-leaks, calculate Time of Useful Consciousness, and master module hatch isolation protocols.',
                  estimatedDurationMinutes: 60,
                  isCompleted: false,
                },
                {
                  lessonId: '66666666-6666-6666-6666-666666666602',
                  lessonNumber: 2,
                  title: 'Oxygen Leaks and Atmosphere Enrichment',
                  description:
                    'Study the critical dangers of elevated oxygen concentrations, flammability limits, high-pressure distribution manifold failures, and N2 purge.',
                  estimatedDurationMinutes: 60,
                  isCompleted: false,
                },
                {
                  lessonId: '66666666-6666-6666-6666-666666666603',
                  lessonNumber: 3,
                  title: 'Fire and Smoke Emergencies',
                  description:
                    'Master the unique physics of microgravity flames, obscuration smoke detection systems, ventilation shutdown tactics, and toxic scrubbing.',
                  estimatedDurationMinutes: 60,
                  isCompleted: false,
                },
                {
                  lessonId: '66666666-6666-6666-6666-666666666604',
                  lessonNumber: 4,
                  title: 'Radiation Exposure Events',
                  description:
                    'Understand cosmic radiation hazards, differentiate Solar Particle Events from GCRs, configure storm shelters using water mass, and track dosimetry.',
                  estimatedDurationMinutes: 60,
                  isCompleted: false,
                },
                {
                  lessonId: '66666666-6666-6666-6666-666666666605',
                  lessonNumber: 5,
                  title: 'Equipment Malfunctions and Systems Failure',
                  description:
                    'Diagnose critical failures across thermal loops, electrical buses, and avionics multiplexers, and execute load shedding and cross-ties.',
                  estimatedDurationMinutes: 60,
                  isCompleted: false,
                },
                {
                  lessonId: '66666666-6666-6666-6666-666666666606',
                  lessonNumber: 6,
                  title: 'Medical Emergency Scenarios',
                  description:
                    'Manage trauma in microgravity, severe decompression sickness (bends), cardiac dysrhythmias, telemedicine with flight surgeons, and hyperbaric bags.',
                  estimatedDurationMinutes: 60,
                  isCompleted: false,
                },
                {
                  lessonId: '66666666-6666-6666-6666-666666666607',
                  lessonNumber: 7,
                  title: 'Emergency Communication and Evacuation',
                  description:
                    'Master distress calling protocols (MAYDAY), emergency safe-haven sheltering, catastrophic station evacuation, and rapid undocking procedures.',
                  estimatedDurationMinutes: 60,
                  isCompleted: false,
                },
              ]
          ).map((l, idx) => (
            <Link
              key={l.lessonId}
              to={`/lessons/${l.lessonId}?tab=3d-sim`}
              className="p-5 rounded-2xl bg-[#070D1A] border border-[#1E2E4A] hover:border-rose-500/50 hover:bg-[#0B1528] transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                      {lessonIcons[idx] || <BookOpen className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      LESSON 0{l.lessonNumber}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {l.estimatedDurationMinutes} MINS
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  {l.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {l.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
                  START LESSON &amp; 3D LAB
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                {l.isCompleted && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PASSED
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
