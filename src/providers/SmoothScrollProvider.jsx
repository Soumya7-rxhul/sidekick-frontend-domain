// src/providers/SmoothScrollProvider.jsx
import React, { createContext, useContext, useRef } from 'react';

const LenisContext = createContext(null);
export const useLenis = () => useContext(LenisContext);

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  );
}
