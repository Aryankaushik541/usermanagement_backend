require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/* -------------------- Middleware -------------------- */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------- Request Logging (Development Only) -------- */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/* ---------------------- Routes ---------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

/* ------------------ Health Check -------------------- */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/* -------------------- Root API ---------------------- */
app.get('/', (req, res) => {
  res.json({
    message: 'User Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

/* -------------------- 404 Handler ------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* ------------------ Error Handler ------------------- */
app.use(errorHandler);

/* ---------------- MongoDB Connection ---------------- */
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management';

const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    /* -------- Start Server AFTER DB Connect -------- */
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

/* --------------- Graceful Shutdown ------------------ */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing MongoDB connection...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB disconnected');
    process.exit(0);
  });
});

module.exports = app;
