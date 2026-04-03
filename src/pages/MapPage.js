import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { Navigation, X, MapPin, Users, Calendar, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const CITY_COORDS = {
  berhampur:   [84.7941, 19.3149],
  bhubaneswar: [85.8245, 20.2961],
  cuttack:     [85.8830, 20.4625],
  puri:        [85.8312, 19.8135],
  rourkela:    [84.8536, 22.2604],
  sambalpur:   [83.9756, 21.4669],
  mumbai:      [72.8777, 19.0760],
  delhi:       [77.2090, 28.6139],
  bangalore:   [77.5946, 12.9716],
  hyderabad:   [78.4867, 17.3850],
  chennai:     [80.2707, 13.0827],
  kolkata:     [88.3639, 22.5726],
  pune:        [73.8567, 18.5204],
  jaipur:      [75.7873, 26.9124],
};

const getCityCoords = (city) => city ? CITY_COORDS[city.toLowerCase()] || null : null;

const CATEGORY_EMOJI = {
  movie: '🍿', sports: '⚽', food: '🍜', study: '📚', hangout: '🤝',
  music: '🎵', drive: '🚗', cafe: '☕', shopping: '🛍️', gaming: '🎮',
  nightwalk: '🌙', travel: '✈️', fitness: '💪', photography: '📸',
  concert: '🎟️', festival: '🎉',
};

const getEventEmoji = (cat) => CATEGORY_EMOJI[cat?.toLowerCase()] || '📍';

const fmt = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const POPUP_STYLE = `
  .sk-popup .mapboxgl-popup-content {
    background: #1A1535;
    border: 1px solid #2D2653;
    border-radius: 14px;
    padding: 0;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    min-width: 200px;
    font-family: Inter, sans-serif;
  }
  .sk-popup .mapboxgl-popup-tip { border-top-color: #1A1535; border-bottom-color: #1A1535; }
  .sk-popup .mapboxgl-popup-close-button { color: #6E6893; font-size: 16px; top: 6px; right: 8px; z-index: 1; }
  .sk-join-btn {
    width: 100%; height: 36px; margin-top: 10px;
    background: linear-gradient(135deg,#7C3AED,#2DD4BF);
    color: white; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: Inter, sans-serif;
  }
  .sk-join-btn:disabled { opacity: 0.5; cursor: default; }
`;

export default function MapPage() {
  const { user } = useAuth();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);           // all mapbox marker instances
  const eventMarkersRef = useRef({});      // eventId → { marker, popup }
  const activePopupRef = useRef(null);

  const [matches, setMatches] = useState([]);
  const [activeMatches, setActiveMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [destination, setDestination] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ matches: 0, connections: 0, events: 0 });
  const [routeAdded, setRouteAdded] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [joinedIds, setJoinedIds] = useState(new Set());

  const myCoords = getCityCoords(user?.location?.city);

  // Inject popup CSS once
  useEffect(() => {
    if (document.getElementById('sk-popup-style')) return;
    const tag = document.createElement('style');
    tag.id = 'sk-popup-style';
    tag.textContent = POPUP_STYLE;
    document.head.appendChild(tag);
  }, []);

  // Fetch data
  useEffect(() => {
    Promise.all([
      api.get('/matches/suggestions').catch(() => ({ data: { matches: [] } })),
      api.get('/matches/active').catch(() => ({ data: { matches: [] } })),
      api.get('/events').catch(() => ({ data: { events: [] } })),
    ]).then(([sugg, active, evts]) => {
      setMatches(sugg.data.matches || []);
      setActiveMatches(active.data.matches || []);
      setEvents(evts.data.events || []);
      setStats({
        matches: sugg.data.matches?.length || 0,
        connections: active.data.matches?.length || 0,
        events: evts.data.events?.length || 0,
      });
    });
  }, []);

  // Init map once
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: myCoords || [85.8245, 20.2961],
      zoom: 9,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right');
  }, []);

  // Join handler — called from popup button via window bridge
  const handleJoin = useCallback(async (eventId) => {
    try {
      await api.post(`/events/${eventId}/join`);
      setJoinedIds(prev => new Set([...prev, eventId]));
      setEvents(prev => prev.map(e =>
        e._id === eventId
          ? { ...e, participants: [...(e.participants || []), user._id] }
          : e
      ));
      toast.success('Joined event!');
      // Update join button in open popup
      const btn = document.getElementById(`join-btn-${eventId}`);
      if (btn) { btn.textContent = '✓ Joined'; btn.disabled = true; }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join');
    }
  }, [user]);

  // Expose join handler to window so popup HTML onclick can call it
  useEffect(() => {
    window.__skJoin = handleJoin;
    return () => { delete window.__skJoin; };
  }, [handleJoin]);

  const makeEl = (emoji, bg, size = 40, isSelected = false) => {
    const el = document.createElement('div');
    el.style.cssText = `width:${size}px;height:${size}px;cursor:pointer`;
    const inner = document.createElement('div');
    inner.style.cssText = [
      'width:100%', 'height:100%', 'border-radius:50%',
      `background:${bg}`, 'display:flex', 'align-items:center', 'justify-content:center',
      `font-size:${size * 0.42}px`, 'box-shadow:0 4px 14px rgba(0,0,0,0.55)',
      `border:${isSelected ? '2.5px solid #2DD4BF' : '2.5px solid rgba(255,255,255,0.18)'}`,
      'transition:transform 0.15s ease',
    ].join(';');
    inner.textContent = emoji;
    el.onmouseenter = () => { inner.style.transform = 'scale(1.18)'; };
    el.onmouseleave = () => { inner.style.transform = 'scale(1)'; };
    el.appendChild(inner);
    return el;
  };

  const makePopup = (html) =>
    new mapboxgl.Popup({ offset: 22, closeButton: true, className: 'sk-popup', closeOnClick: false })
      .setHTML(`<div style="padding:14px 16px">${html}</div>`);

  // Build markers — runs only when data/tab changes, NOT on selectedEventId change
  useEffect(() => {
    if (!map.current) return;

    // Close any open popup and clear markers
    if (activePopupRef.current) { activePopupRef.current.remove(); activePopupRef.current = null; }
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    eventMarkersRef.current = {};

    const addMarker = (coords, el, popup) => {
      const m = new mapboxgl.Marker({ element: el }).setLngLat(coords).setPopup(popup).addTo(map.current);
      markersRef.current.push(m);
      return m;
    };

    // You
    if (myCoords) {
      addMarker(myCoords, makeEl('🧑', 'linear-gradient(135deg,#7C3AED,#2DD4BF)', 44),
        makePopup(`<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#F1F0F7">You</p><p style="margin:0;font-size:12px;color:#A8A3C7">📍 ${user?.location?.city || 'Your location'}</p>`)
      );
    }

    // Match suggestions
    if (activeTab === 'all' || activeTab === 'matches') {
      matches.forEach(({ user: u, totalScore }) => {
        const coords = getCityCoords(u?.location?.city);
        if (!coords) return;
        addMarker(coords, makeEl('✨', '#7C3AED'),
          makePopup(`<p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#F1F0F7">${u.name}</p><p style="margin:0 0 6px;font-size:12px;color:#7C3AED;font-weight:600">⚡ ${Math.round(totalScore)}% match</p>${u.interests?.length ? `<p style="margin:0;font-size:11px;color:#6E6893">${u.interests.slice(0, 3).join(' · ')}</p>` : ''}`)
        );
      });
    }

    // Active connections
    if (activeTab === 'all' || activeTab === 'active') {
      activeMatches.forEach((m) => {
        const other = m.requester?._id === user?._id ? m.receiver : m.requester;
        const coords = getCityCoords(other?.location?.city);
        if (!coords) return;
        addMarker(coords, makeEl('💚', '#34D399'),
          makePopup(`<p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#F1F0F7">${other?.name}</p><p style="margin:0 0 6px;font-size:12px;color:#34D399;font-weight:600">🔗 Active Connection</p>${other?.vibeTag ? `<p style="margin:0;font-size:11px;color:#6E6893">${other.vibeTag}</p>` : ''}`)
        );
        if (myCoords && map.current.isStyleLoaded()) {
          const lineId = `line-${other?._id}`;
          if (!map.current.getSource(lineId)) {
            map.current.addSource(lineId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [myCoords, coords] } } });
            map.current.addLayer({ id: lineId, type: 'line', source: lineId, paint: { 'line-color': '#34D399', 'line-width': 2, 'line-opacity': 0.45, 'line-dasharray': [2, 2] } });
          }
        }
      });
    }

    // Events
    if (activeTab === 'all' || activeTab === 'events') {
      events.forEach((e) => {
        const coords = e.location?.lat && e.location?.lng
          ? [e.location.lng, e.location.lat]
          : getCityCoords(e.location?.city);
        if (!coords) return;

        const emoji = getEventEmoji(e.category);
        const joined = e.participants?.length || 0;
        const max = e.maxParticipants || 2;
        const isJoined = joinedIds.has(e._id) || e.participants?.some(p => p === user?._id || p?._id === user?._id);
        const isCreator = e.creator?._id === user?._id || e.creator === user?._id;

        const popup = makePopup(`
          <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#F1F0F7">${emoji} ${e.title}</p>
          <p style="margin:0 0 6px;font-size:11px;color:#F43F5E;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">${e.category}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#A8A3C7">📍 ${e.location?.city || ''}${e.location?.venue ? `, ${e.location.venue}` : ''}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#A8A3C7">📅 ${fmt(e.date)} · ${e.timeSlot || ''}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#A8A3C7">👥 ${joined} / ${max} joined</p>
          ${e.creator?.name ? `<p style="margin:0;font-size:11px;color:#6E6893">by ${e.creator.name}</p>` : ''}
          ${!isCreator ? `<button id="join-btn-${e._id}" class="sk-join-btn" onclick="window.__skJoin('${e._id}')" ${isJoined ? 'disabled' : ''}>${isJoined ? '✓ Joined' : 'Join Event'}</button>` : `<div style="margin-top:10px;text-align:center;font-size:12px;color:#7C3AED;font-weight:600">Your Event</div>`}
        `);

        const el = makeEl(emoji, 'linear-gradient(135deg,#F43F5E,#FB923C)');
        const marker = addMarker(coords, el, popup);

        // Click: set selectedEventId WITHOUT re-rendering markers
        el.addEventListener('click', () => {
          setSelectedEventId(e._id);
        });

        popup.on('close', () => {
          setSelectedEventId(prev => prev === e._id ? null : prev);
          activePopupRef.current = null;
        });

        eventMarkersRef.current[e._id] = { marker, popup, coords };
      });
    }
  }, [matches, activeMatches, events, activeTab, joinedIds]);

  // When selectedEventId changes, open popup + highlight — no marker rebuild
  useEffect(() => {
    if (!selectedEventId || !map.current) return;
    const entry = eventMarkersRef.current[selectedEventId];
    if (!entry) return;

    // Close previous popup
    if (activePopupRef.current && activePopupRef.current !== entry.popup) {
      activePopupRef.current.remove();
    }

    map.current.flyTo({ center: entry.coords, zoom: 14, duration: 800 });
    entry.marker.togglePopup();
    activePopupRef.current = entry.popup;
  }, [selectedEventId]);

  const handleRoute = async () => {
    const destCoords = getCityCoords(destination.trim().toLowerCase());
    if (!destCoords) return toast.error('City not found. Try: Bhubaneswar, Mumbai, Delhi...');
    if (!myCoords) return toast.error('Please set your city in profile first.');

    const el = document.createElement('div');
    el.style.cssText = 'width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#FBBF24,#F59E0B);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(0,0,0,0.5);border:2.5px solid rgba(255,255,255,0.2);cursor:pointer';
    el.textContent = '🏁';
    new mapboxgl.Marker(el).setLngLat(destCoords).addTo(map.current);

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${myCoords[0]},${myCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      const routeGeometry = data.routes?.[0]?.geometry;
      const distKm = ((data.routes?.[0]?.distance || 0) / 1000).toFixed(0);
      const durMin = Math.round((data.routes?.[0]?.duration || 0) / 60);

      const geojson = routeGeometry
        ? { type: 'Feature', geometry: routeGeometry }
        : { type: 'Feature', geometry: { type: 'LineString', coordinates: [myCoords, destCoords] } };

      if (map.current.getSource('route')) {
        map.current.getSource('route').setData(geojson);
      } else {
        map.current.addSource('route', { type: 'geojson', data: geojson });
        map.current.addLayer({ id: 'route-casing', type: 'line', source: 'route', paint: { 'line-color': '#2DD4BF', 'line-width': 8, 'line-opacity': 0.25 } });
        map.current.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#7C3AED', 'line-width': 4, 'line-opacity': 0.9 } });
      }

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(myCoords);
      bounds.extend(destCoords);
      map.current.fitBounds(bounds, { padding: 80, duration: 1500 });
      setRouteAdded(true);
      toast.success(`🚗 ${destination} · ${distKm} km · ~${durMin} min`);
    } catch {
      toast.error('Could not fetch route');
    }
  };

  const clearRoute = () => {
    ['route', 'route-casing'].forEach(id => {
      if (map.current.getLayer(id)) map.current.removeLayer(id);
    });
    if (map.current.getSource('route')) map.current.removeSource('route');
    setDestination('');
    setRouteAdded(false);
  };

  const visibleEvents = (activeTab === 'all' || activeTab === 'events') ? events : [];

  const tabs = [
    { key: 'all',     label: 'All',         icon: MapPin },
    { key: 'matches', label: 'Matches',      icon: Zap },
    { key: 'active',  label: 'Connections',  icon: Users },
    { key: 'events',  label: 'Events',       icon: Calendar },
  ];

  return (
    <AppLayout noPadding>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

        {/* ── Map ── */}
        <div style={{ position: 'relative', flex: '0 0 55%' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

          {/* Search bar */}
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
            <input value={destination} onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRoute()}
              placeholder="Enter destination city..."
              style={{ flex: 1, height: 44, borderRadius: 12, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(15,11,33,0.9)', backdropFilter: 'blur(12px)', color: '#F1F0F7', padding: '0 16px', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' }}
            />
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleRoute}
              style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#2DD4BF)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={18} color="white" />
            </motion.button>
            {routeAdded && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={clearRoute}
                style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#F87171" />
              </motion.button>
            )}
          </div>

          {/* Legend */}
          <div style={{ position: 'absolute', top: 72, left: 16, zIndex: 10, background: 'rgba(15,11,33,0.9)', backdropFilter: 'blur(12px)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)', padding: '10px 14px' }}>
            {[
              { label: 'You',        dot: '#7C3AED' },
              { label: 'Match',      dot: '#7C3AED' },
              { label: 'Connected',  dot: '#34D399' },
              { label: 'Event',      dot: '#F43F5E' },
              { label: 'Destination',dot: '#FBBF24' },
            ].map(({ label, dot }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: dot, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Tab filter */}
          <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, zIndex: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <motion.button key={key} whileTap={{ scale: 0.93 }} onClick={() => setActiveTab(key)}
                style={{ height: 34, padding: '0 12px', borderRadius: 20, border: `1px solid ${activeTab === key ? 'transparent' : 'rgba(124,58,237,0.3)'}`, background: activeTab === key ? 'linear-gradient(135deg,#7C3AED,#2DD4BF)' : 'rgba(15,11,33,0.85)', backdropFilter: 'blur(12px)', color: activeTab === key ? 'white' : '#A8A3C7', fontSize: 12, fontWeight: activeTab === key ? 600 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon size={12} />{label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ background: 'rgba(15,11,33,0.95)', borderTop: '1px solid #2D2653', borderBottom: '1px solid #2D2653', padding: '8px 20px', display: 'flex', justifyContent: 'space-around', flexShrink: 0 }}>
          {[
            { label: 'Matches',   value: stats.matches,     color: '#7C3AED' },
            { label: 'Connected', value: stats.connections,  color: '#34D399' },
            { label: 'Events',    value: stats.events,       color: '#F43F5E' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color, margin: 0 }}>{value}</p>
              <p style={{ fontSize: 10, color: '#6E6893', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Event List Panel ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#0F0B21', padding: '12px 16px 80px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6E6893', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {visibleEvents.length > 0 ? `${visibleEvents.length} Events Nearby` : 'No Events'}
          </p>

          {visibleEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#4A4570', fontSize: 13 }}>
              Switch to "All" or "Events" tab to see events
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleEvents.map((e) => {
              const emoji = getEventEmoji(e.category);
              const joined = e.participants?.length || 0;
              const max = e.maxParticipants || 2;
              const isSelected = selectedEventId === e._id;

              return (
                <motion.div
                  key={e._id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEventId(e._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
                    background: isSelected ? 'rgba(124,58,237,0.12)' : '#1A1535',
                    border: `1px solid ${isSelected ? '#7C3AED' : '#2D2653'}`,
                    boxShadow: isSelected ? '0 0 0 1px rgba(124,58,237,0.3), 0 4px 16px rgba(124,58,237,0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#F43F5E22,#FB923C22)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#F1F0F7', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#A8A3C7', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📍 {e.location?.city || '—'} · {e.timeSlot || fmt(e.date)}
                    </p>
                  </div>

                  {/* Participants */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 12, color: joined >= max ? '#F87171' : '#34D399', fontWeight: 600, margin: 0 }}>
                      👥 {joined}/{max}
                    </p>
                    <p style={{ fontSize: 10, color: '#6E6893', margin: '2px 0 0' }}>
                      {joined >= max ? 'Full' : `${max - joined} left`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
