// src/pages/VerifyOtpPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';
import { GradientButton, GradientText } from '../components/ui/UIKit';
import { OnboardingCard, StepIcon, OTPInput, ProgressBar } from '../components/onboarding/OnboardingKit';
import api from '../utils/api';

export default function VerifyOtpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const submit = async () => {
    if (otp.length !== 6) return setError('Enter all 6 digits');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp });
      login(data.accessToken, data.user);
      toast.success('Phone verified!');
      navigate('/verify-id');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    await api.post('/auth/resend-otp', { phone });
    setCountdown(60); setError(''); setOtp('');
    toast.success('OTP resent!');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F0B21', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AuroraBackground intensity="subtle" />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProgressBar currentStep={1} totalSteps={5} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
          <OnboardingCard>
            <StepIcon icon={Smartphone} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F1F0F7', textAlign: 'center', letterSpacing: '-0.02em' }}>Verify your phone</h2>
            <p style={{ fontSize: 14, color: '#A8A3C7', textAlign: 'center', marginTop: 6 }}>
              Enter the 6-digit code sent to{' '}
              <span style={{ color: '#F1F0F7', fontWeight: 600 }}>{phone}</span>
            </p>

            <OTPInput length={6} value={otp} onChange={setOtp} error={error} />

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: '#F87171', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</motion.p>
            )}

            <GradientButton onClick={submit} loading={loading} fullWidth>Verify</GradientButton>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 14, color: '#6E6893' }}>Didn't receive it? </span>
              {countdown > 0 ? (
                <span style={{ fontSize: 14, color: '#4A4570' }}>Resend ({countdown}s)</span>
              ) : (
                <button onClick={resend} style={{ background: 'none', border: 'none', color: '#2DD4BF', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Resend</button>
              )}
            </div>

            <div style={{ marginTop: 16, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} color="#FBBF24" />
              <span style={{ fontSize: 13, color: '#FBBF24' }}>Check server console for OTP</span>
            </div>
          </OnboardingCard>
        </div>
      </div>
    </div>
  );
}
