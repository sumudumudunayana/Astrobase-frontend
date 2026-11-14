import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  Radio,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getOrCreateLearnerId, resetLearnerId } from '../../services/api/learnerIdentity';
import { toast } from 'sonner';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
}

// Known label mappings for routes and lessons
const ROUTE_LABELS: Record<string, string> = {
  academy: 'Training Academy',
  'astronaut-fundamentals': 'Module 01: Fundamentals',
  'life-support': 'Module 02: Life Support',
  'module-02': 'Module 02: Life Support',
  eva: 'Module 03: EVA Operations',
  'module-03': 'Module 03: EVA Operations',
  emergency: 'Module 04: Emergency Response',
  'module-04': 'Module 04: Emergency Response',
  planetary: 'Module 05: Planetary Science',
  'module-05': 'Module 05: Planetary Science',
  'mission-planning': 'Module 06: Mission Planning',
  'module-06': 'Module 06: Mission Planning',
  'space-science': 'Module 07: Space Science',
  'module-07': 'Module 07: Space Science',
  crm: 'Module 08: Leadership & CRM',
  'module-08': 'Module 08: Leadership & CRM',
  'training-center': 'CRM Training Center',
  lab: 'Science Laboratory',
  workspace: 'Planning Workspace',
  spaceflight: 'Spaceflight Phases 3D',
  spacesuit: 'Spacesuit Systems 3D',
  microgravity: 'Microgravity Dynamics 3D',
  'practical-training': 'Practical Astronaut Training',
  observatory: 'NASA Science Observatory',
  assessments: 'Assessments',
  simulator: 'EVA Spacewalk Simulator',
  'moon-mars': 'Moon & Mars Ops',
  'mission-control': 'Mission Control',
  'ai-instructor': 'AI Instructor',
  analytics: 'Performance Analytics',
};

