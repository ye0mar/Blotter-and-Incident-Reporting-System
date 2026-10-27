require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads folder exists
const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads static route
app.use('/uploads', express.static(uploadDir));

// Images alias for header logos
app.use('/images', express.static(path.join(__dirname, 'images')));
app.get('/images/barangay logo.jpg', (req, res) => {
  const localLogo = path.join(__dirname, 'images', 'barangay logo.jpg');
  const assetLogo = path.join(__dirname, 'assets', 'Santa ANA logo - Edited - Edited.png');
  if (fs.existsSync(localLogo)) return res.sendFile(localLogo);
  if (fs.existsSync(assetLogo)) return res.sendFile(assetLogo);
  res.status(404).send('Logo not found');
});

// API Routes
app.use('/api/auth', require('./blotter-backend/routes/auth'));
app.use('/api/users', require('./blotter-backend/routes/users'));
app.use('/api/blotter', require('./blotter-backend/routes/blotter'));
app.use('/api/schedules', require('./blotter-backend/routes/schedules'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend static files from root
app.use(express.static(__dirname));

// Default root handler
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Start server on 0.0.0.0:3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📋 Health Check: http://${HOST}:${PORT}/api/health`);
});

module.exports = app;
