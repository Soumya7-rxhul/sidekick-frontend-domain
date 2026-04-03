// src/pages/ProfilePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LogOut, ChevronRight, Edit2, Clock, Shield, Bell, Eye, HelpCircle, Activity, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import { Badge, GradientText } from '../components/ui/UIKit';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import SideKickScore from '../components/ui/SideKickScore';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const sp = { type: 'spring', stiffness: 300, damping: 28 };
const INTERESTS = ['Movies','Cricket','Football','Food','Music','Books','Gaming','Adventure','Coffee','Travel','Dancing','Art'];

function SettingRow({ icon: Icon, label, sub, onClick, divider, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div whileTap={{ scale: 0.99 }} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', minHeight: 56, background: hov ? (danger ? 'rgba(248,113,113,0.05)' : '#231E42') : 'transparent', borderBottom: divider ? '1px solid #2D2653' : 'none', transition: 'background 0.2s, transform 0.2s', transform: hov && !danger ? 'translateX(3px)' : 'translateX(0)' }}>
      {Icon && <Icon size={18} color={danger ? '#F87171' : '#2DD4BF'} strokeWidth={1.8} />}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: danger ? '#F87171' : '#F1F0F7' }}>{label}</p>
        {sub && <p style={{ fontSize: 13, color: '#6E6893', marginTop: 1 }}>{sub}</p>}
      </div>
      {!danger && <ChevronRight size={16} color={hov ? '#2DD4BF' : '#4A4570'} style={{ transition: 'color 0.2s', flexShrink: 0 }} />}
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ bio: user?.bio || '', city: user?.location?.city || '', lat: user?.location?.lat || null, lng: user?.location?.lng || null, interests: user?.interests || [], vibeTag: user?.vibeTag || '' });
  const [saving, setSaving] = useState(false);
  const [notifSettings, setNotifSettings] = useState({ matchRequests: true, matchAccepted: true, eventJoined: true, messages: true });
  const [safetyContacts, setSafetyContacts] = useState(user?.safetyContacts || []);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [savingContacts, setSavingContacts] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({ location: true, interests: true, badges: true, matchRequests: true });
  const photoInputRef = React.useRef();

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (modal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [modal]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Photo must be under 2MB');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        const { data } = await api.put('/users/profile', { profilePhoto: base64 });
        updateUser(data.user);
        toast.success('Profile photo updated!');
      } catch { toast.error('Failed to update photo'); }
    };
    reader.readAsDataURL(file);
  };

  const saveContacts = async () => {
    setSavingContacts(true);
    try {
      const { data } = await api.put('/users/profile', { safetyContacts });
      updateUser(data.user);
      toast.success('Safety circle updated!');
      setModal(null);
    } catch { toast.error('Failed to save'); }
    finally { setSavingContacts(false); }
  };

  const triggerSOS = async () => {
    setSosLoading(true);
    try {
      const { data } = await api.post('/safety/sos', { message: 'I need help! Please contact me immediately.' });
      if (data.success) toast.success(`SOS sent to ${data.alertsSent} contact(s)!`);
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'SOS failed'); }
    finally { setSosLoading(false); }
  };

  const toggleInterest = (i) => setForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] }));

  const save = async () => {
    setSaving(true);
    try {
      const location = { city: form.city };
      if (form.lat && form.lng) { location.lat = form.lat; location.lng = form.lng; }
      const { data } = await api.put('/users/profile', { bio: form.bio, location, interests: form.interests, vibeTag: form.vibeTag });
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const safetyScore = user?.safetyScore ?? 100;

  const SETTINGS = [
    { icon: Clock,       label: 'Availability',   sub: 'Set your schedule',       onClick: () => navigate('/setup-profile') },
    { icon: Shield,      label: 'Safety Circle',  sub: 'Manage trusted contacts', onClick: () => setModal('safety') },
    { icon: Bell,        label: 'Notifications',  sub: 'Manage alerts',           onClick: () => setModal('notifications') },
    { icon: Eye,         label: 'Privacy',        sub: 'Control your data',       onClick: () => setModal('privacy') },
    ...(user?._id === '69c99ae98688969fef140aa2' ? [{ icon: Activity, label: 'System Status', sub: 'Check all services live', onClick: () => navigate('/status') }] : []),
    { icon: HelpCircle,  label: 'Help & Support', sub: 'Get assistance',          onClick: () => setModal('help') },
  ];

  const inputStyle = { width: '100%', background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 12, padding: '10px 14px', color: '#F1F0F7', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <AppLayout>
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={sp}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, paddingTop: 8 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: 'white', boxShadow: '0 8px 32px rgba(124,58,237,0.3)', overflow: 'hidden' }}>
            <style>{`@keyframes rotateGradient { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`}</style>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ animation: 'rotateGradient 6s linear infinite' }}>{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => photoInputRef.current.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: '2px solid #0F0B21', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Camera size={12} color="white" />
          </motion.button>
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F1F0F7', letterSpacing: '-0.02em' }}>{user?.name}</h2>
        <p style={{ fontSize: 14, color: '#6E6893', marginTop: 2 }}>{user?.email}</p>
        {user?.location?.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <MapPin size={13} color="#6E6893" />
            <span style={{ fontSize: 14, color: '#A8A3C7' }}>{user.location.city}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge type="id"   verified={user?.isIdVerified} />
          <Badge type="face" verified={user?.isFaceVerified} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '6px 14px', background: 'rgba(52,211,153,0.1)', borderRadius: 20, border: '1px solid rgba(52,211,153,0.2)' }}>
          <Shield size={14} color="#34D399" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#A8A3C7' }}>Safety Score: </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>{safetyScore}/100</span>
        </div>
        {!editing && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setEditing(true)}
            style={{ marginTop: 14, height: 36, padding: '0 20px', background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#A8A3C7', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit2 size={14} color="#6E6893" /> Edit Profile
          </motion.button>
        )}
      </motion.div>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#F1F0F7', marginBottom: 14 }}>Edit Profile</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Bio</label><textarea style={{ ...inputStyle, height: 'auto', resize: 'none' }} rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell others about yourself..." /></div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>City</label>
                <LocationAutocomplete
                  value={form.city}
                  onChange={(loc) => {
                    if (loc) {
                      setForm(f => ({ ...f, city: loc.city, lat: loc.coords[1], lng: loc.coords[0] }));
                    } else {
                      setForm(f => ({ ...f, city: '', lat: null, lng: null }));
                    }
                  }}
                  placeholder="Your city"
                  label="City"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {INTERESTS.map(i => (
                    <motion.button key={i} whileTap={{ scale: 0.93 }} onClick={() => toggleInterest(i)}
                      style={{ height: 32, padding: '0 14px', borderRadius: 20, border: `1.5px solid ${form.interests.includes(i) ? '#7C3AED' : '#433B72'}`, background: form.interests.includes(i) ? 'rgba(124,58,237,0.15)' : '#2D2653', color: form.interests.includes(i) ? '#7C3AED' : '#A8A3C7', fontSize: 13, fontWeight: form.interests.includes(i) ? 600 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
                      {i}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(false)}
                  style={{ flex: 1, height: 44, background: '#2D2653', border: '1.5px solid #433B72', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#A8A3C7', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={save} disabled={saving}
                  style={{ flex: 2, height: 44, background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                  {saving ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block' }} /> : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interests */}
      {!editing && user?.interests?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay: 0.1 }}
          style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6893', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Interests</p>
            <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#2DD4BF', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Edit</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {user.interests.map(i => (
              <span key={i} style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', color: '#7C3AED', fontSize: 13, fontWeight: 500, border: '1px solid rgba(124,58,237,0.25)' }}>{i}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* SideKick Score */}
      <SideKickScore />

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay: 0.15 }}
        style={{ background: '#1A1535', borderRadius: 20, border: '1px solid #2D2653', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', overflow: 'hidden', marginBottom: 12 }}>
        {SETTINGS.map(({ icon, label, sub, onClick }, i) => (
          <SettingRow key={label} icon={icon} label={label} sub={sub} onClick={onClick} divider={i < SETTINGS.length - 1} />
        ))}
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sp, delay: 0.2 }}
        style={{ background: '#1A1535', borderRadius: 20, border: '1px solid rgba(248,113,113,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <SettingRow icon={LogOut} label="Log Out" onClick={handleLogout} danger />
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflowY: 'hidden' }}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 480, background: '#1A1535', borderRadius: '24px 24px 0 0', border: '1px solid #2D2653', padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>

              {modal === 'safety' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ color: '#F1F0F7', fontSize: 18, fontWeight: 700, margin: 0 }}>Safety Circle</h3>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setModal(null)} style={{ width: 32, height: 32, borderRadius: 10, background: '#2D2653', border: 'none', cursor: 'pointer', color: '#A8A3C7', fontSize: 18 }}>x</motion.button>
                  </div>
                  <p style={{ color: '#6E6893', fontSize: 13, marginBottom: 16 }}>Add trusted contacts who will be notified in emergencies.</p>
                  {safetyContacts.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#2D2653', borderRadius: 12, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#F1F0F7', fontSize: 14, fontWeight: 600, margin: 0 }}>{c.name}</p>
                        <p style={{ color: '#6E6893', fontSize: 12, margin: 0 }}>{c.phone}</p>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSafetyContacts(s => s.filter((_, j) => j !== i))}
                        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '4px 10px', color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Remove</motion.button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <input value={newContact.name} onChange={e => setNewContact(n => ({ ...n, name: e.target.value }))} placeholder="Name"
                      style={{ flex: 1, height: 40, background: '#2D2653', border: '1px solid #433B72', borderRadius: 10, padding: '0 12px', color: '#F1F0F7', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                    <input value={newContact.phone} onChange={e => setNewContact(n => ({ ...n, phone: e.target.value }))} placeholder="Phone"
                      style={{ flex: 1, height: 40, background: '#2D2653', border: '1px solid #433B72', borderRadius: 10, padding: '0 12px', color: '#F1F0F7', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => { if (newContact.name && newContact.phone) { setSafetyContacts(s => [...s, newContact]); setNewContact({ name: '', phone: '' }); }}}
                      style={{ height: 40, padding: '0 14px', background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Add</motion.button>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={saveContacts} disabled={savingContacts}
                    style={{ width: '100%', height: 44, marginTop: 16, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {savingContacts ? 'Saving...' : 'Save Safety Circle'}
                  </motion.button>
                  {safetyContacts.length > 0 && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={triggerSOS} disabled={sosLoading}
                      style={{ width: '100%', height: 44, marginTop: 10, background: 'linear-gradient(135deg,#F43F5E,#FB923C)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      {sosLoading ? 'Sending SOS...' : 'Send SOS Alert Now'}
                    </motion.button>
                  )}
                </div>
              )}

              {modal === 'notifications' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ color: '#F1F0F7', fontSize: 18, fontWeight: 700, margin: 0 }}>Notifications</h3>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setModal(null)} style={{ width: 32, height: 32, borderRadius: 10, background: '#2D2653', border: 'none', cursor: 'pointer', color: '#A8A3C7', fontSize: 18 }}>x</motion.button>
                  </div>
                  <p style={{ color: '#6E6893', fontSize: 13, marginBottom: 16 }}>Email notifications sent to <b style={{ color: '#2DD4BF' }}>{user?.email}</b></p>
                  {[
                    { key: 'matchRequests', label: 'Match Requests', sub: 'When someone sends you a request' },
                    { key: 'matchAccepted', label: 'Match Accepted',  sub: 'When your request is accepted' },
                    { key: 'eventJoined',   label: 'Event Joins',     sub: 'When someone joins your event' },
                    { key: 'messages',      label: 'Messages',        sub: 'New chat messages' },
                  ].map(({ key, label, sub }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #2D2653' }}>
                      <div>
                        <p style={{ color: '#F1F0F7', fontSize: 14, fontWeight: 600, margin: 0 }}>{label}</p>
                        <p style={{ color: '#6E6893', fontSize: 12, margin: 0 }}>{sub}</p>
                      </div>
                      <motion.div whileTap={{ scale: 0.9 }} onClick={() => setNotifSettings(n => ({ ...n, [key]: !n[key] }))}
                        style={{ width: 44, height: 24, borderRadius: 12, background: notifSettings[key] ? 'linear-gradient(135deg,#7C3AED,#2DD4BF)' : '#2D2653', border: '1px solid #433B72', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
                        <motion.div animate={{ x: notifSettings[key] ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white' }} />
                      </motion.div>
                    </div>
                  ))}
                </div>
              )}

              {modal === 'privacy' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ color: '#F1F0F7', fontSize: 18, fontWeight: 700, margin: 0 }}>Privacy</h3>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setModal(null)} style={{ width: 32, height: 32, borderRadius: 10, background: '#2D2653', border: 'none', cursor: 'pointer', color: '#A8A3C7', fontSize: 18 }}>x</motion.button>
                  </div>
                  {[
                    { key: 'location',      label: 'Show my location',          sub: 'Let matches see your city' },
                    { key: 'interests',     label: 'Show my interests',          sub: 'Visible on your profile' },
                    { key: 'badges',        label: 'Show verification badges',   sub: 'ID & face verified badges' },
                    { key: 'matchRequests', label: 'Allow match requests',       sub: 'Others can send you requests' },
                  ].map(({ key, label, sub }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #2D2653' }}>
                      <div>
                        <p style={{ color: '#F1F0F7', fontSize: 14, fontWeight: 600, margin: 0 }}>{label}</p>
                        <p style={{ color: '#6E6893', fontSize: 12, margin: 0 }}>{sub}</p>
                      </div>
                      <motion.div whileTap={{ scale: 0.9 }} onClick={() => setPrivacySettings(p => ({ ...p, [key]: !p[key] }))}
                        style={{ width: 44, height: 24, borderRadius: 12, background: privacySettings[key] ? 'linear-gradient(135deg,#7C3AED,#2DD4BF)' : '#2D2653', border: '1px solid #433B72', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
                        <motion.div animate={{ x: privacySettings[key] ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                      </motion.div>
                    </div>
                  ))}
                  <div style={{ marginTop: 20, padding: 16, background: 'rgba(248,113,113,0.05)', borderRadius: 12, border: '1px solid rgba(248,113,113,0.15)' }}>
                    <p style={{ color: '#F87171', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>Delete Account</p>
                    <p style={{ color: '#6E6893', fontSize: 12, margin: '0 0 12px' }}>Permanently delete your account and all data.</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => toast.error('Please contact support to delete your account.')}
                      style={{ height: 36, padding: '0 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, color: '#F87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Request Deletion</motion.button>
                  </div>
                </div>
              )}

              {modal === 'help' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ color: '#F1F0F7', fontSize: 18, fontWeight: 700, margin: 0 }}>Help & Support</h3>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setModal(null)} style={{ width: 32, height: 32, borderRadius: 10, background: '#2D2653', border: 'none', cursor: 'pointer', color: '#A8A3C7', fontSize: 18 }}>x</motion.button>
                  </div>
                  {[
                    { q: 'How does matching work?', a: 'We match based on interests (35%), availability (25%), distance (25%), and safety score (15%).' },
                    { q: 'What is a Vibe Tag?', a: 'Auto-generated from your interests. E.g. food & cooking = "The Foodie".' },
                    { q: 'How is safety score calculated?', a: 'Starts at 100. Positive ratings +2, reports -10.' },
                    { q: 'How do I report someone?', a: 'Go to their profile and tap Report. They will be auto-blocked.' },
                  ].map(({ q, a }, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: 14, background: '#2D2653', borderRadius: 12 }}>
                      <p style={{ color: '#2DD4BF', fontSize: 13, fontWeight: 700, margin: '0 0 6px' }}>Q: {q}</p>
                      <p style={{ color: '#A8A3C7', fontSize: 13, margin: 0 }}>{a}</p>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, padding: 14, background: 'rgba(124,58,237,0.1)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)', textAlign: 'center' }}>
                    <p style={{ color: '#A8A3C7', fontSize: 13, margin: '0 0 6px' }}>Still need help? Reach us at</p>
                    <p style={{ color: '#2DD4BF', fontSize: 13, fontWeight: 600, margin: 0 }}>support@sidekick.com</p>
                    <p style={{ color: '#6E6893', fontSize: 11, margin: '4px 0 0' }}>We typically respond within 24 hours</p>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
