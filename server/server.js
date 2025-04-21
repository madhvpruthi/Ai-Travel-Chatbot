const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const app = express();
const PORT = 3000;

app.use(express.json());
 
let chatMemory = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/mainpage.html'));
});

app.use(express.static(path.join(__dirname, '../public')));

app.get("/about.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../about.html"));
});

app.use('/expense', express.static(path.join(__dirname, '../expense')));

app.post('/chat', (req, res) => {
  const message = req.body.message;
  console.log('📩 Received message from user:', message);
 
  chatMemory.push({ role: "user", content: message });

  const py = spawn('python3', [path.join(__dirname, 'chatbot.py')]);
 
  py.stdin.write(JSON.stringify({ history: chatMemory }));
  py.stdin.end();

  let reply = '';
  py.stdout.on('data', chunk => reply += chunk.toString());

  py.stderr.on('data', data => {
    console.error('❌ Python error:', data.toString());
  });

  py.on('close', () => {
    const trimmed = reply.trim();
    console.log('🤖 Bot reply:', trimmed);

    if (!trimmed) {
      return res.status(500).json({ error: 'No reply from bot' });
    }

    // Add bot reply to memory
    chatMemory.push({ role: "bot", content: trimmed });

    // Optional: Save to permanent file history
    const file = path.join(__dirname, '../data/conversations.json');
    const history = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, 'utf8'))
      : [];

    history.push({ user: message, bot: trimmed });
    fs.writeFileSync(file, JSON.stringify(history, null, 2), 'utf8');

    res.json({ reply: trimmed });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});
