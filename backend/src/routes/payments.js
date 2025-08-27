import { Router } from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { pool, toMySQLTimestamp } from '../data/db.js';

const router = Router();

// ENV VARIABLES REQUIRED (put real values in backend/.env):
// MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORT_CODE, MPESA_PASSKEY
// MPESA_ENV=sandbox|production, MPESA_CALLBACK_URL

const nowIso = () => new Date().toISOString();
const nowMySQL = () => toMySQLTimestamp(new Date().toISOString());

const getAccessToken = async () => {
  const key = process.env.MPESA_CONSUMER_KEY || '';
  const secret = process.env.MPESA_CONSUMER_SECRET || '';
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const base = process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
  const res = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`Token error ${res.status}`);
  const j = await res.json();
  return j.access_token;
};

const stkPush = async ({ phone, amount, accountReference, transactionDesc }) => {
  const shortCode = process.env.MPESA_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0,14);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const base = process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
  const token = await getAccessToken();
  const res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || 'Order',
      TransactionDesc: transactionDesc || 'Payment',
    }),
  });
  const j = await res.json();
  return j;
};

router.post('/mpesa/stk', async (req, res) => {
  try {
    const id = uuid();
    const { phone, amount, orderId } = req.body || {};
    if (!phone || !amount) return res.status(400).json({ success: false, message: 'phone and amount are required' });
    
    await pool.execute(
      `INSERT INTO payments (id, provider, order_id, phone, amount, status, createdAt, updatedAt)
       VALUES (?, 'mpesa', ?, ?, ?, 'pending', ?, ?)`,
      [id, orderId || null, String(phone), Number(amount), nowMySQL(), nowMySQL()]
    );

    const resp = await stkPush({ phone: String(phone), amount: Number(amount), accountReference: orderId || id, transactionDesc: 'Order Payment' });
    
    await pool.execute(
      `UPDATE payments SET merchantRequestID=?, checkoutRequestID=?, rawResponse=?, updatedAt=? WHERE id=?`,
      [resp.MerchantRequestID || null, resp.CheckoutRequestID || null, JSON.stringify(resp), nowMySQL(), id]
    );
    
    return res.json({ success: true, paymentId: id, response: resp });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Safaricom will POST to this endpoint
router.post('/mpesa/callback', async (req, res) => {
  try {
    const body = req.body || {};
    const result = body.Body?.stkCallback || {};
    const checkout = result.CheckoutRequestID;
    const code = result.ResultCode;
    const desc = result.ResultDesc;

    await pool.execute(
      `UPDATE payments SET status=?, resultCode=?, resultDesc=?, rawResponse=?, updatedAt=? WHERE checkoutRequestID=?`,
      [
        Number(code) === 0 ? 'success' : 'failed',
        Number(code),
        String(desc || ''),
        JSON.stringify(body),
        nowMySQL(),
        checkout,
      ]
    );
  } catch (e) {
    // swallow errors to avoid retries storms; log if needed
  }
  // Acknowledge receipt
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Query payment status
router.get('/status/:id', async (req, res) => {
  try {
    const [payments] = await pool.execute('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.json({ success: true, payment: payments[0] });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;


