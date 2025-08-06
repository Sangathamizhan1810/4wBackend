const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
const db = new sqlite3.Database('users.db')
const PORT = 3001
const SECRET_KEY = 'your_secret_key'

app.use(cors())
app.use(express.json())

// 🚧 CREATE users table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`
)

// 🔐 REGISTER USER
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  // 🔍 Basic validation
  if (!username || !password) {
    return res.status(400).json({ error_msg: 'Username and password are required' })
  }

  if (username.length < 4) {
    return res.status(400).json({ error_msg: 'Username must be at least 4 characters long' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error_msg: 'Password must be at least 6 characters long' })
  }

  // 🧠 Check if username already exists
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (user) {
      return res.status(400).json({ error_msg: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      err => {
        if (err) {
          return res.status(500).json({ error_msg: 'Error registering user' })
        }
        res.json({ message: 'User registered successfully' })
      }
    )
  })
})

// 🔓 LOGIN USER
app.post('/login', (req, res) => {
  const { username, password } = req.body

  // 🔍 Basic validation
  if (!username || !password) {
    return res.status(400).json({ error_msg: 'Username and password are required' })
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error_msg: 'Invalid username' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error_msg: 'Invalid password' })
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '30d' })
    res.json({ jwt_token: token })
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.send('✅ Backend is running')
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
