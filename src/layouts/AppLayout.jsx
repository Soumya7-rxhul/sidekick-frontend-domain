// src/layouts/AppLayout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AuroraBackground from '../components/ui/AuroraBackground';
import TopBar from '../components/ui/TopBar';
import BottomNav from '../components/ui/BottomNav';
import PageTransition from './PageTransition';

export default function AppLayout({ children, noPadding }) {
  const location = useLocation();
  return (
    <div style={{ minHeight: '100vh', background: '#0F0B21', position: 'relative' }}>
      <AuroraBackground intensity="full" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: noPadding ? 'hidden' : 'auto', ...(noPadding ? { paddingTop: 56 } : { padding: '56px 20px 80px' }) }}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
