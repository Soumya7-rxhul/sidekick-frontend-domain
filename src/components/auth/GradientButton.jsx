import React from 'react';
import { motion } from 'framer-motion';

export default function GradientButton({ children, loading, disabled, onClick, type = 'button' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? {
        scale: 1.025,
        boxShadow: '0 6px 28px rgba(139,92,246,0.38)',
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      style={{
        width: '100%',
        height: 52,
        borderRadius: 13,
        border: 'none',
        background: disabled
          ? 'rgba(139,92,246,0.28)'
          : 'linear-gradient(135deg, #8B5CF6 0%, #FF6B6B 100%)',
        color: 'white',
        fontSize: 15,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        /* Resting shadow — subtle, not bloomy */
        boxShadow: '0 4px 18px rgba(139,92,246,0.25)',
        transition: 'background 0.25s, opacity 0.2s',
        letterSpacing: '0.01em',
      }}
    >
      {loading ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.65, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 19, height: 19,
              border: '2px solid rgba(255,255,255,0.25)',
              borderTopColor: 'white',
              borderRadius: '50%',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span>Signing in…</span>
        </>
      ) : children}
    </motion.button>
  );
}
