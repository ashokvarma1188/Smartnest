const API = "https://smartnest-2zw0.onrender.com/api";
const API_ROOT = "https://smartnest-2zw0.onrender.com";

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=900&h=600&fit=crop&q=80',
];

function getPlaceholder(id) {
  const seed = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PLACEHOLDER_IMAGES[seed % PLACEHOLDER_IMAGES.length];
}
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
      <img src="${getPlaceholder(p._id)}" alt="${p.title}" class="active"
        style="width:100%;height:100%;object-fit:cover;"
        onerror="this.onerror=null;this.src='${getPlaceholder(p._id)}'"/>
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

function showContactModal(p) {
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
}

function setupContact(p) {
  const btn  = document.getElementById('contactBtn');
  const note = document.getElementById('loginNote');

  if (!token) {
    btn.style.display = 'none';
    note.style.display = 'block';
    return;
  }

  // Determine if the logged-in user is this property's owner
  const ownerId = p.owner && (p.owner._id || p.owner);
  const isOwner = me && ownerId && ownerId.toString() === me._id;

  if (isOwner) {
    btn.textContent    = 'This is your listing';
    btn.disabled       = true;
    btn.style.opacity  = '0.55';
    btn.style.cursor   = 'not-allowed';
    return;
  }

  // Buyer / other user — primary: chat, secondary: view contact
  btn.textContent = 'Chat with Owner';
  btn.addEventListener('click', () => openChat(p));

  const secondaryBtn = document.createElement('button');
  secondaryBtn.className = 'contact-btn-main';
  secondaryBtn.style.cssText = 'background:transparent;border:1.5px solid var(--paper-dim);color:var(--text-dark);';
  secondaryBtn.textContent = 'View Contact Details';
  secondaryBtn.addEventListener('click', () => showContactModal(p));
  btn.insertAdjacentElement('afterend', secondaryBtn);
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

// ── Real-time Chat ──
let socket = null;
let convId  = null;

function initSocket() {
  if (socket) return;
  socket = io('https://smartnest-2zw0.onrender.com', { transports: ['websocket', 'polling'] });
  socket.on('receive_message', (msg) => {
    // Only render if the message came from the OTHER person (not echoed from ourselves)
    const senderId = msg.sender && (msg.sender._id || msg.sender);
    if (me && senderId && senderId.toString() === me._id) return;
    appendBubble(msg);
  });
}

function openChat(p) {
  const ownerName = (p.owner && p.owner.name) ? p.owner.name : 'Owner';
  document.getElementById('chatOwnerName').textContent = ownerName;
  document.getElementById('chatPropName').textContent  = p.title || 'Property';
  document.getElementById('chatAvatar').textContent    = ownerName[0].toUpperCase();
  document.getElementById('chatMessages').innerHTML    = '<div class="chat-loading">Loading messages…</div>';
  document.getElementById('chatOverlay').classList.add('show');

  fetch(`${API}/conversations/property/${p._id}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(r => r.json())
  .then(data => {
    if (!data.success) { chatLoadError(); return; }
    convId = data.conversation._id;
    initSocket();
    socket.emit('join_conversation', convId);
    renderChatMessages(data.conversation.messages || []);
  })
  .catch(() => chatLoadError());
}

function chatLoadError() {
  document.getElementById('chatMessages').innerHTML = '<div class="chat-loading">Could not load chat. Please try again.</div>';
}

function bubbleHtml(m) {
  const senderId = m.sender && (m.sender._id || m.sender);
  const isMine   = me && senderId && senderId.toString() === me._id;
  const time     = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  return `<div class="chat-bubble ${isMine ? 'mine' : 'theirs'}">${m.text}<div class="chat-bubble-meta">${time}</div></div>`;
}

function renderChatMessages(msgs) {
  const box = document.getElementById('chatMessages');
  if (!msgs.length) {
    box.innerHTML = '<div class="chat-empty">No messages yet — say hello!</div>';
    return;
  }
  box.innerHTML = msgs.map(m => bubbleHtml(m)).join('');
  box.scrollTop = box.scrollHeight;
}

function appendBubble(m) {
  const box   = document.getElementById('chatMessages');
  const empty = box.querySelector('.chat-empty');
  if (empty) empty.remove();
  box.insertAdjacentHTML('beforeend', bubbleHtml(m));
  box.scrollTop = box.scrollHeight;
}

async function sendChatMessage() {
  if (!convId || !token) return;
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;
  input.value    = '';
  input.disabled = true;

  try {
    const res  = await fetch(`${API}/conversations/${convId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.success) {
      appendBubble(data.message);
      socket.emit('send_message', { conversationId: convId, message: data.message });
    } else {
      showToast('Message not sent', 'error');
    }
  } catch {
    showToast('Failed to send message', 'error');
  } finally {
    input.disabled = false;
    input.focus();
  }
}

document.getElementById('chatClose').addEventListener('click', () => {
  document.getElementById('chatOverlay').classList.remove('show');
});
document.getElementById('chatOverlay').addEventListener('click', e => {
  if (e.target.id === 'chatOverlay') document.getElementById('chatOverlay').classList.remove('show');
});
document.getElementById('chatSend').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendChatMessage();
});
