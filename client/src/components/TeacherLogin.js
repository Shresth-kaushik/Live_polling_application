import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in App.js will handle the state update and redirect.
      navigate('/teacher/panel');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fff' }}>
      <div style={{ background: '#4F0DCE', color: '#fff', borderRadius: 16, padding: '6px 18px', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>★ Intervue Poll</div>
      <form onSubmit={handleLogin} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(119,101,218,0.08)', padding: 32, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: '#373737', fontWeight: 700, marginBottom: 16 }}>Teacher Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #7765DA', fontSize: 16, marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #7765DA', fontSize: 16, marginBottom: 18 }}
        />
        <button
          type="submit"
          style={{
            background: 'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            padding: '12px 48px',
            fontWeight: 600,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(119,101,218,0.10)',
            marginTop: 8
          }}
        >
          Login
        </button>
        {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
      </form>
    </div>
  );
} 