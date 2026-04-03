import React from 'react';

export default function Avatar({ name, size = 48, fontSize, showRing = false, ringPercent = 0 }) {
  const initial = name?.[0]?.toUpperCase() || '?';
  const fs = fontSize || Math.round(size * 0.38);
  const ringColor = ringPercent >= 80 ? '#7C3AED' : ringPercent >= 60 ? '#F59E0B' : '#9CA3AF';

  if (showRing) {
    const r = (size / 2) - 3;
    const circ = 2 * Math.PI * r;
    const dash = (ringPercent / 100) * circ;
    return (
      <div style={{ position: 'relative', width: size + 6, height: size + 6, flexShrink: 0 }}>
        <svg width={size + 6} height={size + 6} style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx={(size + 6) / 2} cy={(size + 6) / 2} r={r}
            fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
          <circle cx={(size + 6) / 2} cy={(size + 6) / 2} r={r}
            fill="none" stroke={ringColor} strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${(size + 6) / 2} ${(size + 6) / 2})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', top: 3, left: 3,
          width: size, height: size, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C3AED, #F43F5E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fs, fontWeight: 700, color: 'white',
        }}>
          {initial}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #7C3AED, #F43F5E)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 700, color: 'white',
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}
