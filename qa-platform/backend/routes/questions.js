import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken, optionalAuth, isAdmin } from '../middleware/auth.js';

const router = express.Router();
// Get all questions
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT q.id, q.title, q.description, q.views, q.score, q.created_at, q.updated_at,
             u.username, u.reputation,
             (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count,
             q.accepted_answer_id IS NOT NULL as has_accepted_answer,
             GROUP_CONCAT(t.name) as tags
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
    `;

    const params = [];

    if (tag) {
      query += ' WHERE t.name = ?';
      params.push(tag);
    }

    if (search) {
      query += tag ? ' AND' : ' WHERE';
      query += ' (q.title LIKE ? OR q.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY q.id ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);

    // Get user votes if authenticated
    if (req.user) {
      for (let question of rows) {
        const [votes] = await db.execute(
          'SELECT vote_type FROM votes WHERE user_id = ? AND voteable_id = ? AND voteable_type = "question"',
          [req.user.id, question.id]
        );
        question.userVote = votes.length > 0 ? votes[0].vote_type : null;
      }
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get question by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const questionId = req.params.id;

    // Update view count
    await db.execute('UPDATE questions SET views = views + 1 WHERE id = ?', [questionId]);

    // Get question details
    const [questions] = await db.execute(`
      SELECT q.id, q.title, q.description, q.views, q.score, q.created_at, q.updated_at,
             q.user_id, q.accepted_answer_id,
             u.username, u.reputation,
             GROUP_CONCAT(t.name) as tags
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = ?
      GROUP BY q.id
    `, [questionId]);

    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = questions[0];

    // Get answers
    const [answers] = await db.execute(`
      SELECT a.id, a.content, a.score, a.is_accepted, a.created_at, a.updated_at,
             a.user_id, u.username, u.reputation
      FROM answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ?
      ORDER BY a.is_accepted DESC, a.score DESC, a.created_at ASC
    `, [questionId]);

    // Get user votes if authenticated
    if (req.user) {
      const [questionVotes] = await db.execute(
        'SELECT vote_type FROM votes WHERE user_id = ? AND voteable_id = ? AND voteable_type = "question"',
        [req.user.id, questionId]
      );
      question.userVote = questionVotes.length > 0 ? questionVotes[0].vote_type : null;

      for (let answer of answers) {
        const [answerVotes] = await db.execute(
          'SELECT vote_type FROM votes WHERE user_id = ? AND voteable_id = ? AND voteable_type = "answer"',
          [req.user.id, answer.id]
        );
        answer.userVote = answerVotes.length > 0 ? answerVotes[0].vote_type : null;
      }
    }

    question.answers = answers;
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create question
router.post('/', authenticateToken, [
  body('title').isLength({ min: 5, max: 255 }).trim(),
  body('description').isLength({ min: 10 }).trim(),
  body('tags').isArray({ min: 1, max: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, tags } = req.body;

    // Create question
    const [result] = await db.execute(
      'INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, req.user.id]
    );

    const questionId = result.insertId;

    // Add tags
    for (const tagName of tags) {
      // Get or create tag
      let [tagRows] = await db.execute('SELECT id FROM tags WHERE name = ?', [tagName]);
      let tagId;

      if (tagRows.length === 0) {
        const [tagResult] = await db.execute('INSERT INTO tags (name) VALUES (?)', [tagName]);
        tagId = tagResult.insertId;
      } else {
        tagId = tagRows[0].id;
      }

      // Link question to tag
      await db.execute('INSERT INTO question_tags (question_id, tag_id) VALUES (?, ?)', [questionId, tagId]);
    }

    res.status(201).json({ id: questionId, message: 'Question created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
      const { id } = req.params;

      const [result] = await db.execute('DELETE FROM questions WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Question not found' });
      }

      res.status(200).json({ message: 'Question deleted successfully by admin' });
  } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ error: 'Server error while deleting question' });
  }
});


export default router;