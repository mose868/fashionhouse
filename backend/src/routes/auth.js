import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { pool } from '../data/db.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid();

    // Insert new user
    await pool.execute(
      'INSERT INTO users (_id, email, password, firstName, lastName, phone, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, firstName || '', lastName || '', phone || '', true]
    );

    return res.status(201).json({
      success: true,
      user: {
        id: userId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isVerified: !!user.isVerified,
      },
      token: 'fake-user-token',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    // For now, return a mock user - in real app you'd verify JWT token
    const auth = req.headers.authorization || '';
    if (!auth) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Mock user for now
    return res.json({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Example',
      isVerified: true,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (_req, res) => {
  return res.json({ success: true });
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // 1) Environment-based fallback for admin (works even if DB is unavailable or seed not run)
    const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@fashionhouse.com';
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (email === envAdminEmail && password === envAdminPassword) {
      return res.json({
        success: true,
        user: {
          id: 'env-admin',
          email: envAdminEmail,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
        },
        token: 'env-admin-token',
      });
    }

    // 2) DB-based admin auth (preferred)
    try {
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ? AND isAdmin = 1', [email]);
      if (users.length === 0) {
        return res.status(401).json({ message: 'Admin login failed' });
      }

      const admin = users[0];
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Admin login failed' });
      }

      return res.json({
        success: true,
        user: { 
          id: admin._id, 
          email: admin.email, 
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: 'admin' 
        },
        token: 'fake-admin-token',
      });
    } catch (dbErr) {
      // If DB check throws (e.g., DB down), fall back to environment admin only
      console.error('DB error during admin login, falling back to env admin:', dbErr);
      return res.status(401).json({ message: 'Admin login failed' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


