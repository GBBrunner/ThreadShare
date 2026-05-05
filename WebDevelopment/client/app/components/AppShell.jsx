'use client'

import { useCallback, useEffect, useState } from 'react';
import { FiMenu } from 'react-icons/fi';

import Navbar from './Navbar';

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScrollCollapsed, setIsScrollCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const ICON_SIZE = 24;
  const sidebarWidth = '12.5em';

  const effectiveSidebarOpen = isSidebarOpen && !isScrollCollapsed;
  const isShiftedForSidebar = isDesktop && effectiveSidebarOpen;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const syncLayoutMode = (event) => {
      const desktop = event.matches;
      setIsDesktop(desktop);
      setIsScrollCollapsed(false);
      setIsSidebarOpen(desktop);
    };

    syncLayoutMode(mediaQuery);
    mediaQuery.addEventListener('change', syncLayoutMode);

    return () => mediaQuery.removeEventListener('change', syncLayoutMode);
  }, []);

  const toggleSidebar = useCallback(() => {
    // If the sidebar is only "closed" because scrolling collapsed it, clicking should reopen it.
    if (isSidebarOpen && isScrollCollapsed) {
      setIsScrollCollapsed(false);
      return;
    }

    setIsSidebarOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsScrollCollapsed(false);
      }
      return next;
    });
  }, [isSidebarOpen, isScrollCollapsed]);

  return (
    <div className="min-h-screen">
      {!isDesktop && effectiveSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {!effectiveSidebarOpen && (
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={toggleSidebar}
          className="fixed left-3 top-3 z-60 rounded-md bg-content-1 text-white p-2 transition-colors duration-300 ease-in-out"
        >
          <FiMenu size={ICON_SIZE} />
        </button>
      )}

      <Navbar
        isOpen={effectiveSidebarOpen}
        onToggle={toggleSidebar}
        onScrollCollapsedChange={setIsScrollCollapsed}
      />

      <div
        className="min-h-screen flex flex-col"
        style={{
          marginLeft: isShiftedForSidebar ? sidebarWidth : '0',
          width: isShiftedForSidebar ? `calc(100% - ${sidebarWidth})` : '100%',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
        }}
      >
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
