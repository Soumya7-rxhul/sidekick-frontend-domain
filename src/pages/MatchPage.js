// src/pages/MatchPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import { EmptyState, SkeletonList, Avatar, PageHeader } from '../components/ui/UIKit';
import { useTilt } from '../hooks/useTilt';
import UserProfileModal from '../components/ui/UserProfileModal';
import api from '../utils/api';

const sp = { type: 'spring', stiffness: 300, damping: 28 };

const ScoreBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{Math.round(value)}%</span>
    </div>
    <div style={{ height: 4, background: '#2D2653', borderRadius: 2, overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        style={{ height: '100%', background: color, borderRadius: 2 }} />
    </div>
  </div>
);

function MatchCard({ user, totalScore, interestScore, availabilityScore, distanceScore, sent, onSend, onViewProfile, delay }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(1.5);
  const matchColor = totalScore >= 80 ? '#7C3AED' : totalScore >= 60 ? '#FBBF24' : '#4A4570';

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay }}
      ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 20, position: 'relative', overflow: 'hidden', willChange: 'transform' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7C3AED, #2DD4BF)', borderRadius: '20px 20px 0 0' }} />
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, cursor: 'pointer' }} onClick={() => onViewProfile && onViewProfile(user._id)}>
        <Avatar name={user.name} size={52} showRing ringPercent={Math.round(totalScore)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F0F7' }}>{user.name}</span>
              {(user.isIdVerified || user.isFaceVerified) && <CheckCircle size={14} color="#34D399" />}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: matchColor }}>{Math.round(totalScore)}%</span>
          </div>
          {user.location?.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
              <MapPin size={12} color="#6E6893" />
              <span style={{ fontSize: 13, color: '#6E6893' }}>{user.location.city}</span>
            </div>
          )}
          {user.interests?.length > 0 && (
            <p style={{ fontSize: 13, color: '#A8A3C7', marginTop: 4 }}>{user.interests.slice(0, 4).join(', ')}</p>
          )}
          <p style={{ fontSize: 11, color: '#6E6893', marginTop: 4 }}>Tap to view profile</p>
        </div>
      </div>
      <ScoreBar label="Interests"    value={interestScore    || 0} color="#7C3AED" />
      <ScoreBar label="Availability" value={availabilityScore || 0} color="#34D399" />
      <ScoreBar label="Nearby"       value={distanceScore    || 0} color="#F43F5E" />
      <div style={{ marginTop: 16 }}>
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '10px', background: 'rgba(52,211,153,0.1)', borderRadius: 10, color: '#34D399', fontWeight: 600, fontSize: 14, border: '1px solid rgba(52,211,153,0.2)' }}>
              Request Sent
            </motion.div>
          ) : (
            <motion.button key="send" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={onSend}
              style={{ width: '100%', height: 44, background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
              Send Companion Request
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MatchPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [minScore, setMinScore] = useState(20);
  const [viewProfile, setViewProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/matches/suggestions')
      .then(r => setSuggestions(r.data.matches || []))
      .catch(err => setError(err.response?.data?.message || 'Could not load matches.'))
      .finally(() => setLoading(false));
  }, []);

  const sendRequest = async (userId) => {
    try {
      await api.post('/matches/request', { receiverId: userId });
      setSent(s => new Set([...s, userId]));
      toast.success('Request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Matches" subtitle="Sorted by compatibility"
        rightAction={
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowFilter(f => !f)}
            style={{ width: 36, height: 36, borderRadius: 12, background: showFilter ? 'linear-gradient(135deg,#7C3AED,#2DD4BF)' : '#2D2653', border: '1px solid #433B72', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <SlidersHorizontal size={18} color={showFilter ? 'white' : '#A8A3C7'} />
          </motion.button>
        }
      />

      <AnimatePresence>
        {showFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ background: '#1A1535', borderRadius: 16, border: '1px solid #2D2653', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#A8A3C7', marginBottom: 10 }}>Min Match Score: <span style={{ color: '#7C3AED', fontWeight: 700 }}>{minScore}%</span></p>
              <input type="range" min={0} max={90} value={minScore} onChange={e => setMinScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#7C3AED' }} />
              <p style={{ fontSize: 12, color: '#6E6893', marginTop: 6 }}>
                Showing {suggestions.filter(s => s.totalScore >= minScore).length} of {suggestions.length} matches
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <SkeletonList count={3} height={220} />}

      {!loading && error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#1A1535', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 16, padding: 20, borderLeft: '3px solid #F87171' }}>
          <p style={{ color: '#F87171', fontWeight: 600, fontSize: 14 }}>{error}</p>
          {error.includes('profile') && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/setup-profile')}
              style={{ marginTop: 12, padding: '8px 20px', background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Complete Profile
            </motion.button>
          )}
        </motion.div>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <EmptyState icon={Search} title="No matches yet" subtitle="Complete your profile with interests and city to get matched" action="Update Profile" onAction={() => navigate('/profile')} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {suggestions.filter(s => s.totalScore >= minScore).map(({ user, totalScore, interestScore, availabilityScore, distanceScore }, i) => (
          <MatchCard key={user._id} user={user} totalScore={totalScore} interestScore={interestScore}
            availabilityScore={availabilityScore} distanceScore={distanceScore}
            sent={sent.has(user._id)} onSend={() => sendRequest(user._id)}
            onViewProfile={(id) => setViewProfile(id)} delay={i * 0.07} />
        ))}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {viewProfile && (
          <UserProfileModal
            userId={viewProfile}
            onClose={() => setViewProfile(null)}
            onAccept={() => {}}
            onReject={() => {}}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
