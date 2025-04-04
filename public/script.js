const gameLog = document.getElementById("game-log");
const input = document.getElementById("player-input");
const button = document.getElementById("submit-action");

button.addEventListener("click", submitAction);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitAction();
});

async function submitAction() {
  const input = document.getElementById("player-input");
  const action = input.value.trim();
  const gameLog = document.getElementById("game-log");

  if (!action) return;

  gameLog.innerHTML += `<p><strong>Player:</strong> ${action}</p>`;
  input.value = "";

  try {
    const response = await fetch("/ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: action }),
    });

    const data = await response.json();
    gameLog.innerHTML += `<p><strong>AI DM:</strong> ${data.reply}</p>`;
  } catch (err) {
    gameLog.innerHTML += `<p><strong>AI DM:</strong> ⚠️ No response from the Dungeon Master.</p>`;
  }

  // 🌀 Auto-scroll to the bottom of the chat
  gameLog.scrollTop = gameLog.scrollHeight;
}

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${text}`;
  gameLog.appendChild(div);
  gameLog.scrollTop = gameLog.scrollHeight;
}
