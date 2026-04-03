// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';

import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import VerifyOtpPage    from './pages/VerifyOtpPage';
import VerifyIdPage     from './pages/VerifyIdPage';
import SetupProfilePage from './pages/SetupProfilePage';
import DashboardPage    from './pages/DashboardPage';
import MatchPage        from './pages/MatchPage';
import ChatListPage     from './pages/ChatListPage';
import ChatRoomPage     from './pages/ChatRoomPage';
import EventsPage       from './pages/EventsPage';
import ProfilePage      from './pages/ProfilePage';
import StatusPage       from './pages/StatusPage';
import MapPage          from './pages/MapPage';

const pv = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit:    { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18 } },
};

const PW = ({ children }) => (
  <motion.div variants={pv} initial="initial" animate="animate" exit="exit" style={{ height: '100%' }}>
    {children}
  </motion.div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F0B21' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login"         element={<PW><LoginPage /></PW>} />
        <Route path="/register"      element={<PW><RegisterPage /></PW>} />
        <Route path="/verify-otp"    element={<PW><VerifyOtpPage /></PW>} />
        <Route path="/verify-id"     element={<PrivateRoute><PW><VerifyIdPage /></PW></PrivateRoute>} />
        <Route path="/setup-profile" element={<PrivateRoute><PW><SetupProfilePage /></PW></PrivateRoute>} />
        <Route path="/dashboard"     element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/match"         element={<PrivateRoute><MatchPage /></PrivateRoute>} />
        <Route path="/chats"         element={<PrivateRoute><ChatListPage /></PrivateRoute>} />
        <Route path="/chat/:roomId"  element={<PrivateRoute><ChatRoomPage /></PrivateRoute>} />
        <Route path="/events"        element={<PrivateRoute><EventsPage /></PrivateRoute>} />
        <Route path="/profile"       element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/status"        element={<PrivateRoute><PW><StatusPage /></PW></PrivateRoute>} />
        <Route path="/map"           element={<PrivateRoute><MapPage /></PrivateRoute>} />
        <Route path="*"              element={<Navigate to="/login" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <SmoothScrollProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A1535',
                color: '#F1F0F7',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 1px rgba(124,58,237,0.2)',
                borderRadius: '14px',
                border: '1px solid #2D2653',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#34D399', secondary: '#0F0B21' } },
              error:   { iconTheme: { primary: '#F87171', secondary: '#0F0B21' } },
              duration: 3000,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </SmoothScrollProvider>
  );
}
