import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getSupervisorDashboard, getTherapists, getPatients, getAssignments, getUnassignedPatients, createAssignment, updateAssignment } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const S = {
  card: { background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 4px 24px rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.08)', marginBottom: '1rem' },
  badge: (type) => {
    const colors = { active:'#dcfce7:#166534', urgent:'#fef3c7:#92400e', unassigned:'#fee2e2:#991b1b', completed:'#e0e7ff:#3730a3', scheduled:'#dbeafe:#1e40af', 'on-track':'#ccfbf1:#0f766e' };
    const [bg, color] = (colors[type] || '#f1f5f9:#475569').split(':');
    return { display:'inline-block', padding:'.25rem .65rem', borderRadius:20, fontSize:'.72rem', fontWeight:600, background:bg, color };
  },
  th: { textAlign:'left', padding:'.6rem .8rem', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.5px', color:'#94a3b8', borderBottom:'1px solid #e2e8f0' },
  td: { padding:'.75rem .8rem', borderBottom:'1px solid #f1f5f9', fontSize:'.88rem', verticalAlign:'middle' }
};

export default function SupervisorDash() {
  const [tab, setTab]                 = useState('overview');
  const [stats, setStats]             = useState(null);
  const [caseloads, setCaseloads]     = useState([]);
  const [therapists, setTherapists]   = useState([]);
  const [patients, setPatients]       = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [unassigned, setUnassigned]   = useState([]);
  const [modal, setModal]             = useState(null); // { patient }
  const [form, setForm]               = useState({ therapistId:'', priority:'normal', diagnosis:'', notes:'' });
  const [msg, setMsg]                 = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [d, t, p, a, u] = await Promise.all([
      getSupervisorDashboard(), getTherapists(), getPatients(),
      getAssignments(), getUnassignedPatients()
    ]);
    setStats(d.data.stats); setCaseloads(d.data.caseloads);
    setTherapists(t.data.therapists); setPatients(p.data.patients);
    setAssignments(a.data.assignments); setUnassigned(u.data.patients);
  };

  const assign = async () => {
    if (!form.therapistId) return alert('Select a therapist');
    try {
      await createAssignment({ patientId: modal._id, ...form });
      setMsg(`✅ ${modal.name} successfully assigned!`);
      setModal(null); setForm({ therapistId:'', priority:'normal', diagnosis:'', notes:'' });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  if (!stats) return <div style={{ padding: '2rem', fontFamily: 'DM Sans, sans-serif' }}>Loading…</div>;

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {msg && <div style={{ background:'#dcfce7', border:'1px solid #86efac', borderRadius:10, padding:'.75rem 1rem', marginBottom:'1rem', fontSize:'.9rem', color:'#166534' }}>{msg} <span style={{ cursor:'pointer', float:'right' }} onClick={()=>setMsg('')}>✕</span></div>}

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}>
            <h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Supervisor Dashboard</h2>
            <p style={{ color:'#94a3b8', fontSize:'.9rem' }}>MGM Hospital · Mental Health Division</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
            {[
              { label:'Therapists', value: stats.totalTherapists, icon:'🧑‍⚕️', sub:`${stats.totalTherapists} active` },
              { label:'Total Patients', value: stats.totalPatients, icon:'👥', sub:`${stats.unassigned} unassigned` },
              { label:'Sessions Today', value: stats.todaySessions, icon:'📅', sub:`${stats.cancelledToday} cancelled` },
              { label:'Unassigned', value: stats.unassigned, icon:'⚠️', sub:'Need assignment', alert: stats.unassigned > 0 }
            ].map((s) => (
              <div key={s.label} style={{ ...S.card, marginBottom:0, borderColor: s.alert ? '#fca5a5' : undefined }}>
                <div style={{ float:'right', fontSize:'1.5rem', opacity:.35 }}>{s.icon}</div>
                <div style={{ fontSize:'.75rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'.4rem' }}>{s.label}</div>
                <div style={{ fontSize:'1.9rem', fontWeight:700, fontFamily:'serif', color: s.alert ? '#ef4444' : undefined }}>{s.value}</div>
                <div style={{ fontSize:'.75rem', color:'#94a3b8', marginTop:'.2rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {stats.unassigned > 0 && (
            <div style={{ background:'#fef9c3', border:'1px solid #fde047', borderRadius:10, padding:'.75rem 1rem', fontSize:'.88rem', color:'#713f12', marginBottom:'1rem' }}>
              ⚠️ {stats.unassigned} patients need therapist assignment.{' '}
              <span onClick={() => setTab('assign')} style={{ cursor:'pointer', textDecoration:'underline', fontWeight:600 }}>Assign now →</span>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={S.card}>
              <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>🧑‍⚕️ Therapist Caseloads</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={caseloads} margin={{ top:5, right:5, left:-20, bottom:5 }}>
                  <XAxis dataKey="name" tick={{ fontSize:10 }} tickFormatter={n => n.split(' ')[1] || n} />
                  <YAxis tick={{ fontSize:10 }} />
                  <Tooltip />
                  <Bar dataKey="caseload" fill="#0d9488" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>📋 Recent Assignments</h3>
              {assignments.slice(0,5).map(a => (
                <div key={a._id} style={{ padding:'.6rem 0', borderBottom:'1px solid #f1f5f9', fontSize:'.85rem' }}>
                  <div style={{ fontWeight:600 }}>{a.patient?.name}</div>
                  <div style={{ color:'#94a3b8', fontSize:'.78rem' }}>→ {a.therapist?.name} · <span style={S.badge(a.status)}>{a.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN THERAPIST ── */}
      {tab === 'assign' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}>
            <h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Assign Therapist</h2>
            <p style={{ color:'#94a3b8', fontSize:'.9rem' }}>Match unassigned patients with available therapists</p>
          </div>
          <div style={S.card}>
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Unassigned Patients ({unassigned.length})</h3>
            {unassigned.length === 0 ? (
              <p style={{ color:'#94a3b8', fontSize:'.9rem' }}>✅ All patients are currently assigned!</p>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr><th style={S.th}>Patient</th><th style={S.th}>Gender</th><th style={S.th}>Registered</th><th style={S.th}>Action</th></tr></thead>
                <tbody>
                  {unassigned.map(p => (
                    <tr key={p._id}>
                      <td style={S.td}><b>{p.name}</b><br/><span style={{ color:'#94a3b8', fontSize:'.75rem' }}>{p.email}</span></td>
                      <td style={S.td}>{p.gender || '—'}</td>
                      <td style={S.td}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td style={S.td}><button onClick={() => setModal(p)} style={{ background:'#0d9488', color:'#fff', border:'none', borderRadius:7, padding:'.4rem .9rem', cursor:'pointer', fontSize:'.78rem', fontFamily:'inherit', fontWeight:600 }}>Assign</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={S.card}>
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>All Assignments</h3>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th style={S.th}>Patient</th><th style={S.th}>Therapist</th><th style={S.th}>Priority</th><th style={S.th}>Status</th><th style={S.th}>Date</th></tr></thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a._id}>
                    <td style={S.td}><b>{a.patient?.name}</b></td>
                    <td style={S.td}>{a.therapist?.name}</td>
                    <td style={S.td}><span style={S.badge(a.priority)}>{a.priority}</span></td>
                    <td style={S.td}><span style={S.badge(a.status)}>{a.status}</span></td>
                    <td style={S.td}>{new Date(a.startDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── THERAPISTS ── */}
      {tab === 'therapists' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Therapists</h2><p style={{ color:'#94a3b8' }}>{therapists.length} therapists in the division</p></div>
          <div style={S.card}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th style={S.th}>Name</th><th style={S.th}>Specializations</th><th style={S.th}>Dept</th><th style={S.th}>Caseload</th><th style={S.th}>Today</th></tr></thead>
              <tbody>
                {therapists.map(t => (
                  <tr key={t._id}>
                    <td style={S.td}><b>{t.name}</b><br/><span style={{ color:'#94a3b8', fontSize:'.75rem' }}>{t.email}</span></td>
                    <td style={S.td}>{t.specializations?.slice(0,2).join(', ') || '—'}</td>
                    <td style={S.td}>{t.department || '—'}</td>
                    <td style={S.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:6, background:'#e2e8f0', borderRadius:10 }}>
                          <div style={{ height:'100%', width:`${Math.min((t.caseload/15)*100,100)}%`, background: t.caseload > 12 ? '#f59e0b' : '#0d9488', borderRadius:10 }}/>
                        </div>
                        <span style={{ fontSize:'.78rem', color:'#94a3b8' }}>{t.caseload}/15</span>
                      </div>
                    </td>
                    <td style={S.td}>{t.todaySessions} sessions</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PATIENTS ── */}
      {tab === 'patients' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>All Patients</h2><p style={{ color:'#94a3b8' }}>{patients.length} patients total</p></div>
          <div style={S.card}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th style={S.th}>Patient</th><th style={S.th}>Gender</th><th style={S.th}>Phone</th><th style={S.th}>Registered</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p._id}>
                    <td style={S.td}><b>{p.name}</b><br/><span style={{ color:'#94a3b8', fontSize:'.75rem' }}>{p.email}</span></td>
                    <td style={S.td}>{p.gender || '—'}</td>
                    <td style={S.td}>{p.phone || '—'}</td>
                    <td style={S.td}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REPORTS ── */}
      {tab === 'reports' && (
        <div>
          <div style={{ marginBottom:'1.5rem' }}><h2 style={{ fontFamily:'serif', fontSize:'1.75rem' }}>Reports & Analytics</h2></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1rem' }}>
            {[
              { label:'Total Sessions', value: stats.totalSessions, icon:'📅' },
              { label:'Active Therapists', value: stats.totalTherapists, icon:'🧑‍⚕️' },
              { label:'Total Patients', value: stats.totalPatients, icon:'👥' },
            ].map(s => (
              <div key={s.label} style={{ ...S.card, marginBottom:0 }}>
                <div style={{ float:'right', fontSize:'1.5rem', opacity:.3 }}>{s.icon}</div>
                <div style={{ fontSize:'.75rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'.4rem' }}>{s.label}</div>
                <div style={{ fontSize:'2rem', fontWeight:700, fontFamily:'serif' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Caseload by Therapist</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={caseloads}>
                <XAxis dataKey="name" tick={{ fontSize:10 }} tickFormatter={n => n.split(' ')[1] || n} />
                <YAxis tick={{ fontSize:10 }} />
                <Tooltip />
                <Bar dataKey="caseload" fill="#0d9488" radius={[4,4,0,0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.6)', backdropFilter:'blur(4px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'2rem', width:'100%', maxWidth:460 }}>
            <h3 style={{ fontFamily:'serif', fontSize:'1.4rem', marginBottom:'.3rem' }}>Assign Therapist</h3>
            <p style={{ color:'#94a3b8', fontSize:'.88rem', marginBottom:'1.25rem' }}>Assigning therapist to <b>{modal.name}</b></p>

            {[
              { label:'Select Therapist', key:'therapistId', type:'select', options: therapists.map(t => ({ value:t._id, label:`${t.name} (${t.caseload} patients)` })) },
              { label:'Priority', key:'priority', type:'select', options:[{value:'normal',label:'Normal'},{value:'urgent',label:'Urgent'},{value:'critical',label:'Critical'}] },
              { label:'Diagnosis', key:'diagnosis', type:'text', placeholder:'e.g. Generalized Anxiety Disorder' },
              { label:'Notes', key:'notes', type:'text', placeholder:'Any additional notes for the therapist' }
            ].map(({ label, key, type, options, placeholder }) => (
              <div key={key} style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, marginBottom:'.4rem', color:'#334155' }}>{label}</label>
                {type === 'select' ? (
                  <select value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} style={{ width:'100%', padding:'.7rem .9rem', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:'.9rem', outline:'none', fontFamily:'inherit' }}>
                    <option value="">Select…</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form[key]} placeholder={placeholder} onChange={e => setForm({...form,[key]:e.target.value})} style={{ width:'100%', padding:'.7rem .9rem', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:'.9rem', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
                )}
              </div>
            ))}

            <div style={{ display:'flex', gap:'.75rem', marginTop:'1.5rem' }}>
              <button onClick={assign} style={{ flex:1, padding:'.75rem', background:'#0d9488', color:'#fff', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Confirm Assignment</button>
              <button onClick={() => setModal(null)} style={{ padding:'.75rem 1.25rem', background:'transparent', border:'1.5px solid #e2e8f0', borderRadius:9, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
