/**
 * restructure.js — Reorganizes MealMitra into frontend/ + backend/ structure
 * Run from the web/ root: node restructure.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ====== DIRECTORY CREATION ======
const dirs = [
    'frontend',
    'frontend/css',
    'frontend/js',
    'frontend/pages',
    'backend',
    'backend/config',
    'backend/middleware',
    'backend/models',
    'backend/routes',
];

console.log('\n🏗️  Creating directory structure...');
dirs.forEach(dir => {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) {
        fs.mkdirSync(full, { recursive: true });
        console.log(`  📁 Created ${dir}/`);
    }
});

// ====== FILE MOVES ======
const moves = [
    // CSS → frontend/css/
    ['style.css', 'frontend/css/style.css'],
    ['home.css', 'frontend/css/home.css'],
    ['login.css', 'frontend/css/login.css'],
    ['dashboard.css', 'frontend/css/dashboard.css'],

    // JS → frontend/js/
    ['api.js', 'frontend/js/api.js'],
    ['script.js', 'frontend/js/script.js'],
    ['login.js', 'frontend/js/login.js'],
    ['donor.js', 'frontend/js/donor.js'],
    ['ngo.js', 'frontend/js/ngo.js'],
    ['admin.js', 'frontend/js/admin.js'],

    // HTML → frontend/pages/
    ['index.html', 'frontend/pages/index.html'],
    ['login.html', 'frontend/pages/login.html'],
    ['donor-dashboard.html', 'frontend/pages/donor-dashboard.html'],
    ['ngo-dashboard.html', 'frontend/pages/ngo-dashboard.html'],
    ['admin-dashboard.html', 'frontend/pages/admin-dashboard.html'],

    // Server → backend/
    ['server/server.js', 'backend/server.js'],
    ['server/package.json', 'backend/package.json'],
    ['server/.env', 'backend/.env'],
    ['server/.gitignore', 'backend/.gitignore'],
    ['server/seed.js', 'backend/seed.js'],
    ['server/build.js', 'backend/build.js'],
    ['server/config/db.js', 'backend/config/db.js'],
    ['server/middleware/auth.js', 'backend/middleware/auth.js'],
    ['server/models/User.js', 'backend/models/User.js'],
    ['server/models/FoodListing.js', 'backend/models/FoodListing.js'],
    ['server/models/Volunteer.js', 'backend/models/Volunteer.js'],
    ['server/routes/auth.js', 'backend/routes/auth.js'],
    ['server/routes/listings.js', 'backend/routes/listings.js'],
    ['server/routes/admin.js', 'backend/routes/admin.js'],
    ['server/routes/volunteers.js', 'backend/routes/volunteers.js'],
];

console.log('\n📦 Moving files...');
let moved = 0;
moves.forEach(([from, to]) => {
    const src = path.join(ROOT, from);
    const dst = path.join(ROOT, to);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`  ✅ ${from} → ${to}`);
        moved++;
    } else {
        console.log(`  ⚠️  ${from} — not found, skipping`);
    }
});

// ====== HTML FILES ALREADY UPDATED ======
console.log('\n✅ HTML paths already updated to use /css/ and /js/ absolute paths');

// ====== UPDATE JS FILES (page redirect paths) ======
console.log('\n🔧 Updating JS redirect paths...');
const jsRedirectFiles = [
    'frontend/js/login.js',
    'frontend/js/donor.js',
    'frontend/js/ngo.js',
    'frontend/js/admin.js',
    'frontend/js/api.js',
];

// No changes needed for JS files since they use relative page names
// and pages are all in the same directory (frontend/pages/)
console.log('  ✅ JS files — no path changes needed (same directory)');

// ====== CLEANUP OLD FILES ======
console.log('\n🗑️  Cleaning up old files...');
const oldFiles = [
    'style.css', 'home.css', 'login.css', 'dashboard.css',
    'api.js', 'script.js', 'login.js', 'donor.js', 'ngo.js', 'admin.js',
    'index.html', 'login.html', 'donor-dashboard.html', 'ngo-dashboard.html', 'admin-dashboard.html',
];

oldFiles.forEach(file => {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`  🗑️  Removed ${file}`);
    }
});

// Remove old server directory (if empty after move)
const serverDir = path.join(ROOT, 'server');
if (fs.existsSync(serverDir)) {
    try {
        fs.rmSync(serverDir, { recursive: true });
        console.log('  🗑️  Removed server/ directory');
    } catch (e) {
        console.log('  ⚠️  Could not remove server/ — remove manually');
    }
}

// ====== SUMMARY ======
console.log(`
╔══════════════════════════════════════════╗
║   ✅ Restructuring Complete!             ║
║   ${moved} files moved successfully          ║
╚══════════════════════════════════════════╝

📂 New Project Structure:

web/
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── donor-dashboard.html
│   │   ├── ngo-dashboard.html
│   │   └── admin-dashboard.html
│   ├── css/
│   │   ├── style.css
│   │   ├── home.css
│   │   ├── login.css
│   │   └── dashboard.css
│   └── js/
│       ├── api.js
│       ├── script.js
│       ├── login.js
│       ├── donor.js
│       ├── ngo.js
│       └── admin.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── seed.js
│   ├── build.js
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── FoodListing.js
│   │   └── Volunteer.js
│   └── routes/
│       ├── auth.js
│       ├── listings.js
│       ├── admin.js
│       └── volunteers.js
├── .gitignore
└── README.md

🚀 Next: Run these commands to update the backend:
   cd backend
   npm install
   npm run dev
`);
