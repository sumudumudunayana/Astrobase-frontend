import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Toaster } from 'sonner';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050914] text-[#F8FAFC] flex flex-col antialiased selection:bg-[#42D9F5]/30 selection:text-white">
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Toast Notification Provider */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0B1424',
            border: '1px solid #1E2E4A',
            color: '#F8FAFC',
          },
        }}
      />
    </div>
  );
};

