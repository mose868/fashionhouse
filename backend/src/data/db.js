import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool without database first
const poolWithoutDB = mysql.createPool(dbConfig);

// Create connection pool with database
export const pool = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME || 'fashionhouse'
});

// Initialize database and tables
export async function initializeDatabase() {
  try {
    // First create database using connection without database
    const connectionWithoutDB = await poolWithoutDB.getConnection();
    await connectionWithoutDB.execute(`CREATE DATABASE IF NOT EXISTS fashionhouse CHARACTER SET utf8mb4`);
    connectionWithoutDB.release();
    
    // Now use the main pool with database
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        _id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(255),
        country VARCHAR(255),
        postalCode VARCHAR(20),
        isAdmin BOOLEAN DEFAULT FALSE,
        isVerified BOOLEAN DEFAULT FALSE,
        verificationToken VARCHAR(255),
        resetPasswordToken VARCHAR(255),
        resetPasswordExpires TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure 'suspended' column exists on users (for older databases)
    try {
      const [colRows] = await connection.execute(
        `SELECT COUNT(*) AS c
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'users'
           AND COLUMN_NAME = 'suspended'`
      );
      const hasSuspended = Number(colRows?.[0]?.c || 0) > 0;
      if (!hasSuspended) {
        await connection.execute(`ALTER TABLE users ADD COLUMN suspended BOOLEAN DEFAULT FALSE AFTER isVerified`);
      }
    } catch (e) {
      console.warn('Could not verify/add users.suspended column:', e?.message);
    }

    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        _id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        _id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(255),
        price INT DEFAULT 0,
        stockQuantity INT DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        videoUrl TEXT,
        sku VARCHAR(255),
        brand VARCHAR(255),
        material TEXT,
        care_instructions TEXT,
        sizes JSON,
        colors JSON,
        weight DECIMAL(10,2),
        dimensions JSON,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create product_images table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE
      )
    `);

    // Create product_variants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        _id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        size VARCHAR(50),
        color VARCHAR(100),
        price INT DEFAULT 0,
        stockQuantity INT DEFAULT 0,
        sku VARCHAR(255),
        FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE
      )
    `);

    // Create reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        _id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        rating INT DEFAULT 5,
        title VARCHAR(255) DEFAULT '',
        comment TEXT,
        isVerified BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE SET NULL
      )
    `);

    // Create orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        _id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        user_email VARCHAR(255),
        orderNumber VARCHAR(255) UNIQUE,
        total INT DEFAULT 0,
        subtotal INT DEFAULT 0,
        tax INT DEFAULT 0,
        shipping INT DEFAULT 0,
        discount INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        paymentStatus VARCHAR(50) DEFAULT 'pending',
        shippingAddress JSON,
        billingAddress JSON,
        trackingNumber VARCHAR(255),
        adminNotes TEXT,
        customerNotes TEXT,
        estimatedDelivery TIMESTAMP,
        shippedAt TIMESTAMP,
        deliveredAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE SET NULL
      )
    `);

    // Create order_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        _id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_price INT NOT NULL,
        quantity INT NOT NULL,
        size VARCHAR(50),
        color VARCHAR(100),
        total INT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(_id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE
      )
    `);

    // Create promo_codes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id VARCHAR(255) PRIMARY KEY,
        code VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        description TEXT,
        discountType ENUM('percentage', 'fixed') DEFAULT 'percentage',
        discountValue INT DEFAULT 0,
        minimumOrderAmount INT DEFAULT 0,
        maximumDiscount INT,
        usageLimit INT,
        usedCount INT DEFAULT 0,
        productId VARCHAR(255),
        categoryId VARCHAR(255),
        isActive BOOLEAN DEFAULT TRUE,
        startsAt TIMESTAMP,
        expiresAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255),
        user_id VARCHAR(255),
        provider VARCHAR(100) NOT NULL,
        method VARCHAR(100),
        amount INT NOT NULL,
        currency VARCHAR(10) DEFAULT 'KES',
        status VARCHAR(50) DEFAULT 'pending',
        transactionId VARCHAR(255),
        phone VARCHAR(50),
        merchantRequestID VARCHAR(255),
        checkoutRequestID VARCHAR(255),
        resultCode INT,
        resultDesc TEXT,
        rawResponse TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(_id) ON DELETE SET NULL,
        FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE SET NULL
      )
    `);

    // Create wishlist table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS wishlist (
        _id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
      )
    `);

    // Create cart table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        _id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        product_id VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        size VARCHAR(50),
        color VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE
      )
    `);

    // Create blog_posts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        _id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        author_id VARCHAR(255),
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        publishedAt TIMESTAMP,
        meta_title VARCHAR(255),
        meta_description TEXT,
        tags JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(author_id) REFERENCES users(_id) ON DELETE SET NULL
      )
    `);

    // Create contact_messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        _id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ambassadors table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ambassadors (
        _id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        referral_code VARCHAR(255) UNIQUE NOT NULL,
        commission_rate DECIMAL(5,2) DEFAULT 10.00,
        total_earnings INT DEFAULT 0,
        total_referrals INT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE CASCADE
      )
    `);

    // Create referrals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS referrals (
        _id VARCHAR(255) PRIMARY KEY,
        ambassador_id VARCHAR(255) NOT NULL,
        referred_user_id VARCHAR(255),
        referred_email VARCHAR(255),
        order_id VARCHAR(255),
        commission_amount INT DEFAULT 0,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ambassador_id) REFERENCES ambassadors(_id) ON DELETE CASCADE,
        FOREIGN KEY(referred_user_id) REFERENCES users(_id) ON DELETE SET NULL,
        FOREIGN KEY(order_id) REFERENCES orders(_id) ON DELETE SET NULL
      )
    `);

    // Insert default categories
    await connection.execute(`
      INSERT IGNORE INTO categories (_id, name, description) VALUES
      ('cat-1', 'Women', 'Womens fashion collection'),
      ('cat-2', 'Men', 'Mens fashion collection'),
      ('cat-3', 'Kids', 'Childrens fashion collection'),
      ('cat-4', 'Accessories', 'Fashion accessories'),
      ('cat-5', 'Shoes', 'Footwear collection')
    `);

    // Insert default admin user with hashed password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    await connection.execute(`
      INSERT IGNORE INTO users (_id, email, password, firstName, lastName, isAdmin, isVerified) VALUES
      ('admin-1', 'admin@fashionhouse.com', ?, 'Admin', 'User', TRUE, TRUE)
    `, [hashedPassword]);

    connection.release();
    console.log('Database initialized successfully with all tables');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Helper function to convert boolean to MySQL boolean
export const toBool = (n) => n ? 1 : 0;

// Helper function to convert ISO date string to MySQL timestamp format
export const toMySQLTimestamp = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
};

// Initialize database on module load
// initializeDatabase().catch(console.error);


