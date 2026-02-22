import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const navConfig = {
  supervisor: [
    { icon: '🏠', label: 'Overview',        path: '#overview' },
    { icon: '🔗', label: 'Assign Therapist',path: '#assign' },
    { icon: '🧑‍⚕️', label: 'Therapists',     path: '#therapists' },
    { icon: '👥', label: 'All Patients',    path: '#patients' },
    { icon: '📊', label: 'Reports',         path: '#reports' }
  ],
  therapist: [
    { icon: '🏠', label: 'Overview',    path: '#overview' },
    { icon: '👥', label: 'My Patients', path: '#patients' },
    { icon: '📅', label: 'Schedule',    path: '#schedule' },
    { icon: '📝', label: 'Session Notes',path: '#notes' }
  ],
  patient: [
    { icon: '🏠', label: 'Overview',     path: '#overview' },
    { icon: '🧑‍⚕️', label: 'My Therapist',path: '#therapist' },
    { icon: '📅', label: 'Sessions',     path: '#sessions' },
    { icon: '💚', label: 'Mood Tracker', path: '#mood' }
  ]
};

export default function Layout({ children, activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = navConfig[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const avatarColor = { supervisor: '#f59e0b', therapist: '#0d9488', patient: '#8b5cf6' }[user?.role];
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0fdf9', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', padding: '0 .5rem' }}>
          <div style={{ width: 36, height: 36, background: '#0d9488', borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: '1.1rem' }}>🏥</div>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem' }}>MGM Hospital</div>
            <div style={{ fontSize: '.65rem', color: '#94a3b8' }}>Therapy Portal</div>
          </div>
        </div>

        <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', padding: '0 .6rem', marginBottom: '.4rem' }}>Menu</div>
        {nav.map((item) => {
          const isActive = activeTab === item.path.slice(1);
          return (
            <div
              key={item.path}
              onClick={() => onTabChange(item.path.slice(1))}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '.65rem .8rem',
                borderRadius: 9, cursor: 'pointer', fontSize: '.88rem', marginBottom: 2,
                background: isActive ? '#0d9488' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                transition: 'all .15s'
              }}
            >
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.6rem .8rem', background: 'rgba(255,255,255,0.06)', borderRadius: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '.85rem' }}>{initials}</div>
            <div>
              <div style={{ fontSize: '.8rem' }}>{user?.name}</div>
              <div style={{ fontSize: '.7rem', color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', marginTop: '.5rem', padding: '.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
