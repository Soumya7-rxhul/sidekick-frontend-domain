/**
 * components/LocationAutocomplete.tsx
 *
 * Reusable location autocomplete backed by Mapbox Geocoding API.
 *
 * Key behaviours preserved from existing project:
 *  - Uses NEXT_PUBLIC_MAPBOX_TOKEN (env var)
 *  - types=place, limit=5
 *  - 300ms debounce
 *  - AbortController cancels in-flight requests
 *  - Keyboard navigation (↑ ↓ Enter Escape)
 *  - Clear button
 *  - Free-text rejected on blur — only valid selections allowed
 *  - Returns { name, place_name, lat, lng, country }
 *
 * Does NOT patch any existing file.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  KeyboardEvent,
  FC,
} from 'react';

// ─────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────

/** Shape returned to the parent via onChange */
export interface LocationResult {
  /** Short city / place name  e.g. "Bhubaneswar" */
  name: string;
  /** Full Mapbox place_name  e.g. "Bhubaneswar, Odisha, India" */
  place_name: string;
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Country name  e.g. "India" */
  country: string;
}

/** Internal suggestion shape (richer than what we expose) */
interface Suggestion {
  /** Mapbox feature id — used as React key */
  id: string;
  /** Short name (feature.text) */
  name: string;
  /** Full place name (feature.place_name) */
  place_name: string;
  lat: number;
  lng: number;
  country: string;
}

