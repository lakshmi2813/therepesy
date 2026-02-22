import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getTherapistDashboard, getPatients, getSessions, updateSession } from '../services/api';
import { useAuth } from '../context/AuthContext';

const S = {
  card: { background:'#fff', borderRadius:14, padding:'1.5rem', boxShadow:'0 4px 24px rgba(13,148,136,0.08)', border:'1px solid rgba(13,148,136,0.08)', marginBottom:'1rem' },
  badge: (type) => {
    const map = { completed:'#dcfce7:#166534', scheduled:'#dbeafe:#1e40af', cancelled:'#fee2e2:#991b1b', 'no-show':'#fef3c7:#92400e' };
    const [bg,color] = (map[type]||'#f1f5f9:#475569').split(':');
    return { display:'inline-block', padding:'.2rem .6rem', borderRadius:20, fontSize:'.72rem', fontWeight:600, background:bg, color };
  },
  th: { textAlign:'left', padding:'.6rem .8rem', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.5px', color:'#94a3b8', borderBottom:'1px solid #e2e8f0' },
  td: { padding:'.75rem .8rem', borderBottom:'1px solid #f1f5f9', fontSize:'.88rem', verticalAlign:'middle' }
};

export default function TherapistDash() {
  const [tab, setTab]         = useState('overview');
  const [stats, setStats]     = useState(null);
  const [today, setToday]     = useState([]);
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [noteForm, setNoteForm] = useState({ sessionId:'', summary:'', nextSteps:'', homework:'', riskLevel:'low' });
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [d, p, s] = await Promise.all([getTherapistDashboard(), getPatients(), getSessions()]);
    setStats(d.data.stats); setToday(d.data.todaySessions);
    setPatients(p.data.patients); setSessions(s.data.sessions);
  };

  const saveNote = async () => {
    if (!noteForm.sessionId) return alert('Select a session');
    await updateSession(noteForm.sessionId, { notes: { summary: noteForm.summary, nextSteps: noteForm.nextSteps, homework: noteForm.homework, riskLevel: noteForm.riskLevel }, status: 'completed' });
    alert('Session note saved!');
    loadData();
  };

  if (!stats) return <div style={{ padding:'2rem' }}>Loading…</div>;

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'overview' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}>
            <h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Good morning, {user?.name?.split(' ')[1] || user?.name} 👋</h2>
            <p style={{ color:'#94a3b8', fontSize:'.9rem' }}>MGM Hospital · {new Date().toDateString()}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
            {[
              { label:'Active Patients', value:stats.activePatients, icon:'👥' },
              { label:'Sessions Today', value:stats.todayCount, icon:'📅' },
              { label:'Completed Total', value:stats.completedSessions, icon:'✅' },
              { label:'Avg Rating', value:stats.avgRating, icon:'⭐' }
            ].map(s => (
              <div key={s.label} style={{ ...S.card, marginBottom:0 }}>
                <div style={{ float:'right', fontSize:'1.5rem', opacity:.3 }}>{s.icon}</div>
                <div style={{ fontSize:'.75rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'.4rem' }}>{s.label}</div>
                <div style={{ fontSize:'1.9rem', fontWeight:700, fontFamily:'serif' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={S.card}>
              <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>📅 Today's Schedule</h3>
              {today.length === 0 ? <p style={{ color:'#94a3b8' }}>No sessions today</p> : today.map(s => (
                <div key={s._id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'.7rem 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div style={{ fontSize:'.78rem', color:'#94a3b8', fontWeight:600, minWidth:60 }}>{new Date(s.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:'#0d9488', flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'.9rem' }}>{s.patient?.name}</div>
                    <div style={{ fontSize:'.75rem', color:'#94a3b8' }}>{s.therapy || s.type} · {s.duration} min</div>
                  </div>
                  <span style={S.badge(s.status)}>{s.status}</span>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>👥 My Patients</h3>
              {patients.slice(0,5).map(p => (
                <div key={p._id} style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.6rem 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:'#ccfbf1', display:'grid', placeItems:'center', fontSize:'.8rem', fontWeight:700, color:'#0f766e' }}>{p.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'.88rem' }}>{p.name}</div>
                    <div style={{ fontSize:'.75rem', color:'#94a3b8' }}>{p.gender || 'Patient'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'patients' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>My Patients</h2><p style={{ color:'#94a3b8' }}>{patients.length} assigned patients</p></div>
          <div style={S.card}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th style={S.th}>Patient</th><th style={S.th}>Gender</th><th style={S.th}>Phone</th><th style={S.th}>Email</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p._id}>
                    <td style={S.td}><b>{p.name}</b></td>
                    <td style={S.td}>{p.gender || '—'}</td>
                    <td style={S.td}>{p.phone || '—'}</td>
                    <td style={S.td}>{p.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'schedule' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Schedule</h2></div>
          <div style={S.card}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th style={S.th}>Date & Time</th><th style={S.th}>Patient</th><th style={S.th}>Type</th><th style={S.th}>Duration</th><th style={S.th}>Status</th></tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id}>
                    <td style={S.td}>{new Date(s.date).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}</td>
                    <td style={S.td}><b>{s.patient?.name}</b></td>
                    <td style={S.td}>{s.therapy || s.type}</td>
                    <td style={S.td}>{s.duration} min</td>
                    <td style={S.td}><span style={S.badge(s.status)}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Session Notes</h2></div>
          <div style={S.card}>
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Add Session Note</h3>
            {[
              { label:'Select Session', key:'sessionId', type:'select', options: sessions.filter(s=>s.status==='scheduled').map(s=>({ value:s._id, label:`${s.patient?.name} – ${new Date(s.date).toLocaleDateString()}` })) },
              { label:'Session Summary', key:'summary', type:'textarea', placeholder:'Describe session, patient mood, key discussion...' },
              { label:'Next Steps', key:'nextSteps', type:'text', placeholder:'What should the patient work on?' },
              { label:'Homework', key:'homework', type:'text', placeholder:'e.g. Daily mood journal' },
              { label:'Risk Level', key:'riskLevel', type:'select', options:[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'}] }
            ].map(({ label, key, type, options, placeholder }) => (
              <div key={key} style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, marginBottom:'.4rem', color:'#334155' }}>{label}</label>
                {type === 'select' ? (
                  <select value={noteForm[key]} onChange={e=>setNoteForm({...noteForm,[key]:e.target.value})} style={{ width:'100%', padding:'.7rem', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:'.9rem', fontFamily:'inherit' }}>
                    <option value="">Select…</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : type === 'textarea' ? (
                  <textarea value={noteForm[key]} onChange={e=>setNoteForm({...noteForm,[key]:e.target.value})} placeholder={placeholder} style={{ width:'100%', padding:'.7rem', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:'.9rem', fontFamily:'inherit', minHeight:90, resize:'vertical', boxSizing:'border-box' }}/>
                ) : (
                  <input type="text" value={noteForm[key]} onChange={e=>setNoteForm({...noteForm,[key]:e.target.value})} placeholder={placeholder} style={{ width:'100%', padding:'.7rem', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:'.9rem', fontFamily:'inherit', boxSizing:'border-box' }}/>
                )}
              </div>
            ))}
            <button onClick={saveNote} style={{ background:'#0d9488', color:'#fff', border:'none', borderRadius:9, padding:'.75rem 1.5rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Save Note & Mark Complete</button>
          </div>
          <div style={S.card}>
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Recent Sessions</h3>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th style={S.th}>Date</th><th style={S.th}>Patient</th><th style={S.th}>Type</th><th style={S.th}>Risk</th><th style={S.th}>Status</th></tr></thead>
              <tbody>
                {sessions.filter(s=>s.notes?.summary).map(s => (
                  <tr key={s._id}>
                    <td style={S.td}>{new Date(s.date).toLocaleDateString()}</td>
                    <td style={S.td}><b>{s.patient?.name}</b></td>
                    <td style={S.td}>{s.therapy || s.type}</td>
                    <td style={S.td}><span style={S.badge(s.notes?.riskLevel)}>{s.notes?.riskLevel}</span></td>
                    <td style={S.td}><span style={S.badge(s.status)}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
