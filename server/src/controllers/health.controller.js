import mongoose from 'mongoose';

// GET /api/health: is the server up, and can it reach the database?
export function getHealth(req, res) {
  const dbConnected = mongoose.connection.readyState === 1; // 1 means "connected"
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
}