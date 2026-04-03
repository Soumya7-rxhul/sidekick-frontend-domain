import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, Star } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { EmptyState, SkeletonList, Avatar, PageHeader } from '../components/ui/UIKit';
import RatingModal from '../components/ui/RatingModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const sp = { type: 'spring', stiffness: 300, damping: 28 };

function ChatRow({ room, index, total, formatTime, onClick, onRate, currentUserId }) {
  const [hovered, setHovered] = useState(false);
  const hasRating = room.myRating;

  // Count unread messages
  const unreadCount = room.unreadCount || 0;
  const lastMsg = room.lastMessage;
  const isLastMine = lastMsg?.sender?._id === currentUserId || lastMsg?.sender === currentUserId;
  const lastContent = lastMsg?.type === 'voice' ? 'Voice message' : lastMsg?.content || 'Start the conversation!';

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ ...sp, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: index < total - 1 ? '1px solid #2D2653' : 'none', minHeight: 72, background: hovered ? '#231E42' : 'transparent', transition: 'background 0.15s' }}>

      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }} onClick={onClick}>
        {/* Avatar with online dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar name={room.other?.name} size={44} />
          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#34D399', border: '2px solid #1A1535' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 15, fontWeight: unreadCount > 0 ? 700 : 600, color: '#F1F0F7', margin: 0 }}>{room.other?.name || 'SideKick'}</p>
              {room.metBefore && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 6, padding: '1px 6px' }}>Met Before</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: unreadCount > 0 ? '#7C3AED' : '#6E6893' }}>{formatTime(lastMsg?.createdAt)}</span>
              {unreadCount > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}
                  style={{ minWidth: 20, height: 20, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                </motion.div>
              )}
            </div>
          </div>
          <p style={{ fontSize: 13, color: unreadCount > 0 ? '#A8A3C7' : '#6E6893', fontWeight: unreadCount > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
            {isLastMine ? `You: ${lastContent}` : lastContent}
          </p>
          {hasRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10} fill={s <= room.myRating ? '#FBBF24' : 'none'} color={s <= room.myRating ? '#FBBF24' : '#433B72'} />
              ))}
            </div>
          )}
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.9 }} onClick={onRate}
        style={{ flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 10, background: hasRating ? 'rgba(251,191,36,0.1)' : '#2D2653', border: `1px solid ${hasRating ? 'rgba(251,191,36,0.3)' : '#433B72'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: hasRating ? '#FBBF24' : '#A8A3C7' }}>
        <Star size={12} fill={hasRating ? '#FBBF24' : 'none'} color={hasRating ? '#FBBF24' : '#A8A3C7'} />
        {hasRating ? room.myRating + '/5' : 'Rate'}
      </motion.button>
    </motion.div>
  );
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [focused, setFocused]     = useState(false);
  const [ratingModal, setRatingModal] = useState(null);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/chats/rooms');
      const rooms = data.rooms || [];
      const enriched = await Promise.all(rooms.map(async (room) => {
        try {
          const [rd, msgs] = await Promise.all([
            api.get(`/users/my-review/${room.matchId}`),
            api.get(`/chats/${room.roomId}`),
          ]);
          // Count unread messages
          const unread = (msgs.data.messages || []).filter(m =>
            m.sender?._id !== user._id &&
            m.sender !== user._id &&
            !m.readBy?.includes(user._id)
          ).length;
          return { ...room, myRating: rd.data.review?.rating || null, existingReview: rd.data.review, unreadCount: unread };
        } catch { return room; }
      }));
      setRooms(enriched);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const filtered = rooms.filter(r => r.other?.name?.toLowerCase().includes(search.toLowerCase()));

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const totalUnread = rooms.reduce((s, r) => s + (r.unreadCount || 0), 0);

  return (
    <AppLayout>
      <PageHeader title={`Messages${totalUnread > 0 ? ` (${totalUnread})` : ''}`} subtitle={totalUnread > 0 ? `${totalUnread} unread` : 'Your conversations'} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay: 0.08 }}
        style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} color="#6E6893" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="Search conversations..."
          style={{ width: '100%', height: 44, background: focused ? '#362F5E' : '#2D2653', border: `1.5px solid ${focused ? '#7C3AED' : '#433B72'}`, borderRadius: 14, paddingLeft: 40, paddingRight: 14, fontSize: 14, color: '#F1F0F7', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.25s ease' }}
        />
      </motion.div>

      {loading && <SkeletonList count={4} height={72} />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={MessageCircle} title="No messages yet" subtitle="Match with someone to start chatting" action="Find Matches" onAction={() => navigate('/match')} />
      )}

      {!loading && filtered.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          {filtered.map((room, i) => (
            <ChatRow key={room.roomId} room={room} index={i} total={filtered.length} formatTime={formatTime}
              currentUserId={user._id}
              onClick={() => navigate(`/chat/${room.roomId}`)}
              onRate={() => setRatingModal({ matchId: room.matchId, otherUser: room.other, existingReview: room.existingReview })}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {ratingModal && (
          <RatingModal matchId={ratingModal.matchId} otherUser={ratingModal.otherUser} existingReview={ratingModal.existingReview}
            onClose={(submitted) => { setRatingModal(null); if (submitted) fetchRooms(); }} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
