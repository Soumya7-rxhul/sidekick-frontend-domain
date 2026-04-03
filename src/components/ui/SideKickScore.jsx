import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, CheckCircle, Users, Award } from 'lucide-react';
import api from '../../utils/api';

const BADGE_STYLES = {
  Gold:    { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  color: '#FBBF24' },
  Silver:  { bg: 'rgba(168,163,199,0.15)', border: 'rgba(168,163,199,0.3)', color: '#A8A3C7' },
  Bronze:  { bg: 'rgba(251,146,60,0.15)',  border: 'rgba(251,146,60,0.3)',  color: '#FB923C' },
  Starter: { bg: 'rgba(110,104,147,0.15)', border: 'rgba(110,104,147,0.3)', color: '#6E6893' },
};

const ICONS = { safety: Shield, rating: Star, verification: CheckCircle, activity: Users, profile: Award };

export default function SideKickScore({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = userId ? `/meetups/score/${userId}` : '/meetups/score';
    api.get(url).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', padding: 20, marginBottom: 12 }}>
      <div style={{ height: 16, background: '#2D2653', borderRadius: 8, width: '60%', marginBottom: 12 }} />
      <div style={{ height: 60, background: '#2D2653', borderRadius: 12 }} />
    </div>
  );

  if (!data) return null;

  const { score, badge, breakdown } = data;
  const badgeStyle = BADGE_STYLES[badge];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 20, marginBottom: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>SideKick Score</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '3px 12px', borderRadius: 20, background: badgeStyle.bg, border: `1px solid ${badgeStyle.border}`, color: badgeStyle.color, fontSize: 12, fontWeight: 700 }}>{badge}</span>
        </div>
      </div>

      {/* Score circle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#2D2653" strokeWidth="6" />
            <motion.circle cx="36" cy="36" r="30" fill="none" stroke="url(#scoreGrad)" strokeWidth="6"
              strokeLinecap="round" transform="rotate(-90 36 36)"
              initial={{ strokeDasharray: `0 ${2 * Math.PI * 30}` }}
              animate={{ strokeDasharray: `${(score / 100) * 2 * Math.PI * 30} ${2 * Math.PI * 30}` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#2DD4BF" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#F1F0F7' }}>{score}</span>
          </div>
        </div>
        <div>
          <p style={{ color: '#F1F0F7', fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Your SideKick Score</p>
          <p style={{ color: '#6E6893', fontSize: 12, margin: 0 }}>Based on safety, ratings, verifications & activity</p>
          {breakdown.rating?.totalReviews > 0 && (
            <p style={{ color: '#FBBF24', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>
              {breakdown.rating.avgRating} avg rating from {breakdown.rating.totalReviews} review{breakdown.rating.totalReviews > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(breakdown).map(([key, val]) => {
          const Icon = ICONS[key];
          const pct = Math.round((val.points / val.max) * 100);
          const color = pct >= 80 ? '#34D399' : pct >= 50 ? '#FBBF24' : '#F87171';
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {Icon && <Icon size={12} color="#6E6893" />}
                  <span style={{ fontSize: 12, color: '#A8A3C7' }}>{val.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{val.points}/{val.max}</span>
              </div>
              <div style={{ height: 4, background: '#2D2653', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                  style={{ height: '100%', background: color, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>

      {score < 100 && (
        <p style={{ fontSize: 11, color: '#6E6893', marginTop: 12, textAlign: 'center' }}>
          Complete your profile, get verified and collect reviews to improve your score!
        </p>
      )}
    </motion.div>
  );
}
