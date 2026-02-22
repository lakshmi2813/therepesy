import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email) => setForm({ email, password: 'password123' });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 60%, #0d9488 100%)',
      fontFamily: "'DM Sans', sans-serif", padding: '1rem'
    }}>
      <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d9488', borderRadius: 12, padding: '8px 16px', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#fff', letterSpacing: 2 }}>MGM</span>
          </div>
          <h1 style={{ fontFamily: 'serif', fontSize: '1.8rem', color: '#fff', margin: 0 }}>Therapy Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.88rem', marginTop: '.3rem' }}>MGM Hospital · Mental Health Division</p>
        </div>

        {/* Quick Login Buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.5rem', textAlign: 'center' }}>Quick Demo Login</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem' }}>
            {[
              { label: '👨‍💼 Supervisor', email: 'supervisor@mgmhospital.in' },
              { label: '🧑‍⚕️ Therapist',  email: 'riya.mehta@mgmhospital.in' },
              { label: '🙋 Patient',    email: 'aarav.sharma@gmail.com' }
            ].map(({ label, email }) => (
              <button key={email} onClick={() => quickLogin(email)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '.5rem .3rem', borderRadius: 9, cursor: 'pointer', fontSize: '.72rem', transition: 'all .15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '.8rem', marginBottom: '.4rem' }}>Email</label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '.75rem', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' }}
              placeholder="your@email.com"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '.8rem', marginBottom: '.4rem' }}>Password</label>
            <input
              type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '.75rem', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: 8, padding: '.6rem .8rem', color: '#fca5a5', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '.85rem', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '.82rem', marginTop: '1.25rem' }}>
          New patient? <Link to="/register" style={{ color: '#5eead4' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
