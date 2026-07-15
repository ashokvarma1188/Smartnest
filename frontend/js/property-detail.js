const API = "https://smartnest-2zw0.onrender.com/api";
const API_ROOT = "https://smartnest-2zw0.onrender.com";
const token   = localStorage.getItem('smartnest_token')  || sessionStorage.getItem('smartnest_token');
const userRaw = localStorage.getItem('smartnest_user')   || sessionStorage.getItem('smartnest_user');
const me      = userRaw ? JSON.parse(userRaw) : null;

const id = new URLSearchParams(location.search).get('id');
if (!id) { document.getElementById('pageContent').innerHTML = '<div class="loading-state">No property ID found. <a href="browse-properties.html">Go back</a></div>'; }

let currentProp = null;
let galIdx = 0;
let images = [];

function renderPage(p) {
  currentProp = p;
  images = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);

  const galHtml = images.length ? `
    <div class="gal-main" id="galMain">
      ${images.map((img, i) => `<img src="${API_ROOT}${img}" alt="${p.title}" loading="lazy" class="${i===0?'active':''}" data-idx="${i}"/>`).join('')}
      ${images.length > 1 ? `<button class="gal-arrow gal-prev" id="galPrev">&#8249;</button><button class="gal-arrow gal-next" id="galNext">&#8250;</button>` : ''}
      ${images.length > 1 ? `<div class="gal-counter" id="galCounter">1 / ${images.length}</div>` : ''}
    </div>
    ${images.length > 1 ? `<div class="gal-thumbs">${images.map((img,i) => `<img class="gal-thumb ${i===0?'active':''}" src="${API_ROOT}${img}" data-idx="${i}" alt=""/>`).join('')}</div>` : ''}
  ` : `
    <div class="gal-main">
      <div class="no-img"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><path d="M3 11L12 4l9 7M5 10v10h14V10"/></svg></div>
    </div>
  `;

  const statsHtml = `
    <div class="stats-row">
      <div class="stat-box"><div class="sv">${p.bedrooms || '—'}</div><div class="sl">Bedrooms</div></div>
      <div class="stat-box"><div class="sv">${p.bathrooms || '—'}</div><div class="sl">Bathrooms</div></div>
      <div class="stat-box"><div class="sv">${p.area ? p.area + ' sqft' : '—'}</div><div class="sl">Area</div></div>
      <div class="stat-box"><div class="sv">Active</div><div class="sl">Status</div></div>
    </div>`;

  document.getElementById('pageContent').innerHTML = `
    <div class="gallery">${galHtml}</div>
    <div class="detail-layout">
      <div class="detail-main">
        <div class="prop-header">
          <div class="prop-badge">Active Listing</div>
          <div class="prop-title">${p.title || 'Untitled Property'}</div>
          <div class="prop-loc">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
            ${p.location || 'Location not set'}
          </div>
        </div>
        ${statsHtml}
        <div class="desc-section">
          <div class="sec-label">Description</div>
          <div class="desc-text ${!p.description?'empty':''}">${p.description || 'No description provided by the owner.'}</div>
        </div>
      </div>
      <div class="sidebar">
        <div class="price-card">
          <div class="price-label">Listed price</div>
          <div class="price-val">₹${Number(p.price||0).toLocaleString('en-IN')}</div>
          <div class="price-note">Direct from owner — no brokerage</div>
        </div>
        <div class="contact-card">
          <h3>Interested?</h3>
          <p>Contact the owner directly — no broker, no commission.</p>
          <button class="contact-btn-main" id="contactBtn">Get Owner's Contact</button>
          <p class="login-note" id="loginNote" style="display:none;">
            <a href="login.html">Log in</a> to see contact details.
          </p>
        </div>
      </div>
    </div>
  `;

  document.title = `SmartNest — ${p.title || 'Property'}`;
  setupGallery();
  setupContact(p);
}

function setupGallery() {
  if (images.length <= 1) return;
  const imgs = document.querySelectorAll('.gal-main img');
  const thumbs = document.querySelectorAll('.gal-thumb');
  const counter = document.getElementById('galCounter');

  function goTo(idx) {
    imgs.forEach(i => i.classList.remove('active'));
    thumbs.forEach(t => t.classList.remove('active'));
    galIdx = (idx + images.length) % images.length;
    imgs[galIdx].classList.add('active');
    if (thumbs[galIdx]) thumbs[galIdx].classList.add('active');
    if (counter) counter.textContent = (galIdx+1) + ' / ' + images.length;
  }

  document.getElementById('galPrev').addEventListener('click', () => goTo(galIdx - 1));
  document.getElementById('galNext').addEventListener('click', () => goTo(galIdx + 1));
  thumbs.forEach(t => t.addEventListener('click', () => goTo(Number(t.dataset.idx))));
}

function setupContact(p) {
  const btn = document.getElementById('contactBtn');
  const note = document.getElementById('loginNote');
  if (!token) {
    btn.style.display = 'none';
    note.style.display = 'block';
    return;
  }
  btn.addEventListener('click', () => {
    const owner = p.owner || {};
    document.getElementById('modalRows').innerHTML = `
      <div class="modal-row">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <div><div class="mrow-lbl">Property</div><div class="mrow-val">${p.title || 'N/A'}</div></div>
      </div>
      <div class="modal-row">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <div><div class="mrow-lbl">Owner</div><div class="mrow-val">${owner.name || 'Owner'}</div></div>
      </div>
      <div class="modal-row">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <div><div class="mrow-lbl">Email</div><div class="mrow-val">${owner.email || 'Not available'}</div></div>
      </div>`;
    document.getElementById('overlay').classList.add('show');
  });
}

document.getElementById('closeModal').addEventListener('click', () => document.getElementById('overlay').classList.remove('show'));
document.getElementById('overlay').addEventListener('click', e => { if (e.target.id === 'overlay') document.getElementById('overlay').classList.remove('show'); });

if (id) {
  fetch(API + '/property/' + id)
    .then(r => r.json())
    .then(data => {
      if (data.success && data.property) renderPage(data.property);
      else document.getElementById('pageContent').innerHTML = '<div class="loading-state">Property not found. <a href="browse-properties.html" style="color:var(--brass);">Go back</a></div>';
    })
    .catch(() => {
      document.getElementById('pageContent').innerHTML = '<div class="loading-state">Could not load property. <a href="browse-properties.html" style="color:var(--brass);">Go back</a></div>';
    });
}
