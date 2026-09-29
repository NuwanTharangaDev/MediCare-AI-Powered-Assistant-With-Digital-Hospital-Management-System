require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Bind REST API routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/nurse', require('./routes/nurse'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ai', require('./routes/ai'));

// Status check and server information
app.get('/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    databaseDriver: db.isFallback() ? 'Local Persisted JSON Fallback' : 'MySQL Database Pool',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Default catch-all error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Boot listening server
app.listen(PORT, () => {
  console.log(`===========================================================`);
  console.log(`  Medicare Hospital Management System Backend Active!     `);
  console.log(`  Express Server running on port: ${PORT}                 `);
  console.log(`  Check health status at: http://localhost:${PORT}/status `);
  console.log(`===========================================================`);
});
