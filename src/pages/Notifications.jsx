import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../api';

const TYPE_ICON = { Attendance:'✅', Exam:'📝', Fee:'💳', Homework:'📋', General:'📢', Event:'🎉' };
const PRIORITY_COLOR = { High:'badge-red', Medium:'badge-yellow', Low:'badge-gray' };

export default function Notifications({ onRead }) {
  const { user } = useAuth();
  const isTeacher = user.role === 'teacher';
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ title:'', message:'', type:'General', targetRole:'all', priority:'Medium' });

  const load = async () => {
    try {
      const data = await notificationsAPI.getAll(user.role);
      setNotifs(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await notificationsAPI.markAllRead();
    await load(); onRead?.();
  };

  const markOne = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifs(prev => prev.map(n => n.id===id ? {...n,read:true} : n));
  };

  const remove = async (id) => {
    await notificationsAPI.remove(id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const send = async (e) => {
    e.preventDefault();
    try {
      await notificationsAPI.send({ ...form, sentBy: user.name });
      await load(); setShowCompose(false);
      setForm({ title:'', message:'', type:'General', targetRole:'all', priority:'Medium' });
    } catch(err) { alert(err.message); }
  };

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading notifications…</div>;

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>🔔 Notifications</h1>
          <p>{unread} unread · {notifs.length} total</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {unread > 0 && <button className="btn btn-ghost" onClick={markAll}>✓ Mark All Read</button>}
          {isTeacher && <button className="btn btn-primary" onClick={() => setShowCompose(true)}>📢 Send Notification</button>}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {notifs.length === 0 && <div className="card" style={{ textAlign:'center', padding:48, color:'var(--muted2)' }}>🔔 No notifications</div>}
        {notifs.map(n => (
          <div key={n.id} className="card" style={{ padding:'16px 20px', display:'flex', gap:14, alignItems:'flex-start', borderLeft: n.read ? '3px solid transparent' : '3px solid var(--primary)', transition:'all .2s', cursor: n.read ? 'default' : 'pointer' }} onClick={() => !n.read && markOne(n.id)}>
            <div style={{ width:40, height:40, borderRadius:10, background: n.priority==='High'?'rgba(239,68,68,.15)':'rgba(99,102,241,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>
              {TYPE_ICON[n.type] || '📢'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <div style={{ fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <span className={`badge ${PRIORITY_COLOR[n.priority]}`}>{n.priority}</span>
                  {!n.read && <span className="badge badge-purple">New</span>}
                </div>
              </div>
              <div style={{ color:'var(--muted2)', fontSize:'.83rem', marginTop:4, lineHeight:1.5 }}>{n.message}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                <div style={{ fontSize:'.72rem', color:'var(--muted)' }}>
                  By {n.sentBy} · {new Date(n.sentAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <span className="badge badge-gray">{n.type}</span>
                  {isTeacher && <button className="btn btn-danger btn-sm" style={{ padding:'2px 8px', fontSize:'.7rem' }} onClick={(e) => { e.stopPropagation(); remove(n.id); }}>🗑</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCompose && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowCompose(false)}>
          <div className="modal animate-in" style={{ maxWidth:500 }}>
            <div className="modal-title">📢 Send Notification <span style={{ cursor:'pointer', color:'var(--muted)' }} onClick={() => setShowCompose(false)}>✕</span></div>
            <form onSubmit={send}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} required /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    {['General','Exam','Attendance','Fee','Homework','Event'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Audience</label>
                  <select className="form-select" value={form.targetRole} onChange={e=>setForm(p=>({...p,targetRole:e.target.value}))}>
                    <option value="all">Everyone</option>
                    <option value="student">Students</option>
                    <option value="parent">Parents</option>
                    <option value="teacher">Teachers</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                    {['High','Medium','Low'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCompose(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">📢 Send Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
