import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { homeworkAPI } from '../api';

function Modal({ onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal animate-in">{children}</div>
    </div>
  );
}

export default function Homework() {
  const { user } = useAuth();
  const isTeacher = user.role === 'teacher';
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title:'', subject:'', dueDate:'', totalMarks:20, description:'' });
  const [gradeForm, setGradeForm] = useState({ studentId:'', marks:'', feedback:'' });
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const [hw, st] = await Promise.all([homeworkAPI.getAll(), homeworkAPI.getStats()]);
      setAssignments(hw); setStats(st);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createHW = async (e) => {
    e.preventDefault();
    try { await homeworkAPI.create({ ...form, class:'Class 10-A', createdBy: user.name }); await load(); setShowCreate(false); setForm({ title:'', subject:'', dueDate:'', totalMarks:20, description:'' }); } catch(e) { alert(e.message); }
  };

  const submitHW = async (id) => {
    try {
      await homeworkAPI.submit(id, { studentId: user.id, studentName: user.name, fileUrl: `${user.name.replace(' ','_')}_submission.pdf` });
      await load(); setMsg('Submitted successfully!'); setTimeout(()=>setMsg(''),3000);
    } catch(e) { alert(e.message); }
  };

  const gradeHW = async (e) => {
    e.preventDefault();
    try { await homeworkAPI.grade(selected.id, { studentId: gradeForm.studentId, marks: parseInt(gradeForm.marks), feedback: gradeForm.feedback }); await load(); const hw = assignments.find(a=>a.id===selected.id); setSelected(hw); setMsg('Graded!'); setTimeout(()=>setMsg(''),2000); } catch(e) { alert(e.message); }
  };

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading homework…</div>;

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><h1>📋 Homework & Assignments</h1><p>Manage, submit and grade assignments</p></div>
        {isTeacher && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>➕ New Assignment</button>}
      </div>

      {stats && (
        <div className="stats-grid">
          {[
            { label:'Total', value:stats.total, icon:'📋', color:'rgba(99,102,241,.12)', tc:'var(--primary-light)' },
            { label:'Active', value:stats.active, icon:'🟢', color:'rgba(16,185,129,.12)', tc:'#10b981' },
            { label:'Submissions', value:stats.totalSubmissions, icon:'📤', color:'rgba(245,158,11,.12)', tc:'#f59e0b' },
            { label:'Graded', value:stats.graded, icon:'✅', color:'rgba(239,68,68,.12)', tc:'#ef4444' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background:s.color }}>{s.icon}</div>
              <div><div className="stat-label">{s.label}</div><div className="stat-value" style={{ color:s.tc }}>{s.value}</div></div>
            </div>
          ))}
        </div>
      )}

      {msg && <div style={{ background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', color:'#10b981', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:'.85rem' }}>{msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:16 }}>
        {assignments.map(hw => {
          const mySubmission = hw.submissions?.find(s => s.studentId === user.id);
          const isPast = new Date(hw.dueDate) < new Date();
          return (
            <div key={hw.id} className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:700, marginBottom:4 }}>{hw.title}</div>
                  <span className="badge badge-purple" style={{ marginRight:6 }}>{hw.subject}</span>
                  <span className={`badge ${hw.status==='Active'?'badge-green':'badge-gray'}`}>{hw.status}</span>
                </div>
                <div style={{ fontSize:'.75rem', color: isPast?'#ef4444':'var(--muted2)', textAlign:'right' }}>
                  <div style={{ fontWeight:600 }}>Due</div>
                  <div>{hw.dueDate}</div>
                </div>
              </div>
              <div style={{ color:'var(--muted2)', fontSize:'.82rem', lineHeight:1.5 }}>{hw.description?.slice(0,100)}…</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', color:'var(--muted2)' }}>
                <span>📊 {hw.totalMarks} marks</span>
                <span>📤 {hw.submissions?.length || 0} submitted</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {isTeacher ? (
                  <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => setSelected(hw)}>📋 View Submissions ({hw.submissions?.length})</button>
                ) : mySubmission ? (
                  <span className={`badge ${mySubmission.status==='Graded'?'badge-green':'badge-yellow'}`} style={{ flex:1, justifyContent:'center', padding:'8px' }}>
                    {mySubmission.status==='Graded' ? `✅ Graded: ${mySubmission.marks}/${hw.totalMarks}` : '⏳ Submitted'}
                  </span>
                ) : (
                  <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => submitHW(hw.id)} disabled={isPast && hw.status==='Closed'}>
                    📤 Submit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <div className="modal-title">📋 New Assignment <span style={{ cursor:'pointer', color:'var(--muted)' }} onClick={() => setShowCreate(false)}>✕</span></div>
          <form onSubmit={createHW}>
            {[['title','Assignment Title','text'],['subject','Subject','text'],['dueDate','Due Date','date'],['totalMarks','Total Marks','number']].map(([k,l,t]) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" type={t} value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} required />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} required />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {selected && isTeacher && (
        <Modal onClose={() => setSelected(null)}>
          <div className="modal-title">{selected.title} — Submissions <span style={{ cursor:'pointer', color:'var(--muted)' }} onClick={() => setSelected(null)}>✕</span></div>
          {selected.submissions?.length === 0 && <div style={{ color:'var(--muted2)', marginBottom:16 }}>No submissions yet</div>}
          {selected.submissions?.map(sub => (
            <div key={sub.studentId} style={{ background:'var(--glass)', borderRadius:10, padding:12, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontWeight:600 }}>{sub.studentName}</div>
                <span className={`badge ${sub.status==='Graded'?'badge-green':'badge-yellow'}`}>{sub.status}</span>
              </div>
              {sub.status !== 'Graded' ? (
                <form onSubmit={gradeHW}>
                  <input type="hidden" value={sub.studentId} onChange={()=>{}} />
                  <div style={{ display:'flex', gap:8 }}>
                    <input className="form-input" type="number" placeholder="Marks" style={{ width:80 }} value={gradeForm.studentId===sub.studentId?gradeForm.marks:''} onChange={e => setGradeForm({ studentId:sub.studentId, marks:e.target.value, feedback:gradeForm.feedback })} required />
                    <input className="form-input" placeholder="Feedback" value={gradeForm.studentId===sub.studentId?gradeForm.feedback:''} onChange={e => setGradeForm(p=>({...p,feedback:e.target.value,studentId:sub.studentId}))} />
                    <button type="submit" className="btn btn-green btn-sm">Grade</button>
                  </div>
                </form>
              ) : (
                <div style={{ fontSize:'.82rem', color:'var(--muted2)' }}>
                  Marks: <strong>{sub.marks}/{selected.totalMarks}</strong> · {sub.feedback}
                </div>
              )}
            </div>
          ))}
          {msg && <div style={{ color:'#10b981', fontSize:'.82rem', marginTop:8 }}>{msg}</div>}
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
