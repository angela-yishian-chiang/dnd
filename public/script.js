async function submitAction() {
  const input = document.getElementById("player-input");
  const action = input.value.trim();
  const gameLog = document.getElementById("game-log");

  if (!action) return;

  // Add player message
  gameLog.innerHTML += `<p><strong>Player:</strong> ${action}</p>`;
  gameLog.scrollTop = gameLog.scrollHeight;
  input.value = "";

  try {
    const response = await fetch("/ask-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: action }),
    });

    const data = await response.json();
    console.log("🟢 Response from server:", data);

    const reply = data.reply || "⚠️ No response from the Dungeon Master.";
    gameLog.innerHTML += `<p><strong>AI DM:</strong> ${reply}</p>`;
    gameLog.scrollTop = gameLog.scrollHeight;
  } catch (error) {
    console.error("🔴 Fetch error:", error);
    gameLog.innerHTML += `<p><strong>AI DM:</strong> ⚠️ Network error.</p>`;
    gameLog.scrollTop = gameLog.scrollHeight;
  }
}

window.onload = () => {
  const gameLog = document.getElementById("game-log");
  setTimeout(() => {
    gameLog.innerHTML += `<p><strong>AI DM:</strong> 🧙‍♂️ Welcome, traveler. Are you ready to embark on a perilous adventure?</p>`;
    gameLog.scrollTop = gameLog.scrollHeight;
  }, 500); // half a second delay
};


