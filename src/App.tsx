import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AcademyPage } from './pages/AcademyPage';
import { AstronautFundamentalsPage } from './pages/AstronautFundamentalsPage';
import { LifeSupportPage } from './pages/LifeSupportPage';
import { EVAPage } from './pages/EVAPage';
import { EVASimulatorPage } from './pages/EVASimulatorPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { EmergencySimulatorPage } from './pages/EmergencySimulatorPage';
import { PlanetaryPage } from './pages/PlanetaryPage';
import { PlanetarySimulatorPage } from './pages/PlanetarySimulatorPage';
import { MissionPlanningPage } from './pages/MissionPlanningPage';
import { MissionPlanningWorkspacePage } from './pages/MissionPlanningWorkspacePage';
import { MissionControlSimulatorPage } from './pages/MissionControlSimulatorPage';
import { SpaceSciencePage } from './pages/SpaceSciencePage';
import { SpaceScienceLabPage } from './pages/SpaceScienceLabPage';
import { CrmPage } from './pages/CrmPage';
import { CrmTrainingCenterPage } from './pages/CrmTrainingCenterPage';
import { PracticalTrainingPage } from './pages/PracticalTrainingPage';
import { ObservatoryPage } from './pages/ObservatoryPage';
import { LessonPage } from './pages/LessonPage';
import { SpaceflightPage } from './pages/SpaceflightPage';
import { SpacesuitPage } from './pages/SpacesuitPage';
import { MicrogravityPage } from './pages/MicrogravityPage';
import { ComingSoonPage } from './pages/ComingSoonPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Main Root Opens Directly on Training Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Academy Curriculum */}
          <Route path="academy" element={<AcademyPage />} />
          <Route path="academy/astronaut-fundamentals" element={<AstronautFundamentalsPage />} />
          <Route path="academy/life-support" element={<LifeSupportPage />} />
          <Route path="academy/module-02" element={<Navigate to="/academy/life-support" replace />} />
          <Route path="academy/eva" element={<EVAPage />} />
          <Route path="academy/module-03" element={<Navigate to="/academy/eva" replace />} />
          <Route path="academy/emergency" element={<EmergencyPage />} />
          <Route path="academy/module-04" element={<Navigate to="/academy/emergency" replace />} />
          <Route path="academy/planetary" element={<PlanetaryPage />} />
          <Route path="academy/module-05" element={<Navigate to="/academy/planetary" replace />} />
          <Route path="academy/mission-planning" element={<MissionPlanningPage />} />
          <Route path="academy/module-06" element={<Navigate to="/academy/mission-planning" replace />} />
          <Route path="academy/space-science" element={<SpaceSciencePage />} />
          <Route path="academy/module-07" element={<Navigate to="/academy/space-science" replace />} />
          <Route path="academy/crm" element={<CrmPage />} />
          <Route path="academy/module-08" element={<Navigate to="/academy/crm" replace />} />
          <Route path="crm/training-center" element={<CrmTrainingCenterPage />} />
          <Route path="crm" element={<Navigate to="/crm/training-center" replace />} />

          {/* Dedicated Interactive Lesson Page */}
          <Route path="lessons/:lessonId" element={<LessonPage />} />

          {/* Interactive 3D Simulators & Demonstrations */}
          <Route path="eva/simulator" element={<EVASimulatorPage />} />
          <Route path="emergency/simulator" element={<EmergencySimulatorPage />} />
          <Route path="simulator/emergency" element={<EmergencySimulatorPage />} />
          <Route path="planetary/simulator" element={<PlanetarySimulatorPage />} />
          <Route path="simulator/planetary" element={<PlanetarySimulatorPage />} />
          <Route path="mission-planning/workspace" element={<MissionPlanningWorkspacePage />} />
          <Route path="mission-planning" element={<Navigate to="/mission-planning/workspace" replace />} />
          <Route path="mission-control" element={<MissionControlSimulatorPage />} />
          <Route path="mission-control/simulator" element={<MissionControlSimulatorPage />} />
          <Route path="space-science/lab" element={<SpaceScienceLabPage />} />
          <Route path="space-science" element={<Navigate to="/space-science/lab" replace />} />
          <Route path="science/lab" element={<SpaceScienceLabPage />} />
          <Route path="simulator" element={<EVASimulatorPage />} />
          <Route path="spaceflight" element={<SpaceflightPage />} />
          <Route path="spacesuit" element={<SpacesuitPage />} />
          <Route path="microgravity" element={<MicrogravityPage />} />
          <Route path="moon-mars" element={<PlanetarySimulatorPage />} />

          {/* Practical Astronaut Readiness & Space Science Observatory */}
          <Route path="practical-training" element={<PracticalTrainingPage />} />
          <Route path="observatory" element={<ObservatoryPage />} />
          <Route path="telemetry/observatory" element={<Navigate to="/observatory" replace />} />

          {/* Upcoming Future Modules (Polished Placeholders) */}
          <Route
            path="assessments"
            element={
              <ComingSoonPage
                title="Comprehensive Assessments"
                category="CERTIFICATION EXAMS"
                description="Timed formal examinations and simulated emergency scenarios leading to official Astronaut Candidate (ASCAN) Phase 01 certification."
              />
            }
          />
          <Route
            path="ai-instructor"
            element={
              <ComingSoonPage
                title="AI Mission Flight Instructor"
                category="INTELLIGENT FLIGHT TUTOR"
                description="Autonomous conversational aerospace instructor providing real-time mission assistance, debriefs, and flight manual queries."
              />
            }
          />
          <Route
            path="analytics"
            element={
              <ComingSoonPage
                title="Performance Analytics & Telemetry"
                category="FLIGHT READINESS METRICS"
                description="In-depth analytics on knowledge retention, reaction latency during simulated anomalies, and curriculum completion curves."
              />
            }
          />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
