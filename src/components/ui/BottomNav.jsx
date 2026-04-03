// src/components/ui/BottomNav.jsx
import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Sparkles, MessageCircle, Map, User } from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: Home,           label: 'Home',    center: false },
  { to: '/match',     icon: Sparkles,        label: 'Match',   center: false },
  { to: '/map',       icon: Map,             label: 'Map',     center: true  },
  { to: '/chats',     icon: MessageCircle,   label: 'Chats',   center: false },
  { to: '/profile',   icon: User,            label: 'Profile', center: false },
];

const BottomNav = memo(function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      height: 64,
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(15,11,33,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid #2D2653',
      display: 'flex', alignItems: 'flex-end',
      maxWidth: 480, margin: '0 auto',
    }}>
      {NAV.map(({ to, icon: Icon, label, center }) => (
        <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
          {({ isActive }) =>
            center ? (
              /* ── Map: raised center pill ── */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 10 }}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  style={{
                    width: 52, height: 52,
                    borderRadius: 16,
                    background: isActive
                      ? 'linear-gradient(135deg, #7C3AED, #2DD4BF)'
                      : 'linear-gradient(135deg, #2D2653, #1A1535)',
                    border: isActive ? 'none' : '1.5px solid #433B72',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2,
                    boxShadow: isActive ? '0 4px 20px rgba(124,58,237,0.45)' : '0 2px 8px rgba(0,0,0,0.4)',
                    transform: 'translateY(-14px)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={22} color={isActive ? '#fff' : '#6E6893'} strokeWidth={isActive ? 2 : 1.5} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? '#fff' : '#6E6893', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {label}
                  </span>
                </motion.div>
              </div>
            ) : (
              /* ── Regular nav item ── */
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, paddingTop: 10, paddingBottom: 10, cursor: 'pointer' }}
              >
                <Icon size={20} color={isActive ? '#2DD4BF' : '#6E6893'} strokeWidth={isActive ? 2 : 1.5} />
                <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? '#2DD4BF' : '#6E6893', letterSpacing: '0.02em' }}>
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    style={{ width: 4, height: 4, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', marginTop: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
});

export default BottomNav;
