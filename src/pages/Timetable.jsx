import { useEffect, useState } from 'react';
import { timetableAPI } from '../api';

const SUBJECT_COLORS = {
  Mathematics:      '#6366f1',
  Science:          '#10b981',
  English:          '#3b82f6',
  History:          '#f59e0b',
  'Computer Science':'#8b5cf6',
  'Physical Ed':    '#ef4444',
  Art:              '#ec4899',
  Music:            '#06b6d4',
  'Free Period':    '#64748b',
};

export default function Timetable() {
  const [tt, setTt] = useState(null);
  const [loading, setLoading] = useState(true);
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

  useEffect(() => {
    timetableAPI.getWeekly().then(setTt).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading timetable…</div>;
  if (!tt) return <div style={{ color:'var(--danger)' }}>Failed to load timetable.</div>;

  const periods = tt.periods;
  const today = dayNames[new Date().getDay() - 1];

  return (
    <div>
      <div className="page-header">
        <h1>📅 Timetable</h1>
        <p>Weekly class schedule for {tt.class}</p>
      </div>

      {/* Today's highlight */}
      {today && tt.schedule[today] && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-title">⭐ Today — {today}</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {tt.schedule[today].filter(p => !p.isBreak).map((p, i) => (
              <div key={i} style={{ background:`${SUBJECT_COLORS[p.subject] || '#64748b'}20`, border:`1px solid ${SUBJECT_COLORS[p.subject] || '#64748b'}40`, borderRadius:10, padding:'10px 14px', minWidth:130 }}>
                <div style={{ fontSize:'.68rem', color:'var(--muted2)', marginBottom:4 }}>{p.period}</div>
                <div style={{ fontWeight:700, color: SUBJECT_COLORS[p.subject] || 'var(--text)', fontSize:'.85rem' }}>{p.subject}</div>
                <div style={{ fontSize:'.68rem', color:'var(--muted2)', marginTop:2 }}>{p.teacher}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full weekly grid */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ borderCollapse:'collapse', width:'100%', minWidth:700 }}>
            <thead>
              <tr>
                <th style={{ padding:'12px 14px', background:'var(--bg3)', fontSize:'.72rem', textAlign:'left', color:'var(--muted2)', borderBottom:'1px solid var(--glass-border)', width:110 }}>Period / Time</th>
                {dayNames.map(d => (
                  <th key={d} style={{ padding:'12px 14px', background:'var(--bg3)', fontSize:'.78rem', color: d===today?'var(--primary-light)':'var(--muted2)', fontWeight:700, borderBottom:'1px solid var(--glass-border)', borderLeft:'1px solid var(--glass-border)' }}>
                    {d} {d===today && '📍'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, pi) => {
                const isBreakRow = period === 'BREAK' || period === 'LUNCH';
                return (
                  <tr key={pi} style={{ background: isBreakRow ? 'rgba(255,255,255,.02)' : 'transparent' }}>
                    <td style={{ padding:'10px 14px', fontSize:'.72rem', color:'var(--muted2)', fontWeight:600, borderBottom:'1px solid rgba(255,255,255,.04)', whiteSpace:'nowrap' }}>{period}</td>
                    {dayNames.map(day => {
                      const cell = tt.schedule[day]?.[pi];
                      if (!cell) return <td key={day} />;
                      const color = SUBJECT_COLORS[cell.subject] || '#64748b';
                      return (
                        <td key={day} style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,.04)', borderLeft:'1px solid rgba(255,255,255,.04)', verticalAlign:'middle' }}>
                          {isBreakRow ? (
                            <div style={{ textAlign:'center', color:'var(--muted)', fontSize:'.75rem', fontStyle:'italic' }}>{cell.subject}</div>
                          ) : (
                            <div style={{ background:`${color}15`, borderLeft:`3px solid ${color}`, borderRadius:'0 6px 6px 0', padding:'6px 8px' }}>
                              <div style={{ fontWeight:700, fontSize:'.78rem', color }}>{cell.subject}</div>
                              {cell.teacher && <div style={{ fontSize:'.65rem', color:'var(--muted2)', marginTop:2 }}>{cell.teacher?.split(' ').slice(-1)[0]}</div>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject legend */}
      <div className="card" style={{ marginTop:20 }}>
        <div className="card-title">🎨 Subject Color Legend</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {Object.entries(SUBJECT_COLORS).map(([subj, color]) => (
            <div key={subj} style={{ display:'flex', alignItems:'center', gap:6, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:8, padding:'5px 10px' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:color }} />
              <span style={{ fontSize:'.75rem', color }}>{subj}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
