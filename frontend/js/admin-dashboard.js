const API_BASE = "https://smartnest-2zw0.onrender.com/api";

const token   = localStorage.getItem('smartnest_token')  || sessionStorage.getItem('smartnest_token');
const userRaw = localStorage.getItem('smartnest_user')   || sessionStorage.getItem('smartnest_user');
const me      = userRaw ? JSON.parse(userRaw) : null;

if (!token || !me || me.role !== 'admin') {
  window.location.href = "login.html";
}

document.getElementById('userName').textContent      = me.name || "Admin";
document.getElementById('avatarInitial').textContent = (me.name || "A").charAt(0).toUpperCase();

document.getElementById('logoutBtn').addEventListener('click', () => {
  ['smartnest_token','smartnest_user'].forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  window.location.href = "login.html";
});

// ── Fetch stats ──
async function loadStats() {
  try {
    const res  = await fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.success) throw new Error();
    const s = data.stats;
    document.getElementById('statsRow').innerHTML = `
      <div class="stat-card" style="animation-delay:0s"><div class="stat-num">${s.totalUsers}</div><div class="stat-lbl">Total Users</div></div>
      <div class="stat-card" style="animation-delay:.05s"><div class="stat-num">${s.totalOwners}</div><div class="stat-lbl">Owners</div></div>
      <div class="stat-card" style="animation-delay:.1s"><div class="stat-num">${s.totalBuyers}</div><div class="stat-lbl">Buyers</div></div>
      <div class="stat-card brass" style="animation-delay:.15s"><div class="stat-num">${s.totalProperties}</div><div class="stat-lbl">Properties</div></div>
      <div class="stat-card ok" style="animation-delay:.2s"><div class="stat-num">${s.totalEnquiries}</div><div class="stat-lbl">Enquiries</div></div>
      <div class="stat-card" style="animation-delay:.25s"><div class="stat-num">${s.totalAdmins}</div><div class="stat-lbl">Admins</div></div>
    `;
  } catch {
    document.getElementById('statsRow').innerHTML = '<p style="padding:20px;color:var(--text-dim);">Could not load stats.</p>';
  }
}

// ── Users ──
let allUsers = [];

async function loadUsers() {
  try {
    const res  = await fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.success) throw new Error();
    allUsers = data.users || [];
    renderUsers(allUsers);
    document.getElementById('userCountLabel').textContent = `${allUsers.length} user${allUsers.length !== 1 ? 's' : ''} registered`;
  } catch {
    document.getElementById('usersBody').innerHTML = '<tr><td colspan="5" class="loading-cell">Could not load users.</td></tr>';
  }
}

