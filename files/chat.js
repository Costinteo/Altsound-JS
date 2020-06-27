
const colorPicker = document.getElementById("pickcolor");

colorPicker.addEventListener("change", function(event) {
    let msg = {
        action: "changecolor",
        color: event.target.value
    }
    socket.send(JSON.stringify(msg));
})

let input = document.getElementById("msg");

input.addEventListener("keyup", function(event) {
    if (event.code === 'Enter') {
        event.preventDefault();
        if (event.target.value.trim().length === 0)
            return;
        let msg = {
            action: "send",
            text: event.target.value
        }
        socket.send(JSON.stringify(msg));
        event.target.value = "";
    }
});

const socket = new WebSocket("ws://localhost:3000");

socket.onmessage = function(event) {
    let msg = JSON.parse(event.data);
    if (msg.action === 'send') {
        addMessage(msg.text, msg.username, msg.color);
    } else if (msg.action === 'changecolor') {
        console.log("s-a schimbat o culoare");
        let divs = document.getElementById("chat-log").children
        for (let i = 0; i < divs.length; i++) {
            if (divs[i].dataset.sender === msg.username) {
                divs[i].style.color = msg.color;
            }
        }
    } else if (msg.action === 'getusers') {
        let list = document.getElementById("userlist").children
        for (let i = 0; i < list.length; i++) {
            list[i].remove();
        }
        for (let u of msg.users) {
            let newDiv = document.createElement("div");
            let newContent = document.createTextNode(u);
            newDiv.appendChild(newContent);
            document.getElementById("userlist").appendChild(newDiv);
        }
    }

}
socket.onopen = function () {
    let msg = {
        action: 'changecolor',
        color: document.getElementById("pickcolor").value
    }
    socket.send(JSON.stringify(msg))
}

socket.onclose = function(event) {
    console.error(event.code, event.reason);
}

function pad(a){
    if (a < 10) {
        return '0' + a
    }
    return a;
}

function addMessage(text, sender, color = 'black') {
    let newDiv = document.createElement("div");
    let date = new Date();
    let newContent = document.createTextNode('[' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + '] ' + sender + ': ' + text);
    newDiv.appendChild(newContent);
    let currentDiv = document.getElementById("chat-log");
    currentDiv.appendChild(newDiv);
    newDiv.dataset.sender = sender;
    newDiv.style.color = color;
}

function addEmoji(emoji) {
    document.getElementById("msg").value += String.fromCodePoint(emoji);
}

function getUsers() {
    let list = document.getElementById('userlist');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
}
