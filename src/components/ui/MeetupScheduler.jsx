import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function MeetupScheduler({ matchId, otherUser, currentUserId, onClose }) {
  const [meetups, setMeetups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', venue: '', city: '', note: '' });
  const [loading, setLoading] = useState(false);

  const fetchMeetups = async () => {
    try {
      const { data } = await api.get(`/meetups/match/${matchId}`);
      setMeetups(data.meetups || []);
    } catch {}
  };

  useEffect(() => { fetchMeetups(); }, [matchId]);

  const propose = async () => {
    if (!form.date || !form.time || !form.venue) return toast.error('Date, time and venue are required');
    setLoading(true);
    try {
      await api.post('/meetups/propose', { matchId, receiverId: otherUser._id, ...form });
      toast.success('Meetup proposed! Email sent to ' + otherUser.name);
      setShowForm(false);
      setForm({ date: '', time: '', venue: '', city: '', note: '' });
      fetchMeetups();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const respond = async (meetupId, action) => {
    try {
      await api.put('/meetups/respond', { meetupId, action });
      toast.success(action === 'accept' ? 'Meetup accepted!' : 'Meetup declined');
      fetchMeetups();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const statusColor = { pending: '#FBBF24', accepted: '#34D399', rejected: '#F87171', cancelled: '#6E6893' };
  const inputStyle = { width: '100%', height: 42, background: '#2D2653', border: '1px solid #433B72', borderRadius: 10, padding: '0 12px', color: '#F1F0F7', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: '#1A1535', borderRadius: '24px 24px 0 0', border: '1px solid #2D2653', padding: 24, maxHeight: '85vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ color: '#F1F0F7', fontSize: 18, fontWeight: 700, margin: 0 }}>Meetup Scheduler</h3>
            <p style={{ color: '#6E6893', fontSize: 13, margin: '4px 0 0' }}>Plan a meetup with {otherUser?.name}</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, background: '#2D2653', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#A8A3C7" />
          </motion.button>
        </div>

        {/* Propose button */}
        {!showForm && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(true)}
            style={{ width: '100%', height: 44, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
            Propose a Meetup
          </motion.button>
        )}

        {/* Propose form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ background: '#2D2653', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ color: '#A8A3C7', fontSize: 13, fontWeight: 600, margin: 0 }}>Propose a meetup</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#6E6893', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Date</label>
                    <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6E6893', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Time</label>
                    <input type="time" style={inputStyle} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6E6893', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Venue</label>
                  <input style={inputStyle} placeholder="e.g. Cafe Coffee Day, Saheed Nagar" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6E6893', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>City</label>
                  <input style={inputStyle} placeholder="e.g. Bhubaneswar" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6E6893', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Note (optional)</label>
                  <input style={inputStyle} placeholder="Any message for your SideKick..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowForm(false)}
                    style={{ flex: 1, height: 40, background: 'transparent', border: '1px solid #433B72', borderRadius: 10, color: '#A8A3C7', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={propose} disabled={loading}
                    style={{ flex: 2, height: 40, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {loading ? 'Sending...' : 'Send Proposal'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meetup history */}
        {meetups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#6E6893', fontSize: 13 }}>No meetups scheduled yet. Propose one!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Meetup History</p>
            {meetups.map((m) => {
              const isProposer = m.proposer?._id === currentUserId || m.proposer === currentUserId;
              return (
                <div key={m._id} style={{ background: '#2D2653', borderRadius: 14, padding: 14, border: `1px solid ${statusColor[m.status]}30` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[m.status], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.status}</span>
                    <span style={{ fontSize: 11, color: '#6E6893' }}>{isProposer ? 'You proposed' : `${m.proposer?.name} proposed`}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={12} color="#6E6893" />
                      <span style={{ fontSize: 13, color: '#F1F0F7' }}>{new Date(m.date).toDateString()} at {m.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={12} color="#6E6893" />
                      <span style={{ fontSize: 13, color: '#F1F0F7' }}>{m.venue}{m.city ? `, ${m.city}` : ''}</span>
                    </div>
                    {m.note && <p style={{ fontSize: 12, color: '#A8A3C7', margin: '4px 0 0', fontStyle: 'italic' }}>"{m.note}"</p>}
                  </div>
                  {!isProposer && m.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => respond(m._id, 'reject')}
                        style={{ flex: 1, height: 34, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#F87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Decline</motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => respond(m._id, 'accept')}
                        style={{ flex: 2, height: 34, background: 'linear-gradient(135deg,#34D399,#059669)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Check size={14} /> Accept
                      </motion.button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
