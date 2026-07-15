const API_BASE = "https://smartnest-2zw0.onrender.com/api";

const form        = document.getElementById('loginForm');
const emailEl     = document.getElementById('email');
const passwordEl  = document.getElementById('password');
const submitBtn   = document.getElementById('submitBtn');
const submitLabel = document.getElementById('submitLabel');
const statusBox   = document.getElementById('statusBox');
const togglePw    = document.getElementById('togglePw');

togglePw.addEventListener('click', () => {
  const isHidden = passwordEl.type === 'password';
  passwordEl.type = isHidden ? 'text' : 'password';
  togglePw.textContent = isHidden ? 'HIDE' : 'SHOW';
});

function showStatus(message, kind) {
  statusBox.textContent = message;
  statusBox.className = 'status show ' + kind;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusBox.className = 'status';

  const email    = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) {
    showStatus("Enter your email and password to continue.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitLabel.textContent = "Checking…";

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Couldn't log you in. Check your details and try again.");
    }

    const storage = document.getElementById('remember').checked ? localStorage : sessionStorage;
    storage.setItem('smartnest_token', data.token);
    storage.setItem('smartnest_user', JSON.stringify(data.user));

    showStatus("You're in. Redirecting…", "ok");

    setTimeout(() => {
      window.location.href = data.user?.role === 'owner'
        ? 'add-property.html'
        : 'browse-properties.html';
    }, 600);

  } catch (err) {
    showStatus(err.message, "error");
    submitBtn.disabled = false;
    submitLabel.textContent = "Log in";
  }
});
