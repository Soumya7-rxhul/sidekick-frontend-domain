import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { PageHeader } from '../components/ui/UIKit';

const SERVICES = [
  { name: 'Backend API',        url: 'https://sidekick-be.vercel.app/health',                    icon: 'API' },
  { name: 'Smart Matching',     url: 'https://sidekick-microservice-2.onrender.com/health',       icon: 'ML' },
  { name: 'Face Verification',  url: 'https://sidekick-py.onrender.com/health',                   icon: 'FV' },
  { name: 'NLP Services',       url: 'https://sidekick-nlp-services.onrender.com/health',         icon: 'NLP' },
  { name: 'Safety Services',    url: 'https://sidekick-safety-services.onrender.com/health',      icon: 'SOS' },
];

function ServiceCard({ name, icon, url }) {
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  const check = async () => {
    setStatus('checking');
    const start = Date.now();
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const ms = Date.now() - start;
      setLatency(ms);
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
      setLatency(null);
    }
  };

  useEffect(() => { check(); }, []);

  const color = status === 'ok' ? '#34D399' : status === 'error' ? '#F87171' : '#FBBF24';
  const label = status === 'ok' ? 'Operational' : status === 'error' ? 'Down' : 'Checking...';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#1A1535', border: '1px solid #2D2653', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#F1F0F7' }}>{name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <motion.div animate={status === 'checking' ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span style={{ fontSize: 13, color, fontWeight: 500 }}>{label}</span>
          {latency && <span style={{ fontSize: 12, color: '#6E6893' }}>· {latency}ms</span>}
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.9 }} onClick={check}
        style={{ width: 32, height: 32, borderRadius: 10, background: '#2D2653', border: '1px solid #433B72', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={14} color="#A8A3C7" />
      </motion.button>
    </motion.div>
  );
}

export default function StatusPage() {
  const [refreshAll, setRefreshAll] = useState(0);

  return (
    <AppLayout>
      <PageHeader title="System Status" subtitle="Live health of all services"
        rightAction={
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRefreshAll(r => r + 1)}
            style={{ height: 36, padding: '0 14px', borderRadius: 12, background: '#2D2653', border: '1px solid #433B72', color: '#A8A3C7', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
            <RefreshCw size={14} /> Refresh All
          </motion.button>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SERVICES.map((s, i) => <ServiceCard key={`${s.name}-${refreshAll}`} {...s} />)}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 24, background: '#1A1535', border: '1px solid #2D2653', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Activity size={16} color="#7C3AED" />
        <p style={{ fontSize: 13, color: '#6E6893' }}>Services on Render free tier may take ~30s to wake up after inactivity.</p>
      </motion.div>
    </AppLayout>
  );
}
