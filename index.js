import express from "express";
const app = express();

import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export const client = {
  user: process.env.pocketbase_user,
  password: process.env.pocketbase_password,
};

import http from "http";
import https from "https";

import { Server } from "socket.io";

import cors from "cors";

// import PocketBase from 'pocketbase'
import console from "console";

let rooms = [];

// const pb = new PocketBase('http://arkeapi.tech:8090');

// const authData = await pb.admins.authWithPassword(client.user, client.password);

// console.log(pb.authStore.isValid);

app.use(cors());

// const httpsOptions = {
//   key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
// };

// const server = https.createServer(httpsOptions,app);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://arke.vercel.app",
      "https://app.arkechat.live",
    ],
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello World! This is Arkē</h1>");
});

io.on("connection", (socket) => {
  socket.on("check-if-room-exists", async (roomId) => {
    let index = rooms.findIndex((obj) => obj.roomId === roomId);

    if (index !== -1) {
      const { roomName, participants } = rooms[index];
      socket.emit("room-data", { roomName, participants });
    } else {
      console.log(rooms, roomId);
    }
  });

  socket.on("join-room", async (roomId, userData) => {
    socket.join(roomId);

    const { roomName, newRoom } = userData;

    if (newRoom) {
      // const newRecord = await pb.collection('rooms').create({
      //   roomId: roomId,
      //   roomName: roomName,
      //   participants: 1
      // });

      rooms.push({
        roomId: roomId,
        roomName: roomName,
        participants: 1,
      });

      console.log(rooms);
    } else {
      // const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
      // const {id} = record

      // const updateRecord = await pb.collection('rooms').update(id,{
      //   roomId: roomId,
      //   roomName: roomName,
      //   participants: io.sockets.adapter.rooms.get(roomId).size
      // })

      let index = rooms.findIndex((obj) => obj.roomId === roomId);

      if (index !== -1) {
        rooms[index] = {
          ...rooms[index],
          ...{
            roomId: roomId,
            roomName: roomName,
            participants: io.sockets.adapter.rooms.get(roomId).size,
          },
        };
      }

      io.to(roomId).emit(
        "update-room-count",
        io.sockets.adapter.rooms.get(roomId).size
      );
      // console.log(io.sockets.adapter.rooms.get(roomId).size)
    }

    io.to(roomId).emit("user-connected");

    socket.on("send-message", (messageData) => {
      // console.log(messageData)
      io.to(roomId).emit("receive-message", messageData);
    });

    socket.on("leave-room", async (roomId) => {
      socket.leave(roomId);
      if (io.sockets.adapter.rooms.get(roomId)) {
        // const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
        // const {id} = record

        // const updateRecord = await pb.collection('rooms').update(id,{
        //   roomId: roomId,
        //   roomName: roomName,
        //   participants: io.sockets.adapter.rooms.get(roomId).size
        // })

        let index = rooms.findIndex((obj) => obj.roomId === roomId);

        if (index !== -1) {
          rooms[index] = {
            ...rooms[index],
            ...{
              roomId: roomId,
              roomName: roomName,
              participants: io.sockets.adapter.rooms.get(roomId).size,
            },
          };
        }

        io.to(roomId).emit(
          "update-room-count",
          io.sockets.adapter.rooms.get(roomId).size
        );
      } else {
        // const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
        // const {id} = record
        // const deleteRecord = await pb.collection('rooms').delete(id)
      }
    });

    socket.on("disconnect", async () => {
      if (io.sockets.adapter.rooms.get(roomId)) {
        // const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
        // const {id} = record

        // const updateRecord = await pb.collection('rooms').update(id,{
        //   roomId: roomId,
        //   roomName: roomName,
        //   participants: io.sockets.adapter.rooms.get(roomId).size
        // })

        let index = rooms.findIndex((obj) => obj.roomId === roomId);

        if (index !== -1) {
          rooms[index] = {
            ...rooms[index],
            ...{
              roomId: roomId,
              roomName: roomName,
              participants: io.sockets.adapter.rooms.get(roomId).size,
            },
          };
        }

        io.to(roomId).emit(
          "update-room-count",
          io.sockets.adapter.rooms.get(roomId).size
        );
      } else {
        try {
          // const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
          // const {id} = record

          let index = rooms.findIndex((obj) => obj.roomId === roomId);

          if (index !== -1) {
            rooms.splice(index, 1);
          }

          // const deleteRecord = await pb.collection('rooms').delete(id)
        } catch (error) {
          if (error.data.code === 404) {
            console.log("Room already deleted!");
          }
        }
      }
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Socket.io server listening on port ${process.env.PORT || 3000}`);
});
