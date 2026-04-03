import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import MeshBackground    from '../components/auth/MeshBackground';
import ScooterEntrance   from '../components/auth/ScooterEntrance';
import LoginFormCard     from '../components/auth/LoginFormCard';
import FloatingIcons     from '../components/auth/FloatingIcons';

// Stagger letters for "SideKick"
const TITLE = 'SideKick'.split('');

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const scooterCtrl = useAnimation();

  const [settled,   setSettled]   = useState(false);
  const [email,     setEmail]     = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [celebrate, setCelebrate] = useState(false);

  // Micro-interaction: headlight brightens when email has value
  const headlightBright = email.length > 0;
  // Micro-interaction: riders lean when password has value
  const ridersLean = password.length > 0;

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

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* Layer 1+2: Background */}
      <MeshBackground />

      {/* Layer 3: Floating icons (appear after settled) */}
      <FloatingIcons visible={settled} />

      {/* Layer 4: Content */}
      <div style={{ position: 'relative', zIndex: 20, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, paddingBottom: 40, minHeight: '100vh' }}>

        {/* ── SCOOTER SECTION ── */}
        <motion.div animate={scooterCtrl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
          <ScooterEntrance
            onComplete={() => setSettled(true)}
            headlightBright={headlightBright}
            ridersLean={ridersLean}
            celebrate={celebrate}
          />
        </motion.div>

        {/* ── TITLE (letter-by-letter stagger) ── */}
        <AnimatePresence>
          {settled && (
            <motion.div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {TITLE.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
                    style={{
                      fontSize: 42,
                      fontWeight: 900,
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 6, fontWeight: 400, letterSpacing: '0.01em' }}
              >
                Never go alone. Find your SideKick.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FORM CARD ── */}
        <AnimatePresence>
          {settled && (
            <div style={{ width: '100%', maxWidth: 420, padding: '0 16px', marginTop: 24 }}>
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

      {/* Global styles for placeholder color */}
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(255,255,255,0.05) inset !important;
          -webkit-text-fill-color: white !important;
        }
        @media (max-width: 768px) {
          .scooter-svg { transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
