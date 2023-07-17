const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
app.use(cors());

const server = http.createServer(app);

server.listen(3000, () => {
  console.log("server is running on port 3000");
});

//socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//connected
let users = [];
io.on("connection", (socket) => {
  console.log(`user ${socket.id} is connected`);

  //join a room
  socket.on("join_room", (data) => {
    users.push({ ...data, socketID: socket.id }); // Add socketID property to each user
    // send the list of users to all connected clients
    io.emit("newUsers", users);
    socket.join(data.room);
    console.log(`user ${socket.id} joined a room ${data.room}`);
  });

  //send a message
  socket.on("send_message", (data) => {
    console.log(data);
    // socket.emit("receive_message", data)
    socket.to(data.room).emit("receive_message", data);
    console.log(`user: ${data.username} sent a message: ${data.message}`);
  });

  //disconnected
  socket.on("disconnect", () => {
    // Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // Sends the list of users to the client
    io.emit("newUsers", users);
    console.log(`user ${socket.id} is disconnected`);
  });

  // Get the list of active users
  socket.on("getActiveUsers", () => {
    io.emit("newUsers", users);
  });
});
