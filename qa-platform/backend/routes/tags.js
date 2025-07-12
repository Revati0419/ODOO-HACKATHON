import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, name, description FROM tags';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get popular tags
router.get('/popular', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT t.id, t.name, t.description, COUNT(qt.question_id) as question_count
      FROM tags t
      LEFT JOIN question_tags qt ON t.id = qt.tag_id
      GROUP BY t.id
      ORDER BY question_count DESC
      LIMIT 20
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;