-- Fashion House Database Schema
-- Complete MySQL database setup for fashion e-commerce application

-- Create database
CREATE DATABASE IF NOT EXISTS fashionhouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fashionhouse;

-- Users table
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
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  _id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  imageUrl TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  _id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  category VARCHAR(255) DEFAULT '',
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
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  _id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  size VARCHAR(50),
  color VARCHAR(100),
  price INT DEFAULT 0,
  stockQuantity INT DEFAULT 0,
  sku VARCHAR(255),
  FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  _id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  rating INT DEFAULT 5,
  title VARCHAR(255) DEFAULT '',
  comment TEXT DEFAULT '',
  isVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE SET NULL
);

-- Orders table
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
);

-- Order items table
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
);

-- Promo codes table
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
);

-- Payments table
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
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  _id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Cart table
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
);

-- Blog posts table
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
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  _id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambassadors table
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
);

-- Referrals table
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
);

-- Insert default categories
INSERT IGNORE INTO categories (_id, name, description) VALUES
('cat-1', 'Women', 'Women\'s fashion collection'),
('cat-2', 'Men', 'Men\'s fashion collection'),
('cat-3', 'Kids', 'Children\'s fashion collection'),
('cat-4', 'Accessories', 'Fashion accessories'),
('cat-5', 'Shoes', 'Footwear collection');

-- Insert default admin user
INSERT IGNORE INTO users (_id, email, password, firstName, lastName, isAdmin, isVerified) VALUES
('admin-1', 'admin@fashionhouse.com', '$2b$10$defaultpassword', 'Admin', 'User', TRUE, TRUE);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_created_at ON products(createdAt);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- Show all tables
SHOW TABLES;
