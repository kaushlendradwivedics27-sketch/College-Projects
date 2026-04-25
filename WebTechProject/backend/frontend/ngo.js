/* ===================================================
   ngo.js — NGO Dashboard Logic (Connected to Backend)
   =================================================== */

let currentUser = null;
let pendingAcceptId = null;

const ngoSections = { 'ngo-overview': 's-ngo-overview', 'available-food': 's-available-food', 'accepted': 's-accepted', 'volunteers': 's-volunteers', 'ngo-impact': 's-ngo-impact', 'ngo-profile': 's-ngo-profile' };
const ngoTitles = { 'ngo-overview': '📊 Overview', 'available-food': '🍽️ Available Food', 'accepted': '✅ Accepted Pickups', 'volunteers': '🙋 Volunteers', 'ngo-impact': '🌱 Impact', 'ngo-profile': '⚙️ Settings' };

function ngoShowSection(key) {
    Object.values(ngoSections).forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    const target = document.getElementById(ngoSections[key]);
    if (target) target.classList.remove('hidden');
    const title = document.getElementById('ngoPageTitle');
    if (title) title.textContent = ngoTitles[key] || key;
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const idx = Object.keys(ngoSections).indexOf(key);
    if (navItems[idx]) navItems[idx].classList.add('active');
    if (key === 'available-food') loadAvailableFood();
    if (key === 'accepted') loadAccepted();
    if (key === 'volunteers') loadVolunteers();
    if (key === 'ngo-impact') loadNgoImpact();
    if (key === 'ngo-profile') loadNgoProfile();
}

