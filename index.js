
import express from 'express'
const app = express();

import * as dotenv from 'dotenv' 
dotenv.config()

export const client = {
  user: process.env.pocketbase_user,
  password: process.env.pocketbase_password,
}

import http from 'http'

import { Server } from 'socket.io'

import cors from 'cors'

import PocketBase from 'pocketbase'
import console from 'console';

const pb = new PocketBase('http://127.0.0.1:8090');

const authData = await pb.admins.authWithPassword(client.user, client.password);

console.log(pb.authStore.isValid);

app.use(cors());

// const httpsOptions = {
//   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
// }

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173','https://arke.vercel.app'],
    methods: ["GET", "POST"],
  },
});
  
app.get('/', (req, res)=>{
  
  res.send("<h1>Hello World! This is Arkē</h1>")

})

  io.on('connection', (socket) => {

    socket.on('check-if-room-exists', async (roomId) => {

      try {
        const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
        const {roomName,participants} = record
        socket.emit('room-data',{roomName,participants}) 
      } catch (error) {
        // console.log(error.data.code)
        if(error.data.code === 404){
          socket.emit('room-404',{code: 404})
        }
      }      

    })

    socket.on('join-room', async (roomId,userData) => {
      socket.join(roomId);

              const {roomName, newRoom  } = userData



              if(newRoom){  
                const newRecord = await pb.collection('rooms').create({
                  roomId: roomId,
                  roomName: roomName,
                  participants: 1
                });
              }else{
                const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
                const {id} = record

                const updateRecord = await pb.collection('rooms').update(id,{
                  roomId: roomId,
                  roomName: roomName,
                  participants: io.sockets.adapter.rooms.get(roomId).size
                })
                io.to(roomId).emit('update-room-count',io.sockets.adapter.rooms.get(roomId).size)
                // console.log(io.sockets.adapter.rooms.get(roomId).size)
              }

              io.to(roomId).emit('user-connected')

              socket.on('send-message',(messageData)=>{
                  // console.log(messageData)
                  io.to(roomId).emit('receive-message',messageData)
              })

              socket.on('disconnect', async ()=>{
                if(io.sockets.adapter.rooms.get(roomId)){
                  const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
                  const {id} = record

                  const updateRecord = await pb.collection('rooms').update(id,{
                    roomId: roomId,
                    roomName: roomName,
                    participants: io.sockets.adapter.rooms.get(roomId).size
                  })

                  io.to(roomId).emit('update-room-count',io.sockets.adapter.rooms.get(roomId).size)

                }else{
                  const record = await pb.collection('rooms').getFirstListItem(`roomId="${roomId}"`)
                  const {id} = record

                  const deleteRecord = await pb.collection('rooms').delete(id)
                }
              })
    });
  });
  
  server.listen(3000, () => {
    console.log('Socket.io server listening on port 3000');
  });