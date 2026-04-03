// src/pages/EventsPage.js
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Plus, X, Edit2, Trash2, Film, Dumbbell, UtensilsCrossed, BookOpen, Coffee, Music2, Car, ShoppingBag, Gamepad2, Moon, Plane, Camera, Ticket, PartyPopper, Handshake, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import { EmptyState, SkeletonList, CategoryChip, TabBar, PageHeader, GradientButton } from '../components/ui/UIKit';
import UserProfileModal from '../components/ui/UserProfileModal';
import api from '../utils/api';

const sp = { type: 'spring', stiffness: 300, damping: 28 };

const ACTIVITY_META = {
  movie:        { icon: Film,           color: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
  sports:       { icon: Dumbbell,       color: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
  food:         { icon: UtensilsCrossed,color: '#FB923C', bg: 'rgba(251,146,60,0.12)'  },
  study:        { icon: BookOpen,       color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  hangout:      { icon: Handshake,      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  music:        { icon: Music2,         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  drive:        { icon: Car,            color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)'  },
  cafe:         { icon: Coffee,         color: '#D97706', bg: 'rgba(217,119,6,0.12)'   },
  shopping:     { icon: ShoppingBag,    color: '#EC4899', bg: 'rgba(236,72,153,0.12)'  },
  gaming:       { icon: Gamepad2,       color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  nightwalk:    { icon: Moon,           color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  travel:       { icon: Plane,          color: '#06B6D4', bg: 'rgba(6,182,212,0.12)'   },
  fitness:      { icon: Dumbbell,       color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  photography:  { icon: Camera,         color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  concert:      { icon: Ticket,         color: '#C084FC', bg: 'rgba(192,132,252,0.12)' },
  festival:     { icon: PartyPopper,    color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
};

const ACTIVITY_LABELS = {
  movie: 'Movie', sports: 'Sports', food: 'Food', study: 'Study', hangout: 'Hangout',
  music: 'Music', drive: 'Drive / Long Drive', cafe: 'Cafe Meetup', shopping: 'Shopping',
  gaming: 'Gaming', nightwalk: 'Night Walk', travel: 'Travel / Weekend Trip',
  fitness: 'Fitness / Gym', photography: 'Photography', concert: 'Concert / Show', festival: 'Festival / Local Event',
};

const CATEGORIES = ['All', ...Object.keys(ACTIVITY_META)];
const TABS = [{ key: 'browse', label: 'Browse' }, { key: 'mine', label: 'My Events' }];

function ActivityBadge({ category }) {
  const meta = ACTIVITY_META[category] || { icon: Handshake, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' };
  const Icon = meta.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: meta.bg, border: `1px solid ${meta.color}30` }}>
      <Icon size={11} color={meta.color} />
      <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {ACTIVITY_LABELS[category] || category}
      </span>
    </div>
  );
}

function EventCard({ event, joined, onJoin, onEdit, onDelete, onViewProfile, onChat, currentUserId, delay = 0 }) {
  const isCreator = event.creator?._id === currentUserId || event.creator === currentUserId;
  const isJoined  = joined.has(event._id) || event.participants?.some(p => p === currentUserId || p?._id === currentUserId);
  const canChat   = isCreator || isJoined;
  const total      = event.participants?.length || 0;
  const max        = event.maxParticipants || 2;
  const isFull     = !event.isOpen || total >= max;
  const spotsLeft  = Math.max(0, max - total);
  const meta       = ACTIVITY_META[event.category] || { icon: Handshake, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' };
  const ActivityIcon = meta.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(124,58,237,0.08)' }}
      style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 16, position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.25s ease' }}>
      {/* top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${meta.color}, #2DD4BF)`, borderRadius: '20px 20px 0 0' }} />

      {/* header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, paddingRight: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <ActivityIcon size={18} color={meta.color} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#F1F0F7', lineHeight: 1.3 }}>{event.title}</p>
            {event.description && <p style={{ fontSize: 12, color: '#A8A3C7', marginTop: 3, lineHeight: 1.5 }}>{event.description}</p>}
          </div>
        </div>
        <ActivityBadge category={event.category} />
      </div>

      {/* meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={12} color="#6E6893" />
          <span style={{ fontSize: 12, color: '#A8A3C7' }}>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {event.timeSlot}</span>
        </div>
        {event.location?.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color="#6E6893" />
            <span style={{ fontSize: 12, color: '#A8A3C7' }}>{event.location.city}{event.location.venue ? `, ${event.location.venue}` : ''}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} color={isFull ? '#F87171' : '#6E6893'} />
          <span style={{ fontSize: 12, color: isFull ? '#F87171' : '#A8A3C7', fontWeight: isFull ? 600 : 400 }}>
            {total} / {max} joined{!isFull && ` · ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>
      </div>

      {/* creator row */}
      {event.creator && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <motion.div whileTap={{ scale: 0.95 }}
            onClick={() => !isCreator && onViewProfile && onViewProfile(event.creator._id || event.creator)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: !isCreator ? 'pointer' : 'default' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${meta.color}, #2DD4BF)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
              {event.creator.name?.[0]}
            </div>
            <span style={{ fontSize: 12, color: !isCreator ? '#2DD4BF' : '#6E6893', fontWeight: !isCreator ? 600 : 400 }}>
              by {event.creator.name}{!isCreator && ' · View Profile'}
            </span>
          </motion.div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!isCreator && (
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => onViewProfile && onViewProfile(event.creator._id || event.creator)}
                style={{ height: 28, padding: '0 10px', borderRadius: 8, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#2DD4BF', fontFamily: 'Inter, sans-serif' }}>
                <User size={11} />
                Profile
              </motion.button>
            )}
            {isCreator && (
              <div style={{ display: 'flex', gap: 6 }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => onEdit(event)}
                  style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Edit2 size={12} color="#7C3AED" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(event._id)}
                  style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Trash2 size={12} color="#F87171" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* action button */}
      {isCreator ? (
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: meta.color, padding: '8px', background: meta.bg, borderRadius: 8, fontWeight: 600 }}>Your Event</div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onChat && onChat(event._id)}
            style={{ width: 40, height: 36, background: 'rgba(124,58,237,0.1)', border: '1.5px solid rgba(124,58,237,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <MessageCircle size={15} color="#7C3AED" />
          </motion.button>
        </div>
      ) : isFull ? (
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#6E6893', padding: '8px', background: '#231E42', borderRadius: 8, fontWeight: 500 }}>Event Full</div>
      ) : (
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => !isJoined && onJoin(event._id)} disabled={isJoined}
            style={{ flex: 1, height: 40, background: isJoined ? 'rgba(52,211,153,0.08)' : 'transparent', color: isJoined ? '#34D399' : '#2DD4BF', border: `1.5px solid ${isJoined ? 'rgba(52,211,153,0.3)' : '#2DD4BF'}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: isJoined ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
            {isJoined ? '✓ Joined' : 'Join Event'}
          </motion.button>
          {canChat && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onChat && onChat(event._id)}
              style={{ width: 40, height: 40, background: 'rgba(124,58,237,0.1)', border: '1.5px solid rgba(124,58,237,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <MessageCircle size={16} color="#7C3AED" />
            </motion.button>
          )}
        </div>
      )}}
    </motion.div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents]         = useState([]);
  const [myEvents, setMyEvents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('browse');
  const [category, setCategory]     = useState('All');
  const [joined, setJoined]         = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewProfile, setViewProfile]   = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'hangout', date: '', timeSlot: 'evening', city: '', venue: '', maxParticipants: 2 });
  const [creating, setCreating]     = useState(false);

  const handleEventChat = async (eventId) => {
    try {
      await api.get(`/events/${eventId}/chat`);
      navigate(`/chat/event_${eventId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open event chat');
    }
  };

  const fetchEvents = () => {
    const params = category !== 'All' ? `?category=${category}` : '';
    api.get(`/events${params}`).then(r => setEvents(r.data.events || [])).catch(() => {});
  };

  useEffect(() => {
    fetchEvents();
    api.get('/events/mine').then(r => setMyEvents(r.data.events || [])).catch(() => {});
    setLoading(false);
  }, [category]);

  const joinEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/join`);
      setJoined(j => new Set([...j, eventId]));
      fetchEvents();
      api.get('/events/mine').then(r => setMyEvents(r.data.events || []));
      toast.success('Joined event!');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not join event'); }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
      api.get('/events/mine').then(r => setMyEvents(r.data.events || []));
      toast.success('Event deleted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const startEdit = (event) => {
    setEditingEvent(event._id);
    setForm({ title: event.title, description: event.description || '', category: event.category, date: event.date?.split('T')[0] || '', timeSlot: event.timeSlot || 'evening', city: event.location?.city || '', venue: event.location?.venue || '', maxParticipants: event.maxParticipants || 2 });
    setShowCreate(true);
  };

  const saveEvent = async () => {
    if (!form.title || !form.date) return toast.error('Title and date are required');
    setCreating(true);
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent}`, { ...form, location: { city: form.city, venue: form.venue } });
        toast.success('Event updated!');
      } else {
        await api.post('/events', { ...form, location: { city: form.city, venue: form.venue } });
        toast.success('Event created!');
      }
      setShowCreate(false);
      setEditingEvent(null);
      setForm({ title: '', description: '', category: 'hangout', date: '', timeSlot: 'evening', city: '', venue: '', maxParticipants: 2 });
      fetchEvents();
      api.get('/events/mine').then(r => setMyEvents(r.data.events || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setCreating(false); }
  };

  const inputStyle = { width: '100%', height: 44, background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 12, padding: '0 14px', color: '#F1F0F7', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <AppLayout>
      <PageHeader title="Events" subtitle="Find things to do together"
        rightAction={
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(!showCreate)}
            style={{ height: 36, padding: '0 14px', background: showCreate ? '#2D2653' : 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: showCreate ? '#A8A3C7' : 'white', border: showCreate ? '1px solid #433B72' : 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6, boxShadow: showCreate ? 'none' : '0 4px 16px rgba(124,58,237,0.3)' }}>
            {showCreate ? <X size={14} /> : <Plus size={14} />}
            {showCreate ? 'Cancel' : 'Create'}
          </motion.button>
        }
      />

      <AnimatePresence>
        {showCreate && (
          <motion.div key="create-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 20 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#F1F0F7', marginBottom: 14 }}>{editingEvent ? 'Edit Event' : 'Create Event'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input style={inputStyle} placeholder="Event title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <textarea style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none' }} placeholder="Description (optional)" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                      <option key={val} value={val} style={{ background: '#1A1535' }}>{label}</option>
                    ))}
                  </select>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}>
                    {['morning','afternoon','evening','night'].map(s => <option key={s} value={s} style={{ background: '#1A1535' }}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle, paddingRight: 40 }}
                      type="number" min={2} max={50}
                      placeholder="Max participants"
                      value={form.maxParticipants}
                      onChange={e => setForm({ ...form, maxParticipants: Math.min(50, Math.max(2, Number(e.target.value))) })}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#6E6893', pointerEvents: 'none' }}>max</span>
                  </div>
                </div>
                <input style={inputStyle} placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                <input style={inputStyle} placeholder="Venue (optional)" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveEvent} disabled={creating}
                  style={{ height: 44, background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                  {creating ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block' }} /> : editingEvent ? 'Save Changes' : 'Create Event'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        {tab === 'browse' && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
              {CATEGORIES.map(c => {
                const meta = ACTIVITY_META[c];
                const Icon = meta?.icon;
                return (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${category === c ? (meta?.color || '#2DD4BF') : '#2D2653'}`, background: category === c ? (meta?.bg || 'rgba(45,212,191,0.12)') : 'transparent', color: category === c ? (meta?.color || '#2DD4BF') : '#6E6893', fontSize: 12, fontWeight: category === c ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', flexShrink: 0 }}>
                    {Icon && <Icon size={11} />}
                    {c === 'All' ? 'All' : ACTIVITY_LABELS[c] || c}
                  </button>
                );
              })}
            </div>
            {loading ? <SkeletonList count={3} height={160} /> :
              events.length === 0 ? (
                <EmptyState icon={Calendar} title="No events found" subtitle="Be the first to create one!" action="Create Event" onAction={() => setShowCreate(true)} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.map((e, i) => <EventCard key={e._id} event={e} joined={joined} onJoin={joinEvent} onEdit={startEdit} onDelete={deleteEvent} onViewProfile={(id) => setViewProfile(id)} onChat={handleEventChat} currentUserId={user?._id} delay={i * 0.06} />)}
                </div>
              )
            }
          </motion.div>
        )}
        {tab === 'mine' && (
          <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {myEvents.length === 0 ? (
              <EmptyState icon={Calendar} title="No events yet" subtitle="Join or create an event to see it here" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Upcoming */}
                {myEvents.filter(e => new Date(e.date) >= new Date()).length > 0 && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0' }}>Upcoming</p>
                    {myEvents.filter(e => new Date(e.date) >= new Date()).map((e, i) => (
                      <EventCard key={e._id} event={e} joined={joined} onJoin={joinEvent} onEdit={startEdit} onDelete={deleteEvent} onViewProfile={(id) => setViewProfile(id)} onChat={handleEventChat} currentUserId={user?._id} delay={i * 0.06} />
                    ))}
                  </>
                )}
                {/* Past */}
                {myEvents.filter(e => new Date(e.date) < new Date()).length > 0 && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>Past Events</p>
                    {myEvents.filter(e => new Date(e.date) < new Date()).reverse().map((e, i) => (
                      <div key={e._id} style={{ opacity: 0.6 }}>
                      <EventCard event={e} joined={joined} onJoin={joinEvent} onEdit={startEdit} onDelete={deleteEvent} onViewProfile={(id) => setViewProfile(id)} onChat={handleEventChat} currentUserId={user?._id} delay={i * 0.06} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
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
