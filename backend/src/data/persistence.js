import { pool, toMySQLTimestamp } from './db.js';

export const persistence = {
  async loadAll() {
    try {
      const [products] = await pool.execute('SELECT * FROM products ORDER BY createdAt DESC');
      const [orders] = await pool.execute('SELECT * FROM orders ORDER BY createdAt DESC');
      const [promoCodes] = await pool.execute('SELECT * FROM promo_codes ORDER BY createdAt DESC');
      const [reviews] = await pool.execute('SELECT * FROM reviews ORDER BY createdAt DESC');
      
      // Group reviews by product ID
      const reviewsByProductId = {};
      reviews.forEach(review => {
        if (!reviewsByProductId[review.product_id]) {
          reviewsByProductId[review.product_id] = [];
        }
        reviewsByProductId[review.product_id].push(review);
      });

      return {
        products,
        orders,
        promoCodes,
        reviewsByProductId,
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return {
        products: [],
        orders: [],
        promoCodes: [],
        reviewsByProductId: {},
      };
    }
  },

  async saveProducts(items) {
    try {
      // Clear existing products
      await pool.execute('DELETE FROM products');
      
      // Insert new products
      for (const product of items) {
        await pool.execute(
          'INSERT INTO products (_id, name, description, category, price, stockQuantity, featured, videoUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [product._id, product.name, product.description, product.category, product.price, product.stockQuantity, product.featured, product.videoUrl, toMySQLTimestamp(product.createdAt)]
        );
      }
    } catch (error) {
      console.error('Error saving products:', error);
    }
  },

  async saveOrders(items) {
    try {
      // Clear existing orders
      await pool.execute('DELETE FROM orders');
      
      // Insert new orders
      for (const order of items) {
        await pool.execute(
          'INSERT INTO orders (_id, user_email, total, status, trackingNumber, adminNotes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [order._id, order.user_email, order.total, order.status, order.trackingNumber, order.adminNotes, toMySQLTimestamp(order.createdAt)]
        );
      }
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  },

  async savePromoCodes(items) {
    try {
      // Clear existing promo codes
      await pool.execute('DELETE FROM promo_codes');
      
      // Insert new promo codes
      for (const promoCode of items) {
        await pool.execute(
          'INSERT INTO promo_codes (id, code, productId, discountPercentage, expiryDate, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [promoCode.id, promoCode.code, promoCode.productId, promoCode.discountPercentage, promoCode.expiryDate, promoCode.isActive, toMySQLTimestamp(promoCode.createdAt)]
        );
      }
    } catch (error) {
      console.error('Error saving promo codes:', error);
    }
  },

  async saveReviews(mapObject) {
    try {
      // Clear existing reviews
      await pool.execute('DELETE FROM reviews');
      
      // Insert new reviews
      for (const [productId, reviews] of Object.entries(mapObject)) {
        for (const review of reviews) {
          await pool.execute(
            'INSERT INTO reviews (_id, product_id, rating, title, comment, createdAt, user_email, user_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [review._id, productId, review.rating, review.title, review.comment, toMySQLTimestamp(review.createdAt), review.user_email, review.user_name]
          );
        }
      }
    } catch (error) {
      console.error('Error saving reviews:', error);
    }
  },
};


