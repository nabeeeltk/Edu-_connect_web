import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { notificationsAPI } from './api';
import Sidebar from './components/Sidebar';
import Topbar  from './components/Topbar';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Attendance   from './pages/Attendance';
import Exams        from './pages/Exams';
import ELearning    from './pages/ELearning';
import Homework     from './pages/Homework';
import Timetable    from './pages/Timetable';
import Fees         from './pages/Fees';
import Notifications from './pages/Notifications';
import Communication from './pages/Communication';

const PAGE_TITLES = {
  '/dashboard':'/Dashboard','/attendance':'Attendance',
  '/exams':'Exams & Grades','/elearning':'E-Learning',
  '/homework':'Homework','/timetable':'Timetable',
  '/fees':'Fee Management','/notifications':'Notifications',
  '/communication':'Communication Hub',
};

function ProtectedLayout() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const path = window.location.pathname;
  const title = PAGE_TITLES[path] || 'EduConnect';

  useEffect(() => {
    if (!user) return;
    notificationsAPI.getUnread().then(d => setUnread(d.count)).catch(()=>{});
    const t = setInterval(() => {
      notificationsAPI.getUnread().then(d => setUnread(d.count)).catch(()=>{});
    }, 30000);
    return () => clearInterval(t);
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="app-shell">
      <Sidebar unread={unread} />
      <div className="main-area">
        <Topbar title={title} unread={unread} />
        <div className="page-content animate-in">
          <Routes>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/attendance"    element={<Attendance />} />
            <Route path="/exams"         element={<Exams />} />
            <Route path="/elearning"     element={<ELearning />} />
            <Route path="/homework"      element={<Homework />} />
            <Route path="/timetable"     element={<Timetable />} />
            <Route path="/fees"          element={<Fees />} />
            <Route path="/notifications" element={<Notifications onRead={() => setUnread(0)} />} />
            <Route path="/communication" element={<Communication />} />
            <Route path="*"              element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--muted2)' }}>
      <div>Loading EduConnect…</div>
    </div>
  );
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
