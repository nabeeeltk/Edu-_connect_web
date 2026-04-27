import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../api';

export default function Attendance() {
  const { user } = useAuth();
  const isTeacher = user.role === 'teacher';
  const [students, setStudents] = useState([]);
  const [records, setRecords]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [today, setToday]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [studs, recs, st] = await Promise.all([
          attendanceAPI.getStudents(),
          isTeacher ? attendanceAPI.getAll() : attendanceAPI.getAll(`?studentId=${user.id}`),
          attendanceAPI.getStats(),
        ]);
        setStudents(studs);
        setRecords(recs);
        setStats(st);
        // init today's status map
        const dateStr = new Date().toISOString().split('T')[0];
        const map = {};
        studs.forEach(s => { map[s.id] = recs.find(r => r.studentId === s.id && r.date === dateStr)?.status || 'Present'; });
        setToday(map);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [isTeacher, user.id]);

  const toggleStatus = (id) => {
    setToday(prev => ({ ...prev, [id]: prev[id] === 'Present' ? 'Absent' : 'Present' }));
  };

  const saveBulk = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(today).map(([id, status]) => ({ studentId: parseInt(id), status }));
      await attendanceAPI.markBulk(entries);
      const [recs, st] = await Promise.all([attendanceAPI.getAll(), attendanceAPI.getStats()]);
      setRecords(recs); setStats(st);
      setMsg('✅ Attendance saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch(e) { setMsg('Error saving attendance'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading attendance…</div>;

  const dateStr = new Date().toISOString().split('T')[0];
  const presentToday = Object.values(today).filter(s => s === 'Present').length;

  return (
    <div>
      <div className="page-header">
        <h1>✅ Attendance</h1>
        <p>{isTeacher ? 'Mark and manage daily attendance' : 'View your attendance history'}</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'rgba(16,185,129,.12)' }}>👥</div>
            <div><div className="stat-label">Total Students</div><div className="stat-value">{students.length}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'rgba(16,185,129,.12)' }}>✅</div>
            <div><div className="stat-label">Present Today</div><div className="stat-value" style={{ color:'#10b981' }}>{presentToday}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'rgba(239,68,68,.12)' }}>❌</div>
            <div><div className="stat-label">Absent Today</div><div className="stat-value" style={{ color:'#ef4444' }}>{students.length - presentToday}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'rgba(99,102,241,.12)' }}>📊</div>
            <div><div className="stat-label">Overall Rate</div><div className="stat-value" style={{ color:'var(--primary-light)' }}>{stats.rate}%</div></div>
          </div>
        </div>
      )}

      {isTeacher && (
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>📋 Mark Attendance — {dateStr}</span>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {msg && <span style={{ fontSize:'.8rem', color:'#10b981' }}>{msg}</span>}
              <button className="btn btn-primary btn-sm" onClick={saveBulk} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save All'}
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Roll No</th><th>Student</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ color:'var(--muted2)', fontFamily:'monospace' }}>{s.roll}</td>
                    <td style={{ fontWeight:500 }}>{s.name}</td>
                    <td><span className={`badge ${today[s.id]==='Present'?'badge-green':'badge-red'}`}>{today[s.id] || 'Present'}</span></td>
                    <td>
                      <button
                        className={`btn btn-sm ${today[s.id]==='Present'?'btn-danger':'btn-green'}`}
                        onClick={() => toggleStatus(s.id)}
                      >
                        {today[s.id]==='Present' ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats?.byStudent && isTeacher && (
        <div className="card">
          <div className="card-title">📊 Attendance Analytics by Student</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Rate</th><th>Status</th></tr></thead>
              <tbody>
                {stats.byStudent.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight:500 }}>{s.name}</td>
                    <td>{s.present}</td>
                    <td>{s.absent}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className="progress-bar" style={{ width:80 }}>
                          <div className={`progress-fill ${s.rate>=75?'green':s.rate>=50?'yellow':'red'}`} style={{ width:`${s.rate}%` }} />
                        </div>
                        <span style={{ fontSize:'.8rem' }}>{s.rate}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${s.rate>=75?'badge-green':s.rate>=50?'badge-yellow':'badge-red'}`}>{s.rate>=75?'Good':s.rate>=50?'Low':'Critical'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isTeacher && (
        <div className="card">
          <div className="card-title">📅 My Attendance History</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Status</th><th>Method</th></tr></thead>
              <tbody>
                {records.length === 0 && <tr><td colSpan={3} style={{ color:'var(--muted2)' }}>No records found</td></tr>}
                {records.slice(0,20).map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td><span className={`badge ${r.status==='Present'?'badge-green':'badge-red'}`}>{r.status}</span></td>
                    <td><span className="badge badge-gray">{r.method}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