const LESSON_LOOKUP: Record<string, { module: string; modulePath: string; lesson: string }> = {
  // Module 01
  '33333333-3333-3333-3333-333333333301': { module: 'Module 01: Fundamentals', modulePath: '/academy/astronaut-fundamentals', lesson: 'Lesson 01: Spaceflight History' },
  '33333333-3333-3333-3333-333333333302': { module: 'Module 01: Fundamentals', modulePath: '/academy/astronaut-fundamentals', lesson: 'Lesson 02: Crew Hierarchy' },
  '33333333-3333-3333-3333-333333333303': { module: 'Module 01: Fundamentals', modulePath: '/academy/astronaut-fundamentals', lesson: 'Lesson 03: Spacesuit Systems' },
  '33333333-3333-3333-3333-333333333304': { module: 'Module 01: Fundamentals', modulePath: '/academy/astronaut-fundamentals', lesson: 'Lesson 04: Microgravity Physics' },
  '33333333-3333-3333-3333-333333333305': { module: 'Module 01: Fundamentals', modulePath: '/academy/astronaut-fundamentals', lesson: 'Lesson 05: Orbital Mechanics' },
  '33333333-3333-3333-3333-333333333306': { module: 'Module 01: Fundamentals', modulePath: '/academy/astronaut-fundamentals', lesson: 'Lesson 06: Mission Control Comms' },
  // Module 02
  '55555555-5555-5555-5555-555555555501': { module: 'Module 02: Life Support', modulePath: '/academy/life-support', lesson: 'Lesson 01: Oxygen Generation' },
  '55555555-5555-5555-5555-555555555502': { module: 'Module 02: Life Support', modulePath: '/academy/life-support', lesson: 'Lesson 02: Carbon Dioxide Removal' },
  '55555555-5555-5555-5555-555555555503': { module: 'Module 02: Life Support', modulePath: '/academy/life-support', lesson: 'Lesson 03: Water Recovery' },
  '55555555-5555-5555-5555-555555555504': { module: 'Module 02: Life Support', modulePath: '/academy/life-support', lesson: 'Lesson 04: Space Greenhouse' },
  '55555555-5555-5555-5555-555555555505': { module: 'Module 02: Life Support', modulePath: '/academy/life-support', lesson: 'Lesson 05: Thermal & Pressure' },
  '55555555-5555-5555-5555-555555555506': { module: 'Module 02: Life Support', modulePath: '/academy/life-support', lesson: 'Lesson 06: Habitat Maintenance' },
  '55555555-5555-5555-5555-555555555507': { module: 'Module 02: Life Support', modulePath: '/academy/life-support', lesson: 'Lesson 07: Electrical Power' },
  // Module 03
  '88888888-8888-8888-8888-888888888801': { module: 'Module 03: EVA Operations', modulePath: '/academy/eva', lesson: 'Lesson 01: EVA Fundamentals' },
  '88888888-8888-8888-8888-888888888802': { module: 'Module 03: EVA Operations', modulePath: '/academy/eva', lesson: 'Lesson 02: Spacesuit Components' },
  '88888888-8888-8888-8888-888888888803': { module: 'Module 03: EVA Operations', modulePath: '/academy/eva', lesson: 'Lesson 03: EVA Preparation Checklists' },
  '88888888-8888-8888-8888-888888888804': { module: 'Module 03: EVA Operations', modulePath: '/academy/eva', lesson: 'Lesson 04: Tether & Equipment Safety' },
  '88888888-8888-8888-8888-888888888805': { module: 'Module 03: EVA Operations', modulePath: '/academy/eva', lesson: 'Lesson 05: Tool Handling & Operations' },
  '88888888-8888-8888-8888-888888888806': { module: 'Module 03: EVA Operations', modulePath: '/academy/eva', lesson: 'Lesson 06: Pre-EVA & Post-EVA Procedures' },
  // Module 04
  '66666666-6666-6666-6666-666666666601': { module: 'Module 04: Emergency & Safety', modulePath: '/academy/emergency', lesson: 'Lesson 01: Cabin Pressure Loss' },
  '66666666-6666-6666-6666-666666666602': { module: 'Module 04: Emergency & Safety', modulePath: '/academy/emergency', lesson: 'Lesson 02: Oxygen Leaks' },
  '66666666-6666-6666-6666-666666666603': { module: 'Module 04: Emergency & Safety', modulePath: '/academy/emergency', lesson: 'Lesson 03: Fire and Smoke' },
  '66666666-6666-6666-6666-666666666604': { module: 'Module 04: Emergency & Safety', modulePath: '/academy/emergency', lesson: 'Lesson 04: Radiation Events' },
  '66666666-6666-6666-6666-666666666605': { module: 'Module 04: Emergency & Safety', modulePath: '/academy/emergency', lesson: 'Lesson 05: Equipment Malfunctions' },
  '66666666-6666-6666-6666-666666666606': { module: 'Module 04: Emergency & Safety', modulePath: '/academy/emergency', lesson: 'Lesson 06: Medical Emergencies' },
  '66666666-6666-6666-6666-666666666607': { module: 'Module 04: Emergency & Safety', modulePath: '/academy/emergency', lesson: 'Lesson 07: Evacuation & Undocking' },
  // Module 05
  '50505050-5050-5050-5050-505050505001': { module: 'Module 05: Planetary Science', modulePath: '/academy/planetary', lesson: 'Lesson 01: Moon & Mars Geology' },
  '50505050-5050-5050-5050-505050505002': { module: 'Module 05: Planetary Science', modulePath: '/academy/planetary', lesson: 'Lesson 02: Surface Gravity & Environments' },
  '50505050-5050-5050-5050-505050505003': { module: 'Module 05: Planetary Science', modulePath: '/academy/planetary', lesson: 'Lesson 03: Radiation & Regolith Hazards' },
  '50505050-5050-5050-5050-505050505004': { module: 'Module 05: Planetary Science', modulePath: '/academy/planetary', lesson: 'Lesson 04: Surface Traversing & Waypoints' },
  '50505050-5050-5050-5050-505050505005': { module: 'Module 05: Planetary Science', modulePath: '/academy/planetary', lesson: 'Lesson 05: Robotic Rovers & AutoNav' },
  '50505050-5050-5050-5050-505050505006': { module: 'Module 05: Planetary Science', modulePath: '/academy/planetary', lesson: 'Lesson 06: Sample Coring & Curation' },
  '50505050-5050-5050-5050-505050505007': { module: 'Module 05: Planetary Science', modulePath: '/academy/planetary', lesson: 'Lesson 07: Landing Site Selection' },
  // Module 06
  '60606060-6060-6060-6060-606060606001': { module: 'Module 06: Mission Planning', modulePath: '/academy/mission-planning', lesson: 'Lesson 01: Objectives & Constraints' },
  '60606060-6060-6060-6060-606060606002': { module: 'Module 06: Mission Planning', modulePath: '/academy/mission-planning', lesson: 'Lesson 02: Timelines & Critical Path' },
  '60606060-6060-6060-6060-606060606003': { module: 'Module 06: Mission Planning', modulePath: '/academy/mission-planning', lesson: 'Lesson 03: Crew Roles & Work-Rest Cycles' },
  '60606060-6060-6060-6060-606060606004': { module: 'Module 06: Mission Planning', modulePath: '/academy/mission-planning', lesson: 'Lesson 04: Comms & Ground Tracking' },
  '60606060-6060-6060-6060-606060606005': { module: 'Module 06: Mission Planning', modulePath: '/academy/mission-planning', lesson: 'Lesson 05: Resource & Consumables Budget' },
  '60606060-6060-6060-6060-606060606006': { module: 'Module 06: Mission Planning', modulePath: '/academy/mission-planning', lesson: 'Lesson 06: Mission Control Center Ops' },
  '60606060-6060-6060-6060-606060606007': { module: 'Module 06: Mission Planning', modulePath: '/academy/mission-planning', lesson: 'Lesson 07: Risk & Contingency Planning' },
  // Module 07
  '70707070-7070-7070-7070-707070707001': { module: 'Module 07: Space Science', modulePath: '/academy/space-science', lesson: 'Lesson 01: Space Experimentation' },
  '70707070-7070-7070-7070-707070707002': { module: 'Module 07: Space Science', modulePath: '/academy/space-science', lesson: 'Lesson 02: Microgravity Research' },
  '70707070-7070-7070-7070-707070707003': { module: 'Module 07: Space Science', modulePath: '/academy/space-science', lesson: 'Lesson 03: Data Interpretation' },
  '70707070-7070-7070-7070-707070707004': { module: 'Module 07: Space Science', modulePath: '/academy/space-science', lesson: 'Lesson 04: Space Biology' },
  '70707070-7070-7070-7070-707070707005': { module: 'Module 07: Space Science', modulePath: '/academy/space-science', lesson: 'Lesson 05: Planetary Research' },
  '70707070-7070-7070-7070-707070707006': { module: 'Module 07: Space Science', modulePath: '/academy/space-science', lesson: 'Lesson 06: Scientific Reporting' },
  // Module 08
  '80808080-8080-8080-8080-808080808001': { module: 'Module 08: Leadership & CRM', modulePath: '/academy/crm', lesson: 'Lesson 01: Team Coordination' },
  '80808080-8080-8080-8080-808080808002': { module: 'Module 08: Leadership & CRM', modulePath: '/academy/crm', lesson: 'Lesson 02: Leadership & Pressure' },
  '80808080-8080-8080-8080-808080808003': { module: 'Module 08: Leadership & CRM', modulePath: '/academy/crm', lesson: 'Lesson 03: Situational Awareness' },
  '80808080-8080-8080-8080-808080808004': { module: 'Module 08: Leadership & CRM', modulePath: '/academy/crm', lesson: 'Lesson 04: Crew Wellness & Fatigue' },
  '80808080-8080-8080-8080-808080808005': { module: 'Module 08: Leadership & CRM', modulePath: '/academy/crm', lesson: 'Lesson 05: Conflict Resolution' },
  '80808080-8080-8080-8080-808080808006': { module: 'Module 08: Leadership & CRM', modulePath: '/academy/crm', lesson: 'Lesson 06: Decision Under Uncertainty' },
  '80808080-8080-8080-8080-808080808007': { module: 'Module 08: Leadership & CRM', modulePath: '/academy/crm', lesson: 'Lesson 07: Mission Debriefing' },
};

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const learnerId = getOrCreateLearnerId();

  // Generate human-friendly breadcrumb items
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  let breadcrumbs: Array<{ name: string; path: string }> = [{ name: 'Dashboard', path: '/' }];

  if (pathnames[0] === 'lessons' && pathnames[1]) {
    const lessonInfo = LESSON_LOOKUP[pathnames[1]];
    breadcrumbs.push({ name: 'Training Academy', path: '/academy' });
    if (lessonInfo) {
      breadcrumbs.push({ name: lessonInfo.module, path: lessonInfo.modulePath });
      breadcrumbs.push({ name: lessonInfo.lesson, path: location.pathname });
    } else {
      breadcrumbs.push({ name: 'Lesson Workspace', path: location.pathname });
    }
  } else {
    pathnames.forEach((segment, index) => {
      const url = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
      let name = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');
      if (isGuid) {
        name = 'Telemetry View';
      } else if (!ROUTE_LABELS[segment]) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }
      breadcrumbs.push({ name, path: url });
    });
  }

  const notifications = [
    {
      id: 1,
      title: 'Mission Directive 01 Active',
      message: 'Module 01: Astronaut Fundamentals is ready for evaluation.',
      time: '10m ago',
      type: 'info',
    },
    {
      id: 2,
      title: 'Solar Flare Advisory',
      message: 'Class M-2 flare detected; telemetry loops nominal.',
      time: '42m ago',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Telemetry Synchronization',
      message: 'Connected to Supabase PostgreSQL database.',
      time: '1h ago',
      type: 'success',
    },
  ];

  const handleCopyId = () => {
    navigator.clipboard.writeText(learnerId);
    setCopied(true);
    toast.success('Learner ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetIdentity = () => {
    const newId = resetLearnerId();
    toast.info('Trainee identity reset. Progress will restart from 0%.', {
      description: `New Learner ID: ${newId.substring(0, 8)}...`,
    });
    setShowProfileMenu(false);
    window.location.reload();
  };

  return (
    <header className="h-16 shrink-0 border-b border-[#1E2E4A]/80 bg-[#070D1A]/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-[#94A3B8] hover:text-[#42D9F5] hover:bg-[#111E32] md:hidden transition-colors"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs font-mono">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />}
                {isLast ? (
                  <span className="text-[#42D9F5] font-semibold tracking-wide truncate max-w-[140px] sm:max-w-xs">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Telemetry Status + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Status Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111E32] border border-[#1E2E4A] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[#94A3B8]">TRAINING STATUS:</span>
          <span className="text-[#42D9F5] font-semibold">SIMULATION NOMINAL</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-[#94A3B8] hover:text-[#42D9F5] hover:bg-[#111E32] transition-colors"
            title="Flight Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#42D9F5]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0B1424] border border-[#1E2E4A] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A] mb-2">
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  FLIGHT TELEMETRY ALERTS
                </span>
                <span className="text-[10px] font-mono text-[#42D9F5]">3 ALERTS</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-[#111E32]/70 border border-[#1E2E4A]/80 hover:border-[#42D9F5]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                      <span>{n.title}</span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-tight">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trainee Commander Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl hover:bg-[#111E32] border border-transparent hover:border-[#1E2E4A] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#42D9F5] p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#070D1A] flex items-center justify-center text-[#42D9F5]">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">
                Trainee Commander
              </div>
              <div className="text-[10px] font-mono text-[#42D9F5]">Rank: Candidate</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0B1424] border border-[#1E2E4A] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 pb-3 border-b border-[#1E2E4A] mb-3">
                <div className="w-10 h-10 rounded-full bg-[#111E32] border border-[#42D9F5]/40 flex items-center justify-center text-[#42D9F5]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Trainee Commander</h4>
                  <span className="text-[10px] font-mono text-[#F5B942] uppercase tracking-wider block">
                    FOUNDATION LEVEL
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#94A3B8] block mb-1 uppercase tracking-wider">
                    ANONYMOUS LEARNER ID:
                  </span>
                  <div className="flex items-center justify-between p-2 rounded bg-[#111E32] border border-[#1E2E4A] font-mono text-[11px] text-[#42D9F5]">
                    <span className="truncate mr-2">{learnerId}</span>
                    <button
                      onClick={handleCopyId}
                      className="text-[#94A3B8] hover:text-white transition-colors"
                      title="Copy Learner ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E2E4A]">
                  <button
                    onClick={handleResetIdentity}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#111E32] border border-[#1E2E4A] text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-colors font-mono text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Trainee Progress (0%)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

