import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const TAGS_POSITIVE = ['Friendly', 'Punctual', 'Fun', 'Trustworthy', 'Great company'];
const TAGS_NEGATIVE = ['No show', 'Rude', 'Late', 'Uncomfortable', 'Disrespectful'];

export default function RatingModal({ matchId, otherUser, onClose, existingReview }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState(existingReview?.review || '');
  const [selectedTags, setSelectedTags] = useState(existingReview?.tags || []);
  const [loading, setLoading] = useState(false);

  const tags = rating >= 3 ? TAGS_POSITIVE : rating > 0 ? TAGS_NEGATIVE : [...TAGS_POSITIVE, ...TAGS_NEGATIVE];

  const toggleTag = (tag) => setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);

  const submit = async () => {
    if (!rating) return toast.error('Please select a rating');
    setLoading(true);
    try {
      await api.post('/users/rate', {
        userId: otherUser._id,
        matchId,
        rating,
        review,
        tags: selectedTags,
      });
      toast.success('Review submitted!');
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  const ratingLabel = ['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'][rating] || '';
  const ratingColor = rating >= 4 ? '#34D399' : rating === 3 ? '#FBBF24' : rating > 0 ? '#F87171' : '#6E6893';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => onClose(false)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: '#1A1535', borderRadius: '24px 24px 0 0', border: '1px solid #2D2653', padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ color: '#F1F0F7', fontSize: 18, fontWeight: 700, margin: 0 }}>Rate your SideKick</h3>
            <p style={{ color: '#6E6893', fontSize: 13, margin: '4px 0 0' }}>How was your experience with {otherUser?.name}?</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onClose(false)}
            style={{ width: 32, height: 32, borderRadius: 10, background: '#2D2653', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#A8A3C7" />
          </motion.button>
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#2D2653', borderRadius: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', overflow: 'hidden', flexShrink: 0 }}>
            {otherUser?.profilePhoto
              ? <img src={otherUser.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : otherUser?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ color: '#F1F0F7', fontSize: 15, fontWeight: 600, margin: 0 }}>{otherUser?.name}</p>
            <p style={{ color: '#6E6893', fontSize: 12, margin: 0 }}>{otherUser?.vibeTag || 'SideKick'}</p>
          </div>
        </div>

        {/* Stars */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <motion.button key={s} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                onClick={() => { setRating(s); setSelectedTags([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Star size={36} fill={(hovered || rating) >= s ? '#FBBF24' : 'none'} color={(hovered || rating) >= s ? '#FBBF24' : '#433B72'} strokeWidth={1.5} />
              </motion.button>
            ))}
          </div>
          {rating > 0 && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ color: ratingColor, fontSize: 14, fontWeight: 700, margin: 0 }}>{ratingLabel}</motion.p>
          )}
        </div>

        {/* Tags */}
        {rating > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
            <p style={{ color: '#6E6893', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              {rating >= 3 ? 'What did you like?' : 'What went wrong?'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map(tag => (
                <motion.button key={tag} whileTap={{ scale: 0.93 }} onClick={() => toggleTag(tag)}
                  style={{ height: 32, padding: '0 14px', borderRadius: 20, border: `1.5px solid ${selectedTags.includes(tag) ? (rating >= 3 ? '#34D399' : '#F87171') : '#433B72'}`, background: selectedTags.includes(tag) ? (rating >= 3 ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)') : '#2D2653', color: selectedTags.includes(tag) ? (rating >= 3 ? '#34D399' : '#F87171') : '#A8A3C7', fontSize: 13, fontWeight: selectedTags.includes(tag) ? 600 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Written review */}
        {rating > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 20 }}>
            <p style={{ color: '#6E6893', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Write a review (optional)</p>
            <textarea value={review} onChange={e => setReview(e.target.value)} maxLength={300}
              placeholder={`Share your experience with ${otherUser?.name}...`} rows={3}
              style={{ width: '100%', background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 12, padding: '10px 14px', color: '#F1F0F7', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'none' }} />
            <p style={{ color: '#4A4570', fontSize: 11, textAlign: 'right', marginTop: 4 }}>{review.length}/300</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={submit} disabled={loading || !rating}
          style={{ width: '100%', height: 48, background: rating ? 'linear-gradient(135deg,#7C3AED,#2DD4BF)' : '#2D2653', border: 'none', borderRadius: 14, color: rating ? 'white' : '#4A4570', fontSize: 15, fontWeight: 600, cursor: rating ? 'pointer' : 'default', fontFamily: 'Inter, sans-serif', boxShadow: rating ? '0 4px 16px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s' }}>
          {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
