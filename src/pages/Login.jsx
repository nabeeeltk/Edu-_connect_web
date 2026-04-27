import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMOS = [
  { role:'Teacher', email:'alice@educonnect.com', password:'teacher123', icon:'👩‍🏫' },
  { role:'Student', email:'bob@student.com',       password:'student123', icon:'🧑‍🎓' },
  { role:'Parent',  email:'carol@parent.com',       password:'parent123',  icon:'👨‍👩‍👦' },
];

const FEATURES = [
  { icon:'✅', title:'Smart Attendance',   desc:'QR, biometric & manual marking with real-time alerts' },
  { icon:'📝', title:'Exams & Grades',      desc:'Auto-grading, progress reports & analytics per student' },
  { icon:'🎓', title:'E-Learning',          desc:'Live classes, videos, quizzes & digital resource library' },
  { icon:'💬', title:'Communication Hub',   desc:'Direct messaging, announcements & parent-teacher chat' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (d) => { setEmail(d.email); setPassword(d.password); setError(''); };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div style={{ fontSize:'3rem', marginBottom:8 }}>🎓</div>
          <h1>EduConnect</h1>
          <p>Complete School Management Platform</p>
          <p style={{ fontSize:'.78rem', color:'var(--muted)', marginTop:4 }}>Teachers · Students · Parents</p>
        </div>

        <div className="card login-card animate-in">
          <div className="demo-creds">
            <h4>🚀 Quick Login — Click a role</h4>
            <div className="demo-creds-grid">
              {DEMOS.map(d => (
                <div key={d.role} className="demo-btn" onClick={() => fillDemo(d)}>
                  <div style={{ fontSize:'1.4rem' }}>{d.icon}</div>
                  <div className="role">{d.role}</div>
                  <div className="email">{d.email.split('@')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div style={{ color:'var(--danger)', fontSize:'.83rem', textAlign:'center' }}>{error}</div>}
            <button className="btn btn-primary" style={{ width:'100%', padding:'12px' }} disabled={loading}>
              {loading ? 'Signing in…' : '🔓 Sign In'}
            </button>
          </form>
        </div>
      </div>

      <div className="login-right">
        <div className="feature-list">
          <h2>Everything in one platform</h2>
          <p>Manage your entire school — attendance, exams, fees, and more.</p>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-item animate-in">
              <div className="feature-item-icon">{f.icon}</div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
          <div style={{ marginTop:24, padding:'14px 18px', borderRadius:10, background:'var(--primary-glow)', border:'1px solid rgba(99,102,241,.3)', fontSize:'.8rem', color:'var(--primary-light)' }}>
            ⚡ 3 User Roles · 8+ Core Modules · 2 Platforms · ∞ Scalable
          </div>
        </div>
      </div>
    </div>
  );
}
