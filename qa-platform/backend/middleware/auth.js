import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.execute('SELECT id, username, email FROM users WHERE id = ?', [decoded.userId]);
    
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [rows] = await db.execute('SELECT id, username, email FROM users WHERE id = ?', [decoded.userId]);
      
      if (rows.length > 0) {
        req.user = rows[0];
      }
    } catch (error) {
      // Token invalid, but continue without user
    }
  }
  next();
};