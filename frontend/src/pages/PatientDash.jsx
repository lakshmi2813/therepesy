import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getPatientDashboard, getMoods, logMood } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const S = {
  card: { background:'#fff', borderRadius:14, padding:'1.5rem', boxShadow:'0 4px 24px rgba(13,148,136,0.08)', border:'1px solid rgba(13,148,136,0.08)', marginBottom:'1rem' },
  badge: (type) => {
    const map = { completed:'#dcfce7:#166534', scheduled:'#dbeafe:#1e40af', individual:'#ccfbf1:#0f766e', group:'#ede9fe:#5b21b6' };
    const [bg,color] = (map[type]||'#f1f5f9:#475569').split(':');
    return { display:'inline-block', padding:'.2rem .6rem', borderRadius:20, fontSize:'.72rem', fontWeight:600, background:bg, color };
  }
};

const MOODS = [
  { label:'😊 Happy', score:9 }, { label:'😌 Calm', score:7 }, { label:'🔥 Motivated', score:8 },
  { label:'😟 Anxious', score:3 }, { label:'😔 Sad', score:2 }, { label:'😤 Frustrated', score:3 },
  { label:'😴 Tired', score:4 }, { label:'😰 Stressed', score:2 }
];

export default function PatientDash() {
  const [tab, setTab]         = useState('overview');
  const [data, setData]       = useState(null);
  const [moods, setMoods]     = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote]       = useState('');
  const [moodMsg, setMoodMsg] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [d, m] = await Promise.all([getPatientDashboard(), getMoods()]);
    setData(d.data); setMoods(m.data.moods);
  };

  const submitMood = async () => {
    if (!selectedMood) return alert('Please select a mood');
    await logMood({ mood: selectedMood.label.split(' ')[1], score: selectedMood.score, emoji: selectedMood.label.split(' ')[0], note });
    setMoodMsg('✅ Mood logged! Your therapist has been notified.');
    setSelectedMood(null); setNote('');
    loadData();
    setTimeout(() => setMoodMsg(''), 4000);
  };

  const therapist = data?.assignment?.therapist;
  const upcoming  = data?.upcoming || [];
  const moodChartData = moods.slice(0,7).reverse().map((m,i) => ({ day: `Day ${i+1}`, score: m.score }));

  if (!data) return <div style={{ padding:'2rem' }}>Loading…</div>;

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'overview' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}>
            <h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Your Therapy Journey 🌱</h2>
            <p style={{ color:'#94a3b8', fontSize:'.9rem' }}>MGM Hospital · Mental Health Division</p>
          </div>
          {!data.assignment && (
            <div style={{ background:'#fef9c3', border:'1px solid #fde047', borderRadius:10, padding:'.75rem 1rem', fontSize:'.88rem', color:'#713f12', marginBottom:'1rem' }}>
              ⏳ You haven't been assigned a therapist yet. A supervisor will assign one to you shortly.
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
            <div style={{ ...S.card, marginBottom:0 }}><div style={{ float:'right', fontSize:'1.5rem', opacity:.3 }}>📅</div><div style={{ fontSize:'.75rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'.4rem' }}>Sessions Completed</div><div style={{ fontSize:'1.9rem', fontWeight:700, fontFamily:'serif' }}>{data.stats.completedSessions}</div></div>
            <div style={{ ...S.card, marginBottom:0 }}><div style={{ float:'right', fontSize:'1.5rem', opacity:.3 }}>📆</div><div style={{ fontSize:'.75rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'.4rem' }}>Upcoming Sessions</div><div style={{ fontSize:'1.9rem', fontWeight:700, fontFamily:'serif' }}>{upcoming.length}</div></div>
            <div style={{ ...S.card, marginBottom:0 }}><div style={{ float:'right', fontSize:'1.5rem', opacity:.3 }}>💚</div><div style={{ fontSize:'.75rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'.4rem' }}>Mood Logs</div><div style={{ fontSize:'1.9rem', fontWeight:700, fontFamily:'serif' }}>{moods.length}</div></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={S.card}>
              <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>🧑‍⚕️ My Therapist</h3>
              {therapist ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', background:'#0d9488', display:'grid', placeItems:'center', color:'#fff', fontWeight:700, fontSize:'1rem' }}>
                      {therapist.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontWeight:700 }}>{therapist.name}</div>
                      <div style={{ fontSize:'.82rem', color:'#94a3b8' }}>{therapist.specializations?.join(', ')}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:'.85rem', color:'#64748b' }}>📞 Ext. {therapist.extension || 'N/A'} &nbsp;|&nbsp; ✉️ {therapist.email}</div>
                </>
              ) : <p style={{ color:'#94a3b8' }}>Not yet assigned</p>}
            </div>
            <div style={S.card}>
              <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>📅 Upcoming Sessions</h3>
              {upcoming.length === 0 ? <p style={{ color:'#94a3b8' }}>No upcoming sessions scheduled</p> : upcoming.map(s => (
                <div key={s._id} style={{ display:'flex', gap:'1rem', padding:'.6rem 0', borderBottom:'1px solid #f1f5f9', alignItems:'center' }}>
                  <div style={{ fontSize:'.78rem', color:'#94a3b8', fontWeight:600, minWidth:70 }}>{new Date(s.date).toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'})}</div>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:'#0d9488', flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'.88rem' }}>{s.therapy || s.type}</div>
                    <div style={{ fontSize:'.75rem', color:'#94a3b8' }}>{s.duration} min · {s.location || 'MGM Hospital'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'therapist' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>My Therapist</h2></div>
          {therapist ? (
            <div style={S.card}>
              <div style={{ display:'flex', gap:'1.5rem', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'#0d9488', display:'grid', placeItems:'center', color:'#fff', fontWeight:700, fontSize:'1.5rem' }}>
                  {therapist.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <h2 style={{ fontFamily:'serif', fontSize:'1.4rem' }}>{therapist.name}</h2>
                  <p style={{ color:'#94a3b8', fontSize:'.88rem', marginBottom:'.5rem' }}>Clinical Psychologist</p>
                  <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                    {therapist.specializations?.map(s => <span key={s} style={{ background:'#ccfbf1', color:'#0f766e', padding:'.2rem .6rem', borderRadius:20, fontSize:'.72rem', fontWeight:600 }}>{s}</span>)}
                  </div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', fontSize:'.88rem' }}>
                {[
                  { label:'EMAIL', value: therapist.email },
                  { label:'EXTENSION', value: `Ext. ${therapist.extension || 'N/A'}` },
                  { label:'DEPARTMENT', value: therapist.department || 'Mental Health' },
                  { label:'ASSIGNMENT STATUS', value: data.assignment?.status?.toUpperCase() }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize:'.7rem', color:'#94a3b8', marginBottom:'.2rem' }}>{label}</div>
                    <div style={{ fontWeight:500 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={S.card}><p style={{ color:'#94a3b8' }}>No therapist assigned yet. Please check back soon.</p></div>}
        </div>
      )}

      {tab === 'sessions' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>My Sessions</h2></div>
          <div style={S.card}>
            {upcoming.length === 0 ? <p style={{ color:'#94a3b8' }}>No sessions found.</p> : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  <th style={{ textAlign:'left', padding:'.6rem .8rem', fontSize:'.72rem', textTransform:'uppercase', color:'#94a3b8', borderBottom:'1px solid #e2e8f0' }}>Date</th>
                  <th style={{ textAlign:'left', padding:'.6rem .8rem', fontSize:'.72rem', textTransform:'uppercase', color:'#94a3b8', borderBottom:'1px solid #e2e8f0' }}>Therapist</th>
                  <th style={{ textAlign:'left', padding:'.6rem .8rem', fontSize:'.72rem', textTransform:'uppercase', color:'#94a3b8', borderBottom:'1px solid #e2e8f0' }}>Type</th>
                  <th style={{ textAlign:'left', padding:'.6rem .8rem', fontSize:'.72rem', textTransform:'uppercase', color:'#94a3b8', borderBottom:'1px solid #e2e8f0' }}>Status</th>
                </tr></thead>
                <tbody>
                  {upcoming.map(s => (
                    <tr key={s._id}>
                      <td style={{ padding:'.75rem .8rem', borderBottom:'1px solid #f1f5f9', fontSize:'.88rem' }}>{new Date(s.date).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}</td>
                      <td style={{ padding:'.75rem .8rem', borderBottom:'1px solid #f1f5f9', fontSize:'.88rem' }}>{s.therapist?.name}</td>
                      <td style={{ padding:'.75rem .8rem', borderBottom:'1px solid #f1f5f9', fontSize:'.88rem' }}>{s.therapy || s.type}</td>
                      <td style={{ padding:'.75rem .8rem', borderBottom:'1px solid #f1f5f9', fontSize:'.88rem' }}><span style={S.badge(s.status)}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'mood' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Mood Tracker 💚</h2><p style={{ color:'#94a3b8' }}>Log how you're feeling — shared with your therapist</p></div>
          {moodMsg && <div style={{ background:'#dcfce7', border:'1px solid #86efac', borderRadius:10, padding:'.75rem 1rem', marginBottom:'1rem', fontSize:'.9rem', color:'#166534' }}>{moodMsg}</div>}
          <div style={S.card}>
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>How are you feeling right now?</h3>
            <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
              {MOODS.map(m => (
                <div key={m.label} onClick={() => setSelectedMood(m)}
                  style={{ padding:'.4rem .9rem', borderRadius:20, cursor:'pointer', border:`1.5px solid ${selectedMood?.label === m.label ? '#0d9488' : '#e2e8f0'}`, background: selectedMood?.label === m.label ? '#0d9488' : '#fff', color: selectedMood?.label === m.label ? '#fff' : '#334155', fontSize:'.85rem', transition:'all .15s' }}>
                  {m.label}
                </div>
              ))}
            </div>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What's on your mind today? (optional)" style={{ width:'100%', padding:'.7rem', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:'.9rem', fontFamily:'inherit', minHeight:80, resize:'vertical', boxSizing:'border-box', marginBottom:'1rem' }}/>
            <button onClick={submitMood} style={{ background:'#0d9488', color:'#fff', border:'none', borderRadius:9, padding:'.75rem 1.5rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Log Mood</button>
          </div>

          {moods.length > 0 && (
            <div style={S.card}>
              <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>📊 Mood History (Last 7 entries)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={moodChartData}>
                  <XAxis dataKey="day" tick={{ fontSize:11 }} />
                  <YAxis domain={[0,10]} tick={{ fontSize:11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2.5} dot={{ fill:'#0d9488', r:4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop:'1rem' }}>
                {moods.slice(0,5).map(m => (
                  <div key={m._id} style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.5rem 0', borderBottom:'1px solid #f1f5f9', fontSize:'.85rem' }}>
                    <div style={{ fontSize:'1.2rem' }}>{m.emoji}</div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontWeight:600 }}>{m.mood}</span>
                      {m.note && <span style={{ color:'#94a3b8', marginLeft:'.5rem' }}>– {m.note}</span>}
                    </div>
                    <div style={{ fontSize:'.75rem', color:'#94a3b8' }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontWeight:700, color:'#0d9488' }}>{m.score}/10</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
