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

    //メッセージEvnet
    const messageForm = room.querySelector("#message");
    messageForm.addEventListener("submit", handleMessageSubmit);

    //nicknameEvnet
    const nameForm = room.querySelector("#name");
    nameForm.addEventListener("submit", handleNameSubmit);
  });
  roomName = input.value;
  input.value = "";
});

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#message input");
  const inputVal = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${inputVal}`);
  });
  input.value = "";
}

const handleNameSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

socket.on("welcome", (nickname, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname}さんが参加しました。`);
});

socket.on("bye", (nickname, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname}さんが退場しました。`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});