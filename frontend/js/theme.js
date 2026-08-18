// Apply saved theme immediately to prevent flash of wrong theme
(function () {
  const saved = localStorage.getItem('smartnest_theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

// ── Gold scroll progress bar (all pages) ──
(function () {
  const bar = document.createElement('div');
  bar.id = 'snScrollBar';
  bar.style.cssText = [
    'position:fixed','top:0','left:0','height:3px','width:0',
    'background:linear-gradient(90deg,#C98A35,#E8B45A,#C98A35)',
    'background-size:200% 100%',
    'z-index:99999','pointer-events:none',
    'transition:width .08s linear',
    'animation:scrollBarShimmer 2s linear infinite',
  ].join(';');
  const style = document.createElement('style');
  style.textContent = '@keyframes scrollBarShimmer{0%{background-position:0% 0}100%{background-position:200% 0}}';
  document.head.appendChild(style);
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(bar);
    window.addEventListener('scroll', function () {
      const h = document.documentElement;
      const pct = (h.scrollTop || window.scrollY) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  });
})();

// ── Global scroll-reveal observer (all pages) ──
document.addEventListener('DOMContentLoaded', function () {
  const SELECTORS = '.reveal,.reveal-left,.reveal-right,.reveal-blur,.reveal-scale,.reveal-fall';
  const els = document.querySelectorAll(SELECTORS);
  if (!els.length) return;
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function(el) { obs.observe(el); });
});

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function syncBtn() {
    btn.textContent = isDark() ? '☀' : '🌙';
    btn.title = isDark() ? 'Switch to light mode' : 'Switch to dark mode';
  }

  syncBtn();

  btn.addEventListener('click', function () {
    if (isDark()) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('smartnest_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('smartnest_theme', 'dark');
    }
    syncBtn();
  });
});
