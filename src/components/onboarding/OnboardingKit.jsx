// src/components/onboarding/OnboardingKit.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const sp = { type: 'spring', stiffness: 300, damping: 28 };

// ─── PROGRESS BAR ─────────────────────────────────────────
export function ProgressBar({ currentStep, totalSteps }) {
  const pct = (currentStep / totalSteps) * 100;
  return (
    <div style={{ height: 4, background: '#2D2653', position: 'relative', overflow: 'hidden' }}>
      <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ height: '100%', background: 'linear-gradient(90deg, #7C3AED, #2DD4BF)', borderRadius: 2, boxShadow: '0 0 8px rgba(124,58,237,0.4)' }} />
    </div>
  );
}

// ─── ONBOARDING CARD ──────────────────────────────────────
export function OnboardingCard({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 22 }}
      style={{ width: '100%', maxWidth: 440, background: 'rgba(26,21,53,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 24, padding: window.innerWidth < 768 ? 24 : 36, animation: 'cardGlow 8s ease-in-out infinite' }}>
      <style>{`@keyframes cardGlow { 0%,100% { box-shadow: 0 0 30px rgba(124,58,237,0.08); } 50% { box-shadow: 0 0 30px rgba(45,212,191,0.08); } }`}</style>
      {children}
    </motion.div>
  );
}

// ─── STEP ICON ────────────────────────────────────────────
export function StepIcon({ icon: Icon }) {
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      style={{ width: 56, height: 56, borderRadius: '50%', background: '#2D2653', border: '1px solid #433B72', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'stepFloat 3s ease-in-out infinite' }}>
      <style>{`@keyframes stepFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
      {Icon && <Icon size={28} color="#2DD4BF" strokeWidth={1.8} />}
    </motion.div>
  );
}

// ─── OTP INPUT ────────────────────────────────────────────
export function OTPInput({ length = 6, value, onChange, error }) {
  const refs = useRef([]);
  const digits = value.split('');

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    onChange(next.join(''));
    if (val && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length));
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '24px 0' }}>
      {Array.from({ length }).map((_, i) => (
        <motion.input key={i}
          ref={el => refs.current[i] = el}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, ...sp }}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          maxLength={1} inputMode="numeric"
          style={{
            width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
            background: '#2D2653',
            border: `2px solid ${error ? '#F87171' : digits[i] ? 'rgba(124,58,237,0.6)' : '#433B72'}`,
            borderRadius: 14, color: '#F1F0F7', outline: 'none', fontFamily: 'Inter, sans-serif',
            caretColor: '#7C3AED',
            boxShadow: error ? '0 0 0 3px rgba(248,113,113,0.2)' : digits[i] ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
            transition: 'all 0.2s',
          }}
        />
      ))}
    </div>
  );
}

// ─── FILE UPLOAD ZONE ─────────────────────────────────────
export function FileUploadZone({ onFileSelect, file, uploading, uploaded }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { onFileSelect(f); toast.success('ID uploaded successfully'); }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        background: dragging ? 'rgba(45,212,191,0.05)' : '#2D2653',
        border: `2px ${dragging ? 'solid' : 'dashed'} ${dragging ? '#2DD4BF' : uploaded ? '#34D399' : '#433B72'}`,
        borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.2s',
      }}>
      <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { onFileSelect(e.target.files[0]); toast.success('ID uploaded successfully'); } }} />
      {uploaded ? (
        <><CheckCircle size={40} color="#34D399" style={{ margin: '0 auto 12px' }} /><p style={{ fontSize: 14, color: '#34D399', fontWeight: 600 }}>{file?.name}</p><p style={{ fontSize: 12, color: '#2DD4BF', marginTop: 4 }}>Replace</p></>
      ) : uploading ? (
        <><div style={{ width: 40, height: 40, border: '3px solid #2D2653', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.65s linear infinite', margin: '0 auto 12px' }} /><p style={{ fontSize: 14, color: '#A8A3C7' }}>Uploading...</p></>
      ) : (
        <><CloudUpload size={40} color="#6E6893" style={{ margin: '0 auto 12px' }} /><p style={{ fontSize: 14, color: '#A8A3C7' }}>Drag & drop or click to upload</p><p style={{ fontSize: 12, color: '#6E6893', marginTop: 4 }}>PNG, JPG up to 5MB</p></>
      )}
    </div>
  );
}

// ─── WEBCAM CAPTURE ───────────────────────────────────────
export function WebcamCapture({ videoRef, canvasRef, scanning, captured }) {
  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#0F0B21', aspectRatio: '1', marginBottom: 16 }}>
      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!scanning && !captured && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 48 }}>📷</div>
          <p style={{ color: '#6E6893', fontSize: 14 }}>Camera preview will appear here</p>
        </div>
      )}
      {scanning && (
        <>
          {/* Corner brackets */}
          {[['top:12px','left:12px','borderTop','borderLeft'],['top:12px','right:12px','borderTop','borderRight'],['bottom:12px','left:12px','borderBottom','borderLeft'],['bottom:12px','right:12px','borderBottom','borderRight']].map((corners, i) => (
            <div key={i} style={{ position: 'absolute', [corners[0].split(':')[0]]: corners[0].split(':')[1], [corners[1].split(':')[0]]: corners[1].split(':')[1], width: 20, height: 20, [corners[2]]: '3px solid #2DD4BF', [corners[3]]: '3px solid #2DD4BF' }} />
          ))}
          {/* Pulse ring */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(45,212,191,0.3)', animation: 'scanPulse 2s ease-out infinite' }} />
          <style>{`@keyframes scanPulse { 0% { transform: translate(-50%,-50%) scale(1); opacity: 0.3; } 100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; } }`}</style>
        </>
      )}
    </div>
  );
}
