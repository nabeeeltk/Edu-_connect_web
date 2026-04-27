import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  teacher: [
    { to:'/dashboard',     icon:'📊', label:'Dashboard' },
    { to:'/attendance',    icon:'✅', label:'Attendance' },
    { to:'/exams',         icon:'📝', label:'Exams & Grades' },
    { to:'/elearning',     icon:'🎓', label:'E-Learning' },
    { to:'/homework',      icon:'📋', label:'Homework' },
    { to:'/timetable',     icon:'📅', label:'Timetable' },
    { to:'/fees',          icon:'💳', label:'Fee Management' },
    { to:'/notifications', icon:'🔔', label:'Notifications' },
    { to:'/communication', icon:'💬', label:'Communication' },
  ],
  student: [
    { to:'/dashboard',     icon:'📊', label:'Dashboard' },
    { to:'/attendance',    icon:'✅', label:'My Attendance' },
    { to:'/exams',         icon:'📝', label:'Exams & Grades' },
    { to:'/elearning',     icon:'🎓', label:'E-Learning' },
    { to:'/homework',      icon:'📋', label:'Homework' },
    { to:'/timetable',     icon:'📅', label:'Timetable' },
    { to:'/fees',          icon:'💳', label:'My Fees' },
    { to:'/notifications', icon:'🔔', label:'Notifications' },
    { to:'/communication', icon:'💬', label:'Messages' },
  ],
  parent: [
    { to:'/dashboard',     icon:'📊', label:'Dashboard' },
    { to:'/attendance',    icon:'✅', label:'Attendance' },
    { to:'/exams',         icon:'📝', label:'Grades' },
    { to:'/fees',          icon:'💳', label:'Fee Payment' },
    { to:'/notifications', icon:'🔔', label:'Notifications' },
    { to:'/communication', icon:'💬', label:'Messages' },
  ],
};

const ROLE_COLOR = { teacher:'#6366f1', student:'#10b981', parent:'#f59e0b' };

export default function Sidebar({ unread }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const items = NAV[user.role] || NAV.teacher;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <div className="logo-text">Edu<span>Connect</span></div>
      </div>
      <div className="sidebar-role" style={{ color: ROLE_COLOR[user.role], borderColor: `${ROLE_COLOR[user.role]}40`, background: `${ROLE_COLOR[user.role]}18` }}>
        {user.role} Portal
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize:'1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.to === '/notifications' && unread > 0 && (
              <span className="nav-badge">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" onClick={() => { logout(); navigate('/'); }}>
          <div className="avatar">{user.avatar || user.name?.slice(0,2).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">Sign out</div>
          </div>
          <span style={{ fontSize:'.8rem', color:'var(--muted)' }}>↩</span>
        </div>
      </div>
    </div>
  );
}
