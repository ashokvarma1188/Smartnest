const API = "https://smartnest-2zw0.onrender.com/api";
const token   = localStorage.getItem('smartnest_token')  || sessionStorage.getItem('smartnest_token');
const userRaw = localStorage.getItem('smartnest_user')   || sessionStorage.getItem('smartnest_user');
const user    = userRaw ? JSON.parse(userRaw) : null;

if (!token || !user) { window.location.href = 'login.html'; }

const initial = (user.name || 'U').charAt(0).toUpperCase();
document.getElementById('bigAvatar').textContent  = initial;
document.getElementById('userName').textContent   = user.name  || '—';
document.getElementById('userEmail').textContent  = user.email || '—';
document.getElementById('infoName').textContent   = user.name  || '—';
document.getElementById('infoEmail').textContent  = user.email || '—';
document.getElementById('infoRole').textContent   = user.role === 'owner' ? 'Property Owner' : 'Property Buyer';

const pill = document.getElementById('rolePill');
pill.textContent = user.role === 'owner' ? 'Owner' : 'Buyer';
pill.className   = 'role-pill ' + (user.role || 'buyer');

document.getElementById('dashLink').href = user.role === 'owner' ? 'add-property.html' : 'browse-properties.html';

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear(); sessionStorage.clear();
  window.location.href = 'login.html';
});

document.getElementById('togglePw').addEventListener('click', function () {
  const inp = document.getElementById('newPw');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  this.textContent = inp.type === 'password' ? 'SHOW' : 'HIDE';
});

function showStatus(msg, kind) {
  const el = document.getElementById('pwStatus');
  el.textContent = msg; el.className = 'status show ' + kind;
}

document.getElementById('pwForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPw = document.getElementById('newPw').value;
  const conPw = document.getElementById('confirmPw').value;

  if (!newPw || !conPw)     { showStatus('Please fill in both fields.', 'error'); return; }
  if (newPw.length < 6)     { showStatus('Password must be at least 6 characters.', 'error'); return; }
  if (newPw !== conPw)      { showStatus('Passwords do not match.', 'error'); return; }

  const btn = document.getElementById('submitBtn');
  const lbl = document.getElementById('submitLabel');
  btn.disabled = true; lbl.textContent = 'Updating…';

  try {
    const res  = await fetch(API + '/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, newPassword: newPw })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong.');
    showStatus('Password updated successfully!', 'ok');
    showToast('Password updated!', 'success');
    document.getElementById('pwForm').reset();
  } catch (err) {
    showStatus(err.message, 'error');
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false; lbl.textContent = 'Update Password';
  }
});
