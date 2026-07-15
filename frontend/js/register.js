const API_BASE = "https://smartnest-2zw0.onrender.com/api";

const form        = document.getElementById('registerForm');
const nameEl      = document.getElementById('name');
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

function showStatus(message, kind){
  statusBox.textContent = message;
  statusBox.className = 'status show ' + kind;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusBox.className = 'status';

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  const roleInput = form.querySelector('input[name="role"]:checked');

  if (!name || !email || !password){
    showStatus("Fill in your name, email, and password to continue.", "error");
    return;
  }
  if (password.length < 6){
    showStatus("Password should be at least 6 characters.", "error");
    return;
  }
  if (!roleInput){
    showStatus("Pick a role — owner or buyer — before registering.", "error");
    return;
  }

  const role = roleInput.value;

  submitBtn.disabled = true;
  submitLabel.textContent = "Creating account…";

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Couldn't create your account. Try again.");
    }

    alert("Registration Successful");
    window.location.href = "login.html";

  } catch (err) {
    showStatus(err.message, "error");
    submitBtn.disabled = false;
    submitLabel.textContent = "Register";
  }
});
