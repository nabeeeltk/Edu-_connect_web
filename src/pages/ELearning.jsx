import { useEffect, useState } from 'react';
import { elearningAPI } from '../api';

const TYPE_COLOR = { Video:'badge-blue', Interactive:'badge-green', Quiz:'badge-yellow' };
const DIFF_COLOR  = { Beginner:'badge-green', Intermediate:'badge-yellow', Advanced:'badge-red' };

export default function ELearning() {
  const [lessons, setLessons]   = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats]       = useState(null);
  const [filter, setFilter]     = useState({ subject:'', type:'' });
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState(null);

  useEffect(() => {
    Promise.all([elearningAPI.getLessons(), elearningAPI.getSubjects(), elearningAPI.getStats()])
      .then(([l, s, st]) => { setLessons(l); setSubjects(s); setStats(st); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = lessons.filter(l =>
    (!filter.subject || l.subject === filter.subject) &&
    (!filter.type    || l.type    === filter.type)
  );

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading e-learning…</div>;

  return (
    <div>
      <div className="page-header">
        <h1>🎓 E-Learning</h1>
        <p>Access lessons, videos, and quizzes across all subjects</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(99,102,241,.12)' }}>📚</div><div><div className="stat-label">Total Lessons</div><div className="stat-value" style={{ color:'var(--primary-light)' }}>{stats.totalLessons}</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(16,185,129,.12)' }}>📖</div><div><div className="stat-label">Subjects</div><div className="stat-value" style={{ color:'#10b981' }}>{stats.subjects}</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(245,158,11,.12)' }}>📊</div><div><div className="stat-label">Total Views</div><div className="stat-value" style={{ color:'#f59e0b' }}>{stats.totalViews}</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(239,68,68,.12)' }}>🧪</div><div><div className="stat-label">Quizzes</div><div className="stat-value" style={{ color:'#ef4444' }}>{stats.quizzes}</div></div></div>
        </div>
      )}

      {/* Subject pills */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        <button className={`btn btn-sm ${!filter.subject?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(p=>({...p,subject:''}))}>All</button>
        {subjects.map(s => (
          <button key={s.name} className={`btn btn-sm ${filter.subject===s.name?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(p=>({...p,subject:s.name}))}>
            {s.icon} {s.name} ({s.count})
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['','Video','Interactive','Quiz'].map(t => (
          <button key={t} className={`btn btn-sm ${filter.type===t?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(p=>({...p,type:t}))}>
            {t||'All Types'}
          </button>
        ))}
      </div>

      {/* Lessons grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {filtered.map(l => (
          <div key={l.id} className="card" style={{ cursor:'pointer', transition:'transform .2s', padding:20 }} onClick={() => setActive(l)}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>{l.thumbnail}</div>
            <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
              <span className={`badge ${TYPE_COLOR[l.type]||'badge-gray'}`}>{l.type}</span>
              <span className={`badge ${DIFF_COLOR[l.difficulty]||'badge-gray'}`}>{l.difficulty}</span>
            </div>
            <div style={{ fontWeight:700, marginBottom:6 }}>{l.title}</div>
            <div style={{ color:'var(--primary-light)', fontSize:'.78rem', marginBottom:8 }}>{l.subject}</div>
            <div style={{ color:'var(--muted2)', fontSize:'.8rem', lineHeight:1.5 }}>{l.description.slice(0,90)}…</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:14, fontSize:'.75rem', color:'var(--muted2)' }}>
              <span>⏱ {l.duration}</span>
              <span>👁 {l.views} views</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lesson modal */}
      {active && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActive(null)}>
          <div className="modal animate-in" style={{ maxWidth:540 }}>
            <div style={{ fontSize:'3rem', textAlign:'center', marginBottom:12 }}>{active.thumbnail}</div>
            <div className="modal-title">{active.title} <span style={{ cursor:'pointer', color:'var(--muted)' }} onClick={() => setActive(null)}>✕</span></div>
            <div style={{ display:'flex', gap:6, marginBottom:12 }}>
              <span className={`badge ${TYPE_COLOR[active.type]}`}>{active.type}</span>
              <span className={`badge ${DIFF_COLOR[active.difficulty]}`}>{active.difficulty}</span>
              <span className="badge badge-purple">{active.subject}</span>
            </div>
            <p style={{ color:'var(--muted2)', lineHeight:1.7, marginBottom:20 }}>{active.description}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              <div style={{ background:'var(--glass)', borderRadius:8, padding:12, textAlign:'center' }}>
                <div style={{ color:'var(--muted2)', fontSize:'.72rem' }}>Duration</div>
                <div style={{ fontWeight:700 }}>{active.duration}</div>
              </div>
              <div style={{ background:'var(--glass)', borderRadius:8, padding:12, textAlign:'center' }}>
                <div style={{ color:'var(--muted2)', fontSize:'.72rem' }}>Views</div>
                <div style={{ fontWeight:700 }}>{active.views}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setActive(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { alert('Opening lesson player…'); setActive(null); }}>
                {active.type==='Quiz'?'🧪 Start Quiz':'▶ Start Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
