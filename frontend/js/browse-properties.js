const API_BASE = "https://smartnest-2zw0.onrender.com/api";

const token   = localStorage.getItem('smartnest_token')  || sessionStorage.getItem('smartnest_token');
const userRaw = localStorage.getItem('smartnest_user')   || sessionStorage.getItem('smartnest_user');
const user    = userRaw ? JSON.parse(userRaw) : null;

if (!token || !user) { window.location.href = "login.html"; }

document.getElementById('userName').textContent      = user.name || "User";
document.getElementById('avatarInitial').textContent = (user.name || "U").charAt(0).toUpperCase();
if (user.role === 'owner') document.getElementById('roleBadge').textContent = 'Owner';

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear(); sessionStorage.clear();
  window.location.href = "login.html";
});

// Favorites
const FAV_KEY = 'smartnest_favorites';
function getFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; } }
function saveFavs(arr) { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }
function isFav(id) { return getFavs().includes(String(id)); }
function toggleFav(id) {
  id = String(id);
  const favs = getFavs();
  const idx = favs.indexOf(id);
  if (idx === -1) { favs.push(id); saveFavs(favs); return true; }
  else { favs.splice(idx, 1); saveFavs(favs); return false; }
}

// Build skeletons
(function buildSkeletons() {
  const grid = document.getElementById('skeletonGrid');
  for (let i = 0; i < 6; i++) {
    grid.innerHTML += `
      <div class="skeleton-card">
        <div class="sk sk-media"></div>
        <div class="sk-body">
          <div class="sk sk-line w75"></div>
          <div class="sk sk-line w50"></div>
          <div class="sk sk-line w35"></div>
          <div class="sk-footer">
            <div class="sk sk-price"></div>
            <div class="sk sk-cta"></div>
          </div>
        </div>
      </div>`;
  }
})();

let allProperties = [];
let showFavsOnly  = false;

