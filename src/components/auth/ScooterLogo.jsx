import React from 'react';
import { motion } from 'framer-motion';

export default function ScooterLogo({
  scale = 1,
  headlightBright = false,
  ridersLean = false,
  celebrate = false,
  isRiding = false,
}) {
  const lean = ridersLean ? -3 : 0;

  return (
    <svg
      width={280 * scale}
      height={160 * scale}
      viewBox="0 0 280 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Scooter body gradient */}
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        {/* Wheel gradient */}
        <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </radialGradient>
        {/* Headlight glow */}
        <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity={headlightBright ? 1 : 0.7} />
          <stop offset="60%" stopColor="#FBBF24" stopOpacity={headlightBright ? 0.6 : 0.3} />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
        {/* Tire */}
        <radialGradient id="tireGrad" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#111827" />
          <stop offset="100%" stopColor="#374151" />
        </radialGradient>
      </defs>

      {/* ── ROAD LINE ── */}
      <motion.line
        x1="10" y1="138" x2="270" y2="138"
        stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="16 10"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {/* ── HEADLIGHT GLOW (behind scooter) ── */}
      <ellipse cx="52" cy="108" rx={headlightBright ? 32 : 22} ry={headlightBright ? 18 : 12}
        fill="url(#headlightGlow)"
        style={{ transition: 'all 0.4s ease' }}
      />

      {/* ── FRONT WHEEL ── */}
      <motion.g
        animate={isRiding ? { rotate: 360 } : { rotate: 0 }}
        transition={isRiding ? { duration: 0.4, repeat: Infinity, ease: 'linear' } : {}}
        style={{ originX: '58px', originY: '124px' }}
      >
        <circle cx="58" cy="124" r="22" fill="url(#tireGrad)" stroke="#374151" strokeWidth="3" />
        <circle cx="58" cy="124" r="14" fill="url(#wheelGrad)" />
        {/* Spokes */}
        {[0, 45, 90, 135].map(angle => (
          <line key={angle}
            x1={58 + 4 * Math.cos(angle * Math.PI / 180)}
            y1={124 + 4 * Math.sin(angle * Math.PI / 180)}
            x2={58 + 13 * Math.cos(angle * Math.PI / 180)}
            y2={124 + 13 * Math.sin(angle * Math.PI / 180)}
            stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"
          />
        ))}
        <circle cx="58" cy="124" r="4" fill="#9CA3AF" />
      </motion.g>

      {/* ── REAR WHEEL ── */}
      <motion.g
        animate={isRiding ? { rotate: 360 } : { rotate: 0 }}
        transition={isRiding ? { duration: 0.4, repeat: Infinity, ease: 'linear' } : {}}
        style={{ originX: '210px', originY: '124px' }}
      >
        <circle cx="210" cy="124" r="24" fill="url(#tireGrad)" stroke="#374151" strokeWidth="3" />
        <circle cx="210" cy="124" r="15" fill="url(#wheelGrad)" />
        {[0, 45, 90, 135].map(angle => (
          <line key={angle}
            x1={210 + 4 * Math.cos(angle * Math.PI / 180)}
            y1={124 + 4 * Math.sin(angle * Math.PI / 180)}
            x2={210 + 14 * Math.cos(angle * Math.PI / 180)}
            y2={124 + 14 * Math.sin(angle * Math.PI / 180)}
            stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"
          />
        ))}
        <circle cx="210" cy="124" r="4" fill="#9CA3AF" />
      </motion.g>

      {/* ── SCOOTER BODY ── */}
      {/* Main body */}
      <path d="M70 118 Q80 90 110 85 L190 85 Q220 85 225 100 L228 118 Z"
        fill="url(#bodyGrad)" stroke="#1a1a2e" strokeWidth="2" />
      {/* Front fairing */}
      <path d="M70 118 Q65 105 68 95 Q72 82 85 80 L110 80 Q100 85 95 100 L80 118 Z"
        fill="#7C3AED" stroke="#1a1a2e" strokeWidth="2" />
      {/* Seat */}
      <path d="M115 82 Q140 72 185 74 Q195 74 195 80 L185 84 Q155 78 115 86 Z"
        fill="#5B21B6" stroke="#1a1a2e" strokeWidth="1.5" />
      {/* Footboard */}
      <rect x="90" y="116" width="120" height="8" rx="4" fill="#6D28D9" stroke="#1a1a2e" strokeWidth="1.5" />
      {/* Fender front */}
      <path d="M48 108 Q52 96 62 94 Q70 93 72 100 L68 108 Z"
        fill="#7C3AED" stroke="#1a1a2e" strokeWidth="1.5" />
      {/* Fender rear */}
      <path d="M196 100 Q210 92 222 96 L228 108 L210 108 Z"
        fill="#7C3AED" stroke="#1a1a2e" strokeWidth="1.5" />

      {/* ── HANDLEBAR ── */}
      <line x1="72" y1="88" x2="72" y2="72" stroke="#4B5563" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="72" x2="84" y2="72" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
      {/* Mirrors */}
      <rect x="56" y="68" width="8" height="5" rx="2" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
      <rect x="80" y="68" width="8" height="5" rx="2" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />

      {/* ── HEADLIGHT ── */}
      <circle cx="52" cy="100" r="7" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="52" cy="100" r="4" fill="#FDE68A" />

      {/* ── EXHAUST PIPE ── */}
      <path d="M222 112 Q235 110 240 115 Q242 118 238 120 L222 120 Z"
        fill="#4B5563" stroke="#374151" strokeWidth="1.5" />

      {/* ── LICENSE PLATE ── */}
      <rect x="196" y="108" width="28" height="14" rx="3" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1" />
      <text x="210" y="118" textAnchor="middle" fontSize="5" fill="#374151" fontFamily="monospace" fontWeight="bold">SK-2025</text>

      {/* ── SKID MARKS (shown after brake) ── */}

      {/* ══════════════════════════════════════════════════════
          RIDER 1 — DRIVER (front, leaning forward)
      ══════════════════════════════════════════════════════ */}
      <motion.g animate={{ rotate: lean - 5 }} style={{ originX: '130px', originY: '100px' }} transition={{ duration: 0.3 }}>
        {/* Body */}
        <ellipse cx="130" cy="92" rx="12" ry="16" fill="#4F46E5" stroke="#1a1a2e" strokeWidth="1.5" />
        {/* Helmet */}
        <circle cx="130" cy="72" r="14" fill="#06B6D4" stroke="#1a1a2e" strokeWidth="2" />
        <path d="M118 74 Q130 68 142 74" stroke="#0891B2" strokeWidth="2" fill="none" />
        {/* Visor */}
        <path d="M120 76 Q130 72 140 76 L140 80 Q130 77 120 80 Z" fill="#0E7490" opacity="0.7" />
        {/* Face */}
        <circle cx="126" cy="74" r="1.5" fill="#1a1a2e" />
        <circle cx="134" cy="74" r="1.5" fill="#1a1a2e" />
        <path d="M126 79 Q130 82 134 79" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Arms on handlebar */}
        <line x1="122" y1="90" x2="108" y2="82" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
        <line x1="138" y1="90" x2="108" y2="82" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
        {/* Legs */}
        <line x1="124" y1="106" x2="118" y2="118" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
        <line x1="136" y1="106" x2="130" y2="118" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
      </motion.g>

      {/* ══════════════════════════════════════════════════════
          RIDER 2 — PASSENGER (back, arm raised)
      ══════════════════════════════════════════════════════ */}
      <motion.g animate={{ rotate: lean }} style={{ originX: '162px', originY: '100px' }} transition={{ duration: 0.3 }}>
        {/* Body */}
        <ellipse cx="162" cy="90" rx="12" ry="16" fill="#EC4899" stroke="#1a1a2e" strokeWidth="1.5" />
        {/* Helmet */}
        <circle cx="162" cy="70" r="14" fill="#FF6B6B" stroke="#1a1a2e" strokeWidth="2" />
        <path d="M150 72 Q162 66 174 72" stroke="#EF4444" strokeWidth="2" fill="none" />
        {/* Visor */}
        <path d="M152 74 Q162 70 172 74 L172 78 Q162 75 152 78 Z" fill="#DC2626" opacity="0.7" />
        {/* Face */}
        <circle cx="158" cy="72" r="1.5" fill="#1a1a2e" />
        <circle cx="166" cy="72" r="1.5" fill="#1a1a2e" />
        <path d="M157 77 Q162 81 167 77" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Raised arm (excitement) */}
        <motion.g
          animate={celebrate
            ? { rotate: [0, -20, 20, -20, 0] }
            : { rotate: [0, -8, 8, 0] }
          }
          transition={celebrate
            ? { duration: 0.5, repeat: 3 }
            : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ originX: '174px', originY: '86px' }}
        >
          <line x1="174" y1="86" x2="182" y2="62" stroke="#EC4899" strokeWidth="5" strokeLinecap="round" />
          {/* Hand */}
          <circle cx="183" cy="59" r="5" fill="#FBBF24" stroke="#1a1a2e" strokeWidth="1.5" />
        </motion.g>

        {/* Other arm holding driver */}
        <line x1="150" y1="88" x2="140" y2="94" stroke="#EC4899" strokeWidth="5" strokeLinecap="round" />

        {/* Hair blowing back */}
        <path d="M150 66 Q140 60 132 58" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M150 70 Q139 66 130 66" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M151 74 Q141 72 133 73" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Legs */}
        <line x1="156" y1="104" x2="150" y2="116" stroke="#EC4899" strokeWidth="5" strokeLinecap="round" />
        <line x1="168" y1="104" x2="162" y2="116" stroke="#EC4899" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
