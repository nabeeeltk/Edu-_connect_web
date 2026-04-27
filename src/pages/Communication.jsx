import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { communicationAPI } from '../api';

export default function Communication() {
  const { user } = useAuth();
  const isTeacher = user.role === 'teacher';
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tab, setTab] = useState('messages');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [newMsg, setNewMsg] = useState({ subject:'', body:'', to: { id:2, name:'Bob Johnson', role:'student' } });
  const [newAnn, setNewAnn] = useState({ title:'', body:'', category:'General', pinned:false });
  const [showAnnForm, setShowAnnForm] = useState(false);

  const load = async () => {
    try {
      const [msgs, anns] = await Promise.all([
        communicationAPI.getMessages(user.id),
        communicationAPI.getAnnouncements(),
      ]);
      setMessages(msgs); setAnnouncements(anns);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [user.id]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    const msg = { from: { id:user.id, name:user.name, role:user.role }, to: selected.from.id === user.id ? selected.to : selected.from, subject:`Re: ${selected.subject}`, body:reply, thread: selected.thread };
    await communicationAPI.sendMessage(msg);
    setReply(''); await load();
  };

  const sendNew = async (e) => {
    e.preventDefault();
    await communicationAPI.sendMessage({ ...newMsg, from: { id:user.id, name:user.name, role:user.role }, thread: Date.now() });
    setShowCompose(false); setNewMsg({ subject:'', body:'', to:{ id:2, name:'Bob Johnson', role:'student' } }); await load();
  };

  const postAnn = async (e) => {
    e.preventDefault();
    await communicationAPI.postAnnouncement({ ...newAnn, postedBy: user.name });
    setShowAnnForm(false); setNewAnn({ title:'', body:'', category:'General', pinned:false }); await load();
  };

  const deleteAnn = async (id) => { await communicationAPI.deleteAnnouncement(id); await load(); };

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading…</div>;

  const threads = Object.values(messages.reduce((acc, m) => {
    const k = m.thread;
    if (!acc[k]) acc[k] = { ...m, count:0 };
    acc[k].count++;
    if (new Date(m.sentAt) > new Date(acc[k].sentAt)) acc[k] = { ...m, count: acc[k].count };
    return acc;
  }, {}));

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><h1>💬 Communication Hub</h1><p>Messages and school-wide announcements</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={() => setShowCompose(true)}>✉ New Message</button>
          {isTeacher && <button className="btn btn-primary" onClick={() => setShowAnnForm(true)}>📢 Post Announcement</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['messages','announcements'].map(t => (
          <button key={t} className={`btn ${tab===t?'btn-primary':'btn-ghost'}`} onClick={()=>setTab(t)}>
            {t==='messages'?`✉ Messages (${messages.length})`:`📢 Announcements (${announcements.length})`}
          </button>
        ))}
      </div>

      {tab === 'messages' && (
        <div className="chat-layout">
          <div className="chat-list">
            <div className="chat-list-header">✉ Inbox</div>
            {threads.length===0 && <div style={{ padding:20, color:'var(--muted2)', fontSize:'.83rem' }}>No messages</div>}
            {threads.map(m => (
              <div key={m.id} className={`chat-item${selected?.thread===m.thread?' active':''}`} onClick={() => setSelected(m)}>
                <div className="avatar" style={{ width:34, height:34, fontSize:'.7rem', flexShrink:0 }}>
                  {(m.from.id===user.id ? m.to.name : m.from.name).slice(0,2).toUpperCase()}
                </div>
                <div className="chat-item-text" style={{ flex:1, minWidth:0 }}>
                  <div className="name" style={{ fontWeight: m.read?500:700, display:'flex', justifyContent:'space-between' }}>
                    {m.from.id===user.id ? m.to.name : m.from.name}
                    {!m.read && <span className="badge badge-purple" style={{ fontSize:'.6rem' }}>New</span>}
                  </div>
                  <div className="preview">{m.subject}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-main">
            {!selected ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted2)', flexDirection:'column', gap:8 }}>
                <span style={{ fontSize:'2rem' }}>✉</span>
                <span>Select a conversation</span>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <div style={{ fontWeight:700 }}>{selected.subject}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--muted2)', marginTop:2 }}>
                    {selected.from.name} → {selected.to.name}
                  </div>
                </div>
                <div className="chat-messages">
                  {messages.filter(m => m.thread === selected.thread).sort((a,b)=>new Date(a.sentAt)-new Date(b.sentAt)).map(m => (
                    <div key={m.id}>
                      <div className={`msg-bubble ${m.from.id===user.id?'mine':'theirs'}`}>{m.body}</div>
                      <div className="msg-meta" style={{ textAlign: m.from.id===user.id?'right':'left' }}>
                        {m.from.name} · {new Date(m.sentAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chat-input-row">
                  <input className="form-input" placeholder="Type a reply…" value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendReply()} style={{ flex:1 }} />
                  <button className="btn btn-primary" onClick={sendReply}>Send ↗</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'announcements' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: a.pinned?'3px solid var(--primary)':'3px solid transparent' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:4 }}>
                    {a.pinned && '📌 '}{a.title}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <span className="badge badge-purple">{a.category}</span>
                    {a.pinned && <span className="badge badge-blue">Pinned</span>}
                  </div>
                </div>
                {isTeacher && <button className="btn btn-danger btn-sm" onClick={() => deleteAnn(a.id)}>🗑</button>}
              </div>
              <p style={{ color:'var(--muted2)', lineHeight:1.6, fontSize:'.88rem' }}>{a.body}</p>
              <div style={{ marginTop:12, fontSize:'.72rem', color:'var(--muted)' }}>
                Posted by {a.postedBy} · {new Date(a.postedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose message modal */}
      {showCompose && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowCompose(false)}>
          <div className="modal animate-in">
            <div className="modal-title">✉ New Message <span style={{cursor:'pointer',color:'var(--muted)'}} onClick={()=>setShowCompose(false)}>✕</span></div>
            <form onSubmit={sendNew}>
              <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={newMsg.subject} onChange={e=>setNewMsg(p=>({...p,subject:e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" value={newMsg.body} onChange={e=>setNewMsg(p=>({...p,body:e.target.value}))} required /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={()=>setShowCompose(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send ↗</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement modal */}
      {showAnnForm && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAnnForm(false)}>
          <div className="modal animate-in">
            <div className="modal-title">📢 Post Announcement <span style={{cursor:'pointer',color:'var(--muted)'}} onClick={()=>setShowAnnForm(false)}>✕</span></div>
            <form onSubmit={postAnn}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={newAnn.title} onChange={e=>setNewAnn(p=>({...p,title:e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" value={newAnn.body} onChange={e=>setNewAnn(p=>({...p,body:e.target.value}))} required /></div>
              <div style={{display:'flex',gap:12}}>
                <div className="form-group" style={{flex:1}}><label className="form-label">Category</label>
                  <select className="form-select" value={newAnn.category} onChange={e=>setNewAnn(p=>({...p,category:e.target.value}))}>
                    {['General','Academic','Event','Meeting','Holiday'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{display:'flex',alignItems:'flex-end',gap:8,paddingBottom:2}}>
                  <input type="checkbox" checked={newAnn.pinned} onChange={e=>setNewAnn(p=>({...p,pinned:e.target.checked}))} id="pin" />
                  <label htmlFor="pin" className="form-label" style={{marginBottom:0}}>Pin</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={()=>setShowAnnForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">📢 Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
