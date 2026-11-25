import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  HelpCircle,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Shield,
  Layers,
  ArrowLeft,
  Send,
  AlertCircle,
  Rocket,
  Wrench,
  Wind,
  Droplet,
  Sun,
  Thermometer,
  Zap,
  Home,
  Sidebar as SidebarIcon,
  Maximize2,
  FileText,
  Compass,
} from 'lucide-react';
import { trainingApi } from '../services/api/trainingApi';
import type {
  LessonDetail,
  LessonSummary,
  AssessmentQuestion,
  SubmitQuizResponse,
} from '../types/training';
import { toast } from 'sonner';

// 3D Visual Experience components
import { SpacesuitViewer3D } from '../components/three/SpacesuitViewer3D';
import { MicrogravityDemo3D } from '../components/three/MicrogravityDemo3D';
import { SpaceflightPhases3D } from '../components/three/SpaceflightPhases3D';
import { SpacecraftSystems3D } from '../components/three/SpacecraftSystems3D';

// Module 02 3D Components
import { OxygenCirculation3D } from '../components/three/OxygenCirculation3D';
import { CO2AirPurification3D } from '../components/three/CO2AirPurification3D';
import { WaterRecovery3D } from '../components/three/WaterRecovery3D';
import { SpaceGreenhouse3D } from '../components/three/SpaceGreenhouse3D';
import { ThermalCabinPressure3D } from '../components/three/ThermalCabinPressure3D';
import { SpaceHabitatWalkthrough3D } from '../components/three/SpaceHabitatWalkthrough3D';
import { ElectricalPowerSystem3D } from '../components/three/ElectricalPowerSystem3D';

// Module 03 3D Components
import { EVAFundamentals3D } from '../components/three/EVAFundamentals3D';
import { SpacesuitComponents3D } from '../components/three/SpacesuitComponents3D';
import { EVAPreparationChecklist3D } from '../components/three/EVAPreparationChecklist3D';
import { TetherSafety3D } from '../components/three/TetherSafety3D';
import { EVAToolHandling3D } from '../components/three/EVAToolHandling3D';
import { EVAPostProcedures3D } from '../components/three/EVAPostProcedures3D';

// Module 04 3D Components
import { CabinPressureLoss3D } from '../components/three/CabinPressureLoss3D';
import { OxygenLeak3D } from '../components/three/OxygenLeak3D';
import { CabinFire3D } from '../components/three/CabinFire3D';
import { RadiationEvent3D } from '../components/three/RadiationEvent3D';
import { EquipmentMalfunctions3D } from '../components/three/EquipmentMalfunctions3D';
import { MedicalEmergency3D } from '../components/three/MedicalEmergency3D';
import { EmergencyEvacuation3D } from '../components/three/EmergencyEvacuation3D';

// Module 05 3D Components
import { PlanetaryGeology3D } from '../components/three/PlanetaryGeology3D';
import { PlanetaryGravity3D } from '../components/three/PlanetaryGravity3D';
import { PlanetaryHazards3D } from '../components/three/PlanetaryHazards3D';
import { SurfaceExploration3D } from '../components/three/SurfaceExploration3D';
import { PlanetaryRover3D } from '../components/three/PlanetaryRover3D';
import { SampleCollection3D } from '../components/three/SampleCollection3D';
import { LandingSiteSelection3D } from '../components/three/LandingSiteSelection3D';

// Module 06 3D Components
import { MissionObjectives3D } from '../components/three/MissionObjectives3D';
import { MissionTimeline3D } from '../components/three/MissionTimeline3D';
import { CrewAssignments3D } from '../components/three/CrewAssignments3D';
import { MissionComms3D } from '../components/three/MissionComms3D';
import { ResourceAllocation3D } from '../components/three/ResourceAllocation3D';
import { MissionControl3D } from '../components/three/MissionControl3D';
import { RiskMitigation3D } from '../components/three/RiskMitigation3D';

// Module 07 3D Components
import { SpaceExperiment3D } from '../components/three/SpaceExperiment3D';
import { MicrogravityResearch3D } from '../components/three/MicrogravityResearch3D';
import { DataCollection3D } from '../components/three/DataCollection3D';
import { SpaceBiology3D } from '../components/three/SpaceBiology3D';
import { PlanetaryResearch3D } from '../components/three/PlanetaryResearch3D';
import { ScientificReporting3D } from '../components/three/ScientificReporting3D';

