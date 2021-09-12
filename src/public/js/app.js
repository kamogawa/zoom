const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

//socket.io 最後に設定してパラメータが関数の場合、BEからFEの関数が実行できる。
//パラメータの設定は制限なし、
form.addEventListener("submit", (event)=>{
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const form = room.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = room.querySelector("input");
      const inputVal = input.value;
      socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${inputVal}`);
      });
      input.value = "";
    })
  });
  roomName = input.value;
  input.value = "";
});

socket.on("welcome", () => {
  addMessage("参加しました。");
});

socket.on("bye", () => {
  addMessage("退場しました。");
});

socket.on("new_message", addMessage);