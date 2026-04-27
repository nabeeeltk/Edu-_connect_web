import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { feesAPI } from '../api';

export default function Fees() {
  const { user } = useAuth();
  const isTeacher = user.role === 'teacher';
  const [fees, setFees]   = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [payMethod, setPayMethod] = useState('Online');
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const params = (!isTeacher && user.role==='student') ? `?studentId=${user.id}` : (!isTeacher && user.role==='parent') ? `?studentId=2` : '';
      const [f, s] = await Promise.all([feesAPI.getAll(params), feesAPI.getStats()]);
      setFees(f); setStats(s);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handlePay = async () => {
    if (!paying) return;
    try {
      const result = await feesAPI.pay(paying.id, payMethod);
      setMsg(`✅ Payment successful! Receipt: ${result.receipt}`);
      setPaying(null); await load(); setTimeout(() => setMsg(''), 5000);
    } catch(e) { setMsg(`❌ ${e.message}`); }
  };

  if (loading) return <div style={{ color:'var(--muted2)' }}>Loading fees…</div>;

  const STATUS_COLOR = { Paid:'badge-green', Pending:'badge-yellow', Overdue:'badge-red' };

  return (
    <div>
      <div className="page-header">
        <h1>💳 Fee Management</h1>
        <p>{isTeacher ? 'Manage student fees and payments' : 'View and pay your fees'}</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(16,185,129,.12)' }}>✅</div><div><div className="stat-label">Collected</div><div className="stat-value" style={{ color:'#10b981', fontSize:'1.4rem' }}>₹{stats.collected?.toLocaleString()}</div><div className="stat-sub">{stats.count?.paid} payments</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(245,158,11,.12)' }}>⏳</div><div><div className="stat-label">Pending</div><div className="stat-value" style={{ color:'#f59e0b', fontSize:'1.4rem' }}>₹{stats.pending?.toLocaleString()}</div><div className="stat-sub">{stats.count?.pending} records</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(239,68,68,.12)' }}>🚨</div><div><div className="stat-label">Overdue</div><div className="stat-value" style={{ color:'#ef4444', fontSize:'1.4rem' }}>₹{stats.overdue?.toLocaleString()}</div><div className="stat-sub">{stats.count?.overdue} overdue</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'rgba(99,102,241,.12)' }}>💰</div><div><div className="stat-label">Total</div><div className="stat-value" style={{ fontSize:'1.4rem' }}>₹{stats.total?.toLocaleString()}</div><div className="stat-sub">all records</div></div></div>
        </div>
      )}

      {/* Collection progress */}
      {stats && isTeacher && (
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-title">📊 Collection Progress</div>
          <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', fontSize:'.83rem' }}>
            <span>₹{stats.collected?.toLocaleString()} collected</span>
            <span style={{ color:'var(--muted2)' }}>of ₹{stats.total?.toLocaleString()}</span>
          </div>
          <div className="progress-bar" style={{ height:10 }}>
            <div className="progress-fill green" style={{ width:`${stats.total ? Math.round((stats.collected/stats.total)*100) : 0}%` }} />
          </div>
          <div style={{ fontSize:'.75rem', color:'var(--muted2)', marginTop:6 }}>
            {stats.total ? Math.round((stats.collected/stats.total)*100) : 0}% collected
          </div>
        </div>
      )}

      {msg && <div style={{ background: msg.includes('✅') ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', border:`1px solid ${msg.includes('✅')?'rgba(16,185,129,.2)':'rgba(239,68,68,.2)'}`, color: msg.includes('✅') ? '#10b981' : '#ef4444', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:'.85rem' }}>{msg}</div>}

      <div className="card">
        <div className="card-title">🧾 Fee Records</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Type</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Receipt</th>{!isTeacher&&<th>Action</th>}</tr></thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight:500 }}>{f.studentName}</td>
                  <td>{f.type}</td>
                  <td style={{ fontWeight:600 }}>₹{f.amount.toLocaleString()}</td>
                  <td style={{ color: f.status==='Overdue' ? '#ef4444' : 'inherit' }}>{f.dueDate}</td>
                  <td><span className={`badge ${STATUS_COLOR[f.status]}`}>{f.status}</span></td>
                  <td style={{ fontFamily:'monospace', fontSize:'.78rem', color:'var(--muted2)' }}>{f.receipt || '—'}</td>
                  {!isTeacher && (
                    <td>
                      {f.status !== 'Paid' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => setPaying(f)}>💳 Pay Now</button>
                      ) : (
                        <span style={{ color:'#10b981', fontSize:'.8rem' }}>✓ Paid {f.paidDate}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment modal */}
      {paying && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setPaying(null)}>
          <div className="modal animate-in">
            <div className="modal-title">💳 Pay Fee <span style={{ cursor:'pointer', color:'var(--muted)' }} onClick={() => setPaying(null)}>✕</span></div>
            <div style={{ background:'var(--glass)', borderRadius:10, padding:16, marginBottom:20 }}>
              <div style={{ fontSize:'.8rem', color:'var(--muted2)', marginBottom:4 }}>{paying.type} · {paying.term}</div>
              <div style={{ fontSize:'2rem', fontWeight:800, color:'#10b981' }}>₹{paying.amount.toLocaleString()}</div>
              <div style={{ fontSize:'.78rem', color:'var(--muted2)', marginTop:4 }}>Due: {paying.dueDate}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option>Online</option><option>UPI</option><option>Net Banking</option><option>Card</option><option>Cash</option>
              </select>
            </div>
            <div style={{ background:'rgba(16,185,129,.08)', borderRadius:8, padding:12, fontSize:'.8rem', color:'var(--muted2)', marginBottom:16 }}>
              🔒 Secure payment powered by EduConnect Pay. Your receipt will be generated instantly.
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPaying(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePay}>✅ Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
