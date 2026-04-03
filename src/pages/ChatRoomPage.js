// src/pages/ChatRoomPage.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, CalendarClock, Smile, Phone, Video, Mic, MicOff, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/UIKit';
import MeetupScheduler from '../components/ui/MeetupScheduler';
import VideoCall from '../components/ui/VideoCall';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EMOJIS = ['😊','😂','❤️','👍','🙏','😍','🔥','✅','😎','🤝','🎉','😅','💪','🥳','😢','😮','🤔','👏','💯','🫂','😁','🤩','😴','🙈','💬','🌟','🎯','🚀','☕','🍕','🎶','🏆','💡','🌈','🤗','😇','🥰','😜','🤣','💃'];
const REACTION_EMOJIS = ['❤️','😂','😮','😢','👍','🔥'];

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [otherUser, setOtherUser]     = useState(null);
  const [matchId, setMatchId]         = useState(null);
  const [focused, setFocused]         = useState(false);
  const [sending, setSending]         = useState(false);
  const [showMeetup, setShowMeetup]   = useState(false);
  const [callMode, setCallMode]       = useState(null);
  const [showEmoji, setShowEmoji]     = useState(false);
  const [recording, setRecording]     = useState(false);
  const [recordTime, setRecordTime]   = useState(0);
  const [reactionMsg, setReactionMsg] = useState(null);

  const bottomRef    = useRef();
  const pollRef      = useRef();
  const lastCount    = useRef(0);
  const inputRef     = useRef();
  const mediaRecRef  = useRef();
  const audioChunks  = useRef([]);
  const recordTimer  = useRef();

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/chats/${roomId}`);
      const msgs = data.messages || [];
      if (msgs.length !== lastCount.current) {
        setMessages(msgs);
        lastCount.current = msgs.length;
        const other = msgs.find(m => m.sender?._id !== user._id)?.sender;
        if (other) setOtherUser(other);
      }
    } catch { navigate('/chats'); }
  }, [roomId, user._id]);

  useEffect(() => {
    fetchMessages();
    api.get('/chats/rooms').then(r => {
      const room = (r.data.rooms || []).find(rm => rm.roomId === roomId);
      if (room) { setMatchId(room.matchId); if (!otherUser) setOtherUser(room.other); }
    }).catch(() => {});
    // Mark as read
    api.post('/chats/read', { roomId }).catch(() => {});
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [roomId, fetchMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true); setInput(''); setShowEmoji(false);
    try {
      const { data } = await api.post('/chats/send', { roomId, content });
      setMessages(prev => [...prev, data.message]);
      lastCount.current += 1;
      if (data.warned) toast('Message flagged for inappropriate content');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
      setInput(content);
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const addEmoji = (emoji) => { setInput(prev => prev + emoji); inputRef.current?.focus(); };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecRef.current = mr;
      audioChunks.current = [];
      mr.ondataavailable = e => audioChunks.current.push(e.data);
      mr.start();
      setRecording(true);
      setRecordTime(0);
      recordTimer.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch { toast.error('Microphone access denied'); }
  };

  const stopRecording = () => {
    clearInterval(recordTimer.current);
    const mr = mediaRecRef.current;
    if (!mr) return;
    mr.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const { data } = await api.post('/chats/voice', { roomId, voiceData: e.target.result, duration: recordTime });
          setMessages(prev => [...prev, data.message]);
          lastCount.current += 1;
        } catch { toast.error('Failed to send voice message'); }
      };
      reader.readAsDataURL(blob);
      mr.stream.getTracks().forEach(t => t.stop());
    };
    mr.stop();
    setRecording(false);
    setRecordTime(0);
  };

  const cancelRecording = () => {
    clearInterval(recordTimer.current);
    mediaRecRef.current?.stream.getTracks().forEach(t => t.stop());
    mediaRecRef.current = null;
    setRecording(false);
    setRecordTime(0);
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const { data } = await api.post('/chats/react', { messageId, emoji });
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: data.reactions } : m));
      setReactionMsg(null);
    } catch {}
  };

  const isRead = (msg) => msg.readBy?.some(id => id !== user._id && id !== msg.sender?._id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 480, margin: '0 auto', background: '#0F0B21' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ height: 56, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(15,11,33,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #2D2653', position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/chats')}
          style={{ width: 36, height: 36, borderRadius: 10, background: '#2D2653', border: '1px solid #433B72', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={18} color="#A8A3C7" />
        </motion.button>
        <Avatar name={otherUser?.name} size={36} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#F1F0F7', margin: 0 }}>{otherUser?.name || 'SideKick'}</p>
          <p style={{ fontSize: 11, color: '#6E6893', margin: 0 }}>Active now</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCallMode('audio')}
          style={{ width: 34, height: 34, borderRadius: 10, background: '#2D2653', border: '1px solid #433B72', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Phone size={15} color="#34D399" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCallMode('video')}
          style={{ width: 34, height: 34, borderRadius: 10, background: '#2D2653', border: '1px solid #433B72', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Video size={15} color="#7C3AED" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowMeetup(true)}
          style={{ width: 34, height: 34, borderRadius: 10, background: '#2D2653', border: '1px solid #433B72', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <CalendarClock size={15} color="#2DD4BF" />
        </motion.button>
      </motion.div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }} onClick={() => { setShowEmoji(false); setReactionMsg(null); }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6E6893', fontSize: 13 }}>No messages yet. Say hello!</div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMe = msg.sender?._id === user._id || msg.sender === user._id;
            const groupedReactions = {};
            (msg.reactions || []).forEach(r => { groupedReactions[r.emoji] = (groupedReactions[r.emoji] || 0) + 1; });

            return (
              <motion.div key={msg._id || i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{ maxWidth: '75%', position: 'relative' }}>
                  {/* Message bubble */}
                  <motion.div whileTap={{ scale: 0.98 }}
                    onDoubleClick={() => setReactionMsg(msg._id)}
                    style={{
                      padding: msg.type === 'voice' ? '10px 14px' : '10px 14px',
                      fontSize: 14, lineHeight: 1.55,
                      background: isMe ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : '#1A1535',
                      border: isMe ? 'none' : '1px solid #2D2653',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: isMe ? '0 2px 12px rgba(124,58,237,0.25)' : 'none',
                    }}>
                    {msg.type === 'voice' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => { const a = new Audio(msg.voiceData); a.play(); }}
                          style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white', fontSize: 12 }}>▶</span>
                        </motion.button>
                        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{msg.duration}s</span>
                      </div>
                    ) : (
                      <span style={{ color: isMe ? 'white' : '#F1F0F7' }}>{msg.content}</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.5)' : '#6E6893' }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                      </span>
                      {isMe && <CheckCheck size={12} color={isRead(msg) ? '#2DD4BF' : 'rgba(255,255,255,0.4)'} />}
                    </div>
                  </motion.div>

                  {/* Reactions display */}
                  {Object.keys(groupedReactions).length > 0 && (
                    <div style={{ display: 'flex', gap: 3, marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      {Object.entries(groupedReactions).map(([emoji, count]) => (
                        <motion.button key={emoji} whileTap={{ scale: 0.9 }}
                          onClick={() => addReaction(msg._id, emoji)}
                          style={{ background: '#2D2653', border: '1px solid #433B72', borderRadius: 12, padding: '2px 7px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          {emoji} {count > 1 && <span style={{ color: '#A8A3C7', fontSize: 10 }}>{count}</span>}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Reaction picker */}
                  <AnimatePresence>
                    {reactionMsg === msg._id && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        style={{ position: 'absolute', [isMe ? 'right' : 'left']: 0, bottom: '100%', marginBottom: 4, background: '#1A1535', border: '1px solid #2D2653', borderRadius: 24, padding: '6px 10px', display: 'flex', gap: 6, zIndex: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                        {REACTION_EMOJIS.map(emoji => (
                          <motion.button key={emoji} whileTap={{ scale: 0.8 }} onClick={() => addReaction(msg._id, emoji)}
                            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 2 }}>
                            {emoji}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{ padding: '10px 16px', borderTop: '1px solid #2D2653', background: 'rgba(15,11,33,0.95)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {EMOJIS.map((emoji, i) => (
                <motion.button key={i} whileTap={{ scale: 0.8 }} onClick={() => addEmoji(emoji)}
                  style={{ width: 38, height: 38, borderRadius: 10, background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator */}
      <AnimatePresence>
        {recording && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '10px 16px', borderTop: '1px solid #2D2653', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: '#F43F5E' }} />
              <span style={{ color: '#F87171', fontSize: 14, fontWeight: 600 }}>Recording... {recordTime}s</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={cancelRecording}
                style={{ height: 32, padding: '0 12px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={stopRecording}
                style={{ height: 32, padding: '0 12px', borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Send</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      {!recording && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '10px 12px 16px', borderTop: '1px solid #2D2653', display: 'flex', gap: 6, background: 'rgba(15,11,33,0.9)', backdropFilter: 'blur(16px)', alignItems: 'center' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEmoji(s => !s)}
            style={{ width: 38, height: 38, borderRadius: '50%', background: showEmoji ? 'rgba(124,58,237,0.2)' : '#2D2653', border: `1px solid ${showEmoji ? '#7C3AED' : '#433B72'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Smile size={17} color={showEmoji ? '#7C3AED' : '#A8A3C7'} />
          </motion.button>

          <input ref={inputRef} placeholder="Type a message..." value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            onFocus={() => { setFocused(true); setShowEmoji(false); }} onBlur={() => setFocused(false)}
            style={{ flex: 1, height: 44, borderRadius: 22, background: focused ? '#362F5E' : '#2D2653', border: `1.5px solid ${focused ? '#7C3AED' : '#433B72'}`, padding: '0 16px', fontSize: 14, color: '#F1F0F7', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.25s ease' }}
          />

          {input.trim() ? (
            <motion.button whileTap={{ scale: 0.92 }} onClick={send} disabled={sending}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {sending ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} /> : <Send size={18} color="white" />}
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.92 }} onMouseDown={startRecording}
              style={{ width: 44, height: 44, borderRadius: '50%', background: '#2D2653', border: '1px solid #433B72', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mic size={18} color="#A8A3C7" />
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {callMode && <VideoCall roomId={`sidekick-${roomId}`} userId={user._id} otherUser={otherUser} mode={callMode} onEnd={() => setCallMode(null)} />}
        {showMeetup && matchId && <MeetupScheduler matchId={matchId} otherUser={otherUser} currentUserId={user._id} onClose={() => setShowMeetup(false)} />}
      </AnimatePresence>
    </div>
  );
}
