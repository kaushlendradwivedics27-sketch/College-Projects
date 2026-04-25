/* ===================================================
   login.js — Auth Page Logic (Connected to Backend)
   =================================================== */

let currentRole = 'donor';

/* ---- TAB SWITCH ---- */
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const regTab = document.getElementById('registerTab');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        regTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        regTab.classList.add('active');
    }
    clearErrors();
}

/* ---- ROLE SELECT ---- */
function selectRole(role, btn) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

/* ---- PASSWORD TOGGLE ---- */
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

/* ---- PASSWORD STRENGTH ---- */
const regPwInput = document.getElementById('regPassword');
if (regPwInput) {
    regPwInput.addEventListener('input', function () {
        const val = this.value;
        const bar = document.getElementById('pwBarFill');
        const label = document.getElementById('pwStrengthLabel');
        if (!bar || !label) return;

        bar.className = 'pw-bar-fill';
        if (val.length === 0) { bar.style.width = '0'; label.textContent = ''; return; }
        if (val.length < 6) {
            bar.classList.add('pw-weak'); label.textContent = 'Weak';
        } else if (val.length < 8 || !/[0-9]/.test(val)) {
            bar.classList.add('pw-fair'); label.textContent = 'Fair';
        } else if (!/[!@#$%^&*]/.test(val)) {
            bar.classList.add('pw-good'); label.textContent = 'Good';
        } else {
            bar.classList.add('pw-strong'); label.textContent = 'Strong ✓';
        }
    });
}

/* ---- VALIDATION HELPERS ---- */
function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}
function clearErrors() {
    document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    document.querySelectorAll('input').forEach(i => i.classList.remove('input-error', 'input-success'));
}
function markField(id, valid) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('input-success', valid);
    el.classList.toggle('input-error', !valid);
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(ph) {
    return /^[+\d\s\-()]{8,15}$/.test(ph);
}

/* ---- LOGIN HANDLER (Real Backend) ---- */
async function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    let valid = true;
    const email = document.getElementById('loginEmail').value.trim();
    const pw = document.getElementById('loginPassword').value;

    if (!isValidEmail(email)) {
        showError('loginEmailErr', 'Please enter a valid email address.');
        markField('loginEmail', false); valid = false;
    } else { markField('loginEmail', true); }

    if (pw.length < 6) {
        showError('loginPasswordErr', 'Password must be at least 6 characters.');
        markField('loginPassword', false); valid = false;
    } else { markField('loginPassword', true); }

    if (!valid) return;

    const btn = document.getElementById('loginSubmitBtn');
    const spinner = document.getElementById('loginSpinner');
    btn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');

    try {
        const result = await authAPI.login(email, pw, currentRole);

        btn.disabled = false;
        if (spinner) spinner.classList.add('hidden');

        if (result.success) {
            const destinations = {
                donor: 'donor-dashboard.html',
                ngo: 'ngo-dashboard.html',
                admin: 'admin-dashboard.html'
            };
            showToast(`Welcome back, ${result.user.firstName}! Redirecting…`, 'success');
            setTimeout(() => {
                window.location.href = destinations[result.user.role] || 'index.html';
            }, 1200);
        } else {
            showToast(result.message || 'Login failed. Check your credentials.', 'error');
            if (result.errors) {
                result.errors.forEach(err => {
                    if (err.path === 'email') showError('loginEmailErr', err.msg);
                    if (err.path === 'password') showError('loginPasswordErr', err.msg);
                });
            }
        }
    } catch (err) {
        btn.disabled = false;
        if (spinner) spinner.classList.add('hidden');
        showToast('Network error. Is the server running?', 'error');
    }
}

/* ---- REGISTER HANDLER (Real Backend) ---- */
async function handleRegister(e) {
    e.preventDefault();
    clearErrors();
    let valid = true;

    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const org = document.getElementById('regOrg').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const city = document.getElementById('regCity').value;
    const pw = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const agree = document.getElementById('agreeTerms').checked;

    if (firstName.length < 2) {
        showError('regFirstNameErr', 'Please enter your first name.');
        markField('regFirstName', false); valid = false;
    } else { markField('regFirstName', true); }

    if (org.length < 2) {
        showError('regOrgErr', 'Organization name is required.');
        markField('regOrg', false); valid = false;
    } else { markField('regOrg', true); }

    if (!isValidEmail(email)) {
        showError('regEmailErr', 'Please enter a valid email address.');
        markField('regEmail', false); valid = false;
    } else { markField('regEmail', true); }

    if (!isValidPhone(phone)) {
        showError('regPhoneErr', 'Please enter a valid phone number.');
        markField('regPhone', false); valid = false;
    } else { markField('regPhone', true); }

    if (pw.length < 8) {
        showError('regPasswordErr', 'Password must be at least 8 characters.');
        markField('regPassword', false); valid = false;
    } else { markField('regPassword', true); }

    if (pw !== confirm) {
        showError('regConfirmErr', 'Passwords do not match.');
        markField('regConfirm', false); valid = false;
    } else if (confirm.length > 0) { markField('regConfirm', true); }

    if (!agree) {
        showToast('Please agree to the Terms of Service to continue.', 'warning');
        valid = false;
    }

    if (!valid) return;

    const btn = document.getElementById('regSubmitBtn');
    const spinner = document.getElementById('regSpinner');
    btn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');

    try {
        const result = await authAPI.register({
            firstName, lastName, email, password: pw,
            role: currentRole, organization: org,
            phone, city
        });

        btn.disabled = false;
        if (spinner) spinner.classList.add('hidden');

        if (result.success) {
            showToast('Account created successfully! Please sign in.', 'success');
            // Remove token — user should explicitly login
            removeToken(); removeUser();
            setTimeout(() => switchTab('login'), 1400);
        } else {
            showToast(result.message || 'Registration failed.', 'error');
        }
    } catch (err) {
        btn.disabled = false;
        if (spinner) spinner.classList.add('hidden');
        showToast('Network error. Is the server running?', 'error');
    }
}

/* ---- AUTO SWITCH TO REGISTER IF HASH ---- */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#register') switchTab('register');
    // If already logged in, redirect to dashboard
    if (isLoggedIn()) {
        const user = getUser();
        const dest = { donor: 'donor-dashboard.html', ngo: 'ngo-dashboard.html', admin: 'admin-dashboard.html' };
        window.location.href = dest[user?.role] || 'index.html';
    }
});
