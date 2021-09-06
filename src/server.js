import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res)=> res.render("home"));
app.get("/*", (_, res)=> res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const sockets = [];

const handleConnection = (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous"
  console.log("connected to browser");
  socket.on("close", ()=> console.log("disconnect server"));
  socket.on("message", (message) => {
    const jsMessage = JSON.parse(message);
    console.log(jsMessage);
    switch (jsMessage.type) { 
      case "new_message":
        console.log("mesa")
        sockets.forEach(aSocket => aSocket.send(
          `${socket.nickname}: ${jsMessage.payload}`
        ));
        break;
      case "nickname":
        socket["nickname"] = jsMessage.payload;
        console.log(jsMessage.payload);
        break;
    }
  });
}
wss.on("connection", handleConnection)

server.listen(3000, handleListen);

