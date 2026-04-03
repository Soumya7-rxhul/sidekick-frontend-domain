import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function RideDust({ visible }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute" style={{ right: -10, bottom: 18 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          initial={{ opacity: 0.7, scale: 0.3, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.5, x: 20 + i * 12, y: -8 - i * 6 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.3 }}
          style={{
            position: 'absolute',
            width: 8 + i * 3, height: 8 + i * 3,
            borderRadius: '50%',
            background: 'rgba(200,180,255,0.4)',
          }}
        />
      ))}
    </div>
  );
}

export function IdlePuff({ trigger }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          key="puff"
          initial={{ opacity: 0.6, scale: 0.2, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.8, x: 24, y: -12 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            position: 'absolute', right: -8, bottom: 20,
            width: 14, height: 14, borderRadius: '50%',
            background: 'rgba(200,180,255,0.3)',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}
