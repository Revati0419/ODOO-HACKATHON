import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Vote on question or answer
router.post('/', authenticateToken, [
  body('voteableId').isInt(),
  body('voteableType').isIn(['question', 'answer']),
  body('voteType').isIn(['up', 'down'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { voteableId, voteableType, voteType } = req.body;

    // Check if user is trying to vote on their own content
    const table = voteableType === 'question' ? 'questions' : 'answers';
    const [content] = await db.execute(`SELECT user_id FROM ${table} WHERE id = ?`, [voteableId]);
    
    if (content.length === 0) {
      return res.status(404).json({ error: `${voteableType} not found` });
    }

    if (content[0].user_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot vote on your own content' });
    }

    // Check existing vote
    const [existingVotes] = await db.execute(
      'SELECT vote_type FROM votes WHERE user_id = ? AND voteable_id = ? AND voteable_type = ?',
      [req.user.id, voteableId, voteableType]
    );

    let scoreChange = 0;

    if (existingVotes.length > 0) {
      const currentVote = existingVotes[0].vote_type;
      
      if (currentVote === voteType) {
        // Remove vote
        await db.execute(
          'DELETE FROM votes WHERE user_id = ? AND voteable_id = ? AND voteable_type = ?',
          [req.user.id, voteableId, voteableType]
        );
        scoreChange = voteType === 'up' ? -1 : 1;
      } else {
        // Change vote
        await db.execute(
          'UPDATE votes SET vote_type = ? WHERE user_id = ? AND voteable_id = ? AND voteable_type = ?',
          [voteType, req.user.id, voteableId, voteableType]
        );
        scoreChange = voteType === 'up' ? 2 : -2;
      }
    } else {
      // New vote
      await db.execute(
        'INSERT INTO votes (user_id, voteable_id, voteable_type, vote_type) VALUES (?, ?, ?, ?)',
        [req.user.id, voteableId, voteableType, voteType]
      );
      scoreChange = voteType === 'up' ? 1 : -1;
    }

    // Update score
    await db.execute(
      `UPDATE ${table} SET score = score + ? WHERE id = ?`,
      [scoreChange, voteableId]
    );

    res.json({ message: 'Vote recorded successfully', scoreChange });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;