import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const barColors = ['#7765DA', '#5767D0', '#4F0DCE', '#6E6E6E'];

const defaultOption = () => ({ text: '', isCorrect: false });

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

export default function TeacherPanel({ teacher }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([defaultOption(), defaultOption()]);
  const [timer, setTimer] = useState(60);
  const [activePoll, setActivePoll] = useState(null);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [final, setFinal] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [pastPolls, setPastPolls] = useState([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatTab, setChatTab] = useState('chat');
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('poll_started', (poll) => {
      setActivePoll(poll);
      setResults(null);
      setFinal(false);
    });
    socket.on('poll_ended', () => {
      setActivePoll(null);
      setFinal(true);
    });
    socket.on('poll_results', ({ counts, final }) => {
      setResults(counts);
      setFinal(!!final);
    });
    socket.on('update_participants', setParticipants);
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    return () => {
      socket.off('poll_started');
      socket.off('poll_ended');
      socket.off('poll_results');
      socket.off('update_participants');
      socket.off('new_message');
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch past polls for this teacher
  const fetchPastPolls = async () => {
    setLoadingPast(true);
    try {
      const res = await fetch(`/api/polls?teacher=${encodeURIComponent(teacher.email)}`);
      const data = await res.json();
      setPastPolls(data);
    } catch (err) {
      setPastPolls([]);
    }
    setLoadingPast(false);
  };

  useEffect(() => {
    if (showPast && pastPolls.length === 0) {
      fetchPastPolls();
    }
    // eslint-disable-next-line
  }, [showPast]);

  const handleKickStudent = (studentId) => {
    socket.emit('kick_student', studentId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.emit('send_message', { sender: teacher.email, text: chatInput });
      setChatInput('');
    }
  };

  const handleOptionChange = (idx, value) => {
    setOptions(options.map((opt, i) => i === idx ? { ...opt, text: value } : opt));
  };

  const handleAddOption = () => {
    setOptions([...options, defaultOption()]);
  };

  const handleRemoveOption = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleCorrectChange = (idx) => {
    setOptions(options.map((opt, i) => i === idx ? { ...opt, isCorrect: true } : { ...opt, isCorrect: false }));
  };

  const isFormValid = question.trim() && options.every(opt => opt.text.trim()) && options.length >= 2;

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please fill all fields and provide at least 2 options.');
      return;
    }
    setError('');
    const poll = {
      question,
      options,
      timer: Number(timer),
      createdBy: teacher.email,
    };
    socket.emit('create_poll', poll);
    setActivePoll(poll);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const resetPollState = () => {
    setQuestion('');
    setOptions([defaultOption(), defaultOption()]);
    setTimer(60);
    setActivePoll(null);
    setError('');
    setResults(null);
    setFinal(false);
  };

  // --- UI ---
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 2px 24px rgba(119,101,218,0.10)', padding: 48, position: 'relative' }}>
      {/* Top badge and poll history button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ background: '#4F0DCE', color: '#fff', borderRadius: 16, padding: '6px 18px', fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>★ Intervue Poll</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setShowPast(v => !v)}
            style={{
              background: '#7765DA',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              padding: '10px 32px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(119,101,218,0.10)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span style={{ fontSize: 20 }}>👁️</span> View Poll history
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: '#F2F2F2',
              color: '#373737',
              border: 'none',
              borderRadius: 24,
              padding: '10px 32px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Header and subheader */}
      {!activePoll && !showPast && (
        <>
          <div style={{ marginBottom: 8, fontSize: 38, fontWeight: 500, color: '#373737', fontFamily: 'Sora, sans-serif' }}>
            Let's <span style={{ fontWeight: 700 }}>Get Started</span>
          </div>
          <div style={{ color: '#6E6E6E', fontSize: 19, marginBottom: 32, fontFamily: 'Sora, sans-serif', lineHeight: '25px', maxWidth: 760 }}>
            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </div>
        </>
      )}

      {/* Poll Creation Form */}
      {!activePoll && !showPast && (
        <form onSubmit={handleCreatePoll} style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <label style={{ color: '#373737', fontWeight: 700, fontSize: 20, fontFamily: 'Sora, sans-serif' }}>Enter your question</label>
            <select
              value={timer}
              onChange={e => setTimer(Number(e.target.value))}
              style={{
                background: '#F2F2F2',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: 16,
                color: '#373737',
                outline: 'none',
                cursor: 'pointer',
                minWidth: 140,
                marginLeft: 16
              }}
            >
              {[30, 45, 60, 90, 120].map(val => (
                <option key={val} value={val}>{val} seconds</option>
              ))}
            </select>
          </div>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              maxLength={100}
              rows={3}
              style={{ width: '100%', padding: 24, borderRadius: 12, border: 'none', background: '#F2F2F2', fontSize: 20, color: '#373737', fontFamily: 'Sora, sans-serif', resize: 'none', minHeight: 100, boxSizing: 'border-box' }}
              placeholder="Type your question here..."
              required
            />
            <div style={{ position: 'absolute', bottom: 12, right: 24, color: '#6E6E6E', fontSize: 15 }}>{question.length}/100</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
            <div style={{ flex: 2 }}>
              <div style={{ fontWeight: 700, color: '#373737', fontSize: 18, marginBottom: 8, fontFamily: 'Sora, sans-serif' }}>Edit Options</div>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#7765DA', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginRight: 16
                  }}>{idx + 1}</div>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    style={{ flex: 1, padding: 16, borderRadius: 8, border: 'none', background: '#F2F2F2', fontSize: 17, color: '#373737', fontFamily: 'Sora, sans-serif', marginRight: 16 }}
                    placeholder={`Option ${idx + 1}`}
                    required
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddOption} style={{ color: '#7765DA', border: '1.5px solid #7765DA', background: 'none', borderRadius: 12, padding: '8px 24px', fontWeight: 600, fontSize: 16, marginTop: 8, marginBottom: 24, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>+ Add More option</button>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, color: '#373737', fontSize: 18, marginBottom: 8, fontFamily: 'Sora, sans-serif' }}>Is it Correct?</div>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                  <label style={{ color: '#7765DA', fontWeight: 600, fontFamily: 'Sora, sans-serif', marginRight: 16 }}>
                    <input type="radio" name={`correct${idx}`} checked={opt.isCorrect} onChange={() => handleCorrectChange(idx)} style={{ accentColor: '#7765DA', marginRight: 4 }} /> Yes
                  </label>
                  <label style={{ color: '#6E6E6E', fontWeight: 600, fontFamily: 'Sora, sans-serif' }}>
                    <input type="radio" name={`correct${idx}`} checked={!opt.isCorrect} onChange={() => handleCorrectChange(idx)} style={{ accentColor: '#6E6E6E', marginRight: 4 }} /> No
                  </label>
                </div>
              ))}
            </div>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                background: isFormValid ? 'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)' : '#E0E0E0',
                color: '#fff',
                border: 'none',
                borderRadius: 24,
                padding: '16px 48px',
                fontWeight: 700,
                fontSize: 20,
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                boxShadow: isFormValid ? '0 2px 8px rgba(119,101,218,0.10)' : 'none',
                opacity: isFormValid ? 1 : 0.6,
                transition: 'background 0.2s, opacity 0.2s',
                fontFamily: 'Sora, sans-serif'
              }}
            >
              Ask Question
            </button>
          </div>
        </form>
      )}

      {/* Active Poll/Results */}
      {activePoll && !showPast && (
        <div style={{ margin: '32px 0', textAlign: 'center' }}>
          <div style={{ background: '#373737', color: '#fff', borderRadius: 16, padding: '18px 32px', fontWeight: 700, fontSize: 22, marginBottom: 24, display: 'inline-block' }}>
            {activePoll.question}
          </div>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            {activePoll.options.map((opt, idx) => {
              const total = results ? results.reduce((a, b) => a + b, 0) || 1 : 1;
              const percent = results ? Math.round((results[idx] / total) * 100) : 0;
              return (
                <div key={idx} style={{ margin: '18px 0', textAlign: 'left', border: `2px solid #7765DA`, borderRadius: 12, background: '#F2F2F2', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#7765DA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, marginRight: 16 }}>{idx + 1}</div>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 18, color: '#373737' }}>{opt.text}</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#4F0DCE', marginLeft: 16 }}>{percent}%</div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${percent}%`,
                    background: barColors[idx % barColors.length],
                    opacity: 0.18,
                    zIndex: 0,
                    transition: 'width 0.5s'
                  }} />
                </div>
              );
            })}
          </div>
          {final && <div style={{ color: '#4F0DCE', marginTop: 24, fontWeight: 600, fontSize: 18 }}>Poll Ended</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button
              onClick={resetPollState}
              style={{
                background: 'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 24,
                padding: '14px 44px',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(119,101,218,0.10)',
                marginTop: 10
              }}
            >
              + Ask a new question
            </button>
          </div>
        </div>
      )}

      {/* Poll History Section */}
      {showPast && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#373737', marginBottom: 32 }}>View <span style={{ color: '#4F0DCE' }}>Poll History</span></div>
          {loadingPast ? (
            <div style={{ color: '#6E6E6E' }}>Loading...</div>
          ) : pastPolls.length === 0 ? (
            <div style={{ color: '#6E6E6E' }}>No past polls found.</div>
          ) : (
            pastPolls.map((poll, idx) => (
              <div key={poll.id || idx} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(119,101,218,0.08)', padding: 32, marginBottom: 40 }}>
                <div style={{ fontWeight: 700, fontSize: 22, color: '#373737', marginBottom: 18 }}>Question {idx + 1}</div>
                <div style={{ background: '#373737', color: '#fff', borderRadius: 16, padding: '18px 32px', fontWeight: 700, fontSize: 20, marginBottom: 24, display: 'inline-block' }}>{poll.question}</div>
                <div style={{ maxWidth: 500, margin: '0 auto' }}>
                  {poll.options && poll.counts && poll.options.map((opt, i) => {
                    const total = poll.counts.reduce((a, b) => a + b, 0) || 1;
                    const percent = poll.counts ? Math.round((poll.counts[i] / total) * 100) : 0;
                    return (
                      <div key={i} style={{ margin: '12px 0', textAlign: 'left', border: `2px solid #7765DA`, borderRadius: 12, background: '#F2F2F2', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#7765DA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, marginRight: 16 }}>{i + 1}</div>
                          <div style={{ flex: 1, fontWeight: 600, fontSize: 16, color: '#373737' }}>{opt.text}</div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: '#4F0DCE', marginLeft: 16 }}>{percent}%</div>
                        </div>
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${percent}%`,
                          background: barColors[i % barColors.length],
                          opacity: 0.18,
                          zIndex: 0,
                          transition: 'width 0.5s'
                        }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ color: '#6E6E6E', fontSize: 13, marginTop: 8 }}>
                  Ended: {poll.endedAt && poll.endedAt._seconds ? new Date(poll.endedAt._seconds * 1000).toLocaleString() : 'Unknown'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Floating Chat/Participants Button */}
      <button style={chatButtonStyle} onClick={() => setShowChat(true)}>
        <span role="img" aria-label="chat">💬</span>
      </button>
      {/* Chat/Participants Popup Structure */}
      {showChat && (
        <div style={{ position: 'fixed', bottom: 100, right: 32, width: 340, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(119,101,218,0.18)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #F2F2F2' }}>
            <div
              onClick={() => setChatTab('chat')}
              style={{ flex: 1, padding: 16, fontWeight: 700, color: chatTab === 'chat' ? '#4F0DCE' : '#373737', borderBottom: chatTab === 'chat' ? '2px solid #4F0DCE' : 'none', cursor: 'pointer', textAlign: 'center' }}
            >Chat</div>
            <div
              onClick={() => setChatTab('participants')}
              style={{ flex: 1, padding: 16, fontWeight: 700, color: chatTab === 'participants' ? '#4F0DCE' : '#373737', borderBottom: chatTab === 'participants' ? '2px solid #4F0DCE' : 'none', cursor: 'pointer', textAlign: 'center' }}
            >Participants ({participants.length})</div>
          </div>
          <div style={{ padding: '0 20px', minHeight: 180, maxHeight: 320, overflowY: 'auto', flex: 1 }}>
            {chatTab === 'chat' ? (
              <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 12, alignSelf: msg.sender === teacher.email ? 'flex-end' : 'flex-start' }}>
                    <b style={{ color: msg.sender === teacher.email ? '#4F0DCE' : '#373737', display: 'block', textAlign: msg.sender === teacher.email ? 'right' : 'left' }}>{msg.sender === teacher.email ? 'You' : msg.sender}</b>
                    <div style={{ background: msg.sender === teacher.email ? '#7765DA' : '#F2F2F2', color: msg.sender === teacher.email ? '#fff' : '#373737', borderRadius: 8, padding: 8, display: 'inline-block', marginTop: 4, maxWidth: 240 }}>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div style={{ paddingTop: 20 }}>
                <div style={{ display: 'flex', fontWeight: 700, color: '#373737', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #F2F2F2' }}>
                  <div style={{ flex: 1 }}>Name</div>
                  <div style={{ width: 80, textAlign: 'center' }}>Action</div>
                </div>
                {participants.length === 0 ? (
                  <div style={{ color: '#6E6E6E', padding: '16px 0' }}>No participants yet.</div>
                ) : participants.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, padding: '4px 0' }}>
                    <div style={{ flex: 1 }}>{p.name}</div>
                    <button onClick={() => handleKickStudent(p.id)} style={{ color: '#4F0DCE', background: 'none', border: '1px solid #4F0DCE', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontWeight: 600 }}>Kick out</button>
                  </div>
                ))}
              </div>
            )}
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