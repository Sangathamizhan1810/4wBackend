const Database = require('better-sqlite3');
const db = new Database('./users.db', { verbose: console.log });

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`,
    err => {
      if (err) {
        console.error('❌ Error creating users table:', err.message)
      } else {
        console.log('✅ Users table created or already exists')
      }
      db.close()
    }
  )
})