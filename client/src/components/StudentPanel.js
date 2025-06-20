import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';

const barColors = ['#7765DA', '#5767D0', '#4F0DCE', '#6E6E6E'];

const chatButtonStyle = {
  position: 'fixed',
  bottom: 32,
  right: 32,
  background: '#7765DA',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  boxShadow: '0 2px 8px rgba(119,101,218,0.10)',
  cursor: 'pointer',
  zIndex: 1000
};

// Timer Component
const Timer = ({ initialTime, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, onEnd]);

  return <span style={{ color: '#E53E3E', fontWeight: 700 }}>{`00:${timeLeft < 10 ? '0' : ''}${timeLeft}`}</span>;
};

export default function StudentPanel() {
  const [name, setName] = useState(() => sessionStorage.getItem('studentName') || '');
  const [input, setInput] = useState('');
  const [joined, setJoined] = useState(!!name);
  const [activePoll, setActivePoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [pollEnded, setPollEnded] = useState(false);
  const [results, setResults] = useState(null);
  const [final, setFinal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [kicked, setKicked] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (name) {
      socket.emit('student_join', { name });
      setJoined(true);
    }
  }, [name]);

  useEffect(() => {
    socket.on('poll_started', (poll) => {
      setActivePoll(poll);
      setSelected(null);
      setSubmitted(false);
      setPollEnded(false);
      setResults(null);
      setFinal(false);
    });
    socket.on('poll_ended', () => {
      setPollEnded(true);
      setActivePoll(null);
    });
    socket.on('poll_results', ({ counts, final }) => {
      setResults(counts);
      setFinal(!!final);
    });
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    socket.on('kicked', () => {
      setKicked(true);
    });
    return () => {
      socket.off('poll_started');
      socket.off('poll_ended');
      socket.off('poll_results');
      socket.off('new_message');
      socket.off('kicked');
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected !== null && activePoll) {
      socket.emit('submit_answer', {
        pollQuestion: activePoll.question,
        answerIdx: selected,
        name,
      });
      setSubmitted(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.emit('send_message', { sender: name, text: chatInput });
      setChatInput('');
    }
  };

  if (kicked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fff' }}>
        <div style={{ background: '#4F0DCE', color: '#fff', borderRadius: 16, padding: '6px 18px', fontWeight: 600, fontSize: 14, marginBottom: 32 }}>★ Intervue Poll</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: '#373737', marginBottom: 16, textAlign: 'center' }}>
          You've been Kicked out !
        </div>
        <div style={{ color: '#6E6E6E', fontSize: 20, textAlign: 'center', maxWidth: 600 }}>
          Looks like the teacher had removed you from the poll system. Please<br />Try again sometime.
        </div>
      </div>
    );
  }

  // Name Entry Screen
  if (!joined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ background: '#4F0DCE', color: '#fff', borderRadius: 16, padding: '6px 18px', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>★ Intervue Poll</div>
        <div style={{ fontSize: 32, fontWeight: 500, color: '#373737', marginBottom: 12 }}>
          Let's <span style={{ fontWeight: 700 }}>Get Started</span>
        </div>
        <p style={{ color: '#6E6E6E', fontSize: 19, marginBottom: 32, textAlign: 'center', maxWidth: 600, lineHeight: '25px' }}>
          If you're a student, you'll be able to <b style={{ fontWeight: 600, color: '#373737' }}>submit your answers</b>, participate in live polls, and see how your responses compare with your classmates
        </p>
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { setName(input.trim()); sessionStorage.setItem('studentName', input.trim()); } }} style={{ background: '#fff', padding: 32, minWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ color: '#373737', fontWeight: 700, fontSize: 18, alignSelf: 'flex-start', marginBottom: 8 }}>Enter your Name</label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter Name"
            style={{ width: '100%', padding: 18, borderRadius: 12, border: 'none', background: '#F2F2F2', fontSize: 18, marginBottom: 24, color: '#373737' }}
            required
          />
          <button
            type="submit"
            style={{
              background: input.trim() ? 'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)' : '#E0E0E0',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              padding: '12px 48px',
              fontWeight: 600,
              fontSize: 18,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              boxShadow: input.trim() ? '0 2px 8px rgba(119,101,218,0.10)' : 'none',
              opacity: input.trim() ? 1 : 0.6,
              transition: 'background 0.2s, opacity 0.2s',
            }}
            disabled={!input.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  const MainContent = () => {
    // Question Answering Screen
    if (activePoll && !submitted && !pollEnded) {
      return (
        <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 2px 24px rgba(119,101,218,0.10)', padding: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ color: '#373737', fontWeight: 700 }}>Question 1</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>⏰</span>
              <Timer initialTime={activePoll.timer} onEnd={() => setPollEnded(true)} />
            </div>
          </div>
          <div style={{ background: '#373737', color: '#fff', borderRadius: 16, padding: '18px 32px', fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
            {activePoll.question}
          </div>
          <form onSubmit={handleSubmit}>
            {activePoll.options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => setSelected(idx)}
                style={{
                  margin: '12px 0',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 12,
                  border: `2px solid ${selected === idx ? '#7765DA' : '#F2F2F2'}`,
                  background: selected === idx ? 'rgba(119, 101, 218, 0.1)' : '#fff',
                  cursor: 'pointer',
                  transition: 'border 0.2s, background 0.2s'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#7765DA', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginRight: 16
                }}>{idx + 1}</div>
                <span style={{ color: '#373737', fontSize: 18, fontWeight: 500 }}>{opt.text}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="submit"
                disabled={selected === null}
                style={{
                  background: selected !== null ? 'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)' : '#E0E0E0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 24,
                  padding: '12px 48px',
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: selected !== null ? 'pointer' : 'not-allowed',
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      );
    }

    // Results Screen
    if ((submitted || pollEnded) && results && activePoll) {
      return (
        <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 2px 24px rgba(119,101,218,0.10)', padding: 48 }}>
          <h2 style={{ color: '#373737', fontWeight: 700, marginBottom: 16 }}>Question 1</h2>
          <div style={{ background: '#373737', color: '#fff', borderRadius: 16, padding: '18px 32px', fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
            {activePoll.question}
          </div>
          {activePoll.options.map((opt, idx) => {
            const total = results.reduce((a, b) => a + b, 0) || 1;
            const percent = Math.round((results[idx] / total) * 100);
            return (
              <div key={idx} style={{ margin: '12px 0', border: `2px solid #F2F2F2`, borderRadius: 12, background: '#F2F2F2', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%', width: `${percent}%`,
                  background: barColors[idx % barColors.length], opacity: 0.8, zIndex: 1, transition: 'width 0.5s'
                }} />
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#7765DA', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginRight: 16
                  }}>{idx + 1}</div>
                  <div style={{ flex: 1, fontWeight: 600, fontSize: 18, color: '#373737' }}>{opt.text}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#4F0DCE', marginLeft: 16 }}>{percent}%</div>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 18, fontWeight: 600, color: '#373737' }}>
            Wait for the teacher to ask a new question..
          </div>
        </div>
      );
    }

    // Waiting Screen
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ background: '#4F0DCE', color: '#fff', borderRadius: 16, padding: '6px 18px', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>★ Intervue Poll</div>
        <div style={{
          width: 60, height: 60, border: '6px solid #F2F2F2', borderTopColor: '#7765DA', borderRadius: '50%',
          animation: 'spin 1s linear infinite', marginBottom: 24
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ color: '#373737', fontWeight: 600 }}>Wait for the teacher to ask questions..</h2>
      </div>
    );
  };

  return (
    <div>
      <MainContent />

      <button style={chatButtonStyle} onClick={() => setShowChat(true)}>
        <span role="img" aria-label="chat">💬</span>
      </button>

      {showChat && (
        <div style={{ position: 'fixed', bottom: 100, right: 32, width: 340, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(119,101,218,0.18)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 20px', minHeight: 180, maxHeight: 320, overflowY: 'auto', flex: 1 }}>
            <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 12, alignSelf: msg.sender === name ? 'flex-end' : 'flex-start' }}>
                  <b style={{ color: msg.sender === name ? '#4F0DCE' : '#373737', display: 'block', textAlign: msg.sender === name ? 'right' : 'left' }}>{msg.sender === name ? 'You' : msg.sender}</b>
                  <div style={{ background: msg.sender === name ? '#7765DA' : '#F2F2F2', color: msg.sender === name ? '#fff' : '#373737', borderRadius: 8, padding: 8, display: 'inline-block', marginTop: 4, maxWidth: 240 }}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
          <form onSubmit={handleSendMessage} style={{ padding: 20, borderTop: '2px solid #F2F2F2', display: 'flex' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1.5px solid #F2F2F2', fontSize: 15, marginRight: 8 }}
            />
            <button type="submit" style={{ background: '#7765DA', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Send</button>
          </form>
          <button onClick={() => setShowChat(false)} style={{ width: '100%', padding: 12, background: '#F2F2F2', color: '#373737', border: 'none', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, fontWeight: 700, cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </div>
  );
}