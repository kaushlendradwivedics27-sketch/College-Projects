/* ===================================================
   api.js — Frontend API Client for MealMitra Backend
   Handles all HTTP requests, auth token storage, and
   provides clean methods for every API endpoint.
   =================================================== */

// ======= API CONFIGURATION =======
// In production (Vercel), calls go to the Render backend.
// In development (localhost), calls go to the local server.
const API_BASE = '/api';

// ======= TOKEN MANAGEMENT =======
function getToken() { return localStorage.getItem('mealmitra_token'); }
function setToken(token) { localStorage.setItem('mealmitra_token', token); }
function removeToken() { localStorage.removeItem('mealmitra_token'); }
function getUser() {
    const u = localStorage.getItem('mealmitra_user');
    return u ? JSON.parse(u) : null;
}
function setUser(user) { localStorage.setItem('mealmitra_user', JSON.stringify(user)); }
function removeUser() { localStorage.removeItem('mealmitra_user'); }
function isLoggedIn() { return !!getToken(); }
function logout() { removeToken(); removeUser(); window.location.href = 'login.html'; }

// ======= FETCH WRAPPER =======
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(url, { ...options, headers });
        const data = await res.json();

        if (res.status === 401) {
            // Token expired or invalid
            removeToken(); removeUser();
            if (!window.location.pathname.includes('login.html')) {
                showToast('Session expired. Please log in again.', 'warning');
                setTimeout(() => window.location.href = 'login.html', 1500);
            }
            return { success: false, message: 'Unauthorized' };
        }

        return data;
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        return { success: false, message: 'Network error — is the server running?' };
    }
}

// ======= AUTH API =======
const authAPI = {
    async login(email, password, role) {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, role })
        });
        if (data.success) { setToken(data.token); setUser(data.user); }
        return data;
    },

    async register(userData) {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (data.success) { setToken(data.token); setUser(data.user); }
        return data;
    },

    async getMe() { return apiFetch('/auth/me'); },

    async updateProfile(updates) {
        const data = await apiFetch('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        if (data.success) setUser(data.user);
        return data;
    }
};

// ======= LISTINGS API =======
const listingsAPI = {
    async getAll(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/listings${qs ? '?' + qs : ''}`);
    },

    async getAvailable(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/listings/available${qs ? '?' + qs : ''}`);
    },

    async getOne(id) { return apiFetch(`/listings/${id}`); },

    async create(listing) {
        return apiFetch('/listings', {
            method: 'POST',
            body: JSON.stringify(listing)
        });
    },

    async update(id, updates) {
        return apiFetch(`/listings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },

    async remove(id) {
        return apiFetch(`/listings/${id}`, { method: 'DELETE' });
    },

    async accept(id, body = {}) {
        return apiFetch(`/listings/${id}/accept`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    async markDelivered(id, mealsFed) {
        return apiFetch(`/listings/${id}/deliver`, {
            method: 'PUT',
            body: JSON.stringify({ mealsFed })
        });
    }
};

// ======= ADMIN API =======
const adminAPI = {
    async getStats() { return apiFetch('/admin/stats'); },
    async getDonors(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/admin/donors${qs ? '?' + qs : ''}`);
    },
    async getNgos(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/admin/ngos${qs ? '?' + qs : ''}`);
    },
    async verifyNgo(id) {
        return apiFetch(`/admin/ngos/${id}/verify`, { method: 'PUT' });
    },
    async setUserStatus(id, status) {
        return apiFetch(`/admin/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },
    async clearExpired() {
        return apiFetch('/admin/listings/expired', { method: 'DELETE' });
    }
};

// ======= VOLUNTEERS API =======
const volunteersAPI = {
    async getAll() { return apiFetch('/volunteers'); },
    async create(vol) {
        return apiFetch('/volunteers', { method: 'POST', body: JSON.stringify(vol) });
    },
    async update(id, updates) {
        return apiFetch(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    }
};

// ======= AUTH GUARD =======
function requireAuth(allowedRoles) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    const user = getUser();
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        showToast('You do not have permission to access this page.', 'error');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return false;
    }
    return true;
}
