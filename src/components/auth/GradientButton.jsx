import React from 'react';
import { motion } from 'framer-motion';

export default function GradientButton({ children, loading, disabled, onClick, type = 'button' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(139,92,246,0.45)' } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      style={{
        width: '100%',
        height: 52,
        borderRadius: 14,
        border: 'none',
        background: disabled
          ? 'rgba(139,92,246,0.3)'
          : 'linear-gradient(135deg, #8B5CF6 0%, #FF6B6B 100%)',
        color: 'white',
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
        transition: 'background 0.3s, opacity 0.2s',
        backgroundSize: '200% 200%',
        letterSpacing: '0.01em',
      }}
    >
      {loading ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 20, height: 20,
              border: '2.5px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          <span>Riding in...</span>
        </>
      ) : children}
    </motion.button>
  );
}
