/* ===================================================
   script.js — Global Shared JavaScript
   MealMitra Platform
   =================================================== */

/* ======= NAV TOGGLE ======= */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target))
            navLinks.classList.remove('open');
    });
}

/* ======= TOAST SYSTEM ======= */
function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.success}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 280);
    }, duration);
}

/* ======= COUNT-UP ANIMATION ======= */
function animateCountUp(el) {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

function initCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = true;
                animateCountUp(entry.target);
            }
        });
    }, { threshold: 0.3 });
    counters.forEach(c => observer.observe(c));
}

/* ======= SIDEBAR TOGGLE (Dashboards) ======= */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar || !toggle) return;

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('show');
    });
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('show');
        });
    }
}

/* ======= MODAL HELPERS ======= */
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('open');
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
}
// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
    });
});

/* ======= ACTIVE NAV LINK ======= */
function setActiveLink() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a, .nav-item').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href && href.includes(path)) link.classList.add('active');
    });
}

/* ======= COUNTDOWN TIMER ======= */
function startCountdown(el, expiryTimestamp) {
    function update() {
        const diff = expiryTimestamp - Date.now();
        if (diff <= 0) { el.textContent = 'EXPIRED'; el.style.color = '#e74c3c'; return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.textContent = `${h}h ${m}m ${s}s remaining`;
    }
    update();
    setInterval(update, 1000);
}

/* ======= FILTER UTILITY ======= */
function filterCards(query, cards, fields) {
    query = query.toLowerCase().trim();
    cards.forEach(card => {
        const text = fields.map(f => (card.dataset[f] || '')).join(' ').toLowerCase();
        card.style.display = (!query || text.includes(query)) ? '' : 'none';
    });
}

/* ======= SIGN OUT ======= */
function handleSignOut(e) {
    if (e) e.preventDefault();
    if (typeof removeToken === 'function') removeToken();
    if (typeof removeUser === 'function') removeUser();
    window.location.href = 'login.html';
}

/* ======= INIT ON DOM READY ======= */
document.addEventListener('DOMContentLoaded', () => {
    initCounters();
    initSidebar();
    setActiveLink();

    // Wire sign-out links
    document.querySelectorAll('.sidebar-footer a[href="index.html"]').forEach(link => {
        link.href = '#';
        link.addEventListener('click', handleSignOut);
    });
});
