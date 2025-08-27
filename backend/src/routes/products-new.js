import { Router } from 'express';
import { pool } from '../data/db.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    console.log('Products request:', req.query);
    
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const onlyFeatured = String(req.query.featured || '').toLowerCase() === 'true';
    const category = (req.query.category || '').toString().trim();
    const search = (req.query.search || '').toString().trim();
    const offset = (page - 1) * limit;
    
    console.log('Parsed parameters:', { page, limit, onlyFeatured, category, search, offset });

    // Build WHERE conditions
    let whereConditions = [];
    let params = [];

    if (onlyFeatured) {
      whereConditions.push('featured = TRUE');
    }

    if (category && category !== 'all') {
      whereConditions.push('LOWER(category) = LOWER(?)');
      params.push(category);
    }

    if (search) {
      whereConditions.push('(LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Build the WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    console.log('WHERE clause:', whereClause);
    console.log('Parameters:', params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;
    
    console.log('Total count:', total);

    // Get products - using string interpolation for LIMIT and OFFSET
    let productsQuery = `SELECT * FROM products ${whereClause} ORDER BY featured DESC, createdAt DESC LIMIT ${limit} OFFSET ${offset}`;
    
    console.log('Products query:', productsQuery);
    console.log('Products params:', params);
    
    const [products] = await pool.execute(productsQuery, params);
    console.log('Products found:', products.length);

    // Get images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const [images] = await pool.execute(
          'SELECT url, alt_text, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, is_primary DESC',
          [product._id]
        );
        
        return {
          ...product,
          images: images.map(img => ({
            url: img.url,
            alt_text: img.alt_text,
            is_primary: Boolean(img.is_primary),
            sort_order: img.sort_order
          })),
          featured: Boolean(product.featured),
          price: parseInt(product.price) || 0,
          stockQuantity: parseInt(product.stockQuantity) || 0
        };
      })
    );

    console.log('Products with images processed:', productsWithImages.length);

    return res.json({ 
      success: true, 
      products: productsWithImages, 
      pagination: { 
        page, 
        limit, 
        total, 
        pages: Math.max(1, Math.ceil(total / limit)) 
      } 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE _id = ? AND isActive = TRUE',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = products[0];
    
    // Get images for this product
    const [images] = await pool.execute(
      'SELECT url, alt_text, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, is_primary DESC',
      [product._id]
    );

    const processedProduct = {
      ...product,
      images: images.map(img => ({
        url: img.url,
        alt_text: img.alt_text,
        is_primary: Boolean(img.is_primary),
        sort_order: img.sort_order
      })),
      featured: Boolean(product.featured),
      price: parseInt(product.price) || 0,
      stockQuantity: parseInt(product.stockQuantity) || 0,
      rating: { average: 0, count: 0 },
      fabrics: [],
      sizes: ['S','M','L','XL']
    };

    return res.json({ success: true, product: processedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
