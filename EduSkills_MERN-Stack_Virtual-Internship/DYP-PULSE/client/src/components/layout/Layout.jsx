import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    } catch {
      try {
        window.scrollTo(0, 0);
      } catch {}
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#172033]">
      <Header />
      <main className="flex-1 min-h-[calc(100vh-160px)] flex flex-col">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
