const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log environment variables (without sensitive data)
console.log('Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// MongoDB connection with detailed error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB Connection Details:');
    console.log('  - Database:', mongoose.connection.name);
    console.log('  - Host:', mongoose.connection.host);
    console.log('  - Port:', mongoose.connection.port);
    console.log('  - User:', mongoose.connection.user);
  })
  .catch((err) => {
    console.error('✗ MongoDB Connection Error:');
    console.error('  - Error name:', err.name);
    console.error('  - Error message:', err.message);
    console.error('  - Error code:', err.code);
    if (err.code === 'ECONNREFUSED') {
      console.error('  - Make sure MongoDB is running and accessible');
    }
    if (err.code === 'MongoServerError' && err.message.includes('bad auth')) {
      console.error('  - Authentication failed. Check your username and password');
    }
    process.exit(1);
  });

// Connection event handlers
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServer is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
}); 