const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Absolute path fix for SQLite DB
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// Example: Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
    if (err) {
      return res.status(500).send({ error: 'User already exists or DB error.' });
    }
    res.status(200).send({ message: 'User registered successfully' });
  });
});

// Example: Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return res.status(401).send({ error: 'Invalid credentials' });
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).send({ error: 'Invalid credentials' });
    const token = jwt.sign({ username: user.username }, 'secret', { expiresIn: '1h' });
    res.send({ token });
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});