const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./private.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.get('/', (req, res) => {
  res.send('Live Polling System Backend Running');
});

let activePoll = null;
let students = {};

// Function to broadcast updated participants list
const updateParticipants = () => {
  io.emit('update_participants', Object.values(students));
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Student joins
  socket.on('student_join', ({ name }) => {
    students[socket.id] = { name, id: socket.id };
    console.log(`Student joined: ${name} (${socket.id})`);
    updateParticipants();
  });

  // Teacher kicks a student
  socket.on('kick_student', (studentId) => {
    if (students[studentId]) {
      const studentName = students[studentId].name; // Get name before disconnect
      io.to(studentId).emit('kicked');
      io.sockets.sockets.get(studentId)?.disconnect(true);
      console.log(`Kicked student: ${studentName} (${studentId})`);
    }
  });

  // Student/Teacher sends a message
  socket.on('send_message', ({ sender, text }) => {
    io.emit('new_message', { sender, text, timestamp: new Date() });
  });

  // Student submits answer
  socket.on('submit_answer', ({ pollQuestion, answerIdx, name }) => {
    if (activePoll && activePoll.question === pollQuestion) {
      activePoll.answers[name] = answerIdx;
      // Aggregate results
      const counts = Array(activePoll.options.length).fill(0);
      Object.values(activePoll.answers).forEach(idx => {
        if (typeof idx === 'number' && idx >= 0 && idx < counts.length) counts[idx]++;
      });
      io.emit('poll_results', { counts });
      console.log(`Answer received from ${name}: option ${answerIdx}`);
    }
  });

  // Teacher creates a poll
  socket.on('create_poll', (poll) => {
    if (!activePoll) {
      activePoll = { ...poll, answers: {} };
      io.emit('poll_started', activePoll);
      console.log('Poll started:', poll.question);
      setTimeout(async () => {
        // On poll end, broadcast final results
        if (activePoll) {
          const counts = Array(activePoll.options.length).fill(0);
          Object.values(activePoll.answers).forEach(idx => {
            if (typeof idx === 'number' && idx >= 0 && idx < counts.length) counts[idx]++;
          });
          io.emit('poll_results', { counts, final: true });
          // Save poll to Firestore only when poll ends
          try {
            await db.collection('polls').add({
              question: activePoll.question,
              options: activePoll.options,
              answers: activePoll.answers,
              counts,
              createdBy: activePoll.createdBy,
              endedAt: admin.firestore.FieldValue.serverTimestamp(),
              timer: activePoll.timer
            });
            console.log('Poll saved to Firestore');
          } catch (err) {
            console.error('Error saving poll to Firestore:', err);
          }
        }
        activePoll = null;
        io.emit('poll_ended');
        console.log('Poll ended (timer)');
      }, poll.timer * 1000);
    } else {
      socket.emit('error', 'A poll is already active.');
    }
  });

  socket.on('disconnect', () => {
    if (students[socket.id]) {
      console.log(`Student left: ${students[socket.id].name} (${socket.id})`);
      delete students[socket.id];
      updateParticipants();
    }
    console.log('User disconnected:', socket.id);
  });
});

// Endpoint to fetch past polls, filter by teacher if ?teacher=email is provided
app.get('/api/polls', async (req, res) => {
  try {
    let query = db.collection('polls').orderBy('endedAt', 'desc');
    if (req.query.teacher) {
      console.log('Querying polls for teacher:', req.query.teacher);
      query = query.where('createdBy', '==', req.query.teacher);
    }
    const snapshot = await query.get();
    const polls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Number of polls returned:', polls.length);
    if (polls.length > 0) {
      console.log('Emails of returned polls:', polls.map(p => p.createdBy));
    }
    res.json(polls);
  } catch (err) {
    console.error('Error fetching polls:', err);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 