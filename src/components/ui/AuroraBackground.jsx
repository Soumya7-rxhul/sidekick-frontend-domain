// src/components/ui/AuroraBackground.jsx
import React, { memo } from 'react';

const AuroraBackground = memo(function AuroraBackground({ intensity = 'full' }) {
  const op = intensity === 'subtle' ? 0.4 : 1;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      background: 'linear-gradient(180deg, #0F0B21 0%, #130F29 50%, #0F0B21 100%)' }}>

      {/* Aurora blob 1 — purple */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: window.innerWidth < 768 ? 200 : 400,
        height: window.innerWidth < 768 ? 200 : 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
        filter: 'blur(80px)',
        mixBlendMode: 'screen',
        opacity: op * (window.innerWidth < 768 ? 0.5 : 1),
        animation: 'auroraBlob1 25s ease-in-out infinite',
      }} />

      {/* Aurora blob 2 — teal */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: window.innerWidth < 768 ? 200 : 350,
        height: window.innerWidth < 768 ? 200 : 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,212,191,0.22) 0%, transparent 70%)',
        filter: 'blur(80px)',
        mixBlendMode: 'screen',
        opacity: op * (window.innerWidth < 768 ? 0.5 : 1),
        animation: 'auroraBlob2 30s ease-in-out infinite',
      }} />

      {/* Aurora blob 3 — rose */}
      <div style={{
        position: 'absolute', top: '40%', left: '30%',
        width: window.innerWidth < 768 ? 200 : 300,
        height: window.innerWidth < 768 ? 200 : 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,63,94,0.14) 0%, transparent 70%)',
        filter: 'blur(80px)',
        mixBlendMode: 'screen',
        opacity: op * (window.innerWidth < 768 ? 0.5 : 1),
        animation: 'auroraBlob3 20s ease-in-out infinite',
      }} />

      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      <style>{`
        @keyframes auroraBlob1 {
          0%,100% { transform: translate(0,0) scale(1); }
          25%      { transform: translate(8vw, 6vh) scale(1.1); }
          50%      { transform: translate(4vw, 12vh) scale(0.95); }
          75%      { transform: translate(-4vw, 6vh) scale(1.05); }
        }
        @keyframes auroraBlob2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-10vw, -8vh) scale(1.15); }
          66%      { transform: translate(5vw, -4vh) scale(0.9); }
        }
        @keyframes auroraBlob3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-8vw, 8vh) scale(1.2); }
        }
      `}</style>
    </div>
  );
});

export default AuroraBackground;
