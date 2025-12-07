const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gidroatlas_secret_key_2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { role: 'guest' };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    req.user = { role: 'guest' };
    next();
  }
}

function expertOnly(req, res, next) {
  if (!req.user || req.user.role !== 'expert') {
    return res.status(403).json({ error: 'Доступ только для экспертов' });
  }
  next();
}

module.exports = { authMiddleware, expertOnly };

