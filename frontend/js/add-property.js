const API_BASE = "https://smartnest-2zw0.onrender.com/api";
let editingId = null;

const token   = localStorage.getItem('smartnest_token')  || sessionStorage.getItem('smartnest_token');
const userRaw = localStorage.getItem('smartnest_user')   || sessionStorage.getItem('smartnest_user');
const user    = userRaw ? JSON.parse(userRaw) : null;

if (!token || !user || user.role !== 'owner') {
  window.location.href = "login.html";
}

document.getElementById('userName').textContent      = user.name || "Owner";
document.getElementById('greetName').textContent     = (user.name || "Owner").split(' ')[0];
document.getElementById('avatarInitial').textContent = (user.name || "O").charAt(0).toUpperCase();

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('smartnest_token');
  localStorage.removeItem('smartnest_user');
  sessionStorage.removeItem('smartnest_token');
  sessionStorage.removeItem('smartnest_user');
  window.location.href = "login.html";
});

const grid        = document.getElementById('propGrid');
const skeletonGrid = document.getElementById('skeletonGrid');
const emptyState   = document.getElementById('emptyState');
const statTotal    = document.getElementById('statTotal');
const statActive   = document.getElementById('statActive');
const statViews    = document.getElementById('statViews');

function houseIconSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="#9FB6C9" stroke-width="1.6"><path d="M3 11 L12 4 L21 11 M5 10 V20 H19 V10"/></svg>`;
}
function pinIconSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>`;
}

function renderProperties(list) {
  skeletonGrid.style.display = 'none';

  if (!list || list.length === 0) {
    grid.style.display   = 'none';
    emptyState.style.display = 'block';
    statTotal.textContent  = 0;
    statActive.textContent = 0;
    return;
  }

  emptyState.style.display = 'none';
  grid.style.display       = 'grid';
  grid.innerHTML           = '';

  list.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'prop-card';
    card.style.animationDelay = `${i * 0.06}s`;
    const imgSrc   = (p.images && p.images.length > 0) ? p.images[0] : p.image;
    const imgUrl   = imgSrc ? `https://smartnest-2zw0.onrender.com${imgSrc}` : null;
    const imgCount = p.images && p.images.length > 1 ? p.images.length : 0;
    const chips    = [];
    if (p.bedrooms)  chips.push(`🛏 ${p.bedrooms} Bed`);
    if (p.bathrooms) chips.push(`🚿 ${p.bathrooms} Bath`);
    if (p.area)      chips.push(`📐 ${p.area} sq.ft`);

    card.innerHTML = `
      <div class="prop-media">
        ${imgUrl ? `<img src="${imgUrl}" alt="${p.title}" loading="lazy"/>` : `<div class="no-img-bg">${houseIconSVG()}<span>No photo yet</span></div>`}
        <span class="prop-status">${p.status || 'Active'}</span>
        ${imgCount > 1 ? `<span class="prop-img-count"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>${imgCount}</span>` : ''}
        <div class="prop-price-overlay">₹${Number(p.price || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="prop-body">
        <div class="prop-title">${p.title || 'Untitled property'}</div>
        <div class="prop-loc">${pinIconSVG()} ${p.location || 'Location not set'}</div>
        ${chips.length ? `<div class="prop-chips">${chips.map(c => `<span class="p-chip">${c}</span>`).join('')}</div>` : ''}
        <div class="prop-meta">
          <a href="property-detail.html?id=${p._id}" style="font-size:12px;font-weight:600;color:var(--brass-dark);text-decoration:none;" target="_blank">View listing →</a>
          <div class="prop-actions">
            <button class="icon-btn" title="Edit" data-id="${p._id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Edit
            </button>
            <button class="icon-btn danger" title="Delete" data-id="${p._id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Delete
            </button>
          </div>
        </div>
      </div>`;

    grid.appendChild(card);

    card.querySelector('.icon-btn.danger').addEventListener('click', () => deleteProperty(p._id, card));
    card.querySelector('.icon-btn:not(.danger)').addEventListener('click', () => {
      editingId = p._id;
      document.getElementById('ptitle').value    = p.title       || '';
      document.getElementById('pprice').value    = p.price       || '';
      document.getElementById('plocation').value = p.location    || '';
      document.getElementById('pbedrooms').value = p.bedrooms    || '';
      document.getElementById('parea').value     = p.area        || '';
      document.getElementById('pdesc').value     = p.description || '';
      document.querySelector('.modal-head h3').textContent = 'Edit property';
      document.querySelector('.modal-head p').textContent  = 'Change what you need and hit Update.';
      document.getElementById('saveLabel').textContent     = 'Update property';
      openModal();
    });
  });

  statTotal.textContent  = list.length;
  statActive.textContent = list.filter(p => (p.status || 'Active').toLowerCase() === 'active').length;
  statViews.textContent  = list.reduce((sum, p) => sum + (p.enquiries || 0), 0);
}

