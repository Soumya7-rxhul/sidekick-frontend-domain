// src/components/ui/UIKit.jsx
import React, { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight, Check, ShieldCheck, ShieldAlert } from 'lucide-react';

const sp = { type: 'spring', stiffness: 300, damping: 28 };

// ─── GRADIENT TEXT ────────────────────────────────────────
export const GradientText = memo(function GradientText({ children, gradient = 'purple-teal', style = {} }) {
  const bg = gradient === 'purple-teal'
    ? 'linear-gradient(135deg, #7C3AED, #2DD4BF)'
    : gradient === 'rose-amber'
    ? 'linear-gradient(135deg, #F43F5E, #FB923C)'
    : gradient;
  return (
    <span style={{ background: bg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', ...style }}>
      {children}
    </span>
  );
});

// ─── AVATAR ───────────────────────────────────────────────
export const Avatar = memo(function Avatar({ name, size = 44, gradient = 'purple-teal', showRing = false, ringPercent = 0 }) {
  const bg = gradient === 'purple-teal'
    ? 'linear-gradient(135deg, #7C3AED, #2DD4BF)'
    : 'linear-gradient(135deg, #F43F5E, #FB923C)';
  const fontSize = Math.round(size * 0.35);
  const r = (size / 2) + 4;
  const circ = 2 * Math.PI * r;
  const ringColor = ringPercent >= 80 ? '#7C3AED' : ringPercent >= 60 ? '#FBBF24' : '#4A4570';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {showRing && (
        <svg style={{ position: 'absolute', top: -4, left: -4, width: size + 8, height: size + 8 }} viewBox={`0 0 ${size + 8} ${size + 8}`}>
          <circle cx={(size + 8) / 2} cy={(size + 8) / 2} r={r} fill="none" stroke="#2D2653" strokeWidth="2" />
          <motion.circle cx={(size + 8) / 2} cy={(size + 8) / 2} r={r} fill="none" stroke={ringColor} strokeWidth="2"
            strokeLinecap="round" transform={`rotate(-90 ${(size + 8) / 2} ${(size + 8) / 2})`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${ringPercent * circ / 100} ${circ}` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
      )}
      <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: 'white', overflow: 'hidden' }}>
        {name?.[0]?.toUpperCase() || '?'}
      </div>
    </div>
  );
});

// ─── BADGE ────────────────────────────────────────────────
export const Badge = memo(function Badge({ verified, type }) {
  const label = type === 'id' ? (verified ? 'ID Verified' : 'ID Not Verified') : (verified ? 'Face Verified' : 'Face Not Verified');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 28, padding: '0 12px', borderRadius: 20,
      background: verified ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
      border: `1px solid ${verified ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
      color: verified ? '#34D399' : '#F87171',
      fontSize: 12, fontWeight: 500,
    }}>
      {verified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
      {label}
    </span>
  );
});

// ─── STAT CARD ────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, gradient = 'purple-teal', onClick }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, v => Math.round(v));
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    mv.set(value);
    const unsub = display.on('change', v => setDisplayVal(v));
    return unsub;
  }, [value]);

  const stripe = gradient === 'purple-teal'
    ? 'linear-gradient(90deg, #7C3AED, #2DD4BF)'
    : 'linear-gradient(90deg, #F43F5E, #FB923C)';
  const iconColor = gradient === 'purple-teal' ? '#7C3AED' : '#F43F5E';

  return (
    <motion.div whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(124,58,237,0.08)' }}
      whileTap={{ scale: 0.97 }} onClick={onClick}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sp}
      style={{ flex: 1, background: '#1A1535', border: '1px solid #2D2653', borderRadius: 20, padding: '20px 16px', cursor: onClick ? 'pointer' : 'default', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stripe, borderRadius: '20px 20px 0 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: '#F1F0F7', letterSpacing: '-0.03em', lineHeight: 1 }}>{displayVal}</p>
        </div>
        {Icon && <Icon size={24} color={iconColor} strokeWidth={1.5} style={{ opacity: 0.3 }} />}
      </div>
    </motion.div>
  );
}

// ─── ACTION ROW ───────────────────────────────────────────
export function ActionRow({ icon: Icon, title, subtitle, onClick, divider = false }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div whileTap={{ scale: 0.98 }} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', minHeight: 56, background: hov ? '#231E42' : 'transparent', borderBottom: divider ? '1px solid #2D2653' : 'none', transition: 'background 0.2s, transform 0.2s', transform: hov ? 'translateX(3px)' : 'translateX(0)' }}>
      {Icon && <Icon size={18} color="#2DD4BF" strokeWidth={1.8} />}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#F1F0F7' }}>{title}</p>
        {subtitle && <p style={{ fontSize: 13, color: '#6E6893', marginTop: 1 }}>{subtitle}</p>}
      </div>
      <ChevronRight size={16} color={hov ? '#2DD4BF' : '#4A4570'} style={{ transition: 'color 0.2s', flexShrink: 0 }} />
    </motion.div>
  );
}

// ─── ACTION CARD ──────────────────────────────────────────
export function ActionCard({ children }) {
  return (
    <div style={{ background: '#1A1535', border: '1px solid #2D2653', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────────────────
export function PageHeader({ title, subtitle, rightAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 24, fontWeight: 700, color: '#F1F0F7', letterSpacing: '-0.025em' }}>{title}</motion.h1>
        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.3 }}
            style={{ fontSize: 14, color: '#6E6893', marginTop: 2 }}>{subtitle}</motion.p>
        )}
      </div>
      {rightAction && <div style={{ flexShrink: 0, marginLeft: 12 }}>{rightAction}</div>}
    </div>
  );
}

