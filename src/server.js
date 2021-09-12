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

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous"

  //すべてのイベントがヒットする。
  socket.onAny((event)  => {
    console.log(event);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
  });

  //Client側でDisconnectされた時、実行される。
  socket.on("disconnecting", () => {
    //rooms：重複データがないリスト　
    socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
  });

  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
    done();
  });

  socket.on("nickname", nickname => socket["nickname"] = nickname);
});


httpServer.listen(3000, handleListen);

