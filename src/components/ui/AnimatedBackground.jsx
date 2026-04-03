import React, { memo } from 'react';

const AnimatedBackground = memo(function AnimatedBackground({ variant = 'mesh', intensity = 1 }) {
  if (variant === 'none') return null;

  const opacity = variant === 'subtle' ? 0.04 * intensity : 0.08 * intensity;

  return (
    <>
      {/* Dot texture layer */}
      <div
        className="dot-texture"
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          pointerEvents: 'none', opacity: 0.4,
        }}
      />
      {/* Mesh gradient blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(124,58,237,${opacity * 1.2}) 0%, transparent 70%)`,
          animation: 'meshDrift1 20s ease-in-out infinite',
          filter: 'blur(60px)', willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: '55vw', height: '55vw', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(244,63,94,${opacity}) 0%, transparent 70%)`,
          animation: 'meshDrift2 24s ease-in-out infinite',
          filter: 'blur(60px)', willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '30%',
          width: '40vw', height: '40vw', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(99,102,241,${opacity * 0.7}) 0%, transparent 70%)`,
          animation: 'meshDrift3 28s ease-in-out infinite',
          filter: 'blur(70px)', willChange: 'transform',
        }} />
      </div>
    </>
  );
});

export default AnimatedBackground;