// ─── TAB BAR ──────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #2D2653', marginBottom: 16, position: 'relative' }}>
      {tabs.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)}
          style={{ flex: 1, height: 40, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: active === key ? 600 : 400, color: active === key ? '#F1F0F7' : '#6E6893', position: 'relative', transition: 'color 0.2s' }}>
          {label}
          {active === key && (
            <motion.div layoutId="tab-indicator"
              style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #7C3AED, #2DD4BF)', borderRadius: '2px 2px 0 0' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── CATEGORY CHIP ────────────────────────────────────────
export function CategoryChip({ label, active, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.93 }} onClick={onClick}
      style={{ height: 32, padding: '0 14px', borderRadius: 20, border: `1px solid ${active ? 'transparent' : '#433B72'}`, background: active ? 'linear-gradient(135deg, #7C3AED, #2DD4BF)' : '#2D2653', color: active ? 'white' : '#A8A3C7', fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </motion.button>
  );
}

// ─── SELECTABLE CHIP ──────────────────────────────────────
export function SelectableChip({ label, selected, onToggle, variant = 'multi', selectionIndex }) {
  return (
    <motion.button
      whileHover={{ y: -1 }} whileTap={{ scale: 0.93 }}
      animate={selected ? { scale: [1, 0.95, 1.05, 1] } : { scale: 1 }}
      transition={selected ? { duration: 0.3, type: 'spring', stiffness: 400 } : sp}
      onClick={onToggle}
      style={{
        position: 'relative', height: 40, padding: '0 20px',
        borderRadius: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        fontSize: 14, fontWeight: selected ? 600 : 500,
        border: selected
          ? (variant === 'single' ? 'none' : '1.5px solid #7C3AED')
          : '1.5px solid #433B72',
        background: selected
          ? (variant === 'single' ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'rgba(124,58,237,0.15)')
          : '#2D2653',
        color: selected ? (variant === 'single' ? 'white' : '#7C3AED') : '#A8A3C7',
        boxShadow: selected && variant === 'single' ? '0 4px 16px rgba(124,58,237,0.4)' : 'none',
        display: 'flex', alignItems: 'center', gap: 6, transition: 'border 0.2s, background 0.2s',
      }}>
      {selected && variant === 'single' && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
          <Check size={14} color="white" />
        </motion.span>
      )}
      {label}
      {selected && variant === 'multi' && selectionIndex !== undefined && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
          style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectionIndex + 1}
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────
export const EmptyState = memo(function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={sp}
      style={{ background: '#1A1535', border: '1px solid #2D2653', borderRadius: 20, padding: '40px 24px', textAlign: 'center', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {Icon && <Icon size={48} color="#4A4570" strokeWidth={1.5} />}
      <p style={{ fontSize: 16, fontWeight: 600, color: '#A8A3C7', marginTop: 8 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 14, color: '#6E6893' }}>{subtitle}</p>}
      {action && onAction && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onAction}
          style={{ marginTop: 16, height: 44, padding: '0 24px', background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
          {action}
        </motion.button>
      )}
    </motion.div>
  );
});

// ─── SKELETON ─────────────────────────────────────────────
export const SkeletonCard = memo(function SkeletonCard({ height = 80 }) {
  return (
    <div style={{ height, borderRadius: 16, marginBottom: 10, background: 'linear-gradient(90deg, #2D2653 25%, #362F5E 50%, #2D2653 75%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.5s infinite' }}>
      <style>{`@keyframes skeletonShimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
    </div>
  );
});

export function SkeletonList({ count = 3, height = 80 }) {
  return <>{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} height={height} />)}</>;
}

// ─── GRADIENT BUTTON ──────────────────────────────────────
export function GradientButton({ children, onClick, loading, disabled, variant = 'primary', fullWidth, icon: Icon, type = 'button', style: extraStyle = {} }) {
  const styles = {
    primary:   { background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: 'white', border: 'none', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' },
    secondary: { background: '#2D2653', color: '#A8A3C7', border: '1.5px solid #433B72', boxShadow: 'none' },
    outline:   { background: 'transparent', color: '#2DD4BF', border: '1.5px solid #2DD4BF', boxShadow: 'none' },
    ghost:     { background: 'transparent', color: '#2DD4BF', border: 'none', boxShadow: 'none' },
    danger:    { background: 'transparent', color: '#F87171', border: 'none', boxShadow: 'none' },
  };
  const s = styles[variant] || styles.primary;
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ height: 52, padding: '0 24px', borderRadius: 14, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: fullWidth ? '100%' : 'auto', transition: 'background 0.3s, opacity 0.2s', ...s, ...extraStyle }}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block' }} />
        ) : (
          <motion.span key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icon && <Icon size={16} />}
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── ANIMATED INPUT ───────────────────────────────────────
export function AnimatedInput({ icon: Icon, label, type = 'text', value, onChange, error, placeholder, required, name }) {
  const [focused, setFocused] = useState(false);
  const hasVal = value?.length > 0;
  const active = focused || hasVal;
  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      {active && label && (
        <motion.label initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', top: -20, left: 0, fontSize: 11, fontWeight: 700, color: focused ? '#7C3AED' : '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', pointerEvents: 'none' }}>
          {label}
        </motion.label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#7C3AED' : '#6E6893', transition: 'color 0.25s', pointerEvents: 'none', zIndex: 1 }} />
        )}
        <input type={type} value={value} onChange={onChange} required={required} name={name}
          placeholder={!active && label ? label : placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', height: 52, background: focused ? '#362F5E' : '#2D2653',
            border: `1.5px solid ${error ? '#F87171' : focused ? '#7C3AED' : '#433B72'}`,
            borderRadius: 14, paddingLeft: Icon ? 44 : 16, paddingRight: 16,
            color: '#F1F0F7', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
            boxShadow: error ? '0 0 0 3px rgba(248,113,113,0.2)' : focused ? '0 0 0 3px rgba(124,58,237,0.3)' : 'none',
            transition: 'all 0.25s ease',
          }}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: '#F87171', marginTop: 4 }}>{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