/** Props accepted by LocationAutocomplete */
export interface LocationAutocompleteProps {
  /** Controlled display value — pass the place_name of the selected location */
  value?: string;
  /**
   * Called when the user selects a valid suggestion.
   * Called with `null` when the field is cleared.
   */
  onChange: (location: LocationResult | null) => void;
  /** Input placeholder text */
  placeholder?: string;
  /** Floating label shown above the input when active */
  label?: string;
  /** Inline error message shown below the input */
  error?: string;
  /**
   * ISO 3166-1 alpha-2 country code to restrict results.
   * e.g. "in" for India, "us" for United States.
   * Omit to search globally.
   */
  country?: string;
  disabled?: boolean;
  required?: boolean;
  /** Extra class names applied to the root wrapper */
  className?: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const DEBOUNCE_MS = 300;
const MIN_CHARS   = 2;
const LIMIT       = 5;
const TYPES       = 'place'; // as required by spec

// ─────────────────────────────────────────────────────────────
// Debounce hook
// ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

const LocationAutocomplete: FC<LocationAutocompleteProps> = memo(
  function LocationAutocomplete({
    value       = '',
    onChange,
    placeholder = 'Enter your city',
    label       = 'Location',
    error,
    country,
    disabled    = false,
    required    = false,
    className   = '',
  }) {
    const [inputVal,    setInputVal]    = useState<string>(value);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading,     setLoading]     = useState<boolean>(false);
    const [open,        setOpen]        = useState<boolean>(false);
    const [focused,     setFocused]     = useState<boolean>(false);
    const [activeIdx,   setActiveIdx]   = useState<number>(-1);
    /**
     * committed = true once the user has selected a valid suggestion.
     * Prevents free-text from being submitted.
     */
    const [committed, setCommitted] = useState<boolean>(!!value);

    const inputRef  = useRef<HTMLInputElement>(null);
    const listRef   = useRef<HTMLUListElement>(null);
    const abortRef  = useRef<AbortController | null>(null);

    const debouncedQuery = useDebounce(inputVal, DEBOUNCE_MS);

    // ── Sync external value ──────────────────────────────────
    useEffect(() => {
      setInputVal(value);
      setCommitted(!!value);
    }, [value]);

    // ── Fetch suggestions ────────────────────────────────────
    useEffect(() => {
      if (!debouncedQuery || debouncedQuery.length < MIN_CHARS || committed) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
            access_token: MAPBOX_TOKEN,
            autocomplete: 'true',
            types:        TYPES,
            limit:        String(LIMIT),
            language:     'en',
            ...(country ? { country } : {}),
          });

          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              debouncedQuery
            )}.json?${params.toString()}`,
            { signal: abortRef.current!.signal }
          );

          if (!res.ok) throw new Error(`Mapbox ${res.status}`);

          const data = await res.json();

          const results: Suggestion[] = (data.features ?? []).map(
            (f: any): Suggestion => ({
              id:         f.id as string,
              name:       f.text as string,
              place_name: f.place_name as string,
              lat:        (f.center as [number, number])[1],
              lng:        (f.center as [number, number])[0],
              country:
                (f.context as any[] | undefined)
                  ?.find((c: any) => (c.id as string).startsWith('country'))
                  ?.text ?? '',
            })
          );

          setSuggestions(results);
          setOpen(results.length > 0);
          setActiveIdx(-1);
        } catch (err: unknown) {
          if ((err as Error).name !== 'AbortError') {
            setSuggestions([]);
            setOpen(false);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchSuggestions();

      return () => {
        abortRef.current?.abort();
      };
    }, [debouncedQuery, committed, country]);

    // ── Select a suggestion ──────────────────────────────────
    const select = useCallback(
      (item: Suggestion) => {
        setInputVal(item.place_name);
        setCommitted(true);
        setSuggestions([]);
        setOpen(false);
        setActiveIdx(-1);
        onChange({
          name:       item.name,
          place_name: item.place_name,
          lat:        item.lat,
          lng:        item.lng,
          country:    item.country,
        });
        inputRef.current?.blur();
      },
      [onChange]
    );

    // ── Clear ────────────────────────────────────────────────
    const clear = useCallback(() => {
      setInputVal('');
      setCommitted(false);
      setSuggestions([]);
      setOpen(false);
      onChange(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, [onChange]);

    // ── Keyboard navigation ──────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIdx(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          if (activeIdx >= 0) {
            e.preventDefault();
            select(suggestions[activeIdx]);
          }
          break;
        case 'Escape':
          setOpen(false);
          setActiveIdx(-1);
          break;
      }
    };

    // ── Scroll active item into view ─────────────────────────
    useEffect(() => {
      if (activeIdx < 0 || !listRef.current) return;
      const item = listRef.current.children[activeIdx] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }, [activeIdx]);

    // ── Blur: reject free-text ───────────────────────────────
    const handleBlur = () => {
      setFocused(false);
      // Delay so mousedown on a suggestion fires before blur clears state
      setTimeout(() => {
        if (!committed) {
          setInputVal('');
          setSuggestions([]);
          setOpen(false);
          onChange(null);
        }
      }, 150);
    };

    // ── Derived state ────────────────────────────────────────
    const hasVal  = inputVal.length > 0;
    const isActive = focused || hasVal;
    const showErr  = !!error;

    // ── Inline style tokens (matches SideKick design system) ─
    const S = {
      root: {
        position: 'relative' as const,
        marginBottom: 4,
      },
      floatingLabel: {
        position:      'absolute' as const,
        top:           -20,
        left:          0,
        fontSize:      11,
        fontWeight:    700,
        color:         focused ? '#7C3AED' : '#6E6893',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        pointerEvents: 'none' as const,
        transition:    'color 0.2s',
      },
      inputWrap: {
        position: 'relative' as const,
      },
      pinIcon: {
        position:  'absolute' as const,
        left:      14,
        top:       '50%',
        transform: 'translateY(-50%)',
        color:     focused ? '#7C3AED' : committed ? '#2DD4BF' : '#6E6893',
        transition:'color 0.25s',
        pointerEvents: 'none' as const,
        zIndex:    1,
        fontSize:  18,
      },
      input: {
        width:        '100%',
        height:       52,
        background:   focused ? '#362F5E' : '#2D2653',
        border:       `1.5px solid ${
          showErr    ? '#F87171'
          : focused  ? '#7C3AED'
          : committed? '#2DD4BF'
          :            '#433B72'
        }`,
        borderRadius: 14,
        paddingLeft:  44,
        paddingRight: hasVal ? 44 : 16,
        color:        '#F1F0F7',
        fontSize:     14,
        fontFamily:   'Inter, sans-serif',
        outline:      'none',
        boxShadow:    showErr
          ? '0 0 0 3px rgba(248,113,113,0.2)'
          : focused
          ? '0 0 0 3px rgba(124,58,237,0.3)'
          : 'none',
        transition:   'all 0.25s ease',
        cursor:       disabled ? 'not-allowed' : 'text',
        opacity:      disabled ? 0.5 : 1,
      } as React.CSSProperties,
      rightSlot: {
        position:  'absolute' as const,
        right:     12,
        top:       '50%',
        transform: 'translateY(-50%)',
        display:   'flex',
        alignItems:'center',
      },
      clearBtn: {
        width:          22,
        height:         22,
        borderRadius:   '50%',
        background:     '#433B72',
        border:         'none',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        padding:        0,
      } as React.CSSProperties,
      dropdown: {
        position:    'absolute' as const,
        top:         'calc(100% + 6px)',
        left:        0,
        right:       0,
        background:  '#1A1535',
        border:      '1px solid #2D2653',
        borderRadius:14,
        boxShadow:   '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
        zIndex:      9999,
        listStyle:   'none',
        margin:      0,
        padding:     '6px 0',
        maxHeight:   260,
        overflowY:   'auto' as const,
        scrollbarWidth: 'none' as const,
      },
      errorMsg: {
        fontSize:   12,
        color:      '#F87171',
        marginTop:  4,
        fontFamily: 'Inter, sans-serif',
      },
    };

    return (
      <div style={S.root} className={className}>
        {/* Floating label */}
        {isActive && label && (
          <label style={S.floatingLabel}>{label}</label>
        )}

        {/* Input wrapper */}
        <div style={S.inputWrap}>
          {/* MapPin SVG (no external dep needed) */}
          <svg
            style={S.pinIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            placeholder={!isActive && label ? label : placeholder}
            disabled={disabled}
            required={required}
            autoComplete="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-haspopup="listbox"
            role="combobox"
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
            style={S.input}
          />

          {/* Right slot: spinner or clear */}
          <div style={S.rightSlot}>
            {loading ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ animation: 'la-spin 0.8s linear infinite' }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : hasVal ? (
              <button
                type="button"
                onClick={clear}
                style={S.clearBtn}
                aria-label="Clear location"
              >
                {/* X icon */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A8A3C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {/* Dropdown */}
        {open && suggestions.length > 0 && (
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Location suggestions"
            style={S.dropdown}
          >
            {suggestions.map((item, idx) => (
              <SuggestionRow
                key={item.id}
                item={item}
                isActive={idx === activeIdx}
                onSelect={select}
                onHover={() => setActiveIdx(idx)}
              />
            ))}
          </ul>
        )}

        {/* Error */}
        {showErr && <p style={S.errorMsg}>{error}</p>}

        {/* Keyframe for spinner */}
        <style>{`@keyframes la-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
);

