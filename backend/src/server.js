import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { persistence } from './data/persistence.js';
import { productsStore, ordersStore, promoCodesStore, reviewsStore } from './data/productsStore.js';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import productsRoutes from './routes/products-new.js';
import categoriesRoutes from './routes/categories.js';
import uploadRoutes from './routes/upload.js';
import reviewsRoutes from './routes/reviews.js';
import aiRoutes from './routes/ai.js';
import paymentsRoutes from './routes/payments.js';
import ordersRoutes from './routes/orders.js';
import testimonialsRoutes from './routes/testimonials.js';
import testRoutes from './routes/test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));
// Fallback for legacy uploads saved under backend/uploads (from older code)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/test', testRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5010;


// Start server after data initialization
const startServer = async () => {
  try {
    // Load persisted data before starting server
    try {
      const data = await persistence.loadAll();
      productsStore.items.splice(0, productsStore.items.length, ...(data.products || []));
      ordersStore.items.splice(0, ordersStore.items.length, ...(data.orders || []));
      promoCodesStore.items.splice(0, promoCodesStore.items.length, ...(data.promoCodes || []));
      reviewsStore.byProductId = data.reviewsByProductId || {};
    } catch (e) {
      console.error('Failed to load persisted data, using in-memory stores:', e.message);
      // Initialize with some sample data for development
      if (productsStore.items.length === 0) {
        productsStore.items = [
          {
            _id: '1',
            name: 'Designer Bridal Gown',
            description: 'Elegant bridal gown for special occasions',
            category: 'Women',
            price: 85000,
            stockQuantity: 5,
            featured: true,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Classic High Heels',
            description: 'Comfortable and stylish high heels',
            category: 'Shoes',
            price: 8500,
            stockQuantity: 10,
            featured: false,
            createdAt: new Date().toISOString()
          }
        ];
      }
      
      // Do not seed fake orders; keep empty until real orders are created
      ordersStore.items = ordersStore.items || [];
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


