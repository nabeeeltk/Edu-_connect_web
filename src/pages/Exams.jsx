import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { examsAPI } from '../api';

function Modal({ onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">{children}</div>
    </div>
  );
}

export default function Exams() {
  const { user } = useAuth();
  const isTeacher = user.role === 'teacher';
  const [exams, setExams]   = useState([]);
  const [grades, setGrades] = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('exams'); // 'exams' | 'grades'
  const [form, setForm] = useState({ title:'', subject:'', class:'Class 10-A', date:'', time:'09:00 AM', duration:120, totalMarks:100 });

  const load = async () => {
    try {
      const [ex, gr, st] = await Promise.all([examsAPI.getAll(), examsAPI.getGrades(), examsAPI.getStats()]);
      setExams(ex); setGrades(gr); setStats(st);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createExam = async (e) => {
    e.preventDefault();
    try { await examsAPI.create(form); await load(); setShowModal(false); } catch(e) { alert(e.message); }
  };

  const deleteExam = async (id) => {
    if (!confirm('Delete this exam?')) return;
    await examsAPI.remove(id); await load();
  };

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading exams…</div>;

  const GRADE_COLOR = { 'A+':'badge-green', A:'badge-green', 'B+':'badge-blue', B:'badge-blue', C:'badge-yellow', F:'badge-red' };

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>📝 Exams & Grades</h1>
          <p>Schedule exams, track results and view analytics</p>
        </div>
        {isTeacher && <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Schedule Exam</button>}
      </div>

      {stats && (
        <div className="stats-grid">
          {[
            { label:'Total Exams',    value: stats.total,     icon:'📝', color:'rgba(99,102,241,.12)',   textColor:'var(--primary-light)' },
            { label:'Upcoming',       value: stats.upcoming,  icon:'⏰', color:'rgba(245,158,11,.12)',   textColor:'#f59e0b' },
            { label:'Completed',      value: stats.completed, icon:'✅', color:'rgba(16,185,129,.12)',   textColor:'#10b981' },
            { label:'Avg Score',      value: `${stats.avgScore}%`, icon:'🏆', color:'rgba(239,68,68,.12)', textColor:'#ef4444' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background:s.color }}>{s.icon}</div>
              <div><div className="stat-label">{s.label}</div><div className="stat-value" style={{ color:s.textColor }}>{s.value}</div></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['exams','grades'].map(t => (
          <button key={t} className={`btn ${tab===t?'btn-primary':'btn-ghost'}`} onClick={() => setTab(t)}>
            {t==='exams'?'📅 Exam Schedule':'🏆 Grade Reports'}
          </button>
        ))}
      </div>

      {tab === 'exams' && (
        <div className="card">
          <div className="card-title">📅 Exam Schedule</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Duration</th><th>Marks</th><th>Status</th>{isTeacher&&<th>Actions</th>}</tr></thead>
              <tbody>
                {exams.map(ex => (
                  <tr key={ex.id}>
                    <td style={{ fontWeight:600 }}>{ex.title}</td>
                    <td>{ex.subject}</td>
                    <td>{ex.date} {ex.time}</td>
                    <td>{ex.duration} min</td>
                    <td>{ex.totalMarks}</td>
                    <td><span className={`badge ${ex.status==='Upcoming'?'badge-yellow':'badge-green'}`}>{ex.status}</span></td>
                    {isTeacher && <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteExam(ex.id)}>🗑</button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'grades' && (
        <div className="card">
          <div className="card-title">🏆 Grade Reports</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Exam</th><th>Marks</th><th>Percentage</th><th>Grade</th><th>Feedback</th></tr></thead>
              <tbody>
                {grades.map(g => {
                  const exam = exams.find(e => e.id === g.examId);
                  return (
                    <tr key={g.id}>
                      <td style={{ fontWeight:500 }}>{g.studentName}</td>
                      <td style={{ color:'var(--muted2)', fontSize:'.83rem' }}>{exam?.title || `Exam #${g.examId}`}</td>
                      <td>{g.marksObtained}/{g.totalMarks}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="progress-bar" style={{ width:70 }}>
                            <div className={`progress-fill ${g.percentage>=75?'green':g.percentage>=50?'yellow':'red'}`} style={{ width:`${g.percentage}%` }} />
                          </div>
                          <span style={{ fontSize:'.8rem' }}>{g.percentage}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${GRADE_COLOR[g.grade]||'badge-gray'}`}>{g.grade}</span></td>
                      <td style={{ color:'var(--muted2)', fontSize:'.8rem' }}>{g.feedback}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-title">📝 Schedule New Exam <span style={{ cursor:'pointer', color:'var(--muted)' }} onClick={() => setShowModal(false)}>✕</span></div>
          <form onSubmit={createExam}>
            {[['title','Exam Title','text'],['subject','Subject','text'],['date','Date','date'],['time','Time','text'],['duration','Duration (min)','number'],['totalMarks','Total Marks','number']].map(([k,l,t]) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" type={t} value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} required />
              </div>
            ))}
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Exam</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
