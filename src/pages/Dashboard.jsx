import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, examsAPI, homeworkAPI, feesAPI, notificationsAPI } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ attendance: null, exams: null, homework: null, fees: null });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      attendanceAPI.getStats(),
      examsAPI.getStats(),
      homeworkAPI.getStats(),
      feesAPI.getStats(),
      notificationsAPI.getAll(user.role),
    ]).then(([att, ex, hw, fee, notifs]) => {
      setStats({ attendance: att, exams: ex, homework: hw, fees: fee });
      setNotifications(notifs.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, [user.role]);

  if (loading) return <div style={{ color:'var(--muted2)', padding:40 }}>Loading dashboard…</div>;

  const { attendance, exams, homework, fees } = stats;
  const isTeacher = user.role === 'teacher';
  const isParent  = user.role === 'parent';

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user.name?.split(' ')[0]} 👋</h1>
        <p>{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/attendance')} style={{ cursor:'pointer' }}>
          <div className="stat-icon" style={{ background:'rgba(16,185,129,.12)' }}>✅</div>
          <div>
            <div className="stat-label">Attendance Rate</div>
            <div className="stat-value" style={{ color:'#10b981' }}>{attendance?.rate ?? '--'}%</div>
            <div className="stat-sub">{attendance?.present} present today</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/exams')} style={{ cursor:'pointer' }}>
          <div className="stat-icon" style={{ background:'rgba(99,102,241,.12)' }}>📝</div>
          <div>
            <div className="stat-label">{isTeacher ? 'Exams Scheduled' : 'Avg Score'}</div>
            <div className="stat-value" style={{ color:'var(--primary-light)' }}>
              {isTeacher ? exams?.upcoming : `${exams?.avgScore}%`}
            </div>
            <div className="stat-sub">{exams?.total} total exams</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/homework')} style={{ cursor:'pointer' }}>
          <div className="stat-icon" style={{ background:'rgba(245,158,11,.12)' }}>📋</div>
          <div>
            <div className="stat-label">Assignments</div>
            <div className="stat-value" style={{ color:'#f59e0b' }}>{homework?.active ?? '--'}</div>
            <div className="stat-sub">{homework?.totalSubmissions} submissions</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/fees')} style={{ cursor:'pointer' }}>
          <div className="stat-icon" style={{ background:'rgba(239,68,68,.12)' }}>💳</div>
          <div>
            <div className="stat-label">{isTeacher ? 'Fees Collected' : 'Fee Status'}</div>
            <div className="stat-value" style={{ color:'#ef4444', fontSize:'1.4rem' }}>
              {isTeacher ? `₹${(fees?.collected/1000)?.toFixed(1)}k` : fees?.count?.pending > 0 ? `${fees?.count?.pending} Due` : '✓ Paid'}
            </div>
            <div className="stat-sub">{isTeacher ? `₹${fees?.pending} pending` : `₹${fees?.pending} pending`}</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div>
          <div className="card">
            <div className="card-title">📢 Recent Notifications</div>
            <div className="activity-list">
              {notifications.length === 0 && <div style={{ color:'var(--muted2)', fontSize:'.85rem' }}>No notifications</div>}
              {notifications.map(n => (
                <div key={n.id} className="activity-item">
                  <div className="activity-dot" style={{ background: n.priority==='High' ? 'rgba(239,68,68,.15)' : 'rgba(99,102,241,.15)' }}>
                    {n.type==='Attendance'?'✅':n.type==='Exam'?'📝':n.type==='Fee'?'💳':n.type==='Homework'?'📋':'📢'}
                  </div>
                  <div>
                    <div className="activity-text" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                    <div className="activity-meta">{n.message.slice(0,80)}… · {new Date(n.sentAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                  {!n.read && <span className="badge badge-red" style={{ marginLeft:'auto', flexShrink:0 }}>New</span>}
                </div>
              ))}
            </div>
          </div>

          {isTeacher && attendance?.byStudent && (
            <div className="card" style={{ marginTop:20 }}>
              <div className="card-title">📊 Student Attendance Overview</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Rate</th></tr></thead>
                  <tbody>
                    {attendance.byStudent.slice(0,5).map(s => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td><span className="badge badge-green">{s.present}</span></td>
                        <td><span className="badge badge-red">{s.absent}</span></td>
                        <td>
                          <div>{s.rate}%</div>
                          <div className="progress-bar" style={{ width:100 }}>
                            <div className={`progress-fill ${s.rate>=75?'green':s.rate>=50?'yellow':'red'}`} style={{ width:`${s.rate}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card">
            <div className="card-title">🎯 Quick Actions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {isTeacher && <>
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => navigate('/attendance')}>📋 Mark Attendance</button>
                <button className="btn btn-ghost"   style={{ width:'100%' }} onClick={() => navigate('/exams')}>➕ Schedule Exam</button>
                <button className="btn btn-ghost"   style={{ width:'100%' }} onClick={() => navigate('/homework')}>📝 Create Assignment</button>
                <button className="btn btn-ghost"   style={{ width:'100%' }} onClick={() => navigate('/communication')}>📢 Post Announcement</button>
              </>}
              {isTeacher || <>
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => navigate('/elearning')}>🎓 Start Learning</button>
                <button className="btn btn-ghost"   style={{ width:'100%' }} onClick={() => navigate('/homework')}>📋 View Assignments</button>
                <button className="btn btn-ghost"   style={{ width:'100%' }} onClick={() => navigate('/exams')}>📝 Check Grades</button>
                {(isParent) && <button className="btn btn-ghost" style={{ width:'100%' }} onClick={() => navigate('/fees')}>💳 Pay Fees</button>}
              </>}
            </div>
          </div>

          <div className="card">
            <div className="card-title">📈 Module Status</div>
            {[
              { label:'Attendance', value: attendance?.rate, color:'green' },
              { label:'Exam Avg',   value: exams?.avgScore,  color:'purple' },
              { label:'Graded HW',  value: homework?.graded && homework?.totalSubmissions ? Math.round((homework.graded/homework.totalSubmissions)*100) : 0, color:'yellow' },
              { label:'Fees Paid',  value: fees?.collected && fees?.total ? Math.round((fees.collected/fees.total)*100) : 0, color:'green' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', marginBottom:4 }}>
                  <span style={{ color:'var(--muted2)' }}>{item.label}</span>
                  <span style={{ fontWeight:600 }}>{item.value ?? 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${item.color}`} style={{ width:`${item.value ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
