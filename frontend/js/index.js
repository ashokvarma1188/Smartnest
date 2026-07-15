const API = "https://smartnest-2zw0.onrender.com/api";

// If already logged in, redirect to dashboard
const token = localStorage.getItem('smartnest_token') || sessionStorage.getItem('smartnest_token');
const userRaw = localStorage.getItem('smartnest_user') || sessionStorage.getItem('smartnest_user');
if (token && userRaw) {
  try {
    const u = JSON.parse(userRaw);
    window.location.href = u.role === 'owner' ? 'add-property.html' : 'browse-properties.html';
  } catch(e) {}
}

// Navbar scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// Number counter animation
function animateCounter(el, target, suffix) {
  let start = 0;
  const duration = 1400;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = document.getElementById('statProps');
      if (el && el.textContent !== '—') {
        const num = parseInt(el.textContent);
        if (!isNaN(num)) animateCounter(el, num, '+');
      }
      statObserver.disconnect();
    }
  });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) statObserver.observe(statsEl);

// Load featured properties
(async function () {
  try {
    const res = await fetch(API + '/property/all');
    const data = await res.json();
    const list = (data.properties || []).slice(0, 3);

    document.getElementById('statProps').textContent = (data.properties || []).length + '+';

    const grid = document.getElementById('featGrid');
    if (!list.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No properties yet — be the first to list!</p>';
      return;
    }

    grid.innerHTML = list.map((p, i) => {
      const imgUrl = p.image ? API.replace('/api','') + p.image : null;
      const chips = [
        p.bedrooms ? '🛏 ' + p.bedrooms + ' Bed' : '',
        p.area ? '📐 ' + p.area + ' sq.ft' : ''
      ].filter(Boolean);
      return `<a class="prop-card reveal" style="transition-delay:${i*0.1}s" href="property-detail.html?id=${p._id}">
        <div class="prop-media">
          ${imgUrl ? `<img src="${imgUrl}" alt="${p.title}" loading="lazy"/>` : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(78,122,156,0.4)" stroke-width="1.4"><path d="M3 11L12 4l9 7M5 10v10h14V10"/></svg>'}
          <span class="prop-badge">Active</span>
        </div>
        <div class="prop-body">
          <div class="prop-title">${p.title || 'Untitled'}</div>
          <div class="prop-loc"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>${p.location || 'Location not set'}</div>
          ${chips.length ? `<div class="prop-chips">${chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div>` : ''}
          <div class="prop-footer">
            <div class="prop-price">₹${Number(p.price||0).toLocaleString('en-IN')}</div>
            <span class="view-btn">View details</span>
          </div>
        </div>
      </a>`;
    }).join('');

    document.querySelectorAll('.prop-card.reveal').forEach(el => observer.observe(el));
  } catch(e) {
    document.getElementById('featGrid').innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Could not load properties.</p>';
  }
})();
