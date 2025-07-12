import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js'; // Updated import

const router = express.Router();

router.post('/register', [
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    const token = jwt.sign({ userId: result.insertId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        username,
        email,
        reputation: 0,
        role: 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login (Updated to include role)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const [rows] = await db.execute(
      'SELECT id, username, email, password_hash, reputation, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Add role to token payload
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        reputation: user.reputation,
        role: user.role // Return role in user object
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile (Updated to include role)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, email, reputation, role, created_at FROM users WHERE id = ?',
      [req.user.userId] // Use userId from token payload
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// --- ADMIN ROUTES ---

// Get all users (Admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, email, role, reputation, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (Admin only)
router.patch('/:id/role', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified.' });
        }

        await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated successfully.' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


export default router;