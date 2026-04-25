/* ===================================================
   admin.js — Admin Dashboard Logic (Connected to Backend)
   =================================================== */

let currentUser = null;

const adminSections = { 'admin-overview': 's-admin-overview', 'admin-analytics': 's-admin-analytics', 'admin-donors': 's-admin-donors', 'admin-ngos': 's-admin-ngos', 'admin-listings': 's-admin-listings', 'admin-reports': 's-admin-reports', 'admin-settings': 's-admin-settings' };
const adminTitles = { 'admin-overview': '📊 Admin Dashboard', 'admin-analytics': '📈 Analytics', 'admin-donors': '🍽️ Manage Donors', 'admin-ngos': '🤝 Manage NGOs', 'admin-listings': '📋 All Listings', 'admin-reports': '📑 Reports', 'admin-settings': '🔧 System Settings' };

function escHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

function adminShowSection(key) {
    Object.values(adminSections).forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    const target = document.getElementById(adminSections[key]);
    if (target) target.classList.remove('hidden');
    const title = document.getElementById('adminPageTitle');
    if (title) title.textContent = adminTitles[key] || key;
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const idx = Object.keys(adminSections).indexOf(key);
    if (navItems[idx]) navItems[idx].classList.add('active');

    if (key === 'admin-donors') loadDonors();
    if (key === 'admin-ngos') loadNGOs();
    if (key === 'admin-listings') loadAllListings();
    if (key === 'admin-analytics') loadAnalytics();
}

