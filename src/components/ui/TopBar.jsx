// src/components/ui/TopBar.jsx
import React, { memo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const TopBar = memo(function TopBar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 56,
      background: 'rgba(15,11,33,0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #2D2653',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
      transition: 'box-shadow 0.3s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      maxWidth: 480, margin: '0 auto',
    }}>
      <span style={{
        fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em',
        background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        SideKick
      </span>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, #7C3AED, #2DD4BF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
      }}>
        {user?.name?.[0]?.toUpperCase() || 'S'}
      </div>
    </header>
  );
});

export default TopBar;
