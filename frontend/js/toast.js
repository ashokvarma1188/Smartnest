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

  // Message notification popup — shows when a new chat message arrives while panel is closed
  const notifCss = `
    .sn-msg-notif {
      position:fixed; bottom:80px; right:24px; z-index:99998;
      background:#0F2236; border:1px solid rgba(201,138,53,0.5);
      border-radius:14px; padding:14px 16px;
      max-width:300px; min-width:220px;
      display:flex; align-items:flex-start; gap:12px;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
      cursor:pointer; pointer-events:all;
      transform:translateX(calc(100% + 40px));
      transition:transform 0.35s cubic-bezier(0.34,1.4,0.64,1), opacity 0.3s;
      opacity:0;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
    }
    .sn-msg-notif.sn-in { transform:translateX(0); opacity:1; }
    .sn-msg-notif:hover { border-color:rgba(201,138,53,0.9); }
    .sn-msg-notif-avatar {
      width:36px; height:36px; border-radius:50%; background:#C98A35;
      display:flex; align-items:center; justify-content:center;
      font-size:15px; font-weight:700; color:#fff; flex-shrink:0;
    }
    .sn-msg-notif-body { flex:1; min-width:0; }
    .sn-msg-notif-label { font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#C98A35; margin-bottom:2px; }
    .sn-msg-notif-name  { font-size:13px; font-weight:700; color:#E8EEF3; margin-bottom:3px; }
    .sn-msg-notif-text  { font-size:12.5px; color:#9FB6C9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sn-msg-notif-close {
      background:none; border:none; color:#9FB6C9; cursor:pointer;
      font-size:14px; padding:0; line-height:1; flex-shrink:0; align-self:flex-start;
      transition:color .15s;
    }
    .sn-msg-notif-close:hover { color:#E8EEF3; }
  `;
  const ns = document.createElement('style');
  ns.textContent = notifCss;
  document.head.appendChild(ns);

  window.showMsgNotification = function(senderName, text, onClick) {
    const existing = document.getElementById('snMsgNotif');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'sn-msg-notif';
    el.id = 'snMsgNotif';
    el.innerHTML =
      '<div class="sn-msg-notif-avatar">' + senderName[0].toUpperCase() + '</div>' +
      '<div class="sn-msg-notif-body">' +
        '<div class="sn-msg-notif-label">New message</div>' +
        '<div class="sn-msg-notif-name">' + senderName + '</div>' +
        '<div class="sn-msg-notif-text">' + text + '</div>' +
      '</div>' +
      '<button class="sn-msg-notif-close" id="snMsgNotifClose">✕</button>';

    document.body.appendChild(el);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { el.classList.add('sn-in'); });
    });

    document.getElementById('snMsgNotifClose').addEventListener('click', function(e) {
      e.stopPropagation();
      el.classList.remove('sn-in');
      setTimeout(function() { el.remove(); }, 350);
    });

    el.addEventListener('click', function() {
      el.classList.remove('sn-in');
      setTimeout(function() { el.remove(); }, 350);
      if (onClick) onClick();
    });

    // Auto-dismiss after 6 seconds
    setTimeout(function() {
      if (el.parentNode) {
        el.classList.remove('sn-in');
        setTimeout(function() { el.remove(); }, 350);
      }
    }, 6000);
  };

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
