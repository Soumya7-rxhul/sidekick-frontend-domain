import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Home' },
  { to: '/match',     icon: '✦', label: 'Match' },
  { to: '/events',    icon: '◈', label: 'Events' },
  { to: '/chats',     icon: '◉', label: 'Chats' },
  { to: '/profile',   icon: '◎', label: 'Profile' },
];

export default function Layout({ children }) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const mainRef = React.useRef();

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {/* Top bar */}
      <motion.header
        animate={{ backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)', background: scrolled ? 'rgba(8,8,16,0.85)' : 'transparent' }}
        transition={{ duration: 0.3 }}
        style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`, position: 'sticky', top: 0, zIndex: 50 }}
      >
        <motion.span
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}
        >
          SideKick
        </motion.span>
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {user?.isIdVerified   && <span className="badge badge-verified">✓ ID</span>}
          {user?.isFaceVerified && <span className="badge badge-verified">✓ Face</span>}
        </motion.div>
      </motion.header>

      {/* Content */}
      <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {children}
      </main>

      {/* Bottom nav */}
      <nav style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,16,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', position: 'sticky', bottom: 0, zIndex: 50 }}>
        {NAV.map(({ to, icon, label }, i) => (
          <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.88 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 8px', gap: 3, cursor: 'pointer' }}
              >
                <motion.span
                  animate={{ color: isActive ? '#7c6fff' : '#4a4a70', scale: isActive ? 1.15 : 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontSize: 18, lineHeight: 1 }}
                >
                  {icon}
                </motion.span>
                <motion.span
                  animate={{ color: isActive ? '#7c6fff' : '#4a4a70' }}
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                >
                  {label}
                </motion.span>
                {isActive && (
                  <motion.div layoutId="nav-indicator"
                    style={{ position: 'absolute', bottom: 0, width: 32, height: 2, background: 'var(--primary)', borderRadius: '2px 2px 0 0' }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
