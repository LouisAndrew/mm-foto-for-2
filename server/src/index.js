const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  socket.on("message", (event) => {
    io.emit("message", event);
  });
});

const PORT = 4000;

http.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
