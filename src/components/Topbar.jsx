import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, unread }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <div className="icon-btn" onClick={() => navigate('/notifications')} title="Notifications">
          🔔
          {unread > 0 && <span className="notif-dot" />}
        </div>
        <div className="user-card" style={{ padding:'6px 10px', borderRadius:'10px', background:'var(--glass)', border:'1px solid var(--glass-border)' }}>
          <div className="avatar" style={{ width:30, height:30, fontSize:'.7rem' }}>
            {user?.avatar || user?.name?.slice(0,2).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name" style={{ fontSize:'.8rem' }}>{user?.name?.split(' ').slice(-1)[0]}</div>
            <div className="user-role" style={{ fontSize:'.65rem' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
