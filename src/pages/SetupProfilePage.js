// src/pages/SetupProfilePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';
import { GradientButton, SelectableChip } from '../components/ui/UIKit';
import { OnboardingCard, ProgressBar } from '../components/onboarding/OnboardingKit';
import api from '../utils/api';

const INTERESTS = ['Movies','Cricket','Football','Food','Music','Books','Gaming','Adventure','Coffee','Travel','Dancing','Art'];
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SLOTS = ['Morning','Afternoon','Evening','Night'];
const VIBES = ['Adventurer','Foodie','Planner','Socialite','Chill One','Go-Getter'];

const sp = { type: 'spring', stiffness: 300, damping: 28 };

export default function SetupProfilePage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ age: '', gender: '', bio: '', city: '', interests: [], vibeTag: '', availability: [] });
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i) => setForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] }));

  const toggleSlot = (day, slot) => setForm(f => {
    const avail = [...f.availability];
    const dayEntry = avail.find(d => d.day === day);
    if (dayEntry) {
      dayEntry.slots = dayEntry.slots.includes(slot) ? dayEntry.slots.filter(s => s !== slot) : [...dayEntry.slots, slot];
      if (!dayEntry.slots.length) return { ...f, availability: avail.filter(d => d.day !== day) };
      return { ...f, availability: avail };
    }
    return { ...f, availability: [...avail, { day, slots: [slot] }] };
  });

  const isSlotActive = (day, slot) => form.availability.find(d => d.day === day)?.slots.includes(slot);

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', { ...form, location: { city: form.city } });
      updateUser(data.user);
      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', height: 48, background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 12, padding: '0 14px', color: '#F1F0F7', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: '#0F0B21', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AuroraBackground intensity="subtle" />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProgressBar currentStep={step} totalSteps={3} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  <OnboardingCard>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F1F0F7', marginBottom: 4, letterSpacing: '-0.02em' }}>About You</h2>
                    <p style={{ color: '#A8A3C7', marginBottom: 24, fontSize: 14 }}>Help people know who you are</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div><label style={labelStyle}>Age</label><input style={inputStyle} type="number" placeholder="22" min="18" max="60" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
                      <div><label style={labelStyle}>Gender</label>
                        <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                          <option value="" style={{ background: '#1A1535' }}>Select...</option>
                          {['male','female','non-binary','prefer-not-to-say'].map(g => <option key={g} value={g} style={{ background: '#1A1535' }}>{g}</option>)}
                        </select>
                      </div>
                      <div><label style={labelStyle}>City</label><input style={inputStyle} placeholder="Bhubaneswar, Mumbai..." value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                      <div><label style={labelStyle}>Bio (optional)</label><textarea style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none' }} placeholder="A little about yourself..." rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
                      <GradientButton onClick={() => setStep(2)} fullWidth icon={ArrowRight}>Next</GradientButton>
                    </div>
                  </OnboardingCard>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  <OnboardingCard>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F1F0F7', marginBottom: 4, letterSpacing: '-0.02em' }}>Vibe & Interests</h2>
                    <p style={{ color: '#A8A3C7', marginBottom: 20, fontSize: 14 }}>Pick what you're into</p>

                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED' }} />
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Your Vibe</label>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {VIBES.map(v => <SelectableChip key={v} label={v} selected={form.vibeTag === v} onToggle={() => setForm({ ...form, vibeTag: v })} variant="single" />)}
                      </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Interests (pick 3+)</label>
                        <span style={{ fontSize: 13, fontWeight: 600, color: form.interests.length >= 3 ? '#2DD4BF' : '#F87171' }}>{form.interests.length} selected</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {INTERESTS.map((i, idx) => <SelectableChip key={i} label={i} selected={form.interests.includes(i)} onToggle={() => toggleInterest(i)} variant="multi" selectionIndex={form.interests.indexOf(i)} />)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                        style={{ flex: 1, height: 52, background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#A8A3C7', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <ArrowLeft size={16} /> Back
                      </motion.button>
                      <div style={{ flex: 2 }}>
                        <GradientButton onClick={() => setStep(3)} disabled={form.interests.length < 1} fullWidth icon={ArrowRight}>Next</GradientButton>
                      </div>
                    </div>
                  </OnboardingCard>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  <OnboardingCard>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F1F0F7', marginBottom: 4, letterSpacing: '-0.02em' }}>Availability</h2>
                    <p style={{ color: '#A8A3C7', marginBottom: 20, fontSize: 14 }}>When are you free to hang out?</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                      {DAYS.map(day => (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 36, fontSize: 12, fontWeight: 800, color: '#6E6893', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{day}</span>
                          <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                            {SLOTS.map(slot => (
                              <motion.button key={slot} whileTap={{ scale: 0.9 }} onClick={() => toggleSlot(day, slot)}
                                style={{ height: 28, padding: '0 10px', borderRadius: 20, border: `1.5px solid ${isSlotActive(day, slot) ? '#7C3AED' : '#433B72'}`, background: isSlotActive(day, slot) ? 'rgba(124,58,237,0.15)' : '#2D2653', color: isSlotActive(day, slot) ? '#7C3AED' : '#A8A3C7', fontSize: 11, fontWeight: isSlotActive(day, slot) ? 600 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
                                {slot}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                        style={{ flex: 1, height: 52, background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#A8A3C7', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <ArrowLeft size={16} /> Back
                      </motion.button>
                      <div style={{ flex: 2 }}>
                        <GradientButton onClick={save} loading={loading} fullWidth>Start Matching</GradientButton>
                      </div>
                    </div>
                  </OnboardingCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
