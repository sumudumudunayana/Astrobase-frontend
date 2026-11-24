import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  Compass,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Shield,
  Layers,
  Database,
  RefreshCw,
  ExternalLink,
  Lightbulb,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { HeroSpaceScene } from '../components/three/HeroSpaceScene';
import { trainingApi } from '../services/api/trainingApi';
import type { LearnerProgress, LearnerActivity, TrainingModule } from '../types/training';
import { toast } from 'sonner';

const ROADMAP_MODULES = [
  {
    number: 1,
    title: 'Astronaut Fundamentals',
    category: 'FOUNDATION',
    status: 'Available',
    description: 'Human spaceflight history, crew command structures, spacesuit & habitat systems, orbital physics, and mission communication.',
    path: '/academy/astronaut-fundamentals',
    isAvailable: true,
  },
  {
    number: 2,
    title: 'Life Support & Space Habitat Systems',
    category: 'HABITAT ENGINEERING',
    status: 'Available',
    description: 'Closed-loop environmental control (ECLSS), oxygen generation, water recovery distillation, CO2 removal, greenhouses, thermal loops, and power systems.',
    path: '/academy/life-support',
    isAvailable: true,
  },
  {
    number: 3,
    title: 'EVA & Astronaut Operations',
    category: 'EXTRAVEHICULAR OPERATIONS',
    status: 'Available',
    description: 'Airlock cycling protocols, EMU spacesuit subsystems, spacewalk tether dynamics, zero-g torque dynamics, and post-EVA ingress.',
    path: '/academy/eva',
    isAvailable: true,
  },
  {
    number: 4,
    title: 'Emergency Response & Safety',
    category: 'CRITICAL OPERATIONS',
    status: 'Available',
    description: 'Cabin depressurization containment, oxygen enrichment mitigation, microgravity fire suppression, solar radiation storm shelter, and emergency spacecraft evacuation.',
    path: '/academy/emergency',
    isAvailable: true,
  },
  {
    number: 5,
    title: 'Planetary Science & Exploration',
    category: 'SCIENCE & EXPLORATION',
    status: 'Available',
    description: 'Lunar regolith geology, Martian sedimentology, robotic rover mobility with rocker-bogie suspension, core drilling, and landing site trade studies.',
    path: '/academy/planetary',
    isAvailable: true,
  },
  {
    number: 6,
    title: 'Mission Planning & Operations',
    category: 'MISSION OPERATIONS',
    status: 'Available',
    description: 'Mission architecture, operational constraints, Gantt/timeline scheduling, crew roles & work-rest cycles, DSN communications & light-time delay, consumables & mass-energy budgets, Mission Control console positions, and risk mitigation.',
    path: '/academy/mission-planning',
    isAvailable: true,
  },
  {
    number: 7,
    title: 'Space Science & Research',
    category: 'ACADEMIC & SCIENTIFIC RESEARCH',
    status: 'Available',
    description: 'Microgravity protein crystallography, capillary fluid kinetics, plant gravitropism, planetary core spectroscopy, and formal IMRAD scientific reporting.',
    path: '/academy/space-science',
    isAvailable: true,
  },
  {
    number: 8,
    title: 'Leadership & Crew Resource Management',
    category: 'HUMAN FACTORS & CRM',
    status: 'Available',
    description: 'Cockpit crew coordination, situational leadership under pressure, Endsley SA error management, sleep pod circadian biology, DESC conflict mediation, and Bayesian decisions.',
    path: '/academy/crm',
    isAvailable: true,
  },
];

const DID_YOU_KNOW_FACTS = [
  {
    title: 'Gravity in Low Earth Orbit',
    content: 'At the International Space Station altitude (approx. 408 km), Earth\'s gravity is still ~90% of sea level. Astronauts float not because there is no gravity, but because the station is in continuous horizontal free fall at 27,600 km/h.',
    source: 'NASA Human Research Program',
  },
  {
    title: 'The Puffy-Head Bird-Legs Effect',
    content: 'In microgravity, about 2 liters of fluid shift from the legs to the upper chest and head within hours. This triggers the body to eliminate fluid, reducing blood plasma volume by up to 20% during missions.',
    source: 'NASA Space Medicine',
  },
  {
    title: 'Gold-Plated Astronaut Visors',
    content: 'Spacesuit outer visors are coated with a micro-thin layer of pure 24-karat gold. Gold reflects 90% of dangerous solar infrared and ultraviolet radiation while maintaining optical clarity for the spacewalker.',
    source: 'NASA Johnson Space Center',
  },
  {
    title: 'Orbital Sunset Frequencies',
    content: 'Because the ISS completes an orbit every 90 to 92 minutes, astronauts aboard experience 16 sunrises and 16 sunsets every 24-hour terrestrial day.',
    source: 'NASA ISS Flight Operations',
  },
];

