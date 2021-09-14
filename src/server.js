import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res)=> res.render("home"));
app.get("/*", (_, res)=> res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}
const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous"

  //すべてのイベントがヒットする。
  socket.onAny((event)  => {
    console.log(event);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  //Client側でDisconnectされた時、実行される。disconnetされる前実行？
  socket.on("disconnecting", () => {
    //rooms：重複データがないリスト　
    socket.rooms.forEach(room => 
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
    done();
  });

  socket.on("nickname", nickname => socket["nickname"] = nickname);
});


httpServer.listen(3000, handleListen);