function renderUsers(list) {
  const tbody = document.getElementById('usersBody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No users found.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(u => `
    <tr data-id="${u._id}">
      <td><strong>${u.name || '—'}</strong></td>
      <td style="color:var(--text-dim);">${u.email}</td>
      <td><span class="role-pill ${u.role}">${u.role}</span></td>
      <td style="color:var(--text-dim);">${new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        <select class="role-change-select" data-id="${u._id}" data-name="${u.name||u.email}">
          <option value="buyer"  ${u.role==='buyer' ?'selected':''}>Buyer</option>
          <option value="owner"  ${u.role==='owner' ?'selected':''}>Owner</option>
          <option value="admin"  ${u.role==='admin' ?'selected':''}>Admin</option>
        </select>
        ${u._id !== me._id ? `<button class="del-btn" data-id="${u._id}" data-name="${u.name||u.email}">Delete</button>` : '<span style="font-size:11px;color:var(--text-dim);">(you)</span>'}
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => openDeleteConfirm(btn.dataset.id, btn.dataset.name));
  });

  tbody.querySelectorAll('.role-change-select').forEach(sel => {
    sel.addEventListener('change', async function() {
      const newRole = this.value;
      const id     = this.dataset.id;
      const name   = this.dataset.name;
      if (!confirm(`Change ${name}'s role to "${newRole}"?`)) {
        // revert
        await loadUsers(); return;
      }
      try {
        const res  = await fetch(`${API_BASE}/admin/users/${id}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: newRole }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`${name} is now ${newRole}`, 'success');
          allUsers = allUsers.map(u => u._id === id ? { ...u, role: newRole } : u);
        } else {
          showToast(data.message || 'Failed', 'error');
          await loadUsers();
        }
      } catch {
        showToast('Failed to change role', 'error');
        await loadUsers();
      }
    });
  });
}

// ── Search + role filter ──
let activeRole = '';

function applyFilters() {
  const query = document.getElementById('userSearch').value.trim().toLowerCase();
  let filtered = allUsers;
  if (activeRole) filtered = filtered.filter(u => u.role === activeRole);
  if (query)      filtered = filtered.filter(u =>
    (u.name  || '').toLowerCase().includes(query) ||
    (u.email || '').toLowerCase().includes(query)
  );
  renderUsers(filtered);
}

document.getElementById('userSearch').addEventListener('input', applyFilters);

document.querySelectorAll('.role-pill-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role-pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeRole = btn.dataset.role;
    applyFilters();
  });
});

// ── Delete confirm ──
let pendingDeleteId = null;

function openDeleteConfirm(id, name) {
  pendingDeleteId = id;
  document.getElementById('deleteMsg').textContent = `This will permanently remove "${name}" from SmartNest. Their properties and chats stay.`;
  document.getElementById('deleteOverlay').classList.add('show');
}

document.getElementById('cancelDelete').addEventListener('click', () => {
  pendingDeleteId = null;
  document.getElementById('deleteOverlay').classList.remove('show');
});
document.getElementById('deleteOverlay').addEventListener('click', e => {
  if (e.target.id === 'deleteOverlay') { pendingDeleteId = null; document.getElementById('deleteOverlay').classList.remove('show'); }
});

document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  const btn = document.getElementById('confirmDelete');
  btn.disabled = true; btn.textContent = 'Deleting…';
  try {
    const res = await fetch(`${API_BASE}/admin/users/${pendingDeleteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    showToast('User deleted', 'info');
    allUsers = allUsers.filter(u => u._id !== pendingDeleteId);
    renderUsers(document.getElementById('roleFilter').value ? allUsers.filter(u => u.role === document.getElementById('roleFilter').value) : allUsers);
    document.getElementById('userCountLabel').textContent = `${allUsers.length} user${allUsers.length !== 1 ? 's' : ''} registered`;
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Delete';
    pendingDeleteId = null;
    document.getElementById('deleteOverlay').classList.remove('show');
  }
});

// ── Properties ──
let propsLoaded = false;

async function loadProperties() {
  try {
    const res  = await fetch(`${API_BASE}/admin/properties`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.success) throw new Error();
    const list = data.properties || [];
    document.getElementById('propCountLabel').textContent = `${list.length} propert${list.length !== 1 ? 'ies' : 'y'} on the platform`;
    document.getElementById('propsBody').innerHTML = list.length ? list.map(p => `
      <tr>
        <td><a href="property-detail.html?id=${p._id}" target="_blank" style="color:var(--brass-dark);font-weight:600;text-decoration:none;">${p.title || 'Untitled'}</a></td>
        <td>${(p.owner && p.owner.name) ? p.owner.name : '—'}</td>
        <td style="color:var(--text-dim);">${p.location || '—'}</td>
        <td style="font-weight:600;">₹${Number(p.price||0).toLocaleString('en-IN')}</td>
        <td style="color:var(--text-dim);">${new Date(p.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
      </tr>`).join('') :
      '<tr><td colspan="5" class="loading-cell">No properties found.</td></tr>';
  } catch {
    document.getElementById('propsBody').innerHTML = '<tr><td colspan="5" class="loading-cell">Could not load properties.</td></tr>';
  }
}

// ── Tabs ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
    if (btn.dataset.tab === 'properties' && !propsLoaded) { propsLoaded = true; loadProperties(); }
  });
});

// ── Init ──
loadStats();
loadUsers();
