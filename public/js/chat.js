
function scrollIfNearBottom() {
  const chatBox = document.getElementById("chat-box");
  const isNearBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 100;

  if (isNearBottom) {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: "smooth"
    });
  }
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");

  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.textContent = "You: " + message;
  chatBox.appendChild(userMessage);
  input.value = "";
  input.style.height = "auto";

  const botMessage = document.createElement("div");
  botMessage.className = "message bot-message";
  botMessage.innerHTML = `<span class="bot-icon">🦖</span><div class="typing-area"></div>`;
  chatBox.appendChild(botMessage);

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    });

    if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);

    const data = await res.json();

    const paragraphs = data.reply.split(/\n\s*\n/);
    const typingArea = botMessage.querySelector(".typing-area");

    for (let para of paragraphs) {
      const paraElem = document.createElement("p");
      typingArea.appendChild(paraElem);

      const chars = para.trim();
      for (let i = 0; i < chars.length; i++) {
        paraElem.innerHTML += (chars[i] === "\n") ? "<br>" : chars[i];
        await new Promise(r => setTimeout(r, 20));
        scrollIfNearBottom();
      }

      await new Promise(r => setTimeout(r, 200));
    }

  } catch (err) {
    console.error("Chat fetch error:", err.message);
    const errorMsg = document.createElement("p");
    errorMsg.innerHTML = "<em>Sorry, I couldn't fetch a response. Please try again.</em>";
    botMessage.querySelector(".typing-area").appendChild(errorMsg);
  }
}
 
const chatInput = document.getElementById("chat-input");

chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (event.shiftKey) {
      event.stopPropagation(); // let newline happen
      return;
    } else {
      event.preventDefault();
      sendMessage();
    }
  }
}); 
chatInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

chatInput.addEventListener("focus", () => {
  const chatBox = document.getElementById("chat-box");
  if (chatBox.innerHTML.trim() === "") {
    const hint = document.createElement("div");
    hint.className = "message bot-message";
    hint.innerHTML = `<span class="bot-icon">🦖</span><div class="typing-area">Ask me anything about travel, destinations, or trip tips! 🌍</div>`;
    chatBox.appendChild(hint);
  }
});