const houseIcon = () => `<svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="#9FB6C9" stroke-width="1.4"><path d="M3 11 L12 4 L21 11 M5 10 V20 H19 V10"/></svg>`;
const pinSvg    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>`;

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderCards(list) {
  document.getElementById('skeletonGrid').style.display = 'none';
  const grid  = document.getElementById('propGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');

  if (!list || list.length === 0) {
    grid.style.display  = 'none';
    empty.style.display = 'block';
    count.textContent   = 'No properties found';
    if (showFavsOnly) {
      document.getElementById('emptyTitle').textContent = 'No saved properties';
      document.getElementById('emptyDesc').textContent  = 'Click the heart icon on a card to save properties here.';
      document.getElementById('emptyCta').textContent   = 'Browse all';
    } else {
      document.getElementById('emptyTitle').textContent = 'No properties found';
      document.getElementById('emptyDesc').textContent  = 'Try adjusting your filters or search terms.';
      document.getElementById('emptyCta').textContent   = 'Clear filters';
    }
    return;
  }

  empty.style.display = 'none';
  grid.style.display  = 'grid';
  grid.innerHTML      = '';
  count.textContent   = `${list.length} propert${list.length === 1 ? 'y' : 'ies'} found`;

  list.forEach((p, i) => {
    const card     = document.createElement('div');
    card.className = 'prop-card';
    card.style.animationDelay = `${i * 0.055}s`;

    const imgSrc = p.images && p.images.length > 0 ? p.images[0] : p.image;
    const imgUrl = imgSrc ? `https://smartnest-2zw0.onrender.com${imgSrc}` : null;
    const pid    = p._id;
    const saved  = isFav(pid);

    const chips = [];
    if (p.bedrooms)  chips.push(`🛏 ${p.bedrooms} Bed`);
    if (p.bathrooms) chips.push(`🚿 ${p.bathrooms} Bath`);
    if (p.area)      chips.push(`📐 ${p.area} sq.ft`);

    card.innerHTML = `
      <div class="prop-media">
        ${imgUrl ? `<img src="${imgUrl}" alt="${escHtml(p.title)}" loading="lazy"/>` : houseIcon()}
        <div class="prop-badges">
          <span class="prop-type">Active</span>
          <button class="heart-btn ${saved ? 'saved' : ''}" data-id="${pid}" title="${saved ? 'Remove from saved' : 'Save property'}">
            ${saved ? '♥' : '♡'}
          </button>
        </div>
      </div>
      <div class="prop-body">
        <a href="property-detail.html?id=${pid}" class="prop-link">
          <div class="prop-title">${escHtml(p.title || 'Untitled')}</div>
          <div class="prop-loc">${pinSvg} ${escHtml(p.location || 'Location not set')}</div>
          ${chips.length ? `<div class="prop-chips">${chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : ''}
        </a>
        <div class="prop-footer">
          <div class="prop-price">₹${Number(p.price || 0).toLocaleString('en-IN')}</div>
          <button class="contact-btn" data-pid="${pid}">Contact Owner</button>
        </div>
      </div>`;

    card.querySelector('.heart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const btn   = e.currentTarget;
      const added = toggleFav(pid);
      btn.textContent = added ? '♥' : '♡';
      btn.classList.toggle('saved', added);
      showToast(added ? 'Property saved!' : 'Removed from saved', added ? 'success' : 'info');
      if (showFavsOnly) applyAll();
    });

    card.querySelector('.contact-btn').addEventListener('click', () => openContact(p));
    grid.appendChild(card);
  });
}

async function loadProperties() {
  try {
    const res  = await fetch(`${API_BASE}/property/all`);
    const data = await res.json();
    allProperties = data.properties || data || [];
    applyAll();
  } catch (err) {
    document.getElementById('skeletonGrid').style.display = 'none';
    renderCards([]);
    showToast('Failed to load properties', 'error');
  }
}

loadProperties();

function applyAll() {
  let list = [...allProperties];

  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if (q) list = list.filter(p =>
    (p.title    || '').toLowerCase().includes(q) ||
    (p.location || '').toLowerCase().includes(q)
  );

  const minP = parseFloat(document.getElementById('minPrice').value);
  const maxP = parseFloat(document.getElementById('maxPrice').value);
  if (!isNaN(minP)) list = list.filter(p => Number(p.price) >= minP);
  if (!isNaN(maxP)) list = list.filter(p => Number(p.price) <= maxP);

  const beds = document.getElementById('bedroomFilter').value;
  if (beds === '4')     list = list.filter(p => Number(p.bedrooms) >= 4);
  else if (beds !== '') list = list.filter(p => Number(p.bedrooms) === parseInt(beds));

  if (showFavsOnly) {
    const favs = getFavs();
    list = list.filter(p => favs.includes(String(p._id)));
  }

  renderCards(list);
}

document.getElementById('searchBtn').addEventListener('click', applyAll);
document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') applyAll(); });
document.getElementById('applyFilters').addEventListener('click', applyAll);

document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('bedroomFilter').value = '';
  document.getElementById('searchInput').value = '';
  showFavsOnly = false;
  updateFavBtn();
  applyAll();
  showToast('Filters cleared', 'info');
});

const favToggleBtn = document.getElementById('favToggle');
favToggleBtn.addEventListener('click', () => {
  showFavsOnly = !showFavsOnly;
  updateFavBtn();
  applyAll();
});
function updateFavBtn() {
  favToggleBtn.classList.toggle('active', showFavsOnly);
  favToggleBtn.querySelector('.heart-icon').textContent = showFavsOnly ? '♥' : '♡';
}

document.getElementById('emptyCta').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('clearFilters').click();
});

// Contact modal
const overlay = document.getElementById('overlay');
document.getElementById('closeModal').addEventListener('click', () => overlay.classList.remove('show'));
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });

function openContact(p) {
  document.getElementById('contactDetails').innerHTML = `
    <div class="detail-item">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <div><div class="detail-label">Property</div><div class="detail-value">${escHtml(p.title || 'N/A')}</div></div>
    </div>
    <div class="detail-item">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
      <div><div class="detail-label">Location</div><div class="detail-value">${escHtml(p.location || 'N/A')}</div></div>
    </div>
    <div class="detail-item">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <div><div class="detail-label">Price</div><div class="detail-value">₹${Number(p.price || 0).toLocaleString('en-IN')}</div></div>
    </div>
    <div class="detail-item">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <div><div class="detail-label">Owner Name</div><div class="detail-value">${escHtml(p.owner?.name || 'Not available')}</div></div>
    </div>
    <div class="detail-item">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <div><div class="detail-label">Owner Email</div><div class="detail-value">${escHtml(p.owner?.email || 'Not available')}</div></div>
    </div>`;
  document.getElementById('modalDetailLink').href = `property-detail.html?id=${p._id}`;
  overlay.classList.add('show');
}
