/* ===================================================
   donor.js — Donor Dashboard Logic (Connected to Backend)
   =================================================== */

/* ---- AUTH CHECK ---- */
let currentUser = null;

/* ---- SECTION SWITCHING ---- */
const sectionMap = {
    'overview': 's-overview',
    'add-food': 's-add-food',
    'my-listings': 's-my-listings',
    'history': 's-history',
    'impact': 's-impact',
    'profile': 's-profile',
};
const titleMap = {
    'overview': '📊 Overview',
    'add-food': '➕ Add Food Listing',
    'my-listings': '📋 My Listings',
    'history': '📜 Donation History',
    'impact': '🌱 My Impact',
    'profile': '👤 Profile Settings',
};

function showSection(key) {
    Object.values(sectionMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(sectionMap[key]);
    if (target) target.classList.remove('hidden');
    const title = document.getElementById('pageTitle');
    if (title) title.textContent = titleMap[key] || key;

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const idx = Object.keys(sectionMap).indexOf(key);
    if (navItems[idx]) navItems[idx].classList.add('active');

    if (key === 'my-listings') loadListings();
    if (key === 'history') loadHistory();
    if (key === 'impact') loadImpact();
    if (key === 'profile') loadProfile();
}

/* ---- LOAD LISTINGS FROM API ---- */
async function loadListings() {
    const grid = document.getElementById('donorListingsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="empty-state"><p>⏳ Loading listings…</p></div>';

    const result = await listingsAPI.getAll();
    if (!result.success) {
        grid.innerHTML = '<div class="empty-state"><p>❌ Failed to load listings.</p></div>';
        return;
    }
    renderListings(result.data);
}

function renderListings(data) {
    const grid = document.getElementById('donorListingsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!data.length) {
        grid.innerHTML = '<div class="empty-state"><p>🔍 No listings found. Add your first food listing!</p></div>';
        return;
    }
    data.forEach(item => {
        const expiry = new Date(item.expiryTime).getTime();
        const isUrgent = item.status === 'available' && (expiry - Date.now()) < 3600000 && expiry > Date.now();
        const card = document.createElement('div');
        card.className = 'food-card';
        card.dataset.name = item.name;
        card.dataset.status = item.status;
        card.dataset.category = item.category;
        card.innerHTML = `
      <div class="food-card-img">
        ${foodEmoji(item.category)}
        ${isUrgent ? '<span class="urgent-flag">⚡ URGENT</span>' : ''}
      </div>
      <div class="food-card-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h4 class="food-card-title">${escHtml(item.name)}</h4>
          <span class="badge badge-${item.status}">${capitalize(item.status)}</span>
        </div>
        <div class="food-card-meta">
          <span class="meta-item">📦 ${item.quantity} ${item.unit}</span>
          <span class="meta-item">📍 ${escHtml(item.city)}</span>
          <span class="meta-item">🏷️ ${item.category}</span>
        </div>
        ${item.status === 'available' ? `
        <div class="countdown">
          <p>⏱️ <span class="countdown-timer" data-expiry="${expiry}">Calculating…</span></p>
        </div>` : ''}
        ${item.acceptedByName ? `<p style="font-size:.82rem;color:var(--primary);margin-top:8px;">✅ Accepted by ${escHtml(item.acceptedByName)}</p>` : ''}
      </div>
      <div class="food-card-footer">
        ${item.status === 'available' ? `<button class="btn btn-danger btn-sm" onclick="deleteListing('${item._id}')" id="delete-${item._id}">🗑️ Remove</button>` : ''}
        ${item.status === 'delivered' ? `<button class="btn btn-primary btn-sm" onclick="showToast('Certificate downloaded!','success')">🏅 Certificate</button>` : ''}
        ${item.status === 'accepted' ? `<span style="font-size:.82rem;color:var(--secondary);font-weight:600;">🚚 In transit</span>` : ''}
        ${item.status === 'expired' ? `<span style="font-size:.82rem;color:#e74c3c;font-weight:600;">⏰ Expired</span>` : ''}
      </div>`;
        grid.appendChild(card);
    });
    document.querySelectorAll('.countdown-timer').forEach(el => {
        startCountdown(el, parseInt(el.dataset.expiry));
    });
}

function foodEmoji(cat) {
    const map = { 'Cooked Meals': '🍛', 'Bakery Items': '🧁', 'Fruits': '🍎', 'Raw Vegetables': '🥦', 'Dairy Products': '🥛', 'Snacks': '🥨', 'Beverages': '🥤', 'Packaged Food': '📦' };
    return `<span style="font-size:3rem;">${map[cat] || '🍽️'}</span>`;
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ---- FILTER LISTINGS ---- */
function filterListings() {
    const q = (document.getElementById('listingSearch')?.value || '').toLowerCase();
    const status = document.getElementById('statusFilter')?.value || '';
    const cat = document.getElementById('categoryFilter')?.value || '';
    const cards = document.querySelectorAll('#donorListingsGrid .food-card');
    cards.forEach(card => {
        const nameMatch = !q || card.dataset.name?.toLowerCase().includes(q);
        const statMatch = !status || card.dataset.status === status;
        const catMatch = !cat || card.dataset.category === cat;
        card.style.display = (nameMatch && statMatch && catMatch) ? '' : 'none';
    });
}

/* ---- LOAD HISTORY FROM API ---- */
async function loadHistory() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">⏳ Loading…</td></tr>';

    const result = await listingsAPI.getAll({ status: 'delivered' });
    if (!result.success) { tbody.innerHTML = '<tr><td colspan="7">Failed to load</td></tr>'; return; }

    if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No delivered donations yet.</td></tr>';
        return;
    }

    tbody.innerHTML = result.data.map((h, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escHtml(h.name)}</strong></td>
      <td>${h.quantity} ${h.unit}</td>
      <td>${escHtml(h.acceptedByName || '—')}</td>
      <td>${new Date(h.deliveredAt || h.createdAt).toLocaleDateString('en-IN')}</td>
      <td><span class="badge badge-${h.status}">${capitalize(h.status)}</span></td>
      <td>${h.mealsFed ? h.mealsFed + ' meals' : '—'}</td>
    </tr>`).join('');
}

/* ---- LOAD IMPACT ---- */
async function loadImpact() {
    const result = await listingsAPI.getAll();
    if (!result.success) return;

    const delivered = result.data.filter(l => l.status === 'delivered');
    const totalMeals = delivered.reduce((sum, l) => sum + (l.mealsFed || 0), 0);
    const totalDonations = result.data.length;
    const co2 = Math.round(totalMeals * 0.2);
    const water = Math.round(totalMeals * 3.7);

    // Update impact counters
    const counters = document.querySelectorAll('#s-impact .count-up');
    const values = [totalMeals, co2, water];
    counters.forEach((c, i) => {
        if (values[i] !== undefined) {
            c.dataset.target = values[i];
            c.dataset.animated = '';
            c.textContent = '0';
            animateCountUp(c);
        }
    });

    // Update total donations
    const totalEl = document.querySelector('#s-impact .summary-card:last-child .summary-info h3');
    if (totalEl) totalEl.textContent = totalDonations;
}

/* ---- LOAD PROFILE ---- */
function loadProfile() {
    if (!currentUser) return;
    const inputs = document.querySelectorAll('#s-profile input, #s-profile textarea, #s-profile select');
    const fields = ['organization', 'firstName', 'email', 'phone', 'city', 'address'];
    const vals = [currentUser.organization, `${currentUser.firstName} ${currentUser.lastName}`.trim(),
                  currentUser.email, currentUser.phone, currentUser.city, currentUser.address];
    inputs.forEach((input, i) => { if (vals[i]) input.value = vals[i]; });
}

/* ---- RENDER ACTIVITY ---- */
function renderActivity(listings) {
    const list = document.getElementById('activityList');
    if (!list) return;

    if (!listings || !listings.length) {
        list.innerHTML = '<div class="activity-item"><div class="activity-text"><strong>No recent activity yet.</strong></div></div>';
        return;
    }

    const items = listings.slice(0, 5).map(l => {
        const icon = l.status === 'delivered' ? '✅' : l.status === 'accepted' ? '🚚' : l.status === 'expired' ? '⚠️' : '🔔';
        const text = l.status === 'accepted' ? `${l.acceptedByName || 'An NGO'} accepted your ${l.name}` :
                     l.status === 'delivered' ? `${l.name} was delivered successfully` :
                     l.status === 'expired' ? `${l.name} listing expired` :
                     `${l.name} listing is live`;
        const time = timeAgo(new Date(l.updatedAt || l.createdAt));
        return `<div class="activity-item">
            <div class="activity-icon">${icon}</div>
            <div class="activity-text"><strong>${escHtml(text)}</strong></div>
            <span class="activity-time">${time}</span>
        </div>`;
    });

    list.innerHTML = items.join('');
}

function timeAgo(date) {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

/* ---- ADD FOOD FORM (Real API) ---- */
async function handleAddFood(e) {
    e.preventDefault();
    const btn = document.getElementById('addFoodBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Publishing…';

    const listing = {
        name: document.getElementById('foodName').value,
        category: document.getElementById('foodCategory').value,
        quantity: parseInt(document.getElementById('foodQty').value),
        unit: document.getElementById('foodUnit').value,
        pickupAddress: document.getElementById('pickupAddress').value,
        city: document.getElementById('pickupCity').value,
        availableFrom: document.getElementById('pickupTime').value,
        expiryTime: document.getElementById('expiryTime').value,
        notes: document.getElementById('foodNotes').value,
        contactName: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value
    };

    const result = await listingsAPI.create(listing);

    btn.disabled = false;
    btn.textContent = '🚀 Publish Listing';

    if (result.success) {
        openModal('successModal');
        document.getElementById('addFoodForm')?.reset();
        setDateTimeDefaults();
    } else {
        showToast(result.message || 'Failed to create listing.', 'error');
    }
}

function resetFoodForm() {
    document.getElementById('addFoodForm')?.reset();
    setDateTimeDefaults();
    showToast('Form cleared.', 'info');
}

async function deleteListing(id) {
    if (!confirm('Remove this listing? This cannot be undone.')) return;
    const result = await listingsAPI.remove(id);
    if (result.success) {
        showToast('Listing removed.', 'warning');
        loadListings();
    } else {
        showToast(result.message || 'Failed to remove.', 'error');
    }
}

/* ---- CHART (donor line) ---- */
function initDonorChart() {
    const ctx = document.getElementById('donorLineChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [{
                label: 'Donations',
                data: [5, 8, 6, 12, 9, 7],
                backgroundColor: 'rgba(46,139,87,0.1)',
                borderColor: '#2E8B57',
                borderWidth: 2.5, fill: true, tension: 0.4,
                pointBackgroundColor: '#2E8B57', pointRadius: 5,
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } }
    });
}

/* ---- DATE ---- */
function setDate() {
    const el = document.getElementById('currentDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function setDateTimeDefaults() {
    const pickupInput = document.getElementById('pickupTime');
    const expiryInput = document.getElementById('expiryTime');
    const now = new Date();
    const fmt = d => d.toISOString().slice(0, 16);
    if (pickupInput) pickupInput.value = fmt(now);
    if (expiryInput) { const e = new Date(now); e.setHours(e.getHours() + 4); expiryInput.value = fmt(e); }
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth(['donor'])) return;

    currentUser = getUser();

    // Update sidebar with user info
    const nameEl = document.querySelector('.sidebar-user h4');
    const subEl = document.querySelector('.sidebar-user p');
    if (nameEl && currentUser) nameEl.textContent = currentUser.organization;
    if (subEl && currentUser) subEl.textContent = `Donor Account · ${currentUser.city || 'India'}`;

    // Welcome bar
    const welcomeH3 = document.querySelector('.welcome-bar h3');
    if (welcomeH3 && currentUser) welcomeH3.textContent = `Good ${getGreeting()}, ${currentUser.firstName}! 👋`;

    // Save profile button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const inputs = document.querySelectorAll('#s-profile input, #s-profile textarea');
            const result = await authAPI.updateProfile({
                organization: inputs[0]?.value,
                firstName: inputs[1]?.value?.split(' ')[0],
                lastName: inputs[1]?.value?.split(' ').slice(1).join(' '),
                phone: inputs[3]?.value,
                address: inputs[5]?.value
            });
            if (result.success) showToast('Profile updated successfully!', 'success');
            else showToast(result.message || 'Update failed.', 'error');
        };
    }

    setDate();
    setDateTimeDefaults();
    setTimeout(initDonorChart, 100);

    // Load overview data
    const result = await listingsAPI.getAll();
    if (result.success) {
        const data = result.data;
        const active = data.filter(l => l.status === 'available').length;
        const delivered = data.filter(l => l.status === 'delivered').length;
        const expiring = data.filter(l => l.status === 'available' && (new Date(l.expiryTime).getTime() - Date.now()) < 3600000).length;

        // Update overview KPI cards
        const cards = document.querySelectorAll('#s-overview .summary-info h3');
        if (cards[0]) { cards[0].dataset.target = data.length; cards[0].textContent = '0'; animateCountUp(cards[0]); }
        if (cards[1]) cards[1].textContent = active;
        if (cards[2]) { cards[2].dataset.target = delivered; cards[2].textContent = '0'; animateCountUp(cards[2]); }
        if (cards[3]) cards[3].textContent = expiring;

        const urgentEl = document.getElementById('urgentCount');
        if (urgentEl) urgentEl.textContent = `${expiring} urgent`;

        renderActivity(data);
    }
});

function getGreeting() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}
