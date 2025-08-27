import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { pool, toMySQLTimestamp } from '../data/db.js';

const router = Router();

// Create order
router.post('/', async (req, res) => {
  try {
    const id = uuid();
    const { userId = null, userEmail = '', items = [], totals = {}, shippingAddress = null, billingAddress = null, notes = '' } = req.body || {};

    const orderNumber = `HFH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    const subtotal = Number(totals.subtotal || 0);
    const tax = Number(totals.tax || 0);
    const shipping = Number(totals.shipping || 0);
    const discount = Number(totals.discount || 0);
    const total = Number(totals.total || subtotal + tax + shipping - discount);

    await pool.execute(
      `INSERT INTO orders (_id, user_id, user_email, orderNumber, total, subtotal, tax, shipping, discount, status, paymentStatus, shippingAddress, billingAddress, customerNotes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?)` ,
      [id, userId, userEmail, orderNumber, total, subtotal, tax, shipping, discount, shippingAddress ? JSON.stringify(shippingAddress) : null, billingAddress ? JSON.stringify(billingAddress) : null, String(notes||''), toMySQLTimestamp(new Date().toISOString())]
    );

    // Insert items
    for (const item of items) {
      const itemId = uuid();
      await pool.execute(
        `INSERT INTO order_items (_id, order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)` ,
        [itemId, id, item.productId || null, item.name || '', Number(item.price||0), Number(item.quantity||1)]
      );
    }

    return res.status(201).json({ success: true, orderId: id, orderNumber });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get orders (admin)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM orders');
    const total = countRows[0].total || 0;

    const [orders] = await pool.execute(`SELECT * FROM orders ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`);
    return res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total/limit)) } });
  } catch (error) {
    console.error('List orders error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Public: track order by number or id
router.get('/track/:ref', async (req, res) => {
  try {
    const ref = req.params.ref;
    const [rows] = await pool.execute('SELECT * FROM orders WHERE orderNumber = ? OR _id = ? LIMIT 1', [ref, ref]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order: rows[0] });
  } catch (error) {
    console.error('Track order error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin: update status/tracking
router.put('/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber, adminNotes, estimatedDelivery, shippedAt, deliveredAt } = req.body || {};
    await pool.execute(
      `UPDATE orders SET status = COALESCE(?, status), trackingNumber = COALESCE(?, trackingNumber), adminNotes = COALESCE(?, adminNotes), estimatedDelivery = COALESCE(?, estimatedDelivery), shippedAt = COALESCE(?, shippedAt), deliveredAt = COALESCE(?, deliveredAt), updatedAt = CURRENT_TIMESTAMP WHERE _id = ?`,
      [status || null, trackingNumber || null, adminNotes || null, estimatedDelivery || null, shippedAt || null, deliveredAt || null, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM orders WHERE _id = ?', [req.params.id]);
    return res.json({ success: true, order: rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;


