import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, X, Check } from 'lucide-react';
import AnimatedInput from './AnimatedInput';
import GradientButton from './GradientButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function LoginFormCard({
  onSubmit, loading, error, emailValue, passwordValue,
  onEmailChange, onPasswordChange,
}) {
  const [loginMode, setLoginMode] = useState('email');
  const [phone, setPhone] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('rememberedEmail'));
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // ── All original logic preserved ──────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginMode === 'email') {
      if (remember) localStorage.setItem('rememberedEmail', emailValue);
      else localStorage.removeItem('rememberedEmail');
      onSubmit(e, { email: emailValue, password: passwordValue });
    } else {
      onSubmit(e, { phone, password: passwordValue });
    }
  };

  const handleForgot = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const isPhone = /^[\d\+\s]{10,15}$/.test(forgotEmail.trim());
      if (isPhone) {
        await api.post('/auth/resend-otp', { phone: forgotEmail.trim() });
      } else {
        await api.post('/auth/resend-otp-email', { email: forgotEmail.trim() });
      }
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally { setForgotLoading(false); }
  };
  // ──────────────────────────────────────────────────────────

  return (
    <>
      {/*
        ── LAYOUT: Open, frameless, no outer card ──
        The form floats directly on the page background.
        Only inputs have subtle surface treatment.
      */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.08 }}
        style={{ width: '100%', maxWidth: 400 }}
      >

        {/* ── Heading ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1.15,
          }}>
            Welcome back
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.38)', fontSize: 14,
            marginTop: 8, fontWeight: 400, letterSpacing: '0.01em',
          }}>
            Sign in to find your SideKick
          </p>
        </div>

        {/* ── Mode toggle ── */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12, padding: 3,
          marginBottom: 24,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {['email', 'phone'].map(mode => (
            <motion.button
              key={mode} type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setLoginMode(mode)}
              style={{
                flex: 1, height: 38, borderRadius: 9, border: 'none',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                fontSize: 13, fontWeight: 600,
                background: loginMode === mode
                  ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)'
                  : 'transparent',
                color: loginMode === mode ? '#fff' : 'rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: loginMode === mode ? '0 2px 12px rgba(139,92,246,0.3)' : 'none',
                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
              }}
            >
              {mode === 'email' ? <Mail size={13} /> : <Phone size={13} />}
              {mode === 'email' ? 'Email' : 'Mobile'}
            </motion.button>
          ))}
        </div>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: 10, padding: '10px 14px',
                marginBottom: 18, color: '#F87171',
                fontSize: 13, fontWeight: 500,
              }}
            >
              {error}
              {(error.includes('register') || error.includes('No account')) && (
                <Link to="/register" style={{
                  display: 'block', marginTop: 6,
                  color: '#8B5CF6', fontWeight: 700,
                  textDecoration: 'none', fontSize: 13,
                }}>
                  Create an account →
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email / Phone field */}
          <AnimatePresence mode="wait">
            {loginMode === 'email' ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
              >
                <AnimatedInput
                  label="Email address" type="email"
                  value={emailValue} onChange={onEmailChange}
                  icon={Mail} placeholder="you@email.com" required
                />
              </motion.div>
            ) : (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <AnimatedInput
                  label="Mobile number" type="tel"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  icon={Phone} placeholder="+91 98765 43210" required
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password field */}
          <AnimatedInput
            label="Password" type="password"
            value={passwordValue} onChange={onPasswordChange}
            icon={Lock} placeholder="••••••••" required
          />

          {/* Remember + Forgot row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <motion.div
                whileTap={{ scale: 0.82 }}
                onClick={() => setRemember(r => !r)}
                style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: `1.5px solid ${remember ? '#8B5CF6' : 'rgba(255,255,255,0.18)'}`,
                  background: remember ? '#8B5CF6' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s', cursor: 'pointer', flexShrink: 0,
                }}
              >
                {remember && <Check size={11} color="white" strokeWidth={3} />}
              </motion.div>
              <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13 }}>Remember me</span>
            </label>

            <motion.button
              type="button" whileTap={{ scale: 0.95 }}
              onClick={() => setShowForgot(true)}
              style={{
                background: 'none', border: 'none',
                color: 'rgba(139,92,246,0.9)', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Forgot password?
            </motion.button>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 8 }}>
            <GradientButton type="submit" loading={loading}>
              Sign In
            </GradientButton>
          </div>
        </form>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, letterSpacing: '0.04em' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* ── Google button ── */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => toast('Google Sign-In is not available yet. Please use email or mobile login.')}
          style={{
            width: '100%', height: 46, borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 35.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41.1 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-3.9z"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* ── Sign up link ── */}
        <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
          New here?{' '}
          <Link
            to="/register"
            style={{
              color: '#8B5CF6', fontWeight: 700,
              textDecoration: 'none',
              borderBottom: '1px solid rgba(139,92,246,0.35)',
              paddingBottom: 1,
            }}
          >
            Create account
          </Link>
        </p>

      </motion.div>

      {/* ── Forgot Password Modal ── */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(6px)',
              zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.93, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.93, y: 8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 360,
                background: '#0E1320',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '28px 24px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Reset Password</h3>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={15} color="rgba(255,255,255,0.5)" />
                </motion.button>
              </div>

              {!forgotSent ? (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                    Enter your registered email or mobile number and we'll send you a reset OTP.
                  </p>
                  <input
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="Email or mobile number"
                    type="text"
                    style={{
                      width: '100%', height: 46,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 11, padding: '0 14px',
                      color: '#fff', fontSize: 14,
                      fontFamily: 'Inter, sans-serif', outline: 'none',
                      marginBottom: 14,
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleForgot}
                    disabled={forgotLoading || !forgotEmail}
                    style={{
                      width: '100%', height: 46,
                      background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                      border: 'none', borderRadius: 11,
                      color: '#fff', fontSize: 14, fontWeight: 600,
                      cursor: forgotEmail ? 'pointer' : 'not-allowed',
                      fontFamily: 'Inter, sans-serif',
                      opacity: !forgotEmail ? 0.45 : 1,
                      boxShadow: forgotEmail ? '0 4px 20px rgba(139,92,246,0.3)' : 'none',
                      transition: 'opacity 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {forgotLoading ? 'Sending…' : 'Send Reset OTP'}
                  </motion.button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <Check size={22} color="#22C55E" strokeWidth={2.5} />
                  </motion.div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>OTP Sent!</p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>
                    Check your email for the OTP. Use it on the Verify OTP page.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                    style={{
                      marginTop: 18, height: 40, padding: '0 28px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, color: 'rgba(255,255,255,0.7)',
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
