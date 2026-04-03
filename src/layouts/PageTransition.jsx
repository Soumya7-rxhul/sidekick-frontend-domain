// src/layouts/PageTransition.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, type: 'spring', stiffness: 300, damping: 28 } }}
      exit={{ opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } }}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  );
}
