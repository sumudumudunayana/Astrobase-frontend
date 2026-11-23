import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Award,
  Sparkles,
  Rocket,
  Shield,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';
import { trainingApi } from '../services/api/trainingApi';
import type { TrainingModule, LessonSummary } from '../types/training';
import { SpacecraftSystems3D } from '../components/three/SpacecraftSystems3D';
import { toast } from 'sonner';

export const AstronautFundamentalsPage: React.FC = () => {
  const [moduleData, setModuleData] = useState<TrainingModule | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const moduleId = '22222222-2222-2222-2222-222222222222'; // Seeded Module 01 GUID

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
      console.error('Failed to load module details:', err);
      toast.error('Failed to retrieve module syllabus from Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleAndLessons();
  }, []);

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A] bg-gradient-to-r from-[#070D1A] via-[#0B1424] to-[#070D1A]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5]/40">
                MODULE 01
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] text-[#94A3B8] border border-[#1E2E4A]">
                CATEGORY: FOUNDATION
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] text-[#F5B942] border border-[#1E2E4A]">
                DIFFICULTY: BEGINNER / FOUNDATION
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Astronaut Fundamentals
            </h1>

            <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed">
              Discover the science, technology, responsibilities, and operations behind human
              spaceflight. From the historic dawn of orbital flight to spacesuit life support,
              microgravity adaptation, flight dynamics, and mission control protocols.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#94A3B8] pt-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#42D9F5]" />
                <span>6 Comprehensive Lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#628CFF]" />
                <span>Estimated Duration: ~3 Hours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#F5B942]" />
                <span>NASA Verified Lineage</span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1.5 pt-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#94A3B8]">Curriculum Completion:</span>
                <span className="text-[#42D9F5] font-bold">
                  {completedCount} / {lessons.length} Lessons ({progressPct}%)
                </span>
              </div>
              <div className="w-full bg-[#0B1424] rounded-full h-2.5 overflow-hidden border border-[#1E2E4A]">
                <div
                  className="bg-gradient-to-r from-[#42D9F5] to-[#628CFF] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(66,217,245,0.4)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Jump CTA */}
          <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
            {lessons.length > 0 && (
              <Link
                to={`/lessons/${lessons[0].lessonId}`}
                className="px-6 py-3.5 rounded-xl bg-[#42D9F5] text-[#050914] font-bold text-sm tracking-wide text-center hover:bg-[#38bdf8] shadow-[0_0_20px_rgba(66,217,245,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>{completedCount === 0 ? 'Start Lesson 01' : 'Resume Course'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/spacesuit"
                className="py-2 px-3 rounded-lg bg-[#111E32] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] hover:text-[#42D9F5] text-center transition-colors"
              >
                3D Spacesuit
              </Link>
              <Link
                to="/microgravity"
                className="py-2 px-3 rounded-lg bg-[#111E32] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] hover:text-[#42D9F5] text-center transition-colors"
              >
                3D Microgravity
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Lessons Syllabus Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-wide">Module Syllabus</h2>
          <span className="text-xs font-mono text-[#94A3B8]">
            {completedCount} OF 6 COMPLETED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.lessonId}
              to={`/lessons/${lesson.lessonId}`}
              className={`p-5 rounded-xl border transition-all duration-200 group flex flex-col justify-between ${
                lesson.isCompleted
                  ? 'glass-panel border-[#10B981]/50 hover:border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'glass-panel border-[#1E2E4A] hover:border-[#42D9F5]/60 hover:shadow-[0_0_15px_rgba(66,217,245,0.1)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-[#111E32] text-[#42D9F5] border border-[#1E2E4A]">
                    LESSON 0{lesson.lessonNumber}
                  </span>

                  {lesson.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#10B981] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>COMPLETED</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {lesson.hasQuizAttempt ? 'IN PROGRESS' : 'NOT STARTED'}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#42D9F5] transition-colors mb-2">
                  {lesson.title}
                </h3>

                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 mb-4">
                  {lesson.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] border-t border-[#1E2E4A] pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lesson.estimatedDurationMinutes} mins</span>
                </div>

                {lesson.bestScore !== null && lesson.bestScore !== undefined && (
                  <span className="text-[#F5B942] font-semibold">
                    Quiz Score: {lesson.bestScore}/{lesson.totalQuestions}
                  </span>
                )}

                <span className="text-[#42D9F5] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Enter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Embedded 3D Interactive Spacecraft Systems Diagram */}
      <div className="space-y-4 pt-4 border-t border-[#1E2E4A]">
        <div>
          <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
            INTERACTIVE SUBSYSTEM EXPLORATION
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Spacecraft Subsystem Architecture
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Rotate the modular spacecraft model to inspect the Crew Module, Service Module,
            Hypergolic Propulsion, Solar Arrays, Communications, and Environmental Life Support.
          </p>
        </div>

        <SpacecraftSystems3D />
      </div>
    </div>
  );
};

