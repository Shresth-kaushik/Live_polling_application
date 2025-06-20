import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import TeacherLogin from './components/TeacherLogin';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import socket from './socket';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTeacher(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 24, color: '#373737' }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/select-role" />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/teacher/login" element={!teacher ? <TeacherLogin /> : <Navigate to="/teacher/panel" />} />
        <Route path="/teacher/panel" element={teacher ? <TeacherPanel teacher={teacher} /> : <Navigate to="/teacher/login" />} />
        <Route path="/student" element={<StudentPanel />} />
      </Routes>
    </Router>
  );
}

function RoleSelection() {
  const [selectedRole, setSelectedRole] = React.useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole === 'student') navigate('/student');
    if (selectedRole === 'teacher') navigate('/teacher/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fff' }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ background: '#4F0DCE', color: '#fff', borderRadius: 16, padding: '6px 18px', fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>★ Intervue Poll</span>
      </div>
      <h1 style={{ fontWeight: 500, fontSize: 36, color: '#373737', marginBottom: 8, textAlign: 'center' }}>
        Welcome to the <span style={{ fontWeight: 700 }}>Live Polling System</span>
      </h1>
      <p style={{ color: '#6E6E6E', fontSize: 16, marginBottom: 40, textAlign: 'center', maxWidth: 500 }}>
        Please select the role that best describes you to begin using the live polling system
      </p>
      <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
        <div
          onClick={() => setSelectedRole('student')}
          style={{
            border: selectedRole === 'student' ? '2px solid #7765DA' : '2px solid #F2F2F2',
            borderRadius: 12,
            padding: '28px 36px',
            minWidth: 260,
            background: selectedRole === 'student' ? '#F2F2F2' : '#fff',
            boxShadow: '0 2px 8px rgba(119,101,218,0.04)',
            cursor: 'pointer',
            transition: 'border 0.2s, background 0.2s',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, color: '#373737', marginBottom: 8 }}>I'm a Student</div>
          <div style={{ color: '#6E6E6E', fontSize: 15 }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry</div>
        </div>
        <div
          onClick={() => setSelectedRole('teacher')}
          style={{
            border: selectedRole === 'teacher' ? '2px solid #7765DA' : '2px solid #F2F2F2',
            borderRadius: 12,
            padding: '28px 36px',
            minWidth: 260,
            background: selectedRole === 'teacher' ? '#F2F2F2' : '#fff',
            boxShadow: '0 2px 8px rgba(119,101,218,0.04)',
            cursor: 'pointer',
            transition: 'border 0.2s, background 0.2s',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, color: '#373737', marginBottom: 8 }}>I'm a Teacher</div>
          <div style={{ color: '#6E6E6E', fontSize: 15 }}>Submit answers and view live poll results in real-time.</div>
        </div>
      </div>
      <button
        style={{
          background: selectedRole ? 'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)' : '#E0E0E0',
          color: '#fff',
          border: 'none',
          borderRadius: 24,
          padding: '12px 48px',
          fontWeight: 600,
          fontSize: 18,
          cursor: selectedRole ? 'pointer' : 'not-allowed',
          boxShadow: selectedRole ? '0 2px 8px rgba(119,101,218,0.10)' : 'none',
          opacity: selectedRole ? 1 : 0.6,
          transition: 'background 0.2s, opacity 0.2s',
        }}
        disabled={!selectedRole}
        onClick={handleContinue}
      >
        Continue
      </button>
    </div>
  );
}

export default App;