const catEmoji = { 'Cooked Meals': '🍛', 'Bakery Items': '🧁', 'Fruits': '🍎', 'Snacks': '🥨', 'Beverages': '🥤', 'Raw Vegetables': '🥦', 'Dairy Products': '🥛', 'Packaged Food': '📦' };
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ---- LOAD AVAILABLE FOOD FROM API ---- */
async function loadAvailableFood() {
    const grid = document.getElementById('ngoFoodGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="empty-state"><p>⏳ Loading available food…</p></div>';

    const result = await listingsAPI.getAvailable();
    if (!result.success) { grid.innerHTML = '<div class="empty-state"><p>❌ Failed to load.</p></div>'; return; }

    const badge = document.getElementById('foodBadge');
    if (badge) badge.textContent = result.count;

    const urgentCount = result.data.filter(l => l.isUrgent).length;
    const banner = document.getElementById('urgentBanner');
    if (banner) {
        if (urgentCount > 0) {
            banner.style.display = '';
            banner.innerHTML = `⚡ <strong>${urgentCount} food listing${urgentCount > 1 ? 's' : ''}</strong> expiring within the next 60 minutes — act fast!`;
        } else { banner.style.display = 'none'; }
    }

    renderNgoFood(result.data);
}

function renderNgoFood(data) {
    const grid = document.getElementById('ngoFoodGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!data.length) {
        grid.innerHTML = '<div class="empty-state"><p>🔍 No food available right now. Check back soon!</p></div>';
        return;
    }
    data.forEach(item => {
        const urgent = item.isUrgent;
        const expiry = new Date(item.expiryTime).getTime();
        const card = document.createElement('div');
        card.className = 'food-card';
        card.dataset.name = item.name; card.dataset.location = item.city;
        card.dataset.status = urgent ? 'urgent' : 'available'; card.dataset.category = item.category;
        card.innerHTML = `
      <div class="food-card-img" style="${urgent ? 'background:linear-gradient(135deg,#fff5f5,#ffe8e8)' : ''}">
        <span style="font-size:3rem;">${catEmoji[item.category] || '🍽️'}</span>
        ${urgent ? '<span class="urgent-flag">⚡ URGENT</span>' : ''}
      </div>
      <div class="food-card-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h4 class="food-card-title">${escHtml(item.name)}</h4>
          <span class="badge ${urgent ? 'badge-urgent' : 'badge-available'}">${urgent ? 'Urgent' : 'Available'}</span>
        </div>
        <div class="food-card-meta">
          <span class="meta-item">📦 ${item.quantity} ${item.unit}</span>
          <span class="meta-item">📍 ${escHtml(item.city)}</span>
          <span class="meta-item">🏢 ${escHtml(item.donorName || 'Unknown')}</span>
        </div>
        <div class="countdown"><p>⏱️ <span class="countdown-timer" data-expiry="${expiry}">…</span></p></div>
      </div>
      <div class="food-card-footer">
        <button class="btn btn-outline btn-sm" onclick="viewFoodDetails('${item._id}')">👁 Details</button>
        <button class="btn ${urgent ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="openAcceptModal('${item._id}')">✅ Accept</button>
      </div>`;
        grid.appendChild(card);
    });
    document.querySelectorAll('.countdown-timer').forEach(el => startCountdown(el, parseInt(el.dataset.expiry)));
}

function filterNgoFood() {
    const q = (document.getElementById('ngoSearch')?.value || '').toLowerCase();
    const loc = document.getElementById('ngoLocationFilter')?.value || '';
    const status = document.getElementById('ngoStatusFilter')?.value || '';
    const cat = document.getElementById('ngoCategoryFilter')?.value || '';
    document.querySelectorAll('#ngoFoodGrid .food-card').forEach(card => {
        const show = (!q || card.dataset.name?.toLowerCase().includes(q)) && (!loc || card.dataset.location?.toLowerCase().includes(loc.toLowerCase())) && (!status || card.dataset.status === status) && (!cat || card.dataset.category === cat);
        card.style.display = show ? '' : 'none';
    });
}

function openAcceptModal(id) {
    pendingAcceptId = id;
    openModal('acceptModal');
}

async function confirmAccept() {
    closeModal('acceptModal');
    const volunteer = document.getElementById('assignVolunteer')?.value || '';
    const notes = document.getElementById('pickupNotes')?.value || '';

    const result = await listingsAPI.accept(pendingAcceptId, { volunteer, pickupNotes: notes });
    if (result.success) {
        showToast('✅ Pickup accepted! Volunteer notified.', 'success');
        loadAvailableFood();
    } else {
        showToast(result.message || 'Failed to accept.', 'error');
    }
}

async function viewFoodDetails(id) {
    const result = await listingsAPI.getOne(id);
    if (result.success) {
        const l = result.data;
        showToast(`${l.name} — ${l.quantity} ${l.unit} from ${l.donorName} at ${l.pickupAddress}`, 'info');
    }
}

/* ---- LOAD ACCEPTED PICKUPS ---- */
async function loadAccepted() {
    const tbody = document.getElementById('acceptedBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⏳ Loading…</td></tr>';

    const result = await listingsAPI.getAll({ status: 'accepted' });
    // Also get delivered
    const delivered = await listingsAPI.getAll({ status: 'delivered' });

    const allPickups = [...(result.data || []), ...(delivered.data || [])].slice(0, 20);

    if (!allPickups.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">No pickups yet.</td></tr>';
        return;
    }

    const sc = { 'accepted': 'badge-accepted', 'delivered': 'badge-delivered' };
    tbody.innerHTML = allPickups.map((p, i) => `
    <tr>
      <td>${i + 1}</td><td><strong>${escHtml(p.name)}</strong></td><td>${escHtml(p.donorName || '')}</td><td>${p.quantity} ${p.unit}</td>
      <td>${new Date(p.acceptedAt || p.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
      <td>${escHtml(p.volunteer || '—')}</td>
      <td><span class="badge ${sc[p.status] || 'badge-available'}">${p.status}</span></td>
      <td>${p.status === 'accepted' ? `<button class="btn btn-primary btn-sm" onclick="markDelivered('${p._id}', ${p.quantity})">Mark Delivered</button>` : '<span style="color:var(--primary);font-weight:600;">✓ Done</span>'}</td>
    </tr>`).join('');
}

async function markDelivered(id, qty) {
    const result = await listingsAPI.markDelivered(id, qty);
    if (result.success) {
        showToast('Delivery marked complete! 🎉', 'success');
        loadAccepted();
    } else { showToast(result.message || 'Failed.', 'error'); }
}

/* ---- LOAD VOLUNTEERS ---- */
async function loadVolunteers() {
    const grid = document.getElementById('volunteersGrid');
    if (!grid) return;
    grid.innerHTML = '<p style="padding:20px;">⏳ Loading volunteers…</p>';

    const result = await volunteersAPI.getAll();
    if (!result.success || !result.data.length) {
        grid.innerHTML = '<p style="padding:20px;">No volunteers registered yet.</p>';
        return;
    }

    grid.innerHTML = result.data.map(v => `
    <div class="volunteer-card">
      <div class="vol-avatar">${v.name.charAt(0)}</div>
      <h4>${escHtml(v.name)}</h4><p>${v.role}</p><p>⭐${v.rating.toFixed(1)}</p>
      <div class="vol-stats">
        <span class="vol-stat">📦 ${v.pickups} pickups</span>
        <span class="vol-stat"><span class="vol-status ${v.status === 'available' ? 'vs-available' : 'vs-busy'}"></span>${v.status}</span>
      </div>
    </div>`).join('');

    // Also populate the volunteer dropdown in accept modal
    const select = document.getElementById('assignVolunteer');
    if (select) {
        select.innerHTML = result.data.map(v => `<option>${v.name} (${v.status === 'available' ? 'Available' : 'Busy'})</option>`).join('');
    }
}

/* ---- NGO IMPACT ---- */
let ngoChartsInit = false;
async function loadNgoImpact() {
    // Update stat cards from API
    const accepted = await listingsAPI.getAll({ status: 'delivered' });
    if (accepted.success) {
        const data = accepted.data;
        const totalMeals = data.reduce((s, l) => s + (l.mealsFed || 0), 0);
        const co2 = Math.round(totalMeals * 0.14);
        const beneficiaries = Math.round(totalMeals * 0.25);

        const counters = document.querySelectorAll('#s-ngo-impact .count-up');
        const vals = [totalMeals, co2, beneficiaries];
        counters.forEach((c, i) => { if (vals[i] !== undefined) { c.dataset.target = vals[i]; c.textContent = '0'; c.dataset.animated = ''; animateCountUp(c); } });
    }

    if (!ngoChartsInit) {
        ngoChartsInit = true;
        const pie = document.getElementById('ngoPieChart');
        if (pie) new Chart(pie, { type: 'doughnut', data: { labels: ['Cooked Meals', 'Bakery', 'Fruits', 'Snacks', 'Other'], datasets: [{ data: [52, 18, 12, 10, 8], backgroundColor: ['#2E8B57', '#FF8C00', '#3daa6e', '#e6ac00', '#52c484'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '60%' } });
        const bar = document.getElementById('ngoBarChart');
        if (bar) new Chart(bar, { type: 'bar', data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Pickups', data: [8, 12, 7, 15, 10, 18, 9], backgroundColor: 'rgba(46,139,87,0.75)', borderRadius: 8 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } } });
    }
}

function loadNgoProfile() {
    if (!currentUser) return;
    const inputs = document.querySelectorAll('#s-ngo-profile input, #s-ngo-profile select');
    const vals = [currentUser.organization, currentUser.registrationNumber, currentUser.email, currentUser.phone, currentUser.city, currentUser.serviceAreas];
    inputs.forEach((inp, i) => { if (vals[i]) inp.value = vals[i]; });
}

function initNgoLineChart() {
    const ctx = document.getElementById('ngoLineChart');
    if (!ctx) return;
    new Chart(ctx, { type: 'line', data: { labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], datasets: [{ label: 'Pickups', data: [32, 45, 38, 60, 52, 48], backgroundColor: 'rgba(46,139,87,0.1)', borderColor: '#2E8B57', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#2E8B57', pointRadius: 5 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } } });
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth(['ngo'])) return;
    currentUser = getUser();

    const nameEl = document.querySelector('.sidebar-user h4');
    const subEl = document.querySelector('.sidebar-user p');
    if (nameEl && currentUser) nameEl.textContent = currentUser.organization;
    if (subEl && currentUser) subEl.textContent = `NGO Account · ${currentUser.city || 'India'}`;

    const welcomeH3 = document.querySelector('.welcome-bar h3');
    if (welcomeH3 && currentUser) welcomeH3.textContent = `Welcome back, ${currentUser.organization}! 🤲`;

    const el = document.getElementById('ngoDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    // Save profile
    const saveBtn = document.getElementById('ngoSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const inputs = document.querySelectorAll('#s-ngo-profile input');
            const result = await authAPI.updateProfile({
                organization: inputs[0]?.value,
                phone: inputs[3]?.value,
                serviceAreas: inputs[5]?.value
            });
            showToast(result.success ? 'NGO profile updated!' : (result.message || 'Update failed.'), result.success ? 'success' : 'error');
        };
    }

    // Load overview
    const avail = await listingsAPI.getAvailable();
    if (avail.success) {
        const urgentCount = avail.data.filter(l => l.isUrgent).length;
        const urgentEl = document.getElementById('ngoUrgentCount');
        if (urgentEl) urgentEl.textContent = `${urgentCount} urgent listing${urgentCount !== 1 ? 's' : ''}`;

        const badge = document.getElementById('foodBadge');
        if (badge) badge.textContent = avail.count;

        // Render alerts
        const alertList = document.getElementById('ngoAlertList');
        if (alertList) {
            const alerts = avail.data.slice(0, 5).map(l => {
                const icon = l.isUrgent ? '⚡' : '🍽️';
                const mins = Math.round((new Date(l.expiryTime).getTime() - Date.now()) / 60000);
                const text = l.isUrgent ? `${l.name} expiring in ${mins}min — ${l.city}` : `New: ${l.name} from ${l.donorName}`;
                return `<div class="activity-item"><div class="activity-icon">${icon}</div><div class="activity-text"><strong>${escHtml(text)}</strong></div><span class="activity-time">Now</span></div>`;
            });
            alertList.innerHTML = alerts.join('') || '<div class="activity-item"><div class="activity-text"><strong>No alerts right now.</strong></div></div>';
        }
    }

    // Load overview stats
    const accepted = await listingsAPI.getAll();
    if (accepted.success) {
        const pickups = accepted.data.filter(l => l.status === 'delivered' || l.status === 'accepted');
        const delivered = accepted.data.filter(l => l.status === 'delivered');
        const totalMeals = delivered.reduce((s, l) => s + (l.mealsFed || 0), 0);

        const counters = document.querySelectorAll('#s-ngo-overview .count-up');
        if (counters[0]) { counters[0].dataset.target = pickups.length; counters[0].textContent = '0'; animateCountUp(counters[0]); }
        if (counters[1]) { counters[1].dataset.target = totalMeals; counters[1].textContent = '0'; animateCountUp(counters[1]); }
    }

    // Load volunteers for modal dropdown
    loadVolunteers();
    setTimeout(initNgoLineChart, 100);
});
