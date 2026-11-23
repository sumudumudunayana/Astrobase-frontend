import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Rocket,
  Shield,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  Award,
  CheckCircle2,
} from 'lucide-react';

export const AcademyPage: React.FC = () => {
  const modules = [
    {
      id: 1,
      number: '01',
      title: 'Astronaut Fundamentals',
      category: 'FOUNDATION',
      difficulty: 'Beginner / University Foundation',
      duration: '2.5 - 3 Hours',
      lessonsCount: 6,
      status: 'Available',
      description: 'Discover the science, technology, responsibilities, and operations behind human spaceflight. Master spacecraft systems, spacesuits, microgravity adaptation, and flight communications.',
      path: '/academy/astronaut-fundamentals',
      isAvailable: true,
      topics: [
        'History and Evolution of Human Spaceflight',
        'Astronaut Roles & Command Hierarchy',
        'Spacecraft & Spacesuit EMU Systems',
        'Microgravity Physics & Physiological Countermeasures',
        'Spaceflight Phases: Launch, Orbit, Entry & Recovery',
        'Mission Control Center (MCC) Protocols & 3-Way Comms',
      ],
    },
    {
      id: 2,
      number: '02',
      title: 'Life Support & Space Habitat Systems',
      category: 'HABITAT ENGINEERING',
      difficulty: 'Intermediate / Foundation Engineering',
      duration: '4–6 Hours',
      lessonsCount: 7,
      status: 'Available',
      description: 'Master closed-loop environmental controls (ECLSS), water recovery distillation, oxygen generation, carbon dioxide removal, space greenhouses, thermal loops, and power distribution.',
      path: '/academy/life-support',
      isAvailable: true,
      topics: [
        'Oxygen Generation and Circulation',
        'Carbon Dioxide Removal & Sabatier Reactors',
        'Water Recovery & Rotary Distillation (UPA/WPA/BPA)',
        'Space Greenhouse Cultivation & PAR LED Lighting',
        'Temperature & Pressure Regulation (ITCS/ETCS)',
        'Habitat Modular Design & Maintenance Audits',
        'Electrical Power, Solar Arrays & Battery Systems',
      ],
    },
    {
      id: 3,
      number: '03',
      title: 'EVA & Astronaut Operations',
      category: 'PRACTICAL',
      difficulty: 'Intermediate',
      duration: '5–7 Hours',
      lessonsCount: 6,
      status: 'Available',
      description: 'Spacewalk flight techniques, Quest airlock depressurization, safety tether rigging, Pistol Grip Tool torque dynamics, and post-EVA repressurization.',
      path: '/academy/eva',
      isAvailable: true,
      topics: [
        'EVA Fundamentals & Space Environment',
        'Spacesuit Components & Life Support (PLSS/LCVG)',
        'EVA Preparation & Pre-Breathe Checklists',
        'Tether Safety Systems & SAFER Rescue',
        'Pistol Grip Tool & Microgravity Torquing',
        'Pre-EVA & Post-EVA Airlock Procedures',
      ],
    },
    {
      id: 4,
      number: '04',
      title: 'Emergency Response & Safety',
      category: 'CRITICAL',
      difficulty: 'Intermediate / Advanced',
      duration: '6–8 Hours',
      lessonsCount: 7,
      status: 'Available',
      description: 'Crucial emergency procedures: rapid cabin decompression triage, high-pressure oxygen leaks, microgravity fire suppression, solar proton storms, equipment failures, DCS medical response, and station evacuation.',
      path: '/academy/emergency',
      isAvailable: true,
      topics: [
        'Cabin Pressure Loss & Hatch Isolation',
        'Oxygen Leaks & Flammability Mitigation',
        'Microgravity Fire & Toxic Smoke Scrub',
        'Solar Particle Event Radiation Shelters',
        'Equipment Malfunctions & Bus Cross-Ties',
        'Post-EVA Decompression Sickness (DCS)',
        'Emergency Communication & Evacuation',
      ],
    },
    {
      id: 5,
      number: '05',
      title: 'Planetary Science & Exploration',
      category: 'SCIENCE & EXPLORATION',
      difficulty: 'Intermediate',
      duration: '6–8 Hours',
      lessonsCount: 7,
      status: 'Available',
      description: 'Lunar and Martian surface geology, environmental hazards, robotic rovers with rocker-bogie mobility, rock core sampling with hermetic curation, and multi-criteria landing site selection.',
      path: '/academy/planetary',
      isAvailable: true,
      topics: [
        'Moon and Mars Geology & Formations',
        'Surface Gravity, Dust & Atmosphere',
        'Radiation, Regolith & Thermal Hazards',
        'Surface Traversal & Walk-Back Constraints',
        'Robotic Rovers & Rocker-Bogie Mobility',
        'Sample Collection, Drilling & Curation',
        'Landing Site Selection & Terrain Analysis',
      ],
    },
    {
      id: 6,
      number: '06',
      title: 'Mission Planning & Operations',
      category: 'MISSION OPERATIONS',
      difficulty: 'Intermediate / Advanced',
      duration: '6–8 Hours',
      lessonsCount: 7,
      status: 'Available',
      description: 'Mission architecture, operational constraints, Gantt/timeline scheduling, crew roles & work-rest cycles, DSN communications & light-time delay, consumables & mass-energy budgets, Mission Control console positions, and risk mitigation.',
      path: '/academy/mission-planning',
      isAvailable: true,
      topics: [
        'Mission Objectives and Constraints',
        'Mission Timelines and Critical Path',
        'Crew Roles & Work-Rest Cycles',
        'Mission Communications & Tracking',
        'Resource & Consumables Budgeting',
        'Mission Control Center Operations',
        'Risk Assessment & Contingencies',
      ],
    },
    {
      id: 7,
      number: '07',
      title: 'Space Science & Research',
      category: 'SCIENTIFIC RESEARCH',
      difficulty: 'Intermediate / Advanced',
      duration: '6 Hours',
      lessonsCount: 6,
      status: 'Available',
      description: 'Scientific research beyond Earth: variable isolation, interfacial capillary fluids, macromolecular protein crystallography, cellular gravitropism, planetary core spectroscopy, and peer-reviewed IMRAD reporting.',
      path: '/academy/space-science',
      isAvailable: true,
      topics: [
        'Scientific Experimentation in Space',
        'Microgravity Research & Physical Sciences',
        'Scientific Data Collection & Interpretation',
        'Space Biology Fundamentals & Gravitropism',
        'Planetary Science & Sample Research',
        'Scientific Reporting & Communication',
      ],
    },
    {
      id: 8,
      number: '08',
      title: 'Leadership & Crew Resource Management',
      category: 'PROFESSIONAL SKILLS & CRM',
      difficulty: 'Intermediate / Advanced',
      duration: '7 Hours',
      lessonsCount: 7,
      status: 'Available',
      description: 'Human factors in human spaceflight: team coordination, situational leadership, Endsley SA models & error traps, circadian cycles & sleep pods, DESC conflict resolution, Bayesian decisions under uncertainty, and Just Culture debriefings.',
      path: '/academy/crm',
      isAvailable: true,
      topics: [
        'Team Coordination & Synchronized Cockpit Ops',
        'Leadership Styles & Command Decisions Under Pressure',
        'Situational Awareness & Fixation Error Traps',
        'Crew Wellness, Fatigue & Circadian Biology',
        'Interpersonal Dynamics & Conflict Resolution (DESC)',
        'Decision-Making Under Uncertainty & Risk Bounds',
        'Mission Debriefing & Just Culture Continuous Learning',
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-8 rounded-2xl border border-[#1E2E4A] bg-gradient-to-r from-[#070D1A] via-[#0B1424] to-[#070D1A]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#42D9F5]/10 border border-[#42D9F5]/30 text-[#42D9F5] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>ASTROBASE TRAINING ACADEMY</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Astronaut Certification Curriculum
          </h1>

          <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed mb-6">
            A comprehensive, university-level astronaut curriculum covering spaceflight fundamentals,
            subsystem engineering, microgravity adaptation, and operational protocols.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#94A3B8] border-t border-[#1E2E4A] pt-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#42D9F5]" />
              <span>8 Total Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#628CFF]" />
              <span>~28 Total Curriculum Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F5B942]" />
              <span>NASA & Space Agency Lineage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Module Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-wide">Course Modules</h2>
          <span className="text-xs font-mono text-[#94A3B8]">1 AVAILABLE // 7 UPCOMING</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                mod.isAvailable
                  ? 'glass-panel border-[#42D9F5]/50 shadow-[0_0_20px_rgba(66,217,245,0.12)]'
                  : 'bg-[#0B1424]/60 border-[#1E2E4A]/80 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-mono px-2.5 py-1 rounded font-bold ${
                      mod.isAvailable
                        ? 'bg-[#42D9F5]/20 text-[#42D9F5] border border-[#42D9F5]/40'
                        : 'bg-[#111E32] text-[#64748B] border border-[#1E2E4A]'
                    }`}
                  >
                    MODULE {mod.number}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium ${
                      mod.isAvailable ? 'text-[#10B981]' : 'text-[#64748B]'
                    }`}
                  >
                    {mod.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">{mod.title}</h3>
                <span className="text-xs font-mono text-[#42D9F5] block mb-3">{mod.category}</span>

                <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">{mod.description}</p>

                {/* Topics List */}
                <div className="space-y-1.5 mb-6">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider block">
                    SYLLABUS HIGHLIGHTS:
                  </span>
                  {mod.topics.slice(0, 4).map((t, i) => (
                    <div key={i} className="text-xs text-[#E2E8F0] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#42D9F5]" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] border-t border-[#1E2E4A] py-3 mb-3">
                  <span>{mod.duration}</span>
                  <span>{mod.lessonsCount} Lessons</span>
                  <span>{mod.difficulty}</span>
                </div>

                {mod.isAvailable ? (
                  <Link
                    to={mod.path}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#42D9F5] to-[#628CFF] text-[#050914] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(66,217,245,0.3)] hover:scale-[1.01] transition-transform"
                  >
                    <span>Enter Astronaut Fundamentals</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="w-full py-3 px-4 rounded-xl bg-[#111E32]/60 border border-[#1E2E4A] text-[#64748B] text-xs font-mono text-center">
                    Phase 02 Scheduled Release
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

