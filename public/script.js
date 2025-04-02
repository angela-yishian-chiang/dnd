const gameLog = document.getElementById("game-log");
const input = document.getElementById("player-input");
const button = document.getElementById("submit-action");

button.addEventListener("click", submitAction);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitAction();
});

async function submitAction() {
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Player", message);
  input.value = "";

  try {
    const res = await fetch("/ask-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    appendMessage("AI DM", data.reply);
  } catch (err) {
    console.error("Fetch error:", err);
    appendMessage("AI DM", "❌ Network error.");
  }
}

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${text}`;
  gameLog.appendChild(div);
  gameLog.scrollTop = gameLog.scrollHeight;
}