/* ---- LOAD DONORS ---- */
async function loadDonors() {
    const tbody = document.getElementById('donorsBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⏳ Loading…</td></tr>';
    const search = document.getElementById('donorSearch')?.value || '';
    const city = document.getElementById('donorCityFilter')?.value || '';
    const result = await adminAPI.getDonors({ search, city });
    if (!result.success) { tbody.innerHTML = '<tr><td colspan="8">Failed to load</td></tr>'; return; }
    tbody.innerHTML = result.data.map((d, i) => `
    <tr>
      <td>${i + 1}</td><td><strong>${escHtml(d.organization)}</strong></td><td>${escHtml(d.city)}</td>
      <td>${d.totalDonations}</td><td>${(d.totalMeals || 0).toLocaleString()}</td>
      <td>${d.lastActive ? new Date(d.lastActive).toLocaleDateString('en-IN') : '—'}</td>
      <td><span class="badge ${d.status === 'active' ? 'badge-available' : 'badge-expired'}">${d.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="showToast('Viewing ${escHtml(d.organization)}…','info')">View</button>
        <button class="btn btn-primary btn-sm" style="margin-left:6px;" onclick="toggleUserStatus('${d._id}','${d.status}')">
          ${d.status === 'active' ? 'Suspend' : 'Activate'}
        </button>
      </td>
    </tr>`).join('');
}

/* ---- LOAD NGOS ---- */
async function loadNGOs() {
    const tbody = document.getElementById('ngosBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⏳ Loading…</td></tr>';
    const search = document.getElementById('ngoSearch')?.value || '';
    const result = await adminAPI.getNgos({ search });
    if (!result.success) { tbody.innerHTML = '<tr><td colspan="8">Failed to load</td></tr>'; return; }
    tbody.innerHTML = result.data.map((n, i) => `
    <tr>
      <td>${i + 1}</td><td><strong>${escHtml(n.organization)}</strong></td><td>${escHtml(n.city)}</td>
      <td>${n.pickups || 0}</td><td>${n.volunteerCount || 0}</td><td>${escHtml(n.registrationNumber)}</td>
      <td><span class="badge ${n.isVerified ? 'badge-available' : 'badge-accepted'}">${n.isVerified ? 'verified' : 'pending'}</span></td>
      <td>
        ${!n.isVerified ? `<button class="btn btn-primary btn-sm" onclick="verifyNgo('${n._id}')">✅ Verify</button>` : `<button class="btn btn-outline btn-sm" onclick="showToast('${escHtml(n.organization)} details…','info')">View</button>`}
      </td>
    </tr>`).join('');
}

async function verifyNgo(id) {
    const result = await adminAPI.verifyNgo(id);
    if (result.success) { showToast(result.message || 'NGO verified!', 'success'); loadNGOs(); }
    else showToast(result.message || 'Failed.', 'error');
}

async function toggleUserStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const result = await adminAPI.setUserStatus(id, newStatus);
    if (result.success) { showToast(result.message || 'Status updated!', 'success'); loadDonors(); }
    else showToast(result.message || 'Failed.', 'error');
}

/* ---- LOAD ALL LISTINGS ---- */
async function loadAllListings() {
    const tbody = document.getElementById('allListingsBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;">⏳ Loading…</td></tr>';

    // Admin sees all listings — use a direct fetch since listingsAPI.getAll is donor-scoped
    const result = await apiFetch('/listings');
    if (!result.success) { tbody.innerHTML = '<tr><td colspan="9">Failed to load</td></tr>'; return; }

    const sc = { available: 'badge-available', accepted: 'badge-accepted', delivered: 'badge-delivered', expired: 'badge-expired' };
    tbody.innerHTML = result.data.map((l, i) => `
    <tr>
      <td>${i + 1}</td><td><strong>${escHtml(l.name)}</strong></td><td>${escHtml(l.donorName || '')}</td>
      <td>${l.quantity} ${l.unit}</td><td>${escHtml(l.city)}</td>
      <td>${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
      <td>${new Date(l.expiryTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
      <td><span class="badge ${sc[l.status] || 'badge-available'}">${l.status}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="removeListing('${l._id}')">🗑️</button></td>
    </tr>`).join('');
}

async function removeListing(id) {
    if (!confirm('Remove this listing?')) return;
    const result = await listingsAPI.remove(id);
    if (result.success) { showToast('Listing removed.', 'warning'); loadAllListings(); }
    else showToast(result.message || 'Failed.', 'error');
}

async function clearExpiredListings() {
    const result = await adminAPI.clearExpired();
    if (result.success) { showToast(result.message, 'warning'); loadAllListings(); }
    else showToast(result.message || 'Failed.', 'error');
}

/* ---- ADMIN CHARTS ---- */
let adminChartsInit = false;
async function initAdminCharts(stats) {
    if (adminChartsInit) return;
    adminChartsInit = true;

    const monthly = stats?.monthlyData || [];
    const labels = monthly.map(m => m.label);
    const mealsData = monthly.map(m => m.meals);

    const lineCtx = document.getElementById('adminLineChart');
    if (lineCtx) new Chart(lineCtx, {
        type: 'line', data: { labels, datasets: [{ label: 'Meals Rescued', data: mealsData, fill: true, backgroundColor: 'rgba(46,139,87,0.1)', borderColor: '#2E8B57', borderWidth: 2.5, tension: 0.4, pointBackgroundColor: '#2E8B57', pointRadius: 4 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } }
    });

    const catData = stats?.categoryData || [];
    const pieCtx = document.getElementById('adminPieChart');
    if (pieCtx) new Chart(pieCtx, {
        type: 'doughnut', data: { labels: catData.map(c => c._id || 'Other'), datasets: [{ data: catData.map(c => c.count), backgroundColor: ['#2E8B57', '#FF8C00', '#3daa6e', '#e6ac00', '#52c484', '#ffaa33'], borderWidth: 0 }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }, cutout: '55%' }
    });

    const cityData = stats?.cityData || [];
    const barCtx = document.getElementById('adminBarChart');
    if (barCtx) new Chart(barCtx, {
        type: 'bar', data: { labels: cityData.map(c => c._id), datasets: [{ label: 'Meals Rescued', data: cityData.map(c => c.meals), backgroundColor: ['#2E8B57', '#3daa6e', '#52c484', '#68d494', '#FF8C00', '#ffaa33', '#2E8B57', '#3daa6e', '#52c484', '#68d494'], borderRadius: 8 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } }
    });
}

/* ---- ANALYTICS CHARTS ---- */
let analyticsInit = false;
async function loadAnalytics() {
    if (analyticsInit) return;
    analyticsInit = true;

    const result = await adminAPI.getStats();
    if (!result.success) return;
    const s = result.data;
    const monthly = s.monthlyData || [];
    const labels = monthly.map(m => m.label);

    const al = document.getElementById('analyticsLineChart');
    if (al) new Chart(al, { type: 'line', data: { labels, datasets: [{ label: 'Active Donors', data: monthly.map(m => m.donors), fill: true, backgroundColor: 'rgba(255,140,0,0.1)', borderColor: '#FF8C00', borderWidth: 2.5, tension: 0.4, pointRadius: 4 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } } });

    const an = document.getElementById('analyticsNgoChart');
    if (an) new Chart(an, { type: 'line', data: { labels, datasets: [{ label: 'NGOs', data: monthly.map(m => m.ngos), fill: true, backgroundColor: 'rgba(46,139,87,0.1)', borderColor: '#2E8B57', borderWidth: 2.5, tension: 0.4, pointRadius: 4 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } } });

    const ad = document.getElementById('analyticsDvDChart');
    if (ad) new Chart(ad, { type: 'bar', data: { labels: labels.slice(-6), datasets: [{ label: 'Donations', data: monthly.slice(-6).map(m => m.listings), backgroundColor: 'rgba(46,139,87,0.7)', borderRadius: 6 }, { label: 'Delivered', data: monthly.slice(-6).map(m => m.delivered), backgroundColor: 'rgba(255,140,0,0.7)', borderRadius: 6 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } } });

    const aw = document.getElementById('analyticsWasteChart');
    if (aw) new Chart(aw, { type: 'doughnut', data: { labels: ['Saved from Waste', 'Expired'], datasets: [{ data: [s.successRate, 100 - s.successRate], backgroundColor: ['#2E8B57', '#e74c3c'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '60%' } });
}

/* ---- TABLE FILTER ---- */
function filterAdminTable(inputId, tbodyId) {
    const q = (document.getElementById(inputId)?.value || '').toLowerCase();
    const rows = document.querySelectorAll(`#${tbodyId} tr`);
    rows.forEach(r => { r.style.display = !q || r.textContent.toLowerCase().includes(q) ? '' : 'none'; });
}

function setAdminDate() {
    const el = document.getElementById('adminDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth(['admin'])) return;
    currentUser = getUser();
    setAdminDate();

    // Wire up clear expired button
    const clearBtn = document.getElementById('clearExpiredBtn');
    if (clearBtn) clearBtn.onclick = clearExpiredListings;

    // Wire up export buttons
    document.getElementById('exportDonorsBtn')?.addEventListener('click', () => showToast('Export ready!', 'success'));
    document.getElementById('exportNgosBtn')?.addEventListener('click', () => showToast('NGO export ready!', 'success'));

    // Load stats from API
    const result = await adminAPI.getStats();
    if (result.success) {
        const s = result.data;

        // Update KPI cards
        const kpiCounters = document.querySelectorAll('#s-admin-overview .summary-info .count-up');
        const vals = [s.totalMeals, s.totalDonors, s.totalNgos, s.co2Saved];
        kpiCounters.forEach((c, i) => {
            if (vals[i] !== undefined) { c.dataset.target = vals[i]; c.textContent = '0'; animateCountUp(c); }
        });

        // Secondary KPIs
        const miniCounters = document.querySelectorAll('.secondary-kpis .count-up');
        const miniVals = [s.totalVolunteers, s.activeListings];
        miniCounters.forEach((c, i) => {
            if (miniVals[i] !== undefined) { c.dataset.target = miniVals[i]; c.textContent = '0'; animateCountUp(c); }
        });

        // Static KPIs
        const staticEls = document.querySelectorAll('.kpi-mini strong:not(.count-up)');
        if (staticEls[0]) staticEls[0].textContent = s.citiesCount;
        if (staticEls[1]) staticEls[1].textContent = '98.7%';
        if (staticEls[2]) staticEls[2].textContent = '18 min';
        if (staticEls[3]) staticEls[3].textContent = s.successRate + '%';

        // SDG progress bars (analytics section)
        const sdgBars = document.querySelectorAll('.sdg-progress-bar div');
        if (sdgBars[0]) sdgBars[0].style.width = Math.min(s.successRate, 100) + '%';
        if (sdgBars[1]) sdgBars[1].style.width = Math.min(Math.round(s.totalMeals / 2000 * 100), 100) + '%';
        if (sdgBars[2]) sdgBars[2].style.width = Math.min(s.successRate + 5, 100) + '%';

        // Init charts with real data
        setTimeout(() => initAdminCharts(s), 150);
    }
});
