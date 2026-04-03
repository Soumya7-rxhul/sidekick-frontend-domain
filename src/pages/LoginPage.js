import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import MeshBackground  from '../components/auth/MeshBackground';
import ScooterEntrance from '../components/auth/ScooterEntrance';
import LoginFormCard   from '../components/auth/LoginFormCard';
import FloatingIcons   from '../components/auth/FloatingIcons';

// Stagger letters for "SideKick" — preserved exactly
const TITLE = 'SideKick'.split('');

export default function LoginPage() {
  // ── All original state & logic preserved ──────────────────
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const scooterCtrl  = useAnimation();

  const [settled,   setSettled]   = useState(false);
  const [email,     setEmail]     = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [celebrate, setCelebrate] = useState(false);

  const headlightBright = email.length > 0;
  const ridersLean      = password.length > 0;

  const handleSubmit = useCallback(async (e, loginData) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', loginData);
      setCelebrate(true);
      await new Promise(r => setTimeout(r, 600));
      await scooterCtrl.start({ x: '110vw', transition: { duration: 0.8, ease: [0.4, 0, 1, 1] } });
      login(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      await scooterCtrl.start({ x: [-10, 10, -10, 10, -6, 6, 0], transition: { duration: 0.5, ease: 'easeInOut' } });
    } finally {
      setLoading(false);
    }
  }, [login, navigate, scooterCtrl]);
  // ──────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Layer 1+2: Background (unchanged) ── */}
      <MeshBackground />

      {/* ── Layer 3: Floating icons (unchanged) ── */}
      <FloatingIcons visible={settled} />

      {/* ── Layer 4: Page content ── */}
      <div style={{
        position: 'relative', zIndex: 20,
        width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        /* Generous top padding so scooter has room to breathe */
        paddingTop: 40, paddingBottom: 56,
        minHeight: '100vh',
      }}>

        {/* ── Scooter (unchanged) ── */}
        <motion.div
          animate={scooterCtrl}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 4 }}
        >
          <ScooterEntrance
            onComplete={() => setSettled(true)}
            headlightBright={headlightBright}
            ridersLean={ridersLean}
            celebrate={celebrate}
          />
        </motion.div>

        {/* ── Brand title — letter stagger (unchanged) ── */}
        <AnimatePresence>
          {settled && (
            <motion.div style={{ textAlign: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {TITLE.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.32, ease: 'easeOut' }}
                    style={{
                      fontSize: 40, fontWeight: 900,
                      letterSpacing: '-0.03em',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #FF6B6B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1,
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52, duration: 0.38 }}
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: 14, marginTop: 8,
                  fontWeight: 400, letterSpacing: '0.01em',
                }}
              >
                Never go alone. Find your SideKick.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/*
          ── Form area ──────────────────────────────────────────
          NO card wrapper. NO background. NO border.
          The form floats directly on the page.
          Only the inputs themselves have a subtle surface.
        */}
        <AnimatePresence>
          {settled && (
            <div style={{
              width: '100%', maxWidth: 400,
              padding: '0 24px',
              marginTop: 28,
            }}>
              <LoginFormCard
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                emailValue={email}
                passwordValue={password}
                onEmailChange={e => setEmail(e.target.value)}
                onPasswordChange={e => setPassword(e.target.value)}
              />
            </div>
          )}
        </AnimatePresence>

      </div>

      {/* Global input overrides */}
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.22) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(255,255,255,0.04) inset !important;
          -webkit-text-fill-color: white !important;
        }
        @media (max-width: 768px) {
          .scooter-svg { transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
