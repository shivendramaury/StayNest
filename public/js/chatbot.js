const toggle = document.getElementById("chatToggle");
const windowBox = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendMessage");
const input = document.getElementById("chatInput");
const messages = document.getElementById("chatMessages");

toggle.addEventListener("click", ()=>{
    windowBox.classList.toggle("d-none");
});

function addMessage(text, sender) {
    const div = document.createElement("div");

    div.className = sender === "user" ? "userMessage" : "botMessage";

    div.innerHTML = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
    const message = input.value.trim();

    if(!message) return;

    addMessage(message, "user");

    input.value = "";

    addMessage("Typing...", "bot");

    try{
        const response = await fetch("/chat", {
            method: "POST",

            headers: {
                "Content-Type" : "application/json"
            },

            body: JSON.stringify({
                message
            })
        });

        const data = await response.json();

        messages.lastChild.remove();

        addMessage(data.reply, "bot");
    }

    catch(err) {
        messages.lastChild.remove();

        addMessage("Sorry, something went wrong.", "bot");
    }
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", function (e) {
    if(e.key === "Enter") {
        sendMessage();
    }
});