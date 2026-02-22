import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '', gender: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '.75rem', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '.8rem', marginBottom: '.4rem' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 60%, #0d9488 100%)', fontFamily: "'DM Sans', sans-serif", padding: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 440 }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '1.6rem', color: '#fff', marginBottom: '.3rem' }}>Create Account</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.88rem', marginBottom: '1.5rem' }}>MGM Hospital · Therapy Portal</p>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Dr. / Mr. / Ms. ...' },
            { label: 'Email',     key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Password',  key: 'password', type: 'password', placeholder: 'Min 6 characters' },
            { label: 'Phone',     key: 'phone', type: 'tel', placeholder: '9876543210' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{label}</label>
              <input type={type} required={key !== 'phone'} placeholder={placeholder}
                value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Gender</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={inputStyle}>
              <option value="">Select gender</option>
              <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem' }}>
              {[['patient','🙋','Patient'],['therapist','🧑‍⚕️','Therapist'],['supervisor','👨‍💼','Supervisor']].map(([val, icon, lbl]) => (
                <div key={val} onClick={() => setForm({ ...form, role: val })}
                  style={{ background: form.role === val ? '#0d9488' : 'rgba(255,255,255,0.08)', border: `1.5px solid ${form.role === val ? '#0d9488' : 'rgba(255,255,255,0.15)'}`, borderRadius: 10, padding: '.75rem .3rem', textAlign: 'center', cursor: 'pointer', color: '#fff', fontSize: '.78rem' }}>
                  <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                  <div style={{ marginTop: '.2rem' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: 8, padding: '.6rem .8rem', color: '#fca5a5', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '.85rem', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '.82rem', marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#5eead4' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
