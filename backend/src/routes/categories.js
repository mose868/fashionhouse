import { Router } from 'express';
import { pool } from '../data/db.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(p._id) as product_count
      FROM categories c
      LEFT JOIN products p ON LOWER(c.name) = LOWER(p.category) AND p.isActive = TRUE
      WHERE c.isActive = TRUE
      GROUP BY c._id
      ORDER BY c.name ASC
    `);

    return res.json({ 
      success: true, 
      categories: categories.map(cat => ({
        ...cat,
        product_count: parseInt(cat.product_count) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE _id = ? AND isActive = TRUE',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, category: categories[0] });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const _id = `cat-${Date.now()}`;
    
    await pool.execute(
      'INSERT INTO categories (_id, name, description, imageUrl) VALUES (?, ?, ?, ?)',
      [_id, name, description || '', imageUrl || '']
    );

    return res.json({ 
      success: true, 
      message: 'Category created successfully',
      category: { _id, name, description, imageUrl }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    await pool.execute(
      'UPDATE categories SET name = ?, description = ?, imageUrl = ? WHERE _id = ?',
      [name, description || '', imageUrl || '', req.params.id]
    );

    return res.json({ 
      success: true, 
      message: 'Category updated successfully' 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    // Check if category has products
    const [products] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE LOWER(category) = (SELECT LOWER(name) FROM categories WHERE _id = ?)',
      [req.params.id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category with existing products' 
      });
    }

    await pool.execute(
      'UPDATE categories SET isActive = FALSE WHERE _id = ?',
      [req.params.id]
    );

    return res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