// Module 08 3D Components
import { CrewCoordination3D } from '../components/three/CrewCoordination3D';
import { LeadershipPressure3D } from '../components/three/LeadershipPressure3D';
import { SituationalAwareness3D } from '../components/three/SituationalAwareness3D';
import { CrewFatigue3D } from '../components/three/CrewFatigue3D';
import { ConflictResolution3D } from '../components/three/ConflictResolution3D';
import { DecisionUnderUncertainty3D } from '../components/three/DecisionUnderUncertainty3D';
import { MissionDebriefing3D } from '../components/three/MissionDebriefing3D';

// Practical Exercise Component
import { PracticalLabRunner } from '../components/training/PracticalLabRunner';

const MODULE_01_ID = '22222222-2222-2222-2222-222222222222';
const MODULE_02_ID = '44444444-4444-4444-4444-444444444444';
const MODULE_03_ID = '77777777-7777-7777-7777-777777777777';
const MODULE_04_ID = '66666666-6666-6666-6666-666666666666';
const MODULE_05_ID = '50505050-5050-5050-5050-505050505050';
const MODULE_06_ID = '60606060-6060-6060-6060-606060606060';
const MODULE_07_ID = '70707070-7070-7070-7070-707070707070';
const MODULE_08_ID = '80808080-8080-8080-8080-808080808080';

type ActiveTab = '3d-sim' | 'theory' | 'practical-lab' | 'quiz' | 'all';

