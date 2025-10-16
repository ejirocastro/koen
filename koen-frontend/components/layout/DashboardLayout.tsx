/**
 * DashboardLayout Component
 *
 * Main layout wrapper for all dashboard pages.
 * Manages responsive sidebar and top bar components with mobile menu state.
 *
 * Layout Structure:
 * - TopBar: Fixed at top (always visible)
 * - Sidebar: Fixed on left (desktop) or overlay (mobile)
 * - Main Content: Flexible area with responsive padding
 *
 * Responsive Behavior:
 * - Desktop (lg+): Sidebar always visible, collapsible
 * - Mobile: Sidebar hidden, accessible via hamburger menu
 */
'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * Props for the DashboardLayout component
 */
interface DashboardLayoutProps {
  children: React.ReactNode;  // Page content to render
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0E11]">
      <TopBar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 mt-14
          lg:${sidebarCollapsed ? 'ml-16' : 'ml-60'}
          px-4 sm:px-6 lg:px-8
          py-4 sm:py-6 lg:py-8
        `}>
          {children}
        </main>
      </div>
    </div>
  );
}
