import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { pool, toMySQLTimestamp } from '../data/db.js';

const router = Router();

// Reviews now persisted in MySQL

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;
    
    const [totalResult] = await pool.execute('SELECT COUNT(*) as c FROM reviews WHERE product_id = ?', [req.params.productId]);
    const total = totalResult[0].c;
    
    // Some MySQL configurations don't allow binding LIMIT/OFFSET; inline validated numbers
    const [reviews] = await pool.execute(
      `SELECT * FROM reviews WHERE product_id = ? ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`,
      [req.params.productId]
    );
    
    return res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        totalReviews: total,
        hasPrev: page > 1,
        hasNext: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/reviews/product/:productId
router.post('/product/:productId', async (req, res) => {
  try {
    const { rating = 5, title = '', comment = '' } = req.body || {};
    if (!comment || String(comment).trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }
    
    const data = {
      _id: uuid(),
      product_id: req.params.productId,
      rating: Number(rating) || 5,
      title: String(title || ''),
      comment: String(comment || ''),
      createdAt: new Date().toISOString(),
      user_email: 'guest@example.com',
      user_name: 'Guest User',
    };
    
    await pool.execute(
      'INSERT INTO reviews (_id, product_id, rating, title, comment, createdAt, user_email, user_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data._id, data.product_id, data.rating, data.title, data.comment, toMySQLTimestamp(data.createdAt), data.user_email, data.user_name]
    );
    
    return res.status(201).json({ success: true, review: data });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;