export const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [allLessons, setAllLessons] = useState<LessonSummary[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<SubmitQuizResponse | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [showRoster, setShowRoster] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('3d-sim');
  const [isLoading, setIsLoading] = useState(true);

  const loadLessonData = async (targetId: string) => {
    setIsLoading(true);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      // 1. Fetch lesson details (includes practical exercise if present)
      const detail = await trainingApi.getLessonById(targetId);
      setLesson(detail);

      // 2. Mark lesson as started
      await trainingApi.startLesson(targetId);

      // 3. Fetch module lesson list for sidebar navigation
      const activeModuleId = detail.trainingModuleId || MODULE_01_ID;
      const list = await trainingApi.getModuleLessons(activeModuleId);
      setAllLessons(list);

      // 4. Fetch quiz questions
      const quiz = await trainingApi.getLessonQuiz(targetId);
      setQuizQuestions(quiz);

      // Determine default active tab:
      // Check if URL specifies a tab (e.g. ?tab=3d-sim)
      const searchParams = new URLSearchParams(window.location.search);
      const requestedTab = searchParams.get('tab') as ActiveTab | null;
      if (requestedTab && ['3d-sim', 'theory', 'practical-lab', 'quiz', 'all'].includes(requestedTab)) {
        setActiveTab(requestedTab);
      } else {
        // If module 08, 07, 06, 05, 04, 03, 02 or module 01 lessons 3, 4, 5 -> always default to 3d-sim lab
        const hasSim =
          detail.trainingModuleId === MODULE_08_ID ||
          detail.trainingModuleId === MODULE_07_ID ||
          detail.trainingModuleId === MODULE_06_ID ||
          detail.trainingModuleId === MODULE_05_ID ||
          detail.trainingModuleId === MODULE_04_ID ||
          detail.trainingModuleId === MODULE_03_ID ||
          detail.trainingModuleId === MODULE_02_ID ||
          [3, 4, 5].includes(detail.lessonNumber);
        setActiveTab(hasSim ? '3d-sim' : 'theory');
      }
    } catch (err: any) {
      console.error('Error loading lesson:', err);
      toast.error('Failed to load lesson telemetry from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      loadLessonData(lessonId);
      window.scrollTo(0, 0);
    }
  }, [lessonId]);

  const currentIndex = allLessons.findIndex((l) => l.lessonId === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const isModule08 = lesson?.trainingModuleId === MODULE_08_ID;
  const isModule07 = lesson?.trainingModuleId === MODULE_07_ID;
  const isModule06 = lesson?.trainingModuleId === MODULE_06_ID;
  const isModule05 = lesson?.trainingModuleId === MODULE_05_ID;
  const isModule04 = lesson?.trainingModuleId === MODULE_04_ID;
  const isModule03 = lesson?.trainingModuleId === MODULE_03_ID;
  const isModule02 = lesson?.trainingModuleId === MODULE_02_ID;
  const moduleReturnLink = isModule08
    ? '/academy/crm'
    : isModule07
    ? '/academy/space-science'
    : isModule06
    ? '/academy/mission-planning'
    : isModule05
    ? '/academy/planetary'
    : isModule04
    ? '/academy/emergency'
    : isModule03
    ? '/academy/eva'
    : isModule02
    ? '/academy/life-support'
    : '/academy/astronaut-fundamentals';
  const moduleTitle = isModule08
    ? 'Leadership & Crew Resource Management'
    : isModule07
    ? 'Space Science & Research'
    : isModule06
    ? 'Mission Planning & Operations'
    : isModule05
    ? 'Planetary Science & Exploration'
    : isModule04
    ? 'Emergency Response & Safety'
    : isModule03
    ? 'EVA & Astronaut Operations'
    : isModule02
    ? 'Life Support & Space Habitat Systems'
    : 'Astronaut Fundamentals';
  const totalLessonsInModule = allLessons.length > 0 ? allLessons.length : (isModule08 ? 7 : isModule07 ? 6 : isModule06 ? 7 : isModule05 ? 7 : isModule04 ? 7 : isModule03 ? 6 : isModule02 ? 7 : 6);

  const has3DSim =
    isModule08 || isModule07 || isModule06 || isModule05 || isModule04 || isModule03 || isModule02 || (lesson && [3, 4, 5].includes(lesson.lessonNumber));

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!lessonId || !lesson) return;

    const unanswered = quizQuestions.filter((q) => selectedAnswers[q.assessmentQuestionId] === undefined);
    if (unanswered.length > 0) {
      toast.warning(`Please answer all ${quizQuestions.length} assessment questions before submitting.`);
      return;
    }

    setIsSubmittingQuiz(true);
    try {
      const response = await trainingApi.submitQuiz(lessonId, selectedAnswers);
      setQuizResult(response);

      if (response.passed) {
        toast.success(`Assessment Passed! Score: ${response.score}/${response.totalQuestions} (${response.percentage}%)`, {
          description: 'Lesson marked as completed in Supabase PostgreSQL.',
        });
        setLesson((prev) => (prev ? { ...prev, isCompleted: true } : prev));
        const list = await trainingApi.getModuleLessons(lesson.trainingModuleId);
        setAllLessons(list);
      } else {
        toast.error(`Assessment Incomplete: Scored ${response.score}/${response.totalQuestions} (${response.percentage}%)`, {
          description: 'Review the technical material and explanations below, then retry.',
        });
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      toast.error('Failed to submit quiz to backend.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleMarkCompleteManual = async () => {
    if (!lessonId || !lesson) return;
    setIsMarkingComplete(true);
    try {
      await trainingApi.completeLesson(lessonId);
      setLesson((prev) => (prev ? { ...prev, isCompleted: true } : prev));
      const list = await trainingApi.getModuleLessons(lesson.trainingModuleId);
      setAllLessons(list);
      toast.success('Lesson marked as completed in database.');
    } catch (err) {
      toast.error('Failed to mark lesson completed.');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleExerciseCompleted = async () => {
    if (!lessonId || !lesson) return;
    try {
      const detail = await trainingApi.getLessonById(lessonId);
      setLesson(detail);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !lesson) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-[#42D9F5] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-[#42D9F5] tracking-widest uppercase">
          SYNCHRONIZING FLIGHT MANUAL TELEMETRY...
        </span>
      </div>
    );
  }

  // Render the appropriate 3D component
  const render3DComponent = () => {
    if (isModule08) {
      switch (lesson.lessonNumber) {
        case 1:
          return <CrewCoordination3D />;
        case 2:
          return <LeadershipPressure3D />;
        case 3:
          return <SituationalAwareness3D />;
        case 4:
          return <CrewFatigue3D />;
        case 5:
          return <ConflictResolution3D />;
        case 6:
          return <DecisionUnderUncertainty3D />;
        case 7:
          return <MissionDebriefing3D />;
        default:
          return <CrewCoordination3D />;
      }
    } else if (isModule07) {
      switch (lesson.lessonNumber) {
        case 1:
          return <SpaceExperiment3D />;
        case 2:
          return <MicrogravityResearch3D />;
        case 3:
          return <DataCollection3D />;
        case 4:
          return <SpaceBiology3D />;
        case 5:
          return <PlanetaryResearch3D />;
        case 6:
          return <ScientificReporting3D />;
        default:
          return <MicrogravityResearch3D />;
      }
    } else if (isModule06) {
      switch (lesson.lessonNumber) {
        case 1:
          return <MissionObjectives3D />;
        case 2:
          return <MissionTimeline3D />;
        case 3:
          return <CrewAssignments3D />;
        case 4:
          return <MissionComms3D />;
        case 5:
          return <ResourceAllocation3D />;
        case 6:
          return <MissionControl3D />;
        case 7:
          return <RiskMitigation3D />;
        default:
          return <MissionControl3D />;
      }
    } else if (isModule05) {
      switch (lesson.lessonNumber) {
        case 1:
          return <PlanetaryGeology3D />;
        case 2:
          return <PlanetaryGravity3D />;
        case 3:
          return <PlanetaryHazards3D />;
        case 4:
          return <SurfaceExploration3D />;
        case 5:
          return <PlanetaryRover3D />;
        case 6:
          return <SampleCollection3D />;
        case 7:
          return <LandingSiteSelection3D />;
        default:
          return <PlanetaryGeology3D />;
      }
    } else if (isModule04) {
      switch (lesson.lessonNumber) {
        case 1:
          return <CabinPressureLoss3D />;
        case 2:
          return <OxygenLeak3D />;
        case 3:
          return <CabinFire3D />;
        case 4:
          return <RadiationEvent3D />;
        case 5:
          return <EquipmentMalfunctions3D />;
        case 6:
          return <MedicalEmergency3D />;
        case 7:
          return <EmergencyEvacuation3D />;
        default:
          return <CabinPressureLoss3D />;
      }
    } else if (isModule03) {
      switch (lesson.lessonNumber) {
        case 1:
          return <EVAFundamentals3D />;
        case 2:
          return <SpacesuitComponents3D />;
        case 3:
          return <EVAPreparationChecklist3D />;
        case 4:
          return <TetherSafety3D />;
        case 5:
          return <EVAToolHandling3D />;
        case 6:
          return <EVAPostProcedures3D />;
        default:
          return <EVAFundamentals3D />;
      }
    } else if (isModule02) {
      switch (lesson.lessonNumber) {
        case 1:
          return <OxygenCirculation3D />;
        case 2:
          return <CO2AirPurification3D />;
        case 3:
          return <WaterRecovery3D />;
        case 4:
          return <SpaceGreenhouse3D />;
        case 5:
          return <ThermalCabinPressure3D />;
        case 6:
          return <SpaceHabitatWalkthrough3D />;
        case 7:
          return <ElectricalPowerSystem3D />;
        default:
          return null;
      }
    } else {
      switch (lesson.lessonNumber) {
        case 3:
          return <SpacesuitViewer3D />;
        case 4:
          return <MicrogravityDemo3D />;
        case 5:
          return <SpaceflightPhases3D />;
        default:
          return (
            <div className="p-8 text-center glass-panel rounded-xl border border-[#1E2E4A]">
              <Compass className="w-8 h-8 text-[#42D9F5] mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">
                Interactive 3D simulation for this lesson is available in subsequent modules.
                Proceed with the Flight Manual Theory below.
              </p>
            </div>
          );
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2E4A] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={moduleReturnLink}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-[#42D9F5] transition-colors bg-[#111E32] px-3 py-1.5 rounded-lg border border-[#1E2E4A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO {isModule05 ? 'MODULE 05' : isModule04 ? 'MODULE 04' : isModule03 ? 'MODULE 03' : isModule02 ? 'MODULE 02' : 'MODULE 01'} SYLLABUS</span>
          </Link>
        </div>

        {/* Top Telemetry Strip */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-[#111E32] px-3 py-1.5 rounded-lg border border-[#1E2E4A] text-xs font-mono">
            <span className="text-[#94A3B8]">MODULE:</span>
            <span className="text-white font-medium">{moduleTitle}</span>
            <span className="text-[#1E2E4A]">•</span>
            <span className="text-[#94A3B8]">TIME:</span>
            <span className="text-[#42D9F5]">{lesson.estimatedDurationMinutes}m</span>
          </div>

          {lesson.isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LESSON COMPLETED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#F5B942] animate-pulse" />
              <span>IN PROGRESS</span>
            </span>
          )}

          <button
            disabled={lesson.isCompleted || isMarkingComplete}
            onClick={handleMarkCompleteManual}
            className="px-3 py-1.5 rounded-lg bg-[#111E32] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] hover:text-[#10B981] hover:border-[#10B981]/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {lesson.isCompleted ? 'Certified' : 'Mark Complete'}
          </button>
        </div>
      </div>

      {/* Horizontal Curriculum Stepper Bar (Full Width) */}
      <div className="glass-panel p-3.5 rounded-2xl border border-[#1E2E4A]">
        <div className="flex items-center justify-between gap-3 mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-[#42D9F5] uppercase tracking-wider">
              CURRICULUM ROSTER:
            </span>
            <span className="text-xs text-[#94A3B8]">
              Lesson 0{lesson.lessonNumber} of {totalLessonsInModule}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {prevLesson && (
              <button
                onClick={() => navigate(`/lessons/${prevLesson.lessonId}${activeTab === '3d-sim' ? '?tab=3d-sim' : ''}`)}
                className="px-2.5 py-1 rounded-lg bg-[#111E32] hover:bg-[#1E2E4A] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PREV LESSON</span>
              </button>
            )}
            {nextLesson && (
              <button
                onClick={() => navigate(`/lessons/${nextLesson.lessonId}${activeTab === '3d-sim' ? '?tab=3d-sim' : ''}`)}
                className="px-2.5 py-1 rounded-lg bg-[#111E32] hover:bg-[#1E2E4A] border border-[#1E2E4A] text-xs font-mono text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">NEXT LESSON</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Lesson Cards Strip */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {allLessons.map((item) => {
            const isCurrent = item.lessonId === lessonId;
            return (
              <button
                key={item.lessonId}
                onClick={() => navigate(`/lessons/${item.lessonId}${activeTab === '3d-sim' ? '?tab=3d-sim' : ''}`)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2.5 border cursor-pointer ${
                  isCurrent
                    ? 'bg-[#42D9F5]/20 border-[#42D9F5] text-white font-bold shadow-[0_0_15px_rgba(66,217,245,0.25)] ring-1 ring-[#42D9F5]/50'
                    : 'bg-[#0B1424]/80 border-[#1E2E4A] text-[#94A3B8] hover:bg-[#111E32] hover:text-white hover:border-[#42D9F5]/40'
                }`}
              >
                <span className={isCurrent ? 'text-[#42D9F5] font-bold' : 'text-[#64748B]'}>
                  0{item.lessonNumber}.
                </span>
                <span className="whitespace-nowrap">{item.title}</span>
                {item.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[#42D9F5] shrink-0 animate-pulse" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Width Main Workspace (No Side Boxes) */}
      <main className="w-full space-y-6">
          {/* Main Lesson Hero Card */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5]/30">
                  LESSON 0{lesson.lessonNumber} OF {totalLessonsInModule}
                </span>
                <span className="text-xs font-mono text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#628CFF]" />
                  <span>{lesson.estimatedDurationMinutes} MINS</span>
                </span>
              </div>

              <span className="text-xs font-mono text-[#94A3B8]">
                {moduleTitle}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-wide mb-3">
              {lesson.title}
            </h1>

            <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed">
              {lesson.description}
            </p>

            {/* Astronaut Training Workflow Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#1E2E4A]">
              {has3DSim && (
                <button
                  onClick={() => setActiveTab('3d-sim')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                    activeTab === '3d-sim'
                      ? 'bg-[#42D9F5] text-[#050914] border-[#42D9F5] shadow-[0_0_15px_rgba(66,217,245,0.4)]'
                      : 'bg-[#111E32] text-[#94A3B8] border-[#1E2E4A] hover:text-white hover:border-[#42D9F5]/40'
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>3D SIMULATION LAB</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('theory')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                  activeTab === 'theory'
                    ? 'bg-[#42D9F5] text-[#050914] border-[#42D9F5] shadow-[0_0_15px_rgba(66,217,245,0.4)]'
                    : 'bg-[#111E32] text-[#94A3B8] border-[#1E2E4A] hover:text-white hover:border-[#42D9F5]/40'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>FLIGHT MANUAL THEORY</span>
              </button>

              {lesson.practicalExercise && (
                <button
                  onClick={() => setActiveTab('practical-lab')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                    activeTab === 'practical-lab'
                      ? 'bg-[#F5B942] text-[#050914] border-[#F5B942] shadow-[0_0_15px_rgba(245,185,66,0.4)]'
                      : 'bg-[#111E32] text-[#94A3B8] border-[#1E2E4A] hover:text-white hover:border-[#F5B942]/40'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>PRACTICAL LAB</span>
                  {lesson.practicalExercise.hasAttempt && (
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                  activeTab === 'quiz'
                    ? 'bg-[#628CFF] text-[#050914] border-[#628CFF] shadow-[0_0_15px_rgba(98,140,255,0.4)]'
                    : 'bg-[#111E32] text-[#94A3B8] border-[#1E2E4A] hover:text-white hover:border-[#628CFF]/40'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>EVALUATION QUIZ</span>
                {lesson.hasQuizAttempt && (
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 border ml-auto ${
                  activeTab === 'all'
                    ? 'bg-[#1E2E4A] text-white border-[#42D9F5]'
                    : 'bg-transparent text-[#64748B] border-[#1E2E4A] hover:text-[#94A3B8]'
                }`}
                title="View All Content in Continuous Document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">VIEW ALL</span>
              </button>
            </div>
          </div>

          {/* TAB 1: 3D INTERACTIVE SIMULATION */}
          {(activeTab === '3d-sim' || activeTab === 'all') && has3DSim && (
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-[#42D9F5]" />
                  <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
                    INTERACTIVE 3D AEROSPACE LABORATORY
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  DRAG TO ROTATE // SCROLL TO ZOOM
                </span>
              </div>

              {render3DComponent()}
            </div>
          )}

          {/* TAB 2: FLIGHT MANUAL THEORY & SECTIONS */}
          {(activeTab === 'theory' || activeTab === 'all') && (
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#42D9F5]" />
                  <span className="text-xs font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
                    FLIGHT MANUAL THEORY & SPECIFICATIONS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {lesson.sections.length} TECHNICAL SECTIONS
                </span>
              </div>

              <div className="space-y-6">
                {lesson.sections.map((section) => (
                  <article
                    key={section.lessonSectionId}
                    className="space-y-3 p-6 rounded-xl bg-[#0B1424] border border-[#1E2E4A]/80 shadow-inner"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#42D9F5] uppercase tracking-wider font-semibold">
                        SECTION // {section.sectionType.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-white tracking-wide border-b border-[#1E2E4A]/80 pb-2">
                      {section.title}
                    </h3>

                    <div className="text-sm md:text-base text-[#E2E8F0] leading-relaxed whitespace-pre-line space-y-3">
                      {section.content}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRACTICAL TELEMETRY LAB */}
          {(activeTab === 'practical-lab' || activeTab === 'all') && lesson.practicalExercise && (
            <PracticalLabRunner
              exercise={lesson.practicalExercise}
              onCompleted={handleExerciseCompleted}
            />
          )}

          {/* TAB 4: KNOWLEDGE-CHECK ASSESSMENT QUIZ */}
          {(activeTab === 'quiz' || activeTab === 'all') && (
            <section className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1E2E4A] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
                <div>
                  <span className="text-xs font-mono text-[#F5B942] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#F5B942]" />
                    KNOWLEDGE-CHECK ASSESSMENT
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">Lesson Evaluation Quiz</h3>
                </div>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {quizQuestions.length} QUESTIONS // PASS: 66%+
                </span>
              </div>

              {/* Quiz Questions List */}
              <div className="space-y-6">
                {quizQuestions.map((q, qIndex) => {
                  const selectedOption = selectedAnswers[q.assessmentQuestionId];
                  const feedback = quizResult?.feedback.find((f) => f.assessmentQuestionId === q.assessmentQuestionId);

                  return (
                    <div
                      key={q.assessmentQuestionId}
                      className="p-5 rounded-xl bg-[#0B1424] border border-[#1E2E4A] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm md:text-base font-semibold text-white leading-relaxed">
                          <span className="text-[#42D9F5] font-mono mr-2">Q{qIndex + 1}.</span>
                          {q.questionText}
                        </span>
                        {feedback && (
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                              feedback.isCorrect
                                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                                : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                            }`}
                          >
                            {feedback.isCorrect ? 'CORRECT' : 'INCORRECT'}
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = selectedOption === optIndex;
                          let optionStyle =
                            'bg-[#111E32]/70 border-[#1E2E4A] text-[#E2E8F0] hover:border-[#42D9F5]/40 hover:bg-[#111E32]';

                          if (feedback) {
                            if (optIndex === feedback.correctOptionIndex) {
                              optionStyle = 'bg-[#10B981]/20 border-[#10B981] text-white font-semibold';
                            } else if (isSelected && !feedback.isCorrect) {
                              optionStyle = 'bg-[#EF4444]/20 border-[#EF4444] text-[#FCA5A5]';
                            } else {
                              optionStyle = 'bg-[#111E32]/40 border-[#1E2E4A] text-[#64748B] opacity-60';
                            }
                          } else if (isSelected) {
                            optionStyle =
                              'bg-[#42D9F5]/20 border-[#42D9F5] text-[#42D9F5] shadow-[0_0_10px_rgba(66,217,245,0.2)] font-semibold';
                          }

                          return (
                            <button
                              key={optIndex}
                              disabled={Boolean(quizResult)}
                              onClick={() => handleSelectOption(q.assessmentQuestionId, optIndex)}
                              className={`w-full text-left p-3.5 rounded-lg text-xs md:text-sm border transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-mono">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback Explanation */}
                      {feedback && (
                        <div className="p-3.5 rounded-lg bg-[#111E32] border border-[#1E2E4A] text-xs text-[#94A3B8] space-y-1">
                          <span className="font-mono text-[#F5B942] block">TECHNICAL EXPLANATION:</span>
                          <p className="leading-relaxed text-[#E2E8F0]">{feedback.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Result Summary Banner */}
              {quizResult && (
                <div
                  className={`p-5 rounded-xl border text-center space-y-2 ${
                    quizResult.passed
                      ? 'bg-[#10B981]/10 border-[#10B981]/50'
                      : 'bg-[#EF4444]/10 border-[#EF4444]/50'
                  }`}
                >
                  <div className="text-xl font-black text-white">
                    {quizResult.passed ? 'ASSESSMENT PASSED' : 'MINIMUM PASS SCORE NOT ACHIEVED'}
                  </div>
                  <div className="text-sm font-mono text-[#42D9F5]">
                    Score: {quizResult.score} of {quizResult.totalQuestions} ({quizResult.percentage}%)
                  </div>
                  <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                    {quizResult.passed
                      ? 'Congratulations! Your assessment has been evaluated and permanently recorded in Supabase PostgreSQL.'
                      : 'A minimum score of 66% is required to pass this lesson. Review the technical explanations and retry.'}
                  </p>
                  {!quizResult.passed && (
                    <button
                      onClick={() => {
                        setQuizResult(null);
                        setSelectedAnswers({});
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111E32] border border-[#1E2E4A] text-xs font-mono text-white hover:border-[#42D9F5] transition-colors mt-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Assessment</span>
                    </button>
                  )}
                </div>
              )}

              {/* Submit Quiz Button */}
              {!quizResult && (
                <button
                  disabled={isSubmittingQuiz}
                  onClick={handleSubmitQuiz}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#42D9F5] to-[#628CFF] text-[#050914] font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(66,217,245,0.3)] hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingQuiz ? 'Evaluating in Mission Control...' : 'Submit Assessment Answers'}</span>
                </button>
              )}
            </section>
          )}

          {/* Navigation Controls: Previous / Next Lesson */}
          <div className="flex items-center justify-between border-t border-[#1E2E4A] pt-6">
            {prevLesson ? (
              <button
                onClick={() => navigate(`/lessons/${prevLesson.lessonId}`)}
                className="px-4 py-2.5 rounded-xl bg-[#111E32] border border-[#1E2E4A] text-xs font-mono text-white hover:border-[#42D9F5] transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev: Lesson 0{prevLesson.lessonNumber}</span>
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                onClick={() => navigate(`/lessons/${nextLesson.lessonId}`)}
                className="px-5 py-2.5 rounded-xl bg-[#42D9F5] text-[#050914] text-xs font-mono font-bold hover:bg-[#38bdf8] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(66,217,245,0.3)]"
              >
                <span>Next: Lesson 0{nextLesson.lessonNumber}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to={moduleReturnLink}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] text-[#050914] text-xs font-mono font-bold hover:bg-[#059669] transition-colors flex items-center gap-2"
              >
                <span>Curriculum Complete! Return to Syllabus</span>
                <CheckCircle2 className="w-4 h-4" />
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  };
