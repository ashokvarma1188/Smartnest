const API_BASE = "https://smartnest-2zw0.onrender.com/api";

const btn       = document.getElementById("chatbot-btn");
const window_   = document.getElementById("chatbot-window");
const closeBtn  = document.getElementById("cb-close");
const messages  = document.getElementById("cb-messages");
const input     = document.getElementById("cb-input");
const sendBtn   = document.getElementById("cb-send");
const dot       = document.getElementById("chatbot-dot");

// show dot on load to attract attention
setTimeout(() => { if (dot) dot.style.display = "block"; }, 2000);

btn.addEventListener("click", () => {
  window_.classList.toggle("open");
  if (dot) dot.style.display = "none";
  if (window_.classList.contains("open")) input.focus();
});

closeBtn.addEventListener("click", () => window_.classList.remove("open"));

// quick suggestion chips
document.querySelectorAll(".cb-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent;
    sendMessage();
  });
});

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = `cb-msg ${type}`;
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return msg;
}

function showTyping() {
  const t = document.createElement("div");
  t.className = "cb-typing";
  t.id = "cb-typing";
  t.innerHTML = "<span></span><span></span><span></span>";
  messages.appendChild(t);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById("cb-typing");
  if (t) t.remove();
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addMessage(text, "user");
  showTyping();
  sendBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    hideTyping();

    if (data.success) {
      addMessage(data.reply, "bot");
    } else {
      addMessage("Sorry, something went wrong. Please try again.", "bot");
    }
  } catch {
    hideTyping();
    addMessage("Cannot connect right now. Please try again later.", "bot");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}