async function loadProperties() {
  try {
    const res  = await fetch(`${API_BASE}/property/all`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Couldn't load your properties.");
    renderProperties(data.properties || data || []);
  } catch (err) {
    skeletonGrid.style.display = 'none';
    renderProperties([]);
    console.error(err);
  }
}

loadProperties();

// Modal open/close
const overlay = document.getElementById('overlay');
function openModal() {
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  document.getElementById('propertyForm').reset();
  document.getElementById('modalStatus').className = 'modal-status';
  document.getElementById('imagePreviews').innerHTML = '';
  document.getElementById('imagePreviews').style.display = 'none';
  editingId = null;
  document.querySelector('.modal-head h3').textContent = 'Add a property';
  document.querySelector('.modal-head p').textContent  = 'This goes straight onto SmartNest — buyers see it as soon as you save.';
  document.getElementById('saveLabel').textContent     = 'Save property';
}
document.getElementById('openModalBtn').addEventListener('click', openModal);
document.getElementById('emptyAddBtn').addEventListener('click', openModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('show')) closeModal(); });

// Image preview
document.getElementById('pimages').addEventListener('change', function () {
  const container = document.getElementById('imagePreviews');
  container.innerHTML = '';
  const files = Array.from(this.files).slice(0, 8);
  if (files.length === 0) { container.style.display = 'none'; return; }
  container.style.display = 'grid';
  files.forEach((file, idx) => {
    const url  = URL.createObjectURL(file);
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;border:1.5px solid var(--paper-dim);background:#f0ede5;';
    wrap.innerHTML = `<img src="${url}" alt="preview ${idx+1}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
      ${idx === 0 ? '<span style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:9px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:.04em;text-shadow:0 1px 3px rgba(0,0,0,.5);">PRIMARY</span>' : ''}`;
    container.appendChild(wrap);
  });
});

// Form submit
const propertyForm = document.getElementById('propertyForm');
const saveBtn      = document.getElementById('saveBtn');
const saveLabel    = document.getElementById('saveLabel');
const modalStatus  = document.getElementById('modalStatus');

propertyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  modalStatus.className = 'modal-status';

  const payload = {
    title:       document.getElementById('ptitle').value.trim(),
    price:       Number(document.getElementById('pprice').value),
    location:    document.getElementById('plocation').value.trim(),
    bedrooms:    Number(document.getElementById('pbedrooms').value) || 0,
    area:        Number(document.getElementById('parea').value) || 0,
    description: document.getElementById('pdesc').value.trim()
  };

  if (!payload.title || !payload.price || !payload.location) {
    modalStatus.textContent = "Title, price, and location are required.";
    modalStatus.className = 'modal-status show error';
    return;
  }

  saveBtn.disabled = true;
  saveLabel.textContent = "Saving…";

  try {
    const url    = editingId ? `${API_BASE}/property/${editingId}` : `${API_BASE}/property/add`;
    const method = editingId ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('title',       payload.title);
    formData.append('price',       payload.price);
    formData.append('location',    payload.location);
    formData.append('bedrooms',    payload.bedrooms);
    formData.append('area',        payload.area);
    formData.append('description', payload.description);
    Array.from(document.getElementById('pimages').files).slice(0, 8).forEach(f => formData.append('images', f));

    const res  = await fetch(url, { method, headers: { "Authorization": `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Couldn't save the property.");

    closeModal();
    loadProperties();
    showToast(editingId ? 'Property updated!' : 'Property listed!', 'success');
  } catch (err) {
    modalStatus.textContent = err.message;
    modalStatus.className   = 'modal-status show error';
    showToast(err.message, 'error');
  } finally {
    saveBtn.disabled      = false;
    saveLabel.textContent = editingId ? "Update property" : "Save property";
  }
});

// Delete
async function deleteProperty(id, cardEl) {
  if (!confirm("Remove this property from SmartNest?")) return;
  try {
    const res = await fetch(`${API_BASE}/property/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Couldn't delete this property.");
    }
    showToast('Property removed', 'info');
    cardEl.style.transition = 'opacity .25s ease, transform .25s ease';
    cardEl.style.opacity    = '0';
    cardEl.style.transform  = 'scale(.95)';
    setTimeout(() => { cardEl.remove(); loadProperties(); }, 220);
  } catch (err) {
    showToast(err.message, 'error');
  }
}
