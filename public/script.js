const gameLog = document.getElementById("game-log");

function submitAction() {
  const input = document.querySelector("#player1 input");
  const action = input.value.trim();
  if (!action) return;

  logMessage("Player: " + action);
  input.value = "";

  console.log("Sending action:", action);

  fetch("https://reimagined-goldfish-v6wrqjwwwvwphpxj9-3000.app.github.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Player: " + action })
  })
  .then(res => res.json())
  .then(data => {
    if (data.reply) {
      logMessage("🧠 AI DM: " + data.reply);
    } else {
      logMessage("🛑 AI DM: Error getting response.");
    }
  })
  .catch(err => {
    console.error("Fetch error:", err);
    logMessage("🛑 AI DM: Network error.");
  });
}

function logMessage(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  gameLog.appendChild(p);
  gameLog.scrollTop = gameLog.scrollHeight;
}
