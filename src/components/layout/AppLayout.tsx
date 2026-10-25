import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { DemoBanner } from '../common/DemoBanner';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('careerpulse_sidebar_collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('careerpulse_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleSidebar = () => {
    // If mobile, toggle mobile drawer. If desktop, toggle collapse.
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      handleToggleCollapse();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <DemoBanner />
      <TopBar onToggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex">
        <WorkspaceSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
