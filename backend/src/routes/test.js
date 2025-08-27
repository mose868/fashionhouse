import { Router } from 'express';
import { pool } from '../data/db.js';

const router = Router();

// Test endpoint to debug MySQL issues
router.get('/', async (req, res) => {
  try {
    console.log('Testing simple query...');
    
    // Test 1: Simple count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM products');
    console.log('Count result:', countResult);
    
    // Test 2: Simple select with limit
    const [productsResult] = await pool.execute('SELECT * FROM products LIMIT 5');
    console.log('Products result:', productsResult.length, 'products');
    
    // Test 3: Test with parameters
    const [paramResult] = await pool.execute('SELECT * FROM products WHERE category = ? LIMIT 1', ['Accessories']);
    console.log('Parameter result:', paramResult.length, 'products');
    
    res.json({ 
      success: true, 
      message: 'All tests passed',
      count: countResult[0].total,
      products: productsResult.length,
      paramTest: paramResult.length
    });
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
});

export default router;
