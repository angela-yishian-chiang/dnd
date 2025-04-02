const gameLog = document.getElementById("game-log");
const input = document.getElementById("player-input");
const button = document.getElementById("submit-action");

button.addEventListener("click", submitAction);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitAction();
});

async function submitAction() {
  const input = document.querySelector("input");
  const message = input.value.trim();
  if (!message) return;

  // Add player message to log
  const log = document.getElementById("game-log");
  log.innerHTML += `<p><strong>Player:</strong> ${message}</p>`;
  input.value = "";

  try {
    const response = await fetch("/ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // ✅ Add these logs for debugging
    console.log("Sending message:", message);
    console.log("Received reply:", data);

    const reply = data.reply || "⚠️ No response from the Dungeon Master.";
    log.innerHTML += `<p><strong>AI DM:</strong> ${reply}</p>`;
  } catch (err) {
    console.error("Fetch error:", err);
    log.innerHTML += `<p style="color:red;"><strong>🛑 AI DM:</strong> Network error.</p>`;
  }
}

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${text}`;
  gameLog.appendChild(div);
  gameLog.scrollTop = gameLog.scrollHeight;
}
