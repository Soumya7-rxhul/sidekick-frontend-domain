// src/layouts/OnboardingLayout.jsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AuroraBackground from '../components/ui/AuroraBackground';
import ProgressBar from '../components/onboarding/ProgressBar';
import PageTransition from './PageTransition';

export default function OnboardingLayout({ children, step = 1, totalSteps = 5 }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0B21', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <AuroraBackground intensity="subtle" />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProgressBar currentStep={step} totalSteps={totalSteps} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
          <AnimatePresence mode="wait">
            <PageTransition key={step}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