export const DashboardPage: React.FC = () => {
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [activities, setActivities] = useState<LearnerActivity[]>([]);
  const [moduleData, setModuleData] = useState<TrainingModule | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('Connecting...');
  const [isLoading, setIsLoading] = useState(true);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Health check
      try {
        const health = await trainingApi.checkDatabaseHealth();
        setDbStatus(health.database === 'Connected' ? 'Supabase Connected' : 'Disconnected');
      } catch {
        setDbStatus('Offline');
      }

      // 2. Real Learner Progress
      const prog = await trainingApi.getLearnerProgress();
      setProgress(prog);

      // 3. Modules
      const modules = await trainingApi.getModules();
      if (modules.length > 0) {
        setModuleData(modules[0]);
      }

      // 4. Recent activities
      const acts = await trainingApi.getLearnerActivity();
      setActivities(acts);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Mission control telemetry error: Unable to load records from Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currentFact = DID_YOU_KNOW_FACTS[currentFactIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Section */}
      <section className="relative rounded-2xl overflow-hidden border border-[#1E2E4A] bg-[#070D1A] shadow-2xl">
        {/* Background 3D Space Scene */}
        <div className="relative">
          <HeroSpaceScene />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070D1A] via-[#070D1A]/70 to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none">
            <div className="max-w-3xl pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111E32]/90 border border-[#42D9F5]/40 text-[#42D9F5] text-xs font-mono font-semibold tracking-widest uppercase mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>YOUR JOURNEY TO THE STARS STARTS HERE</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
                Welcome to <span className="text-[#42D9F5]">AstroBase</span>
              </h1>

              <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed mb-6 max-w-2xl">
                Train, explore, and master the fundamentals of human spaceflight through interactive
                astronaut training experiences designed for university-level aerospace education.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/academy/astronaut-fundamentals"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#42D9F5] to-[#628CFF] text-[#050914] font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(66,217,245,0.4)] hover:shadow-[0_0_25px_rgba(66,217,245,0.6)] hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4 fill-current" />
                  <span>Continue Training</span>
                </Link>

                <Link
                  to="/academy"
                  className="px-6 py-3 rounded-xl bg-[#111E32]/90 border border-[#1E2E4A] text-white font-semibold text-sm hover:border-[#42D9F5]/50 hover:bg-[#111E32] transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <BookOpen className="w-4 h-4 text-[#42D9F5]" />
                  <span>Explore Academy</span>
                </Link>

                <div className="hidden sm:flex items-center gap-2 ml-auto text-xs font-mono text-[#94A3B8] px-3 py-2 rounded-lg bg-[#0B1424]/80 border border-[#1E2E4A] backdrop-blur-sm">
                  <Database className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>DB: {dbStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Real Database Training Overview Statistics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Modules */}
        <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A] relative overflow-hidden group hover:border-[#42D9F5]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#94A3B8] uppercase">TRAINING MODULES</span>
            <Layers className="w-4 h-4 text-[#42D9F5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">8</span>
            <span className="text-xs font-mono text-[#94A3B8]">Planned</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#42D9F5]">
            Completed: {progress?.completedModules ?? 0} / 8
          </div>
        </div>

        {/* Lessons Completed (Actual DB Data) */}
        <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A] relative overflow-hidden group hover:border-[#42D9F5]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#94A3B8] uppercase">LESSONS COMPLETED</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{progress?.completedLessons ?? 0}</span>
            <span className="text-xs font-mono text-[#94A3B8]">/ {progress?.totalLessons ?? 6}</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#10B981]">
            Actual Database Record
          </div>
        </div>

        {/* Overall Training Progress % */}
        <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A] relative overflow-hidden group hover:border-[#42D9F5]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#94A3B8] uppercase">TOTAL PROGRESS</span>
            <Award className="w-4 h-4 text-[#F5B942]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#42D9F5]">
              {progress?.overallProgressPercent ?? 0}%
            </span>
          </div>
          <div className="mt-2 w-full bg-[#111E32] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#42D9F5] to-[#628CFF] h-full rounded-full transition-all duration-500"
              style={{ width: `${progress?.overallProgressPercent ?? 0}%` }}
            />
          </div>
        </div>

        {/* Current Training Level */}
        <div className="glass-panel p-5 rounded-xl border border-[#1E2E4A] relative overflow-hidden group hover:border-[#42D9F5]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#94A3B8] uppercase">TRAINING LEVEL</span>
            <Shield className="w-4 h-4 text-[#628CFF]" />
          </div>
          <div className="text-sm font-bold text-white truncate mb-1">
            {progress?.currentTrainingLevel ?? 'Beginner / Foundation'}
          </div>
          <div className="text-[11px] font-mono text-[#94A3B8]">
            {progress?.completedLessons === 6
              ? 'Level 1 Certified'
              : `${6 - (progress?.completedLessons ?? 0)} lessons to Level 1`}
          </div>
        </div>
      </section>

      {/* 3. Featured Active Training Module Card (Module 01) */}
      <section className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#42D9F5]/10 text-[#42D9F5] border border-[#42D9F5]/30">
                ACTIVE MODULE 01
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] text-[#94A3B8] border border-[#1E2E4A]">
                CATEGORY: FOUNDATION
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] text-[#F5B942] border border-[#1E2E4A]">
                DIFFICULTY: BEGINNER / FOUNDATION
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              ASTRONAUT FUNDAMENTALS
            </h2>

            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Explore the history, systems, science, and operations that make human spaceflight
              possible. Master rocket flight phases, spacesuit life support, microgravity adaptation,
              and mission control communication protocols.
            </p>

            {/* Metrics Row */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#94A3B8] pt-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#42D9F5]" />
                <span>6 Core Lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#628CFF]" />
                <span>~2.5 - 3 Hours Total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>
                  Completed: {progress?.completedLessons ?? 0} of 6 (
                  {progress?.activeModuleProgressPercent ?? 0}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#0B1424] rounded-full h-2.5 overflow-hidden border border-[#1E2E4A] max-w-lg mt-2">
              <div
                className="bg-gradient-to-r from-[#42D9F5] to-[#628CFF] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(66,217,245,0.4)]"
                style={{ width: `${progress?.activeModuleProgressPercent ?? 0}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
            <Link
              to="/academy/astronaut-fundamentals"
              className="px-6 py-3.5 rounded-xl bg-[#42D9F5] text-[#050914] font-bold text-sm tracking-wide text-center hover:bg-[#38bdf8] shadow-[0_0_20px_rgba(66,217,245,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span>{progress?.completedLessons === 0 ? 'Start Module 01' : 'Continue Module'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              to="/spaceflight"
              className="px-6 py-2.5 rounded-xl bg-[#111E32] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] hover:text-[#42D9F5] hover:border-[#42D9F5]/40 text-center transition-all flex items-center justify-center gap-2"
            >
              <Rocket className="w-3.5 h-3.5 text-[#42D9F5]" />
              <span>Launch 3D Flight Phases</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Training Roadmap (All 8 Modules) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              Astronaut Curriculum Roadmap
            </h3>
            <p className="text-xs font-mono text-[#94A3B8]">
              8 University-Level Astronaut Training Modules
            </p>
          </div>
          <Link
            to="/academy"
            className="text-xs font-mono text-[#42D9F5] hover:underline flex items-center gap-1"
          >
            <span>Full Syllabus</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROADMAP_MODULES.map((mod) => (
            <div
              key={mod.number}
              className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                mod.isAvailable
                  ? 'glass-panel border-[#42D9F5]/40 hover:border-[#42D9F5] shadow-[0_0_15px_rgba(66,217,245,0.1)]'
                  : 'bg-[#0B1424]/60 border-[#1E2E4A]/80 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      mod.isAvailable
                        ? 'bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5]/40'
                        : 'bg-[#111E32] text-[#64748B] border border-[#1E2E4A]'
                    }`}
                  >
                    MODULE 0{mod.number}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      mod.isAvailable ? 'text-[#10B981]' : 'text-[#64748B]'
                    }`}
                  >
                    {mod.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1.5 leading-snug">
                  {mod.title}
                </h4>

                <span className="text-[10px] font-mono text-[#42D9F5] block mb-2">
                  {mod.category}
                </span>

                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3 mb-4">
                  {mod.description}
                </p>
              </div>

              <div>
                {mod.isAvailable ? (
                  <Link
                    to={mod.path}
                    className="w-full py-2 px-3 rounded-lg bg-[#42D9F5]/10 border border-[#42D9F5]/40 text-[#42D9F5] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 hover:bg-[#42D9F5] hover:text-[#050914] transition-colors"
                  >
                    <span>Enter Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div className="w-full py-2 px-3 rounded-lg bg-[#111E32]/50 border border-[#1E2E4A] text-[#64748B] text-xs font-mono text-center">
                    Upcoming in Phase 02
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Bottom Grid: Recent Activity & "Did You Know?" & Learning Objectives */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Activity from PostgreSQL (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-xl border border-[#1E2E4A]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#42D9F5]" />
              <span>Recent Training Telemetry</span>
            </h4>
            <span className="text-[10px] font-mono text-[#94A3B8]">LIVE DATABASE LOG</span>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-lg bg-[#0B1424] border border-[#1E2E4A]">
              <Rocket className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
              <h5 className="text-sm font-semibold text-white mb-1">No Completed Sessions Yet</h5>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mb-4">
                You have not completed any lesson quizzes yet. Begin Lesson 01 to record your first
                astronaut training telemetry in Supabase.
              </p>
              <Link
                to="/academy/astronaut-fundamentals"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5]/30 text-xs font-mono font-semibold hover:bg-[#42D9F5] hover:text-[#050914] transition-colors"
              >
                <span>Launch Lesson 01</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.activityId}
                  className="p-3 rounded-lg bg-[#0B1424] border border-[#1E2E4A] flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">{act.title}</span>
                    <p className="text-[11px] text-[#94A3B8]">{act.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#42D9F5] shrink-0">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Did You Know? + Objectives (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Did You Know Card */}
          <div className="glass-panel p-6 rounded-xl border border-[#1E2E4A] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F5B942] uppercase tracking-wider font-semibold">
                <Lightbulb className="w-4 h-4 text-[#F5B942]" />
                DID YOU KNOW? // NASA SCIENCE FACT
              </span>
              <button
                onClick={() =>
                  setCurrentFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length)
                }
                className="text-xs font-mono text-[#94A3B8] hover:text-[#42D9F5] flex items-center gap-1 transition-colors"
                title="Next Fact"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Fact</span>
              </button>
            </div>

            <h4 className="text-base font-bold text-white mb-2">{currentFact.title}</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{currentFact.content}</p>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] border-t border-[#1E2E4A] pt-2">
              <span>REFERENCE: {currentFact.source}</span>
              <span>
                FACT {currentFactIndex + 1} OF {DID_YOU_KNOW_FACTS.length}
              </span>
            </div>
          </div>

          {/* Core Foundation Objectives */}
          <div className="glass-panel p-6 rounded-xl border border-[#1E2E4A]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3 text-[#42D9F5]">
              CORE FOUNDATION OBJECTIVES
            </h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#42D9F5] shrink-0 mt-0.5" />
                <span>Master historical milestones from Vostok to Apollo, Shuttle, ISS, and Artemis.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#42D9F5] shrink-0 mt-0.5" />
                <span>Understand flight crew hierarchy, CRM decision making, and ASCAN training.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#42D9F5] shrink-0 mt-0.5" />
                <span>Analyze spacesuit EMU life support, thermal loops, and pressure garments.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#42D9F5] shrink-0 mt-0.5" />
                <span>Differentiate orbital free fall from zero gravity and study human adaptation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

