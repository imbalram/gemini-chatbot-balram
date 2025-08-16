// --- DOM refs
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const typingEl = document.getElementById("typing");
const themeToggle = document.getElementById("theme-toggle");

// --- Events
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// --- Helpers
function scrollToBottom(){
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addBubble(markdown, who = "bot"){
  const bubble = document.createElement("div");
  bubble.className = `bubble ${who}`;

  const meta = document.createElement("div");
  meta.className = "meta";

  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = who === "user" ? "🧑" : "🤖";

  const time = document.createElement("span");
  time.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

  meta.appendChild(avatar);
  meta.appendChild(time);

  const content = document.createElement("div");
  content.className = "content";

  // Render markdown safely
  const dirty = marked.parse(markdown || "", { breaks: true });
  const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
  content.innerHTML = clean;

  // Add copy buttons to code blocks
  content.querySelectorAll("pre code").forEach(code => {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 1200);
      } catch (_) {}
    });
    code.parentElement.insertBefore(btn, code);
  });

  // Highlight code blocks
  content.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block));

  bubble.appendChild(meta);
  bubble.appendChild(content);
  messagesEl.appendChild(bubble);
  scrollToBottom();
}

function showTyping(show){
  typingEl.style.display = show ? "flex" : "none";
  if (show) scrollToBottom();
}

// --- Send flow
async function sendMessage(){
  const msg = inputEl.value.trim();
  if (!msg) return;

  addBubble(msg, "user");
  inputEl.value = "";
  showTyping(true);

  try{
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    showTyping(false);

    addBubble(typeof data.reply === "string" ? data.reply : "⚠️ No reply.", "bot");
  }catch(err){
    showTyping(false);
    addBubble("⚠️ Error connecting to server.", "bot");
  }
}

// --- Greet on load
addBubble("**Hi! I’m Balram’s AI.**\n\nAsk me anything, or try:\n- `Who developed you?`\n- `Give me 3 tips to learn Python`\n- `Explain OAuth in 5 bullet points`", "bot");
