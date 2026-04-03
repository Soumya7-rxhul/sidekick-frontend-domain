import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, X } from 'lucide-react';
import AnimatedInput from './AnimatedInput';
import GradientButton from './GradientButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function LoginFormCard({
  onSubmit, loading, error, emailValue, passwordValue,
  onEmailChange, onPasswordChange,
}) {
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'phone'
  const [phone, setPhone] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('rememberedEmail'));
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

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
      // Try email first, then phone
      const isPhone = /^[\d\+\s]{10,15}$/.test(forgotEmail.trim());
      if (isPhone) {
        await api.post('/auth/resend-otp', { phone: forgotEmail.trim() });
      } else {
        // Find user by email and resend OTP via their phone
        await api.post('/auth/resend-otp-email', { email: forgotEmail.trim() });
      }
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally { setForgotLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }}
      style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '40px 36px', position: 'relative', zIndex: 20 }}
    >
      <style>{`
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 30px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.2); }
          33%      { box-shadow: 0 0 30px rgba(6,182,212,0.15),  0 0 0 1px rgba(6,182,212,0.2); }
          66%      { box-shadow: 0 0 30px rgba(255,107,107,0.15),0 0 0 1px rgba(255,107,107,0.2); }
        }
        .signup-link { position: relative; display: inline-block; }
        .signup-link::after { content: ''; position: absolute; bottom: -1px; left: 0; height: 1px; background: linear-gradient(to right, #8B5CF6, #FF6B6B); width: 0; transition: width 0.3s ease; }
        .signup-link:hover::after { width: 100%; }
        .form-card-inner { animation: borderGlow 8s ease-in-out infinite; border-radius: 24px; }
      `}</style>

      <div className="form-card-inner" style={{ borderRadius: 24 }}>
        {/* Title */}
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Welcome Back</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>Sign in to find your SideKick</p>
        </div>

        {/* Login mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
          {['email', 'phone'].map(mode => (
            <motion.button key={mode} type="button" whileTap={{ scale: 0.97 }} onClick={() => setLoginMode(mode)}
              style={{ flex: 1, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: loginMode === mode ? 'linear-gradient(135deg,#8B5CF6,#06B6D4)' : 'transparent', color: loginMode === mode ? 'white' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {mode === 'email' ? <Mail size={14} /> : <Phone size={14} />}
              {mode === 'email' ? 'Email' : 'Mobile'}
            </motion.button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#FF6B6B', fontSize: 13, fontWeight: 500 }}>
              {error}
              {(error.includes('register') || error.includes('No account')) && (
                <Link to="/register" style={{ display: 'block', marginTop: 6, color: '#8B5CF6', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
                  Create an account
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait">
            {loginMode === 'email' ? (
              <motion.div key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <AnimatedInput label="Email address" type="email" value={emailValue} onChange={onEmailChange} icon={Mail} placeholder="you@email.com" required />
              </motion.div>
            ) : (
              <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <AnimatedInput label="Mobile number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} icon={Phone} placeholder="+91 98765 43210" required />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatedInput label="Password" type="password" value={passwordValue} onChange={onPasswordChange} icon={Lock} placeholder="••••••••" required />

          {/* Remember + Forgot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setLoginMode === 'email' && setRemember(r => !r)}>
              <motion.div whileTap={{ scale: 0.85 }} onClick={() => setRemember(r => !r)}
                style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${remember ? '#8B5CF6' : 'rgba(255,255,255,0.2)'}`, background: remember ? '#8B5CF6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
                {remember && <span style={{ color: 'white', fontSize: 11, fontWeight: 900 }}>✓</span>}
              </motion.div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Remember me</span>
            </label>
            <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => setShowForgot(true)}
              style={{ background: 'none', border: 'none', color: '#8B5CF6', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Forgot password?
            </motion.button>
          </div>

          <div style={{ marginTop: 4 }}>
            <GradientButton type="submit" loading={loading}>Sign In</GradientButton>
          </div>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Google */}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          onClick={() => toast('Google Sign-In is not available yet. Please use email or mobile login.')}
          style={{ width: '100%', height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 35.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41.1 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-3.9z"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Sign up */}
        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          New here?{' '}
          <Link to="/register" className="signup-link" style={{ background: 'linear-gradient(135deg, #8B5CF6, #FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 360, background: 'rgba(20,15,40,0.98)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(139,92,246,0.2)', padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>Reset Password</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                  style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color="rgba(255,255,255,0.6)" />
                </motion.button>
              </div>
              {!forgotSent ? (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>Enter your registered email or mobile number and we will send you a reset OTP.</p>
                  <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Email or mobile number" type="text"
                    style={{ width: '100%', height: 44, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0 14px', color: 'white', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: 6 }} />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 14 }}>e.g. you@email.com or +919876543210</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleForgot} disabled={forgotLoading || !forgotEmail}
                    style={{ width: '100%', height: 44, background: 'linear-gradient(135deg,#8B5CF6,#06B6D4)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: !forgotEmail ? 0.5 : 1 }}>
                    {forgotLoading ? 'Sending...' : 'Send Reset OTP'}
                  </motion.button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <span style={{ color: '#34D399', fontSize: 16, fontWeight: 700 }}>Sent</span>
                  </div>
                  <p style={{ color: 'white', fontWeight: 600, marginBottom: 8 }}>OTP Sent!</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Check your email for the OTP. Use it on the Verify OTP page.</p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                    style={{ marginTop: 16, height: 40, padding: '0 24px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Close</motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