// ─────────────────────────────────────────────────────────────
// Suggestion row
// ─────────────────────────────────────────────────────────────

interface SuggestionRowProps {
  item:     Suggestion;
  isActive: boolean;
  onSelect: (item: Suggestion) => void;
  onHover:  () => void;
}

const SuggestionRow: FC<SuggestionRowProps> = memo(
  function SuggestionRow({ item, isActive, onSelect, onHover }) {
    const parts     = item.place_name.split(', ');
    const primary   = parts[0];
    const secondary = parts.slice(1).join(', ');

    return (
      <li
        role="option"
        aria-selected={isActive}
        onMouseDown={e => { e.preventDefault(); onSelect(item); }}
        onMouseEnter={onHover}
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         10,
          padding:     '10px 14px',
          cursor:      'pointer',
          background:  isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
          borderLeft:  `2px solid ${isActive ? '#7C3AED' : 'transparent'}`,
          transition:  'background 0.12s, border-color 0.12s',
        }}
      >
        {/* Pin icon */}
        <div
          style={{
            width:          30,
            height:         30,
            borderRadius:   8,
            flexShrink:     0,
            background:     isActive ? 'rgba(124,58,237,0.2)' : 'rgba(45,38,83,0.8)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            transition:     'background 0.12s',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isActive ? '#7C3AED' : '#6E6893'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize:     14,
              fontWeight:   600,
              color:        isActive ? '#F1F0F7' : '#C4B5FD',
              margin:       0,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
              fontFamily:   'Inter, sans-serif',
            }}
          >
            {primary}
          </p>
          {secondary && (
            <p
              style={{
                fontSize:     12,
                color:        '#6E6893',
                margin:       '1px 0 0',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
                fontFamily:   'Inter, sans-serif',
              }}
            >
              {secondary}
            </p>
          )}
        </div>
      </li>
    );
  }
);

export default LocationAutocomplete;

// ─────────────────────────────────────────────────────────────
// Example usage (do not import — reference only)
// ─────────────────────────────────────────────────────────────
//
// import LocationAutocomplete, {
//   LocationResult,
// } from '@/components/LocationAutocomplete';
//
// function SignupForm() {
//   const [location, setLocation] = useState<LocationResult | null>(null);
//
//   return (
//     <LocationAutocomplete
//       value={location?.place_name ?? ''}
//       onChange={(loc) => setLocation(loc)}
//       placeholder="Enter your city"
//       label="City"
//       country="in"           // restrict to India (optional)
//       error={!location ? 'Please select a valid city' : undefined}
//       required
//     />
//   );
// }
//
// // What onChange receives on selection:
// // {
// //   name:       "Bhubaneswar",
// //   place_name: "Bhubaneswar, Odisha, India",
// //   lat:        20.2961,
// //   lng:        85.8245,
// //   country:    "India",
// // }
//
// // onChange(null) is called when:
// //   - user clicks the clear (×) button
// //   - user types free text and blurs without selecting
