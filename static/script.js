document.getElementById("send").addEventListener("click", sendMessage);
document.getElementById("input").addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

async function sendMessage() {
    const input = document.getElementById("input");
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    showTyping(true);

    const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    showTyping(false);
    addMessage(data.reply, "bot");
}

function addMessage(text, sender) {
    const messages = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "message " + sender;
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping(show) {
    document.getElementById("typing").style.display = show ? "flex" : "none";
}
