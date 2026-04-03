// src/components/ui/LocationAutocomplete.jsx
//
// Reusable location autocomplete backed by Mapbox Geocoding API.
// Enforces selection-only — free-text is rejected on blur.
//
// Props:
//   value        string          — controlled value (display name)
//   onChange     (location) => void
//                location: { name, city, country, coords: [lng, lat] }
//   placeholder  string          — input placeholder
//   label        string          — floating label text
//   icon         LucideIcon      — optional left icon
//   error        string          — error message
//   types        string          — Mapbox types filter (default: 'place,locality,neighborhood')
//   country      string          — ISO country filter e.g. 'in' (optional)
//   disabled     boolean
//   required     boolean

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader, X } from 'lucide-react';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const DEBOUNCE_MS  = 300;
const MIN_CHARS    = 2;

// ── Debounce hook ─────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Main component ────────────────────────────────────────
const LocationAutocomplete = memo(function LocationAutocomplete({
  value       = '',
  onChange,
  placeholder = 'Enter your city',
  label       = 'Location',
  icon: Icon  = MapPin,
  error,
  types       = 'place,locality,neighborhood',
  country,
  disabled    = false,
  required    = false,
}) {
  const [inputVal,    setInputVal]    = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const [focused,     setFocused]     = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [committed,   setCommitted]   = useState(!!value); // true once a valid option is selected

  const inputRef      = useRef(null);
  const listRef       = useRef(null);
  const abortRef      = useRef(null);
  const selectingRef  = useRef(false); // true while pointer is held on dropdown

  const debouncedQuery = useDebounce(inputVal, DEBOUNCE_MS);

  // Sync external value changes
  useEffect(() => {
    setInputVal(value);
    setCommitted(!!value);
  }, [value]);

  // ── Fetch suggestions ─────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < MIN_CHARS || committed) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          access_token: MAPBOX_TOKEN,
          autocomplete:  'true',
          types,
          limit:         '6',
          language:      'en',
          ...(country ? { country } : {}),
        });

        const res  = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery)}.json?${params}`,
          { signal: abortRef.current.signal }
        );
        const data = await res.json();

        const results = (data.features || []).map(f => ({
          id:      f.id,
          name:    f.text,
          full:    f.place_name,
          city:    f.text,
          country: f.context?.find(c => c.id.startsWith('country'))?.text || '',
          coords:  f.center, // [lng, lat]
        }));

        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIdx(-1);
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    return () => abortRef.current?.abort();
  }, [debouncedQuery, committed, types, country]);

  // ── Select a suggestion ───────────────────────────────
  const select = useCallback((item) => {
    setInputVal(item.full);
    setCommitted(true);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    onChange?.({
      name:    item.full,
      city:    item.city,
      country: item.country,
      coords:  item.coords,
    });
    inputRef.current?.blur();
  }, [onChange]);

  // ── Clear ─────────────────────────────────────────────
  const clear = useCallback(() => {
    setInputVal('');
    setCommitted(false);
    setSuggestions([]);
    setOpen(false);
    onChange?.(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [onChange]);

  // ── Keyboard navigation ───────────────────────────────
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      select(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  // ── Scroll active item into view ──────────────────────
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIdx];
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // ── Blur: reject free-text ────────────────────────────
  const handleBlur = () => {
    setFocused(false);
    // If pointer is held on the dropdown, skip — selection is in progress
    if (selectingRef.current) return;
    setTimeout(() => {
      if (!committed && !selectingRef.current) {
        setInputVal('');
        setSuggestions([]);
        setOpen(false);
        onChange?.(null);
      }
    }, 150);
  };

  const hasVal  = inputVal.length > 0;
  const active  = focused || hasVal;
  const showErr = !!error;

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      {/* Floating label */}
      <AnimatePresence>
        {active && label && (
          <motion.label
            key="label"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{
              position: 'absolute', top: -20, left: 0,
              fontSize: 11, fontWeight: 700,
              color: focused ? '#7C3AED' : '#6E6893',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              pointerEvents: 'none',
            }}
          >
            {label}
          </motion.label>
        )}
      </AnimatePresence>

      {/* Input wrapper */}
      <div style={{ position: 'relative' }}>
        {/* Left icon */}
        <Icon
          size={18}
          style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? '#7C3AED' : committed ? '#2DD4BF' : '#6E6893',
            transition: 'color 0.25s', pointerEvents: 'none', zIndex: 1,
          }}
        />

        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          placeholder={!active && label ? label : placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          spellCheck={false}
          onChange={e => {
            setInputVal(e.target.value);
            setCommitted(false);
          }}
          onFocus={() => {
            setFocused(true);
            if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%', height: 52,
            background: focused ? '#362F5E' : '#2D2653',
            border: `1.5px solid ${showErr ? '#F87171' : focused ? '#7C3AED' : committed ? '#2DD4BF' : '#433B72'}`,
            borderRadius: 14,
            paddingLeft: 44,
            paddingRight: hasVal ? 44 : 16,
            color: '#F1F0F7', fontSize: 14,
            fontFamily: 'Inter, sans-serif', outline: 'none',
            boxShadow: showErr
              ? '0 0 0 3px rgba(248,113,113,0.2)'
              : focused
              ? '0 0 0 3px rgba(124,58,237,0.3)'
              : 'none',
            transition: 'all 0.25s ease',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.5 : 1,
          }}
        />

        {/* Right: spinner or clear */}
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader
                  size={16}
                  color="#7C3AED"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
              </motion.div>
            ) : hasVal ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                whileTap={{ scale: 0.85 }}
                onClick={clear}
                type="button"
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#433B72', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={12} color="#A8A3C7" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Dropdown — plain <ul> so ref points directly to the DOM node */}
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          onMouseDown={() => { selectingRef.current = true; }}
          onMouseUp={() => { selectingRef.current = false; }}
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: '#1A1535',
            border: '1px solid #2D2653',
            borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
            zIndex: 9999,
            listStyle: 'none', margin: 0, padding: '6px 0',
            maxHeight: 280, overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {suggestions.map((item, idx) => (
            <SuggestionItem
              key={item.id}
              item={item}
              isActive={idx === activeIdx}
              onSelect={select}
              onHover={() => setActiveIdx(idx)}
            />
          ))}
        </ul>
      )}

      {/* Error message */}
      <AnimatePresence>
        {showErr && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: '#F87171', marginTop: 4, fontFamily: 'Inter, sans-serif' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
});

// ── Suggestion row ────────────────────────────────────────
const SuggestionItem = memo(function SuggestionItem({ item, isActive, onSelect, onHover }) {
  // Split full place name: "Bhubaneswar, Odisha, India" → bold first part, muted rest
  const parts = item.full.split(', ');
  const primary   = parts[0];
  const secondary = parts.slice(1).join(', ');

  return (
    <li
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      onMouseEnter={onHover}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', cursor: 'pointer',
        background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
        borderLeft: `2px solid ${isActive ? '#7C3AED' : 'transparent'}`,
        transition: 'background 0.12s, border-color 0.12s',
      }}
    >
      {/* Pin icon */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: isActive ? 'rgba(124,58,237,0.2)' : 'rgba(45,38,83,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.12s',
      }}>
        <MapPin size={14} color={isActive ? '#7C3AED' : '#6E6893'} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 600,
          color: isActive ? '#F1F0F7' : '#C4B5FD',
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: 'Inter, sans-serif',
        }}>
          {primary}
        </p>
        {secondary && (
          <p style={{
            fontSize: 12, color: '#6E6893', margin: '1px 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}>
            {secondary}
          </p>
        )}
      </div>
    </li>
  );
});

export default LocationAutocomplete;
