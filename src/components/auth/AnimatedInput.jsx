import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function AnimatedInput({
  label, type = 'text', value, onChange, icon, placeholder, required,
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const hasValue = value.length > 0;
  const active = focused || hasValue;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      <motion.label
        animate={{ y: active ? -26 : 0, scale: active ? 0.82 : 1, color: focused ? '#8B5CF6' : 'rgba(255,255,255,0.4)' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ position: 'absolute', left: 48, top: 16, fontSize: 15, fontWeight: 500, pointerEvents: 'none', transformOrigin: 'left center', zIndex: 2 }}
      >
        {label}
      </motion.label>

      <motion.span
        animate={{ color: focused ? '#8B5CF6' : 'rgba(255,255,255,0.3)' }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, zIndex: 2, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}
      >
        {icon && typeof icon === 'string' ? icon : icon ? React.createElement(icon, { size: 18 }) : null}
      </motion.span>

      <motion.input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        placeholder={active ? placeholder : ''}
        animate={{ borderColor: focused ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.15), 0 0 20px rgba(139,92,246,0.1)' : '0 0 0 0px transparent' }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%', height: 52, background: 'rgba(255,255,255,0.05)', border: '1px solid', borderRadius: 14, paddingLeft: 48, paddingRight: isPassword ? 44 : 16, paddingTop: active ? 10 : 0, color: 'white', fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'padding 0.2s' }}
      />

      {isPassword && (
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setShowPass(s => !s)}
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', zIndex: 3, color: focused ? '#8B5CF6' : 'rgba(255,255,255,0.3)' }}>
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </motion.button>
      )}
    </div>
  );
}