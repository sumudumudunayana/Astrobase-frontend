import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Award,
  Radio,
  Shield,
  Layers,
  ClipboardCheck,
  Link2,
  Wrench,
  DoorClosed,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { trainingApi } from '../services/api/trainingApi';
import type { TrainingModule, LessonSummary } from '../types/training';
import { EVAFundamentals3D } from '../components/three/EVAFundamentals3D';
import { toast } from 'sonner';

export const EVAPage: React.FC = () => {
  const [moduleData, setModuleData] = useState<TrainingModule | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const moduleId = '77777777-7777-7777-7777-777777777777'; // Seeded Module 03 GUID

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
      console.error('Failed to load Module 03 details:', err);
      // Non-blocking fallback for offline/sandbox
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
    <Radio key="1" className="w-4 h-4 text-[#42D9F5]" />,
    <Layers key="2" className="w-4 h-4 text-[#F5B942]" />,
    <ClipboardCheck key="3" className="w-4 h-4 text-[#10B981]" />,
    <Link2 key="4" className="w-4 h-4 text-[#EF4444]" />,
    <Wrench key="5" className="w-4 h-4 text-[#38BDF8]" />,
    <DoorClosed key="6" className="w-4 h-4 text-[#628CFF]" />,
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A] bg-gradient-to-r from-[#070D1A] via-[#0B1424] to-[#070D1A]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5]/40">
                MODULE 03
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] text-[#94A3B8] border border-[#1E2E4A]">
                CATEGORY: PRACTICAL
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] text-[#F5B942] border border-[#1E2E4A]">
                DIFFICULTY: INTERMEDIATE
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] text-[#10B981] border border-[#1E2E4A] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                EST. 5–7 HOURS
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              EVA & Astronaut Operations
            </h1>
            <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed">
              Master the protocols and physics of Extravehicular Activities. Learn to operate Extravehicular Mobility Units (EMU), manage dual safety tether systems, utilize Pistol Grip Tools (PGT) under zero-gravity reaction dynamics, and navigate staged Quest airlock depressurization.
            </p>
          </div>

          {/* Quick Actions & Progress Card */}
          <div className="w-full lg:w-72 p-5 rounded-xl bg-[#111E32]/70 border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#94A3B8] uppercase">Sortie Readiness</span>
              <span className="text-sm font-bold font-mono text-[#42D9F5]">
                {progressPct}% COMPLETED
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#050914] h-2 rounded-full overflow-hidden border border-[#1E2E4A]">
              <div
                className="bg-gradient-to-r from-[#42D9F5] to-[#628CFF] h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/eva/simulator"
                className="w-full py-2.5 px-4 rounded-lg bg-[#42D9F5] hover:bg-[#38BDF8] text-[#050914] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#42D9F5]/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>LAUNCH EVA SIMULATOR</span>
              </Link>

              {lessons.length > 0 && (
                <Link
                  to={`/lessons/${lessons[0].lessonId}`}
                  className="w-full py-2 px-4 rounded-lg bg-[#0B1424] hover:bg-[#1E2E4A] border border-[#1E2E4A] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#42D9F5]" />
                  <span>START LESSON 01</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded 3D Interactive Lab: EVA Fundamentals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#42D9F5]" />
              INTERACTIVE 3D LAB: EVA FUNDAMENTALS & SPACE ENVIRONMENT
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Inspect an astronaut outside the Quest airlock, rotate orbital views, and explore space environment hazards.
            </p>
          </div>
        </div>

        <EVAFundamentals3D />
      </div>

      {/* Module 03 Syllabus Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#42D9F5]" />
            CURRICULUM SYLLABUS ({lessons.length} LESSONS & PRACTICAL LABS)
          </h2>
          <span className="text-xs font-mono text-[#94A3B8]">
            {completedCount} of {lessons.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, idx) => (
            <Link
              key={lesson.lessonId}
              to={`/lessons/${lesson.lessonId}`}
              className="group glass-panel p-5 rounded-xl border border-[#1E2E4A] hover:border-[#42D9F5]/60 hover:bg-[#111E32]/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#070D1A] border border-[#1E2E4A] flex items-center justify-center">
                    {lessonIcons[idx % lessonIcons.length]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111E32] text-[#94A3B8] border border-[#1E2E4A]">
                      {lesson.estimatedDurationMinutes} MINS
                    </span>
                    {lesson.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#42D9F5] font-semibold block uppercase">
                    LESSON {lesson.lessonNumber.toString().padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-[#42D9F5] transition-colors mt-0.5">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1.5 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[#1E2E4A]/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[#94A3B8] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#F5B942]" />
                  {lesson.hasQuizAttempt
                    ? `Quiz: ${lesson.bestScore}/${lesson.totalQuestions ?? 3}`
                    : 'Quiz & Lab Included'}
                </span>
                <span className="text-[#42D9F5] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Enter Lesson <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

