const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;

let roomName;

//socket.io 最後に設定してパラメータが関数の場合、BEからFEの関数が実行できる。
//パラメータの設定は制限なし、
form.addEventListener("submit", (event)=>{
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`
  });
  roomName = input.value;
  input.value = "";
});