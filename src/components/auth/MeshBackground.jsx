import React, { memo } from 'react';

const MeshBackground = memo(function MeshBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Blob 1 — purple */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
        animation: 'blobDrift1 18s ease-in-out infinite',
        filter: 'blur(40px)',
      }} />
      {/* Blob 2 — coral */}
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '55vw', height: '55vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,107,0.28) 0%, transparent 70%)',
        animation: 'blobDrift2 22s ease-in-out infinite',
        filter: 'blur(40px)',
      }} />
      {/* Blob 3 — cyan */}
      <div style={{
        position: 'absolute', top: '40%', left: '35%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
        animation: 'blobDrift3 26s ease-in-out infinite',
        filter: 'blur(50px)',
      }} />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: 'white',
          opacity: p.opacity,
          animation: `particleDrift${p.anim} ${p.dur}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      <style>{`
        @keyframes blobDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(8vw, 6vh) scale(1.1); }
          66%      { transform: translate(-4vw, 10vh) scale(0.95); }
        }
        @keyframes blobDrift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-10vw, -8vh) scale(1.15); }
          70%      { transform: translate(5vw, -4vh) scale(0.9); }
        }
        @keyframes blobDrift3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-8vw, 8vh) scale(1.2); }
        }
        @keyframes particleDrift1 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(12px,-18px); }
        }
        @keyframes particleDrift2 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-10px, 14px); }
        }
        @keyframes particleDrift3 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(8px, 20px); }
        }
      `}</style>
    </div>
  );
});

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: `${2 + Math.random() * 4}px`,
  opacity: 0.04 + Math.random() * 0.1,
  anim: (i % 3) + 1,
  dur: 6 + Math.random() * 8,
  delay: Math.random() * 5,
}));

export default MeshBackground;
