require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');
const setupDatabase = require('./database');

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] }
});

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ccutmiguieiisrmywbby.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Setup Multer for avatar uploads (memory storage for Supabase upload)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let db;

async function initServer() {
  db = await setupDatabase();
  console.log('Database connected and ready.');
}

initServer();

// --- Auth Routes ---
app.post('/api/auth/sync', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    
    // Ensure user exists in public.users
    const existing = await db.get('SELECT * FROM users WHERE id = ?', [user.id]);
    if (!existing) {
      const name = user.email.split('@')[0];
      await db.run('INSERT INTO users (id, email, name) VALUES (?, ?, ?)', [user.id, user.email, name]);
    }
    
    const dbUser = await db.get('SELECT * FROM users WHERE id = ?', [user.id]);
    dbUser.avatarUrl = dbUser.avatarUrl ? `http://localhost:3000/${dbUser.avatarUrl}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.email;
    
    res.json({ message: 'User synced', user: dbUser });
  } catch (error) {
    res.status(500).json({ error: 'Server error syncing user' });
  }
});

// --- User Profile Routes ---
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  
  req.userId = user.id;
  next();
};

app.put('/api/user/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  const { name } = req.body;
  
  try {
    let updateQuery = 'UPDATE users SET name = ?';
    let params = [name];
    
    if (req.file) {
      // Upload to Supabase Storage
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${req.userId}-${Date.now()}${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      updateQuery += ', avatarUrl = ?';
      params.push(publicUrl);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(req.userId);
    
    await db.run(updateQuery, params);
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.userId]);
    const { ...safeUser } = user;
    safeUser.avatarUrl = safeUser.avatarUrl || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.email);
    
    res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

app.get('/api/quotes', async (req, res) => {
  const { category } = req.query;
  const authHeader = req.headers['authorization'];
  let userId = null;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    } catch (e) {}
  }

  try {
    let query = `
      SELECT q.*, u.name as authorName, 
      (SELECT SUM(likes) FROM quotes WHERE userId = u.id) as userTotalLikes
      FROM quotes q JOIN users u ON q.userId = u.id
    `;
    let params = [];
    if (category && category !== 'All') {
      query += ' WHERE q.category = ?';
      params.push(category);
    }
    query += ' ORDER BY q.likes DESC, q.createdAt DESC LIMIT 50';
    
    let quotes = await db.all(query, params);
    
    // Add comment counts and check if current user liked
    for (let q of quotes) {
      const countRes = await db.get('SELECT COUNT(*) as c FROM comments WHERE quoteId = ?', [q.id]);
      q.commentCount = countRes.c;
      if (userId) {
        const liked = await db.get('SELECT 1 FROM quote_likes WHERE userId = ? AND quoteId = ?', [userId, q.id]);
        q.isLiked = !!liked;
      } else {
        q.isLiked = false;
      }
    }

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Social Routes ---
app.post('/api/quotes/:id/like', authMiddleware, async (req, res) => {
  const quoteId = req.params.id;
  try {
    const existing = await db.get('SELECT * FROM quote_likes WHERE userId = ? AND quoteId = ?', [req.userId, quoteId]);
    if (existing) {
      await db.run('DELETE FROM quote_likes WHERE userId = ? AND quoteId = ?', [req.userId, quoteId]);
      await db.run('UPDATE quotes SET likes = likes - 1 WHERE id = ?', [quoteId]);
      res.json({ action: 'unliked' });
    } else {
      await db.run('INSERT INTO quote_likes (userId, quoteId) VALUES (?, ?)', [req.userId, quoteId]);
      await db.run('UPDATE quotes SET likes = likes + 1 WHERE id = ?', [quoteId]);
      res.json({ action: 'liked' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/quotes/:id/comments', async (req, res) => {
  try {
    const comments = await db.all(`
      SELECT c.*, u.name as userName, u.avatarUrl as userAvatar,
      (SELECT SUM(likes) FROM quotes WHERE userId = u.id) as userTotalLikes
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.quoteId = ?
      ORDER BY c.createdAt DESC
    `, [req.params.id]);

    const formattedComments = comments.map(c => ({
      ...c,
      userAvatar: c.userAvatar || null
    }));

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/quotes/:id/comments', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment required' });
  try {
    const result = await db.run('INSERT INTO comments (userId, quoteId, text) VALUES (?, ?, ?)', [req.userId, req.params.id, text]);
    const newComment = await db.get(`
      SELECT c.*, u.name as userName, u.avatarUrl as userAvatar,
      (SELECT SUM(likes) FROM quotes WHERE userId = u.id) as userTotalLikes
      FROM comments c JOIN users u ON c.userId = u.id WHERE c.id = ?
    `, [result.lastID]);
    
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/quotes', authMiddleware, async (req, res) => {
  const { text, category } = req.body;
  if (!text || !category) return res.status(400).json({ error: 'Text and category required' });
  try {
    const result = await db.run('INSERT INTO quotes (userId, text, category) VALUES (?, ?, ?)', [req.userId, text, category]);
    res.json({ message: 'Quote submitted successfully', id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/user/quotes', authMiddleware, async (req, res) => {
  try {
    const quotes = await db.all(`
      SELECT q.*, u.name as authorName, 
      (SELECT SUM(likes) FROM quotes WHERE userId = u.id) as userTotalLikes
      FROM quotes q JOIN users u ON q.userId = u.id WHERE q.userId = ? ORDER BY q.createdAt DESC
    `, [req.userId]);
    for (let q of quotes) {
      const countRes = await db.get('SELECT COUNT(*) as c FROM comments WHERE quoteId = ?', [q.id]);
      q.commentCount = countRes.c;
      const liked = await db.get('SELECT 1 FROM quote_likes WHERE userId = ? AND quoteId = ?', [req.userId, q.id]);
      q.isLiked = !!liked;
    }
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching quotes' });
  }
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const quotes = await db.all('SELECT * FROM quotes WHERE text LIKE ? OR category LIKE ? ORDER BY createdAt DESC LIMIT 5', [`%${query}%`, `%${query}%`]);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching search results' });
  }
});

app.get('/api/daily-quote', async (req, res) => {
  try {
    const quote = await db.get('SELECT * FROM daily_quote WHERE id = 1');
    res.json(quote || { text: 'The obstacle in the path becomes the path.', author: 'Ryan Holiday' });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching daily quote' });
  }
});

// --- Kaggle Automation ---
const updateDailyQuote = async (retries = 3) => {
  console.log('Fetching daily quote from public API...');
  
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    
    if (data && data.length > 0) {
      const text = data[0].q;
      const author = data[0].a;
      
      const query = `
        INSERT INTO daily_quote (id, text, author, updatedAt) 
        VALUES (1, ?, ?, CURRENT_TIMESTAMP) 
        ON CONFLICT (id) DO UPDATE SET 
          text = EXCLUDED.text, 
          author = EXCLUDED.author, 
          updatedAt = CURRENT_TIMESTAMP
      `;
      
      await db.run(query, [text, author]);
      console.log('Daily quote updated to:', text);
    } else {
      throw new Error('Invalid response from API');
    }
  } catch (error) {
    console.error('Error fetching daily quote:', error.message);
    if (retries > 0) {
      console.log(`Retrying daily quote update in 5 minutes... (${retries} retries left)`);
      setTimeout(() => updateDailyQuote(retries - 1), 5 * 60 * 1000);
    }
  }
};

// Run immediately on boot, and then every day at midnight
updateDailyQuote();
cron.schedule('0 0 * * *', () => updateDailyQuote(3));

// --- WebSocket Chat Logic (E2EE Routed) ---
io.on('connection', (socket) => {
  console.log('A user connected to chat:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    // The message is already encrypted by the client! The server just routes it.
    socket.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
