import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Rocket,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Wrench,
  Award,
  Compass,
  Globe2,
  Radio,
  Bot,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Lock,
  Zap,
  AlertOctagon,
  AlertTriangle,
  FlaskConical,
  Users,
  Sun,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  isComingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Training Dashboard', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'TRAINING',
      items: [
        { name: 'Training Academy', path: '/academy', icon: GraduationCap },
        { name: 'Astronaut Fundamentals', path: '/academy/astronaut-fundamentals', icon: BookOpen },
        { name: 'Life Support & Habitats', path: '/academy/life-support', icon: Layers },
        { name: 'EVA & Spacewalks', path: '/academy/eva', icon: Zap },
        { name: 'Emergency & Safety', path: '/academy/emergency', icon: AlertOctagon },
        { name: 'Planetary Science', path: '/academy/planetary', icon: Globe2 },
        { name: 'Mission Planning & Ops', path: '/academy/mission-planning', icon: Compass },
        { name: 'Space Science & Research', path: '/academy/space-science', icon: FlaskConical },
        { name: 'Leadership & CRM', path: '/academy/crm', icon: Users },
        { name: 'Spaceflight Phases 3D', path: '/spaceflight', icon: Rocket },
        { name: 'Spacesuit Model 3D', path: '/spacesuit', icon: Shield },
        { name: 'Microgravity Demo 3D', path: '/microgravity', icon: Sparkles },
        { name: 'Practical Training', path: '/practical-training', icon: Wrench },
        { name: 'Assessments', path: '/assessments', icon: Award, isComingSoon: true },
      ],
    },
    {
      title: 'MISSION OPERATIONS',
      items: [
        { name: 'NASA Science Observatory', path: '/observatory', icon: Sun },
        { name: 'CRM Training Center', path: '/crm/training-center', icon: Users },
        { name: 'Space Science Laboratory', path: '/space-science/lab', icon: FlaskConical },
        { name: 'Mission Planning Workspace', path: '/mission-planning/workspace', icon: Compass },
        { name: 'Mission Control Center', path: '/mission-control', icon: Radio },
        { name: 'EVA Mission Simulator', path: '/eva/simulator', icon: Compass },
        { name: 'Emergency Simulator', path: '/emergency/simulator', icon: AlertTriangle },
        { name: 'Moon & Mars Exploration', path: '/planetary/simulator', icon: Globe2 },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'AI Mission Instructor', path: '/ai-instructor', icon: Bot, isComingSoon: true },
        { name: 'Performance Analytics', path: '/analytics', icon: BarChart3, isComingSoon: true },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#070D1A] border-r border-[#1E2E4A] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E2E4A]/80">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#42D9F5] to-[#1E3A8A] flex items-center justify-center text-[#050914] shadow-[0_0_15px_rgba(66,217,245,0.4)] transition-transform duration-200 group-hover:scale-105">
            <Rocket className="w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-black tracking-widest text-white leading-tight">
                ASTRO<span className="text-[#42D9F5]">BASE</span>
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8] tracking-widest uppercase">
                TRAINING COMMAND
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-[#94A3B8] hover:text-[#42D9F5] hover:bg-[#111E32] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-mono tracking-widest text-[#94A3B8]/70 uppercase font-semibold mb-2">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : item.path === '/academy'
                  ? location.pathname === '/academy'
                  : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

              if (item.isComingSoon) {
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onCloseMobile}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#94A3B8] hover:bg-[#111E32]/40 transition-colors group"
                    title={isCollapsed ? `${item.name} (Coming Soon)` : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0 text-[#64748B] group-hover:text-[#94A3B8]" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111E32] text-[#64748B] border border-[#1E2E4A]">
                        SOON
                      </span>
                    )}
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#42D9F5]/10 text-[#42D9F5] border border-[#42D9F5]/30 shadow-[0_0_12px_rgba(66,217,245,0.15)] font-semibold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#111E32]/60'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#42D9F5]' : 'text-[#94A3B8]'
                    }`}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                  {isActive && !isCollapsed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#42D9F5] ml-auto animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Tagline */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#1E2E4A]/80 text-center">
          <span className="text-[10px] font-mono text-[#94A3B8] tracking-widest block">
            BUILD. SURVIVE. EXPLORE.
          </span>
          <span className="text-[9px] text-[#42D9F5]/80 font-mono">PHASE 01 // FOUNDATION</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 h-screen overflow-hidden flex flex-col">
          <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-full flex flex-col overflow-hidden`}>{sidebarContent}</div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

