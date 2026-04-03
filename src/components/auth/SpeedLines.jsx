import React from 'react';
import { motion } from 'framer-motion';

export default function SpeedLines({ scooterX, visible }) {
  if (!visible) return null;
  const lines = [
    { y: '42%', width: 120, opacity: 0.7, delay: 0 },
    { y: '48%', width: 80,  opacity: 0.5, delay: 0.03 },
    { y: '54%', width: 100, opacity: 0.6, delay: 0.06 },
    { y: '38%', width: 60,  opacity: 0.4, delay: 0.09 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, l.opacity, 0], scaleX: [0, 1, 0] }}
          transition={{ duration: 0.4, delay: l.delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.8 }}
          style={{
            position: 'absolute',
            top: l.y,
            right: `calc(50% + 80px)`,
            width: l.width,
            height: 2,
            background: 'linear-gradient(to left, rgba(139,92,246,0.8), transparent)',
            borderRadius: 2,
            transformOrigin: 'right center',
          }}
        />
      ))}
    </div>
  );
}
