/**
 * build.js — Copies frontend files into backend/public/ for production deployment
 * Mirrors the frontend/ directory structure for the Express static server.
 * Run: npm run build
 */
const fs = require('fs');
const path = require('path');

const FRONTEND = path.join(__dirname, '..', 'frontend');
const DEST = path.join(__dirname, 'public');

// File groups matching frontend/ structure
const structure = {
    'pages': [
        'index.html',
        'login.html',
        'donor-dashboard.html',
        'ngo-dashboard.html',
        'admin-dashboard.html',
    ],
    'css': [
        'style.css',
        'home.css',
        'login.css',
        'dashboard.css',
    ],
    'js': [
        'api.js',
        'script.js',
        'login.js',
        'donor.js',
        'ngo.js',
        'admin.js',
    ]
};

// Clean and create
if (fs.existsSync(DEST)) fs.rmSync(DEST, { recursive: true });

let copied = 0;
Object.entries(structure).forEach(([dir, files]) => {
    const destDir = path.join(DEST, dir);
    fs.mkdirSync(destDir, { recursive: true });

    files.forEach(file => {
        const src = path.join(FRONTEND, dir, file);
        const dst = path.join(destDir, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dst);
            copied++;
            console.log(`  ✅ ${dir}/${file}`);
        } else {
            console.log(`  ⚠️  ${dir}/${file} — not found`);
        }
    });
});

console.log(`\n🏗️  Build complete! ${copied} files → backend/public/\n`);
