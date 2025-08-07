const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Database = require('better-sqlite3')

const app = express()
const db = new Database('./users.db', { verbose: console.log })
const PORT = process.env.PORT || 3001
const SECRET_KEY = 'your_secret_key'

app.use(cors())
app.use(express.json())

// Create users table if not exists
db.prepare(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`
).run()

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error_msg: 'Username and password are required' })
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (existingUser) {
    return res.status(400).json({ error_msg: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword)

  res.json({ message: 'User registered successfully' })
})

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)

  if (!user) {
    return res.status(401).json({ error_msg: 'Invalid username' })
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return res.status(401).json({ error_msg: 'Invalid password' })
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '30d' })
  res.json({ jwt_token: token })
})

app.get('/', (req, res) => {
  res.send('✅ Backend is running')
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
