// src/pages/RegisterPage.js
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Smartphone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuroraBackground from '../components/ui/AuroraBackground';
import { AnimatedInput, GradientButton, GradientText } from '../components/ui/UIKit';
import api from '../utils/api';

const sp = { type: 'spring', stiffness: 300, damping: 28 };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, phone: val });
  };

  const handle = async (e) => {
    e.preventDefault();
    if (submitting.current) return; // hard lock against double-submit
    if (form.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    submitting.current = true;
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', { ...form });
      toast.success('Account created!');
      navigate('/verify-otp', { state: { phone: form.phone } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
      submitting.current = false;
    }
  };

  const fields = [
    { key: 'name',     icon: User,       label: 'Full Name', type: 'text',     placeholder: 'Arjun Sharma' },
    { key: 'email',    icon: Mail,       label: 'Email',     type: 'email',    placeholder: 'you@email.com' },
    { key: 'password', icon: Lock,       label: 'Password',  type: 'password', placeholder: 'Min 8 characters' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0F0B21', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative' }}>
      <AuroraBackground intensity="full" />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 22 }}
          style={{ background: 'rgba(26,21,53,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 24, padding: window.innerWidth < 768 ? 24 : 36 }}>

          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
              <GradientText gradient="purple-teal">SideKick</GradientText>
            </h1>
            <p style={{ color: '#A8A3C7', fontSize: 14, marginTop: 4 }}>Create your account</p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#F87171', fontSize: 13, fontWeight: 500 }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {fields.map(({ key, icon, label, type, placeholder }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay: 0.08 * i + 0.2 }}>
                <AnimatedInput icon={icon} label={label} type={type} placeholder={placeholder}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
              </motion.div>
            ))}

            {/* Phone field - strictly 10 digits */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay: 0.08 * 2 + 0.2 }}>
              <AnimatedInput icon={Smartphone} label="Phone" type="tel" placeholder="10-digit mobile number"
                value={form.phone} onChange={handlePhoneChange} required />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingLeft: 4 }}>
                <span style={{ fontSize: 11, color: '#6E6893' }}>Only digits, no spaces or symbols</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: form.phone.length === 10 ? '#34D399' : '#6E6893' }}>
                  {form.phone.length}/10
                </span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <GradientButton type="submit" loading={loading} fullWidth>Create Account</GradientButton>
            </motion.div>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#6E6893', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2DD4BF', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
