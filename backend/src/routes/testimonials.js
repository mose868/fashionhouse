import { Router } from 'express';

const router = Router();

// Minimal testimonials endpoint to satisfy frontend requests
router.get('/featured', (_req, res) => {
  res.json({
    success: true,
    testimonials: [],
  });
});

export default router;


