import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { productsStore, ordersStore, promoCodesStore } from '../data/productsStore.js';
import { persistence } from '../data/persistence.js';
import { pool, toMySQLTimestamp } from '../data/db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();

// Simple in-memory stores (shared products store)
let products = productsStore.items;
let orders = ordersStore.items;
let promoCodes = promoCodesStore.items;

// file storage for product media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use the SAME uploads directory that server.js serves statically
const uploadsDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
// Configure multer with file filtering for video uploads
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.fieldname === 'images') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for images field'), false);
    }
  }
  // Allow videos
  else if (file.fieldname === 'video') {
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo'];
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, AVI, MOV) are allowed for video field'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 6 // 5 images + 1 video
  }
});

// No mock orders; real orders are stored in MySQL

router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search || '';
    const category = req.query.category || '';
    const offset = (page - 1) * limit;
    
    // Build WHERE conditions
    let whereConditions = [];
    let params = [];
    
    if (search) {
      whereConditions.push('(LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (category) {
      whereConditions.push('LOWER(category) = LOWER(?)');
      params.push(category);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    
    // Get products with images
    const [products] = await pool.execute(
      `SELECT * FROM products ${whereClause} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    
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
    
    return res.json({ 
      products: productsWithImages, 
      pagination: { 
        total: Math.max(1, Math.ceil(total / limit)), 
        totalProducts: total 
      } 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post(
  '/products',
  (req, res, next) => {
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'video', maxCount: 1 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            message: 'File too large. Maximum size is 100MB.' 
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ 
            success: false, 
            message: 'Too many files. Maximum is 5 images and 1 video.' 
          });
        }
        return res.status(400).json({ 
          success: false, 
          message: 'File upload error: ' + err.message 
        });
      } else if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      console.log('Creating product with data:', req.body);
      console.log('Files received:', req.files);
      
      // Use the backend server's actual port for image URLs
      const backendPort = process.env.PORT || 5010;
      const baseUrl = `http://localhost:${backendPort}`;
      const id = uuid();
      const video = (req.files?.video || [])[0];
      const createdAt = new Date().toISOString();

      // Validate required fields
      if (!req.body?.name || !req.body?.price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product name and price are required' 
        });
      }

      // Ensure all fields have proper values
      const name = req.body.name.trim();
      const description = (req.body.description || '').trim();
      const category = (req.body.category || '').trim();
      const price = Number(req.body.price);
      const stock = Number(req.body.stock || 0);
      const featured = !!(req.body.featured === 'true' || req.body.featured === true);

      const images = (req.files?.images || []).map((f) => ({ 
        url: `${baseUrl}/uploads/${f.filename}`,
        filename: f.filename,
        originalName: f.originalname
      }));

      const product = { 
        _id: id, 
        name: name, 
        description: description, 
        category: category, 
        price: price, 
        stockQuantity: stock, 
        featured: featured, 
        images, 
        videoUrl: video ? `${baseUrl}/uploads/${video.filename}` : null, 
        createdAt 
      };
      
      // Prepare database parameters
      const dbParams = [
        product._id,
        product.name,
        product.description,
        product.category,
        product.price,
        product.stockQuantity,
        product.featured,
        product.videoUrl,
        toMySQLTimestamp(product.createdAt)
      ];
      
      // Validate parameters before database insertion
      console.log('Database parameters:', dbParams);
      for (let i = 0; i < dbParams.length; i++) {
        if (dbParams[i] === undefined) {
          console.error(`Parameter ${i} is undefined:`, dbParams[i]);
          return res.status(500).json({ 
            success: false, 
            message: `Database parameter ${i} is undefined` 
          });
        }
      }
      
      // Save to database
      await pool.execute(
        `INSERT INTO products (_id, name, description, category, price, stockQuantity, featured, videoUrl, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        dbParams
      );
      
      // Save images to database
      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i];
        await pool.execute(
          `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            product._id,
            image.url,
            image.originalName || '',
            i === 0 ? 1 : 0, // First image is primary
            i
          ]
        );
      }
      
      // Add to in-memory store for consistency
      productsStore.items.push(product);
      
      console.log('Product created successfully in database and memory store:', product);
      return res.status(201).json({ success: true, product });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
  }
);

