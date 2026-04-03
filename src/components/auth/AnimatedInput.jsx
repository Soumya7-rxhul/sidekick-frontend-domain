import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function AnimatedInput({
  label, type = 'text', value, onChange, icon, placeholder, required,
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ── All original logic preserved ──────────────────────────
  const hasValue   = value.length > 0;
  const active     = focused || hasValue;
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type;
  // ──────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>

      {/* Floating label */}
      <motion.label
        animate={{
          y:     active ? -24 : 0,
          scale: active ? 0.80 : 1,
          color: focused
            ? 'rgba(139,92,246,0.9)'
            : active
              ? 'rgba(255,255,255,0.45)'
              : 'rgba(255,255,255,0.32)',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'absolute', left: 46, top: 15,
          fontSize: 15, fontWeight: 500,
          pointerEvents: 'none',
          transformOrigin: 'left center',
          zIndex: 2,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </motion.label>

      {/* Leading icon */}
      <motion.span
        animate={{ color: focused ? 'rgba(139,92,246,0.85)' : 'rgba(255,255,255,0.25)' }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'absolute', left: 15, top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2, pointerEvents: 'none',
          display: 'flex', alignItems: 'center',
        }}
      >
        {icon && typeof icon === 'string'
          ? icon
          : icon ? React.createElement(icon, { size: 17 }) : null}
      </motion.span>

      {/* Input */}
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        placeholder={active ? placeholder : ''}
        style={{
          width: '100%', height: 52,
          /* Clean dark surface — no heavy glass */
          background: focused
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${
            focused
              ? 'rgba(139,92,246,0.55)'
              : 'rgba(255,255,255,0.08)'
          }`,
          borderRadius: 13,
          paddingLeft: 46,
          paddingRight: isPassword ? 44 : 16,
          paddingTop: active ? 10 : 0,
          color: '#fff',
          fontSize: 15,
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          /* Single, subtle focus ring — no bloom */
          boxShadow: focused
            ? '0 0 0 3px rgba(139,92,246,0.10)'
            : 'none',
          transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s, padding 0.18s',
        }}
      />

      {/* Password toggle */}
      {isPassword && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowPass(s => !s)}
          style={{
            position: 'absolute', right: 13, top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            zIndex: 3,
            color: focused ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.25)',
            transition: 'color 0.18s',
          }}
        >
          {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
        </motion.button>
      )}
    </div>
  );
}
