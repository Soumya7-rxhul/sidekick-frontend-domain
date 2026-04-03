// src/hooks/useTilt.js
import { useRef, useCallback } from 'react';

export function useTilt(maxDeg = 1.5) {
  const ref = useRef(null);
  const onMouseMove = useCallback(() => {}, []);
  const onMouseLeave = useCallback(() => {}, []);
  return { ref, onMouseMove, onMouseLeave };
}
