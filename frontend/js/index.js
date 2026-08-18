const API = "https://smartnest-2zw0.onrender.com/api";

// ── Hero background slideshow ──
const REEL_IMGS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1600&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&h=900&fit=crop&q=85',
];
(function initReel() {
  const slides = document.querySelectorAll('.reel-slide');
  slides.forEach((s, i) => { s.style.backgroundImage = `url('${REEL_IMGS[i]}')`; });
  slides[0].classList.add('active');
  let cur = 0;
  setInterval(() => {
    slides[cur].classList.remove('active');
    cur = (cur + 1) % slides.length;
    // Force animation restart on the incoming slide
    slides[cur].style.animation = 'none';
    slides[cur].offsetHeight; // reflow
    slides[cur].style.animation = '';
    slides[cur].classList.add('active');
  }, 5500);
})();

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

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&h=400&fit=crop&q=80',
];
function getPlaceholder(id) {
  const seed = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PLACEHOLDER_IMAGES[seed % PLACEHOLDER_IMAGES.length];
}

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
      const pid = p._id;
      const imgUrl = p.image ? API.replace('/api','') + p.image : getPlaceholder(pid);
      const chips = [
        p.bedrooms ? '🛏 ' + p.bedrooms + ' Bed' : '',
        p.area ? '📐 ' + p.area + ' sq.ft' : ''
      ].filter(Boolean);
      return `<a class="prop-card reveal" style="transition-delay:${i*0.1}s" href="property-detail.html?id=${p._id}">
        <div class="prop-media">
          <img src="${imgUrl}" alt="${p.title}" loading="lazy" onerror="this.onerror=null;this.src='${getPlaceholder(pid)}'"/>
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
