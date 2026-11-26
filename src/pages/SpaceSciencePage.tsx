import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Atom,
  BarChart3,
  Dna,
  Globe2,
  FileText,
  Activity,
  Compass,
} from 'lucide-react';
import { trainingApi } from '../services/api/trainingApi';
import type { TrainingModule, LessonSummary } from '../types/training';
import { MicrogravityResearch3D } from '../components/three/MicrogravityResearch3D';

export const SpaceSciencePage: React.FC = () => {
  const [moduleData, setModuleData] = useState<TrainingModule | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const moduleId = '70707070-7070-7070-7070-707070707070'; // Seeded Module 07 GUID

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
      console.error('Failed to load Module 07 details:', err);
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
    <FlaskConical key="1" className="w-4 h-4 text-cyan-400" />,
    <Atom key="2" className="w-4 h-4 text-emerald-400" />,
    <BarChart3 key="3" className="w-4 h-4 text-amber-400" />,
    <Dna key="4" className="w-4 h-4 text-purple-400" />,
    <Globe2 key="5" className="w-4 h-4 text-teal-400" />,
    <FileText key="6" className="w-4 h-4 text-blue-400" />,
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
            Module 07: Space Science & Research
          </span>
        </div>

        <Link
          to="/space-science/lab"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <FlaskConical className="w-4 h-4" />
          <span>ENTER SCIENCE LABORATORY</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Module Overview Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0b1329] via-[#070b14] to-[#120a1c] border border-cyan-800/40 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-semibold tracking-wider uppercase">
              Module 07 // Academic & Scientific Research
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1e293b] text-slate-300 font-mono text-xs">
              Difficulty: Intermediate / Advanced
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1e293b] text-slate-300 font-mono text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              6 Hours Est.
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
            Space Science & Research
          </h1>

          <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed">
            Master the fundamentals of scientific research in microgravity, interfacial fluid
            mechanics, macromolecular protein crystallography, cellular gravitropism, planetary
            spectroscopy, and the formal IMRAD peer-reviewed reporting architecture.
          </p>

          {/* Module Progress Bar */}
          <div className="pt-2 max-w-md space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">Curriculum Completion</span>
              <span className="text-cyan-400 font-bold">
                {completedCount} / {lessons.length} Lessons ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Roster: 6 Lessons Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-slate-300">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Structured Curriculum Lessons (6)</span>
          </div>
          <span className="text-xs font-mono text-[#64748b]">
            Direct 3D Aerospace Lab in every lesson (?tab=3d-sim)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, index) => {
            const isCompleted = lesson.isCompleted;

            return (
              <Link
                key={lesson.lessonId}
                to={`/lessons/${lesson.lessonId}?tab=3d-sim`}
                className="group relative rounded-xl bg-[#090d1a] border border-[#1e293b] hover:border-cyan-500/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      LESSON 0{lesson.lessonNumber || index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#0f172a] border border-[#1e293b] group-hover:border-cyan-500/40 transition-colors">
                      {lessonIcons[index] || <FlaskConical className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lesson.estimatedDurationMinutes} mins</span>
                  </div>
                  <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Enter Lab 3D <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured 3D Simulation Rig Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-slate-300">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Interactive 3D Spotlight: Dual-Chamber Microgravity Physics</span>
          </div>
          <span className="text-xs font-mono text-[#64748b]">
            Earth 1.0g vs Microgravity 10^-4g // Live Gravity Vector Regulator
          </span>
        </div>

        <MicrogravityResearch3D />
      </div>
    </div>
  );
};
