const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===== FRONTEND STATIC FILES =====
const frontendPath = path.join(__dirname, 'frontend'); // ✅ Fixed

// Serve CSS and JS from their subdirectories
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));

// Serve HTML pages
app.use(express.static(path.join(frontendPath, 'pages')));

// ===== API ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/volunteers', require('./routes/volunteers'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle SPA — serve index.html for non-API, non-static routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'pages', 'index.html'));
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🌾 MealMitra Server running on port ${PORT}`);
    console.log(`📡 API:      http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📂 Serving:  ${frontendPath}\n`);
});