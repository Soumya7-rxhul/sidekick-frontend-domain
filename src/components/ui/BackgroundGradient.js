import React from 'react';
import { motion } from 'framer-motion';

export default function BackgroundGradient() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '55%', height: '55%',
          background: 'radial-gradient(circle, rgba(255,101,132,0.14) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        style={{
          position: 'absolute', top: '40%', left: '30%',
          width: '40%', height: '40%',
          background: 'radial-gradient(circle, rgba(67,233,123,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
