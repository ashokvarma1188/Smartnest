// SmartNest — shared toast notification system
// Usage: showToast("Property saved!", "success")
// Types: "success" | "error" | "info"
(function () {
  const css = `
    .sn-toast-wrap {
      position: fixed; bottom: 24px; right: 24px;
      z-index: 99999;
      display: flex; flex-direction: column; gap: 8px; align-items: flex-end;
      pointer-events: none;
    }
    .sn-toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 10px;
      font-size: 13.5px; font-weight: 600;
      max-width: 300px; min-width: 200px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.3);
      transform: translateX(calc(100% + 32px));
      transition: transform 0.35s cubic-bezier(0.34,1.4,0.64,1), opacity 0.3s;
      opacity: 0; pointer-events: all;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.4;
    }
    .sn-toast.sn-in { transform: translateX(0); opacity: 1; }
    .sn-toast-success { background:#152B1E; border:1px solid rgba(61,170,106,0.4); color:#6DD694; }
    .sn-toast-error   { background:#2B1515; border:1px solid rgba(192,80,63,0.4);  color:#E08070; }
    .sn-toast-info    { background:#231A0A; border:1px solid rgba(201,138,53,0.4); color:#D4A050; }
    .sn-toast .sn-ti  { font-size:15px; flex-shrink:0; line-height:1; }
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

  const wrap = document.createElement('div');
  wrap.className = 'sn-toast-wrap';
  document.body.appendChild(wrap);

  const ICONS = { success: '✓', error: '✕', info: 'ℹ' };

  window.showToast = function (message, type) {
    type = type || 'success';
    const t = document.createElement('div');
    t.className = 'sn-toast sn-toast-' + type;
    t.innerHTML = '<span class="sn-ti">' + (ICONS[type] || '✓') + '</span><span>' + message + '</span>';
    wrap.appendChild(t);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('sn-in'); });
    });
    setTimeout(function () {
      t.classList.remove('sn-in');
      setTimeout(function () { t.remove(); }, 380);
    }, 3200);
  };
})();
