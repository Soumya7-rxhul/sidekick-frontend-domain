import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Shield, CheckCircle, Star } from 'lucide-react';
import api from '../../utils/api';

export default function UserProfileModal({ userId, matchId, onClose, onAccept, onReject }) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/users/reviews/${userId}`),
    ]).then(([p, r]) => {
      setProfile(p.data);
      setReviews(r.data.reviews || []);
    }).catch(() => {}).finally(() => setLoading(false));
    return () => { document.body.style.overflow = ''; };
  }, [userId]);

  const u = profile?.user;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: '#0F0B21', borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #2D2653' }}>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.65s linear infinite', margin: '0 auto' }} />
          </div>
        ) : u ? (
          <>
            {/* Cover + Avatar */}
            <div style={{ position: 'relative', marginBottom: 60 }}>
              {/* Cover */}
              <div style={{ height: 120, background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', borderRadius: '24px 24px 0 0' }} />

              {/* Close button */}
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="white" />
              </motion.button>

              {/* Avatar */}
              <div style={{ position: 'absolute', bottom: -48, left: 20 }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: '4px solid #0F0B21', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white', overflow: 'hidden' }}>
                  {u.profilePhoto
                    ? <img src={u.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : u.name?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ padding: '0 20px 32px' }}>
              {/* Name + badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <h2 style={{ color: '#F1F0F7', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{u.name}</h2>
                  {u.age && u.gender && (
                    <p style={{ color: '#6E6893', fontSize: 13, margin: '2px 0 0' }}>{u.age} · {u.gender}</p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {u.isIdVerified && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                      <CheckCircle size={11} color="#34D399" />
                      <span style={{ fontSize: 11, color: '#34D399', fontWeight: 600 }}>ID Verified</span>
                    </div>
                  )}
                  {u.isFaceVerified && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
                      <CheckCircle size={11} color="#2DD4BF" />
                      <span style={{ fontSize: 11, color: '#2DD4BF', fontWeight: 600 }}>Face Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location + vibe */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                {u.location?.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="#6E6893" />
                    <span style={{ fontSize: 13, color: '#6E6893' }}>{u.location.city}</span>
                  </div>
                )}
                {u.vibeTag && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '2px 10px' }}>{u.vibeTag}</span>
                )}
              </div>

              {/* Safety score + avg rating */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, background: '#1A1535', borderRadius: 12, padding: '10px 14px', border: '1px solid #2D2653', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} color="#34D399" />
                  <div>
                    <p style={{ color: '#34D399', fontSize: 16, fontWeight: 700, margin: 0 }}>{u.safetyScore}/100</p>
                    <p style={{ color: '#6E6893', fontSize: 11, margin: 0 }}>Safety Score</p>
                  </div>
                </div>
                {avgRating && (
                  <div style={{ flex: 1, background: '#1A1535', borderRadius: 12, padding: '10px 14px', border: '1px solid #2D2653', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={16} color="#FBBF24" fill="#FBBF24" />
                    <div>
                      <p style={{ color: '#FBBF24', fontSize: 16, fontWeight: 700, margin: 0 }}>{avgRating} <span style={{ fontSize: 11, color: '#6E6893', fontWeight: 400 }}>({reviews.length})</span></p>
                      <p style={{ color: '#6E6893', fontSize: 11, margin: 0 }}>Avg Rating</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {u.bio && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>About</p>
                  <p style={{ color: '#A8A3C7', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{u.bio}</p>
                </div>
              )}

              {/* Interests */}
              {u.interests?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Interests</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {u.interests.map(i => (
                      <span key={i} style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(124,58,237,0.12)', color: '#A78BFA', fontSize: 13, fontWeight: 500, border: '1px solid rgba(124,58,237,0.2)' }}>{i}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Reviews ({reviews.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {reviews.slice(0, 3).map((r, i) => (
                      <div key={i} style={{ background: '#1A1535', borderRadius: 12, padding: '12px 14px', border: '1px solid #2D2653' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ color: '#F1F0F7', fontSize: 13, fontWeight: 600 }}>{r.reviewer?.name}</span>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s <= r.rating ? '#FBBF24' : 'none'} color={s <= r.rating ? '#FBBF24' : '#433B72'} />)}
                          </div>
                        </div>
                        {r.review && <p style={{ color: '#A8A3C7', fontSize: 13, margin: 0, fontStyle: 'italic' }}>"{r.review}"</p>}
                        {r.tags?.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                            {r.tags.map(t => <span key={t} style={{ fontSize: 11, color: '#6E6893', background: '#2D2653', borderRadius: 6, padding: '2px 8px' }}>{t}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accept / Reject buttons */}
              {matchId && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { onReject(matchId); onClose(); }}
                    style={{ flex: 1, height: 48, background: 'rgba(248,113,113,0.1)', border: '1.5px solid rgba(248,113,113,0.3)', borderRadius: 14, color: '#F87171', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Decline
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { onAccept(matchId); onClose(); }}
                    style={{ flex: 2, height: 48, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                    Accept Request
                  </motion.button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#6E6893' }}>Could not load profile</div>
        )}
      </motion.div>
    </motion.div>
  );
}
