const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'gidroatlas_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Login
router.post('/login', (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    const user = db.prepare('SELECT * FROM users WHERE login = ?').get(login);
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, login: user.login, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Выход выполнен успешно' });
});

// Verify token
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      valid: true,
      user: {
        id: decoded.id,
        login: decoded.login,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Недействительный токен', valid: false });
  }
});

module.exports = router;

