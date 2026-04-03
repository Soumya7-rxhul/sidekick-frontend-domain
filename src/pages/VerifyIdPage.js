// src/pages/VerifyIdPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ScanFace, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';
import { GradientButton } from '../components/ui/UIKit';
import { OnboardingCard, StepIcon, ProgressBar, FileUploadZone, WebcamCapture } from '../components/onboarding/OnboardingKit';
import api from '../utils/api';

export default function VerifyIdPage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('gov-id');
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [faceGuide, setFaceGuide] = useState(''); // instruction message
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();

  const getIdRules = () => {
    if (idType === 'aadhaar') return { maxLen: 12, pattern: /^\d{12}$/, hint: 'Must be exactly 12 digits' };
    if (idType === 'pan')     return { maxLen: 10, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, hint: 'Format: ABCDE1234F' };
    if (idType === 'passport') return { maxLen: 8, pattern: /^[A-Z][0-9]{7}$/, hint: 'Format: A1234567' };
    return { maxLen: 16, pattern: /.{6,}/, hint: 'Min 6 characters' };
  };

  const handleIdNumberChange = (e) => {
    const val = e.target.value;
    if (idType === 'aadhaar') {
      // Only allow digits, max 12
      if (/^\d*$/.test(val) && val.length <= 12) setIdNumber(val);
    } else {
      setIdNumber(val.toUpperCase().slice(0, getIdRules().maxLen));
    }
  };

  const stepIndex = step === 'gov-id' ? 3 : 4;

  const verifyId = async () => {
    const { pattern, hint } = getIdRules();
    if (!pattern.test(idNumber)) return setError(hint);
    if (!file) return setError('Please upload a photo of your ID');
    setLoading(true); setError('');
    try {
      await api.post('/auth/verify-id', { idType, idNumber, idPhoto: filePreview });
      updateUser({ isIdVerified: true });
      toast.success('ID verified!');
      setStep('face-scan');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      videoRef.current.play();
      setScanning(true);
      setFaceGuide('Position your face in the center. Make sure only ONE face is visible.');
      setError('');
    } catch { setError('Camera access denied. Please allow camera permission.'); }
  };

  const captureFace = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const descriptor = canvas.toDataURL('image/jpeg', 0.8);

    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop());
    setScanning(false);
    setFaceGuide('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-face', { faceDescriptor: descriptor });
      updateUser({ isFaceVerified: true });
      toast.success('Face verified! Confidence: ' + Math.round((data.confidence || 0.95) * 100) + '%');
      navigate('/setup-profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Face scan failed. Ensure only your face is visible and try again.');
    } finally { setLoading(false); }
  };

  const handleFileSelect = (f) => {
    setFile(f);
    setUploaded(true);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const inputStyle = { width: '100%', height: 48, background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 12, padding: '0 14px', color: '#F1F0F7', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: '#0F0B21', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AuroraBackground intensity="subtle" />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProgressBar currentStep={stepIndex} totalSteps={5} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
          <AnimatePresence mode="wait">
            {step === 'gov-id' && (
              <motion.div key="gov-id" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ width: '100%', maxWidth: 440 }}>
                <OnboardingCard>
                  <StepIcon icon={ShieldCheck} />
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F1F0F7', textAlign: 'center', letterSpacing: '-0.02em' }}>Verify your identity</h2>
                  <p style={{ fontSize: 14, color: '#A8A3C7', textAlign: 'center', marginTop: 6, marginBottom: 24 }}>Upload a government-issued ID</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>ID Type</label>
                      <select style={{ ...inputStyle, cursor: 'pointer' }} value={idType} onChange={e => setIdType(e.target.value)}>
                        {[['aadhaar','Aadhaar Card'],['pan','PAN Card'],['passport','Passport'],['driving','Driving License']].map(([v,l]) => (
                          <option key={v} value={v} style={{ background: '#1A1535' }}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>ID Number</label>
                      <input style={inputStyle}
                        placeholder={idType === 'aadhaar' ? '12-digit Aadhaar number' : 'Enter ID number'}
                        value={idNumber}
                        onChange={handleIdNumberChange}
                        maxLength={getIdRules().maxLen}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: '#6E6893' }}>{getIdRules().hint}</span>
                        <span style={{ fontSize: 11, color: idType === 'aadhaar' && idNumber.length === 12 ? '#34D399' : '#6E6893', fontWeight: 600 }}>
                          {idNumber.length}/{getIdRules().maxLen}
                        </span>
                      </div>
                    </div>
                    <FileUploadZone onFileSelect={handleFileSelect} file={file} uploading={false} uploaded={uploaded} />
                    {error && <p style={{ color: '#F87171', fontSize: 13 }}>{error}</p>}
                    <GradientButton onClick={verifyId} loading={loading} fullWidth>Verify ID</GradientButton>
                    <p style={{ fontSize: 12, color: '#6E6893', textAlign: 'center' }}>Your ID is encrypted and never stored in plain text</p>
                  </div>
                </OnboardingCard>
              </motion.div>
            )}

            {step === 'face-scan' && (
              <motion.div key="face-scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ width: '100%', maxWidth: 440 }}>
                <OnboardingCard>
                  <StepIcon icon={ScanFace} />
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F1F0F7', textAlign: 'center', letterSpacing: '-0.02em' }}>Face verification</h2>
                  <p style={{ fontSize: 14, color: '#A8A3C7', textAlign: 'center', marginTop: 6, marginBottom: 20 }}>Only ONE face should be visible in the frame</p>

                  {/* Face oval guide */}
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <WebcamCapture videoRef={videoRef} canvasRef={canvasRef} scanning={scanning} />
                    {scanning && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ width: 160, height: 200, borderRadius: '50%', border: '3px solid #2DD4BF', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', opacity: 0.8 }} />
                      </div>
                    )}
                  </div>

                  {/* Guide message */}
                  {faceGuide && (
                    <div style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10, padding: '8px 14px', marginBottom: 12, textAlign: 'center' }}>
                      <p style={{ color: '#2DD4BF', fontSize: 13, fontWeight: 500, margin: 0 }}>{faceGuide}</p>
                    </div>
                  )}

                  {/* Rules */}
                  {!scanning && (
                    <div style={{ background: '#1A1535', borderRadius: 12, padding: 14, marginBottom: 14, border: '1px solid #2D2653' }}>
                      <p style={{ color: '#A8A3C7', fontSize: 12, margin: '0 0 6px', fontWeight: 600 }}>Before you start:</p>
                      {['Only ONE face should be in frame', 'Look directly at the camera', 'Ensure good lighting', 'Remove glasses or hat if possible'].map((r, i) => (
                        <p key={i} style={{ color: '#6E6893', fontSize: 12, margin: '3px 0' }}>• {r}</p>
                      ))}
                    </div>
                  )}
                  {error && <p style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('gov-id')}
                      style={{ flex: 1, height: 52, background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#A8A3C7', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Back</motion.button>
                    <div style={{ flex: 2 }}>
                      <GradientButton onClick={scanning ? captureFace : startCamera} loading={loading} fullWidth>
                        {scanning ? 'Capture Face' : 'Start Camera'}
                      </GradientButton>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#6E6893', textAlign: 'center', marginTop: 10 }}>Ensure good lighting. Look directly at the camera.</p>
                </OnboardingCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
