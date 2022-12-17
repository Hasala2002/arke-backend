const express = require('express');

const app = express();

const server = require('http').Server(app)
// const io = require('socket.io')(server)

const io = require('socket.io')(server, {cors: {origin: "*"}});
const {v4: uuidv4 } = require('uuid')
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server,{
    debug: true
})
const cors = require('cors')

app.use(cors())
app.use('/peerjs',peerServer)


// Set up a route to handle incoming requests
app.get('/', (req, res) => {
  // Send a response to the client
  res.send('Hello, World!');
});

io.on('connection',socket=>{

    // console.log("someone connected")

    socket.on('join-room', (roomId, userData) => {
        socket.join(roomId)
        // console.log(roomId,userData)
        io.to(roomId).emit('user-connected')

        socket.on('send-message',(messageData)=>{
            // console.log(messageData)
            io.to(roomId).emit('receive-message',messageData)
        })
    })

    socket.on('disconnect', () => {
        // socket.to(roomId).emit('user-disconnected', userId, uname)
        // console.log("someone disconnected")
      })
})

// Start the server on a specific port
server.listen(process.env.PORT||3000, ()=> {
    console.log('Server started successfully at PORT 3000!')
  })