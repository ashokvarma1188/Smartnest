const API_BASE = "https://smartnest-2zw0.onrender.com/api";

let currentEmail = "";
let timerInterval = null;
const OTP_SECONDS = 600;

function showStatus(id, msg, kind) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = "status show " + kind;
}
function hideStatus(id) {
  document.getElementById(id).className = "status";
}

function goToStep(n) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + n).classList.add("active");

  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById("dot" + i);
    dot.classList.remove("active", "done");
    if (i < n)  dot.classList.add("done"),   dot.innerHTML = "✓";
    if (i === n) dot.classList.add("active"), dot.textContent = i;
    if (i > n)  dot.textContent = i;
  }
  for (let i = 1; i <= 2; i++) {
    const b = document.getElementById("bridge" + i);
    b.classList.toggle("done", i < n);
  }
}

document.getElementById("togglePw").addEventListener("click", () => {
  const inp = document.getElementById("newPassword");
  const btn = document.getElementById("togglePw");
  inp.type = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "password" ? "SHOW" : "HIDE";
});

const otpBoxes = Array.from(document.querySelectorAll(".otp-box"));

otpBoxes.forEach((box, i) => {
  box.addEventListener("input", (e) => {
    const val = e.target.value.replace(/\D/g, "");
    e.target.value = val ? val[0] : "";
    e.target.classList.toggle("filled", !!e.target.value);
    if (val && i < 5) otpBoxes[i + 1].focus();
  });

  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !box.value && i > 0) {
      otpBoxes[i - 1].value = "";
      otpBoxes[i - 1].classList.remove("filled");
      otpBoxes[i - 1].focus();
    }
  });

  box.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
    pasted.split("").slice(0, 6).forEach((ch, idx) => {
      if (otpBoxes[idx]) {
        otpBoxes[idx].value = ch;
        otpBoxes[idx].classList.add("filled");
      }
    });
    otpBoxes[Math.min(pasted.length, 5)].focus();
  });
});

function getOtpValue() {
  return otpBoxes.map(b => b.value).join("");
}

function clearOtpBoxes() {
  otpBoxes.forEach(b => { b.value = ""; b.classList.remove("filled"); });
  otpBoxes[0].focus();
}

function startTimer() {
  clearInterval(timerInterval);
  let remaining = OTP_SECONDS;
  const bar  = document.getElementById("timerBar");
  const text = document.getElementById("timerText");
  const resendBtn = document.getElementById("resendBtn");
  resendBtn.classList.remove("show");
  bar.classList.remove("expiring");
  text.classList.remove("expiring");
  bar.style.width = "100%";

  timerInterval = setInterval(() => {
    remaining--;
    const pct = (remaining / OTP_SECONDS) * 100;
    bar.style.width = pct + "%";

    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    text.textContent = m + ":" + String(s).padStart(2, "0");

    if (remaining <= 60) {
      bar.classList.add("expiring");
      text.classList.add("expiring");
    }

    if (remaining <= 0) {
      clearInterval(timerInterval);
      text.textContent = "Expired";
      resendBtn.classList.add("show");
    }
  }, 1000);
}

function showOtpSuccess(onDone) {
  const overlay = document.getElementById("otpSuccessOverlay");
  const circle  = document.getElementById("checkCircle");
  const rings   = document.getElementById("successRings");
  const title   = document.getElementById("successTitle");
  const sub     = document.getElementById("successSub");
  const badge   = document.getElementById("verifiedBadge");

  overlay.classList.add("show");

  setTimeout(() => {
    circle.classList.add("show");
    rings.classList.add("animate");
  }, 80);

  setTimeout(() => title.classList.add("show"), 500);
  setTimeout(() => sub.classList.add("show"),   680);
  setTimeout(() => badge.classList.add("show"),  900);

  setTimeout(() => {
    overlay.classList.remove("show");
    circle.classList.remove("show");
    rings.classList.remove("animate");
    title.classList.remove("show");
    sub.classList.remove("show");
    badge.classList.remove("show");
    onDone();
  }, 2200);
}

document.getElementById("step1Form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus("step1Status");
  const email = document.getElementById("email").value.trim();

  if (!email) { showStatus("step1Status", "Please enter your email.", "error"); return; }

  const btn = document.getElementById("step1Btn");
  const lbl = document.getElementById("step1Label");
  btn.disabled = true;
  lbl.textContent = "Sending…";

  try {
    const res  = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong.");

    currentEmail = email;
    document.getElementById("emailDisplay").textContent = email;
    goToStep(2);
    startTimer();
    otpBoxes[0].focus();

  } catch (err) {
    showStatus("step1Status", err.message, "error");
  } finally {
    btn.disabled = false;
    lbl.textContent = "Send OTP";
  }
});

document.getElementById("step2Btn").addEventListener("click", async () => {
  hideStatus("step2Status");
  const otp = getOtpValue();

  if (otp.length < 6) {
    showStatus("step2Status", "Please enter all 6 digits.", "error"); return;
  }

  const btn = document.getElementById("step2Btn");
  const lbl = document.getElementById("step2Label");
  btn.disabled = true;
  lbl.textContent = "Verifying…";

  try {
    const res  = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, otp })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong.");

    clearInterval(timerInterval);

    showOtpSuccess(() => {
      goToStep(3);
      hideStatus("step2Status");
    });

  } catch (err) {
    showStatus("step2Status", err.message, "error");
    clearOtpBoxes();
  } finally {
    btn.disabled = false;
    lbl.textContent = "Verify OTP";
  }
});

document.getElementById("resendBtn").addEventListener("click", async () => {
  hideStatus("step2Status");
  clearOtpBoxes();
  document.getElementById("resendBtn").classList.remove("show");

  try {
    const res  = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not resend OTP.");
    startTimer();
    showStatus("step2Status", "New OTP sent to your email.", "ok");
  } catch (err) {
    showStatus("step2Status", err.message, "error");
  }
});

document.getElementById("step3Form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus("step3Status");

  const newPassword     = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!newPassword || !confirmPassword) {
    showStatus("step3Status", "Please fill in both fields.", "error"); return;
  }
  if (newPassword.length < 6) {
    showStatus("step3Status", "Password must be at least 6 characters.", "error"); return;
  }
  if (newPassword !== confirmPassword) {
    showStatus("step3Status", "Passwords do not match.", "error"); return;
  }

  const btn = document.getElementById("step3Btn");
  const lbl = document.getElementById("step3Label");
  btn.disabled = true;
  lbl.textContent = "Updating…";

  try {
    const res  = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, newPassword })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong.");

    showStatus("step3Status", "Password updated! Redirecting to login…", "ok");
    setTimeout(() => window.location.href = "login.html", 2000);

  } catch (err) {
    showStatus("step3Status", err.message, "error");
  } finally {
    btn.disabled = false;
    lbl.textContent = "Update Password";
  }
});
