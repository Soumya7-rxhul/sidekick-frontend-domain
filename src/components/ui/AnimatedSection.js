import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedSection({ children, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
