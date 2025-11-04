import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from the MUD game server!' });
});

export default router;

