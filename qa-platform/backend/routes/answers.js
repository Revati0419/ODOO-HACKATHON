import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create answer
router.post('/', authenticateToken, [
  body('questionId').isInt(),
  body('content').isLength({ min: 10 }).trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { questionId, content } = req.body;

    // Check if question exists
    const [questions] = await db.execute('SELECT user_id FROM questions WHERE id = ?', [questionId]);
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Create answer
    const [result] = await db.execute(
      'INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)',
      [questionId, req.user.id, content]
    );

    // Create notification for question owner
    if (questions[0].user_id !== req.user.id) {
      await db.execute(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
        [
          questions[0].user_id,
          'answer',
          'New Answer',
          `${req.user.username} answered your question`,
          `/questions/${questionId}`
        ]
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Answer created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept answer
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answerId = req.params.id;

    // Get answer and question details
    const [answers] = await db.execute(`
      SELECT a.id, a.question_id, a.user_id, q.user_id as question_owner_id
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.id = ?
    `, [answerId]);

    if (answers.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const answer = answers[0];

    // Check if user is question owner
    if (answer.question_owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only question owner can accept answers' });
    }

    // Unaccept previous answer
    await db.execute(
      'UPDATE answers SET is_accepted = FALSE WHERE question_id = ?',
      [answer.question_id]
    );

    // Accept this answer
    await db.execute('UPDATE answers SET is_accepted = TRUE WHERE id = ?', [answerId]);

    // Update question accepted answer
    await db.execute('UPDATE questions SET accepted_answer_id = ? WHERE id = ?', [answerId, answer.question_id]);

    // Create notification for answer owner
    if (answer.user_id !== req.user.id) {
      await db.execute(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
        [
          answer.user_id,
          'accept',
          'Answer Accepted',
          `${req.user.username} accepted your answer`,
          `/questions/${answer.question_id}`
        ]
      );
    }

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
      const { id } = req.params;

      const [result] = await db.execute('DELETE FROM answers WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Answer not found' });
      }

      res.status(200).json({ message: 'Answer deleted successfully by admin' });
  } catch (error) {
      console.error("Error deleting answer:", error);
      res.status(500).json({ error: 'Server error while deleting answer' });
  }
});

export default router;