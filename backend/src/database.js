const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/gidroatlas.db'));

function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('guest', 'expert')) DEFAULT 'guest',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Water objects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS water_objects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      resource_type TEXT CHECK(resource_type IN ('озеро', 'канал', 'водохранилище', 'шлюз', 'гидроузел', 'плотина')) NOT NULL,
      water_type TEXT CHECK(water_type IN ('пресная', 'непресная', 'нет')),
      fauna BOOLEAN DEFAULT 0,
      fauna_description TEXT,
      passport_date DATE,
      technical_condition INTEGER CHECK(technical_condition BETWEEN 1 AND 5) NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      pdf_url TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_region ON water_objects(region);
    CREATE INDEX IF NOT EXISTS idx_condition ON water_objects(technical_condition);
    CREATE INDEX IF NOT EXISTS idx_resource_type ON water_objects(resource_type);
  `);

  // Create default users if not exist
  const expertExists = db.prepare('SELECT id FROM users WHERE login = ?').get('expert');
  if (!expertExists) {
    const hash = bcrypt.hashSync('expert123', 10);
    db.prepare('INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)').run('expert', hash, 'expert');
    console.log('✅ Default expert user created (login: expert, password: expert123)');
  }

  console.log('✅ Database initialized');
}

module.exports = { db, initDatabase };