router.delete('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    // Fetch product and its images to remove files from disk
    const [productRows] = await pool.execute(
      'SELECT _id, videoUrl FROM products WHERE _id = ?',
      [productId]
    );
    const [imageRows] = await pool.execute(
      'SELECT url FROM product_images WHERE product_id = ?',
      [productId]
    );
    
    // Delete from database first
    const [deleteResult] = await pool.execute(
      'DELETE FROM product_images WHERE product_id = ?',
      [productId]
    );
    
    const [productDeleteResult] = await pool.execute(
      'DELETE FROM products WHERE _id = ?',
      [productId]
    );
    
    if (productDeleteResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Attempt to remove files from disk (best-effort)
    try {
      // Remove image files
      for (const row of imageRows) {
        try {
          const filename = path.basename(new URL(row.url).pathname);
          const filepath = path.join(uploadsDir, filename);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        } catch {}
      }
      // Remove video file if present
      const productRow = productRows[0];
      if (productRow?.videoUrl) {
        try {
          const videoFilename = path.basename(new URL(productRow.videoUrl).pathname);
          const videoPath = path.join(uploadsDir, videoFilename);
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to remove one or more media files for product', productId, e?.message);
    }
    
    // Also delete from in-memory store for consistency
    const index = productsStore.items.findIndex(p => p._id === productId);
    if (index !== -1) {
      productsStore.items.splice(index, 1);
    }
    
    console.log(`Product ${productId} deleted successfully from database and memory store`);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;
    const status = String(req.query.status || '');
    const search = String(req.query.search || '');

    let where = 'WHERE 1=1';
    const params = [];
    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      where += ' AND (orderNumber LIKE ? OR user_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.execute(`SELECT COUNT(*) as c FROM orders ${where}`, params);
    const total = countRows[0].c || 0;

    const [rows] = await pool.execute(`SELECT * FROM orders ${where} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`, params);

    return res.json({
      orders: rows,
      pagination: { total: Math.max(1, Math.ceil(total / limit)), totalOrders: total }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Use in-memory stores
    const productCount = productsStore.items.length;
    const orderCount = ordersStore.items.length;
    const userCount = 0; // Mock user count for now
    const totalRevenue = ordersStore.items
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Get low stock products (less than 5 items)
    const lowStockProducts = productsStore.items
      .filter(product => product.stockQuantity < 5)
      .slice(0, 5);
    
    return res.json({
      totalProducts: productCount,
      totalOrders: orderCount,
      totalCustomers: userCount,
      totalRevenue: totalRevenue,
      recentOrders: ordersStore.items.slice(0, 5),
      lowStockProducts: lowStockProducts,
      todayStats: {
        orders: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        customers: Math.floor(Math.random() * 5) + 1
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = String(req.query.search || '');
    const role = String(req.query.role || '');

    let where = 'WHERE 1=1';
    const params = [];
    if (search) {
      where += ' AND (LOWER(firstName) LIKE LOWER(?) OR LOWER(lastName) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role === 'admin') {
      where += ' AND isAdmin = 1';
    } else if (role === 'customer') {
      where += ' AND (isAdmin IS NULL OR isAdmin = 0)';
    }

    const [countRows] = await pool.execute(`SELECT COUNT(*) as c FROM users ${where}`, params);
    const total = countRows[0].c || 0;

    const [users] = await pool.execute(
      `SELECT * FROM users ${where} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      params
    );

    return res.json({
      users: users.map(u => ({ ...u, isAdmin: !!u.isAdmin })),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total/limit)) }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { isAdmin, isVerified, suspended } = req.body;
    try {
      await pool.execute(
        'UPDATE users SET isAdmin = COALESCE(?, isAdmin), isVerified = COALESCE(?, isVerified), suspended = COALESCE(?, suspended) WHERE _id = ?',
        [
          typeof isAdmin === 'boolean' ? (isAdmin ? 1 : 0) : null,
          typeof isVerified === 'boolean' ? (isVerified ? 1 : 0) : null,
          typeof suspended === 'boolean' ? (suspended ? 1 : 0) : null,
          req.params.id
        ]
      );
    } catch (e) {
      // Auto-migrate if 'suspended' column is missing, then retry once
      if (e?.code === 'ER_BAD_FIELD_ERROR') {
        try {
          await pool.execute('ALTER TABLE users ADD COLUMN suspended BOOLEAN DEFAULT FALSE AFTER isVerified');
          await pool.execute(
            'UPDATE users SET isAdmin = COALESCE(?, isAdmin), isVerified = COALESCE(?, isVerified), suspended = COALESCE(?, suspended) WHERE _id = ?',
            [
              typeof isAdmin === 'boolean' ? (isAdmin ? 1 : 0) : null,
              typeof isVerified === 'boolean' ? (isVerified ? 1 : 0) : null,
              typeof suspended === 'boolean' ? (suspended ? 1 : 0) : null,
              req.params.id
            ]
          );
        } catch (e2) {
          console.error('Failed to add suspended column or update user:', e2);
          return res.status(500).json({ message: 'Internal server error' });
        }
      } else {
        throw e;
      }
    }
    const [rows] = await pool.execute('SELECT * FROM users WHERE _id = ?', [req.params.id]);
    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    // Optional: detach relations (orders table already uses ON DELETE SET NULL for user_id)
    // Ensure no orphan references in custom tables if any
    const [result] = await pool.execute('DELETE FROM users WHERE _id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Contacts management
router.get('/contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    
    // Mock contacts data for now
    const contacts = Array.from({ length: 10 }, (_, i) => ({
      _id: `contact-${i + 1}`,
      name: `Contact ${i + 1}`,
      email: `contact${i + 1}@example.com`,
      message: `This is a sample message ${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      status: i % 3 === 0 ? 'unread' : i % 3 === 1 ? 'read' : 'replied'
    }));
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const slice = contacts.slice(start, end);
    
    return res.json({
      contacts: slice,
      pagination: {
        total: Math.ceil(contacts.length / limit),
        totalContacts: contacts.length
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/contacts/statistics', (req, res) => {
  // Mock statistics
  return res.json({
    total: 25,
    unread: 8,
    read: 12,
    replied: 5
  });
});

// Ambassadors management
router.get('/ambassadors', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const status = req.query.status || '';
    const search = req.query.search || '';
    
    // Mock ambassadors data
    const ambassadors = Array.from({ length: 15 }, (_, i) => ({
      _id: `ambassador-${i + 1}`,
      firstName: `Ambassador ${i + 1}`,
      lastName: `Last ${i + 1}`,
      email: `ambassador${i + 1}@example.com`,
      phone: `+254700${String(i + 1).padStart(6, '0')}`,
      status: i % 4 === 0 ? 'pending' : i % 4 === 1 ? 'approved' : i % 4 === 2 ? 'active' : 'suspended',
      referralCount: Math.floor(Math.random() * 50),
      totalEarnings: Math.floor(Math.random() * 10000),
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    }));
    
    let filtered = ambassadors;
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (search) {
      filtered = filtered.filter(a => 
        a.firstName.toLowerCase().includes(search.toLowerCase()) ||
        a.lastName.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const slice = filtered.slice(start, end);
    
    return res.json({
      ambassadors: slice,
      pagination: {
        total: Math.ceil(filtered.length / limit),
        totalAmbassadors: filtered.length
      }
    });
  } catch (error) {
    console.error('Error fetching ambassadors:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/ambassadors/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    // In a real app, this would update the database
    return res.json({ success: true, status });
  } catch (error) {
    console.error('Error updating ambassador status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// AI usage tracking
router.get('/ai-usage', (req, res) => {
  // Mock AI usage data
  return res.json({
    totalGenerations: 156,
    thisMonth: 23,
    popularPrompts: [
      { prompt: 'Ankara dress', count: 45 },
      { prompt: 'Traditional gown', count: 32 },
      { prompt: 'Modern African wear', count: 28 }
    ],
    usageByDay: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10) + 1
    }))
  });
});

// Loyalty program
router.get('/loyalty/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    
    // Mock loyalty customers data
    const customers = Array.from({ length: 25 }, (_, i) => ({
      _id: `customer-${i + 1}`,
      firstName: `Customer ${i + 1}`,
      lastName: `Last ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      points: Math.floor(Math.random() * 1000),
      tier: i % 3 === 0 ? 'bronze' : i % 3 === 1 ? 'silver' : 'gold',
      totalSpent: Math.floor(Math.random() * 50000),
      lastPurchase: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString()
    }));
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const slice = customers.slice(start, end);
    
    return res.json({
      customers: slice,
      pagination: {
        total: Math.ceil(customers.length / limit),
        totalCustomers: customers.length
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty customers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/promo-codes/stats', (req, res) => {
  // Mock promo code statistics
  return res.json({
    totalCodes: 45,
    activeCodes: 23,
    totalRedemptions: 156,
    totalDiscount: 12500
  });
});

router.post('/loyalty/customers/:id/generate', (req, res) => {
  try {
    const { points } = req.body;
    // In a real app, this would generate a code and save it
    const code = `LOYALTY-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    return res.json({ success: true, code, points });
  } catch (error) {
    console.error('Error generating loyalty code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/loyalty/bulk-generate', (req, res) => {
  try {
    const { count, points } = req.body;
    const codes = Array.from({ length: count }, () => 
      `LOYALTY-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    );
    return res.json({ success: true, codes, points });
  } catch (error) {
    console.error('Error bulk generating loyalty codes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body || {};
    await pool.execute(
      `UPDATE orders SET status = COALESCE(?, status), trackingNumber = COALESCE(?, trackingNumber), adminNotes = COALESCE(?, adminNotes), updatedAt = CURRENT_TIMESTAMP WHERE _id = ?`,
      [status || null, trackingNumber || null, notes || null, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM orders WHERE _id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order: rows[0] });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create promo code (used by AdminProducts)
router.post('/promo-codes', (req, res) => {
  const code = (req.body?.code || '').toUpperCase() || `PROMO-${Math.floor(Math.random() * 1e6)}`;
  const promo = {
    id: uuid(),
    code,
    productId: req.body?.productId,
    discountPercentage: Number(req.body?.discountPercentage || 0),
    expiryDate: req.body?.expiryDate || null,
    isActive: req.body?.isActive !== false,
    createdAt: new Date().toISOString(),
  };
  promoCodes.push(promo);
  try { persistence.savePromoCodes(promoCodes); } catch {}
  return res.status(201).json({ success: true, promo });
});

export default router;


