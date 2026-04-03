import React, { memo } from 'react';
import { motion } from 'framer-motion';

const ICONS = [
  { emoji: '🎬', x: '5%',  y: '20%', delay: 0 },
  { emoji: '⚽', x: '88%', y: '15%', delay: 0.3 },
  { emoji: '🍕', x: '92%', y: '55%', delay: 0.6 },
  { emoji: '🎵', x: '4%',  y: '65%', delay: 0.9 },
  { emoji: '🏔️', x: '48%', y: '92%', delay: 1.2 },
];

const FloatingIcons = memo(function FloatingIcons({ visible }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {ICONS.map((icon, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ delay: icon.delay, type: 'spring', stiffness: 200, damping: 12 }}
          style={{ position: 'absolute', left: icon.x, top: icon.y }}
        >
          <motion.span
            animate={{
              y: [0, -10, 4, -6, 0],
              x: [0, 4, -3, 5, 0],
              rotate: [0, 5, -5, 3, 0],
            }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
            style={{ fontSize: 28, display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
          >
            {icon.emoji}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
});

export default FloatingIcons;
