// Apply saved theme immediately to prevent flash of wrong theme
(function () {
  const saved = localStorage.getItem('smartnest_theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

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
