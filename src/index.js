const path= require('path')
const http = require('http')
const express = require('express')
const socketio= require('socket.io')
const Filter = require('bad-words')
const {generatemessage,generatelocationmessage} = require('./utils/messages')
const {getuser,adduser,removeuser,getinroom} = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const PORT =process.env.PORT ||3000

 
io.on('connection',(socket)=>{

  
    
    socket.on('join',(options,callback)=>{
        const user= adduser({id:socket.id,...options})
        
       
       if(user.error)
       {
          return callback(user.error)
       }
        
        socket.join(user.room)
        socket.emit('message',generatemessage(user.username,'welcome to the server'))
        socket.broadcast.to(user.room).emit('message',generatemessage(user.username,user.username+' has joined the chat'))
        io.to(user.room).emit('roomdata',{
            room:user.room,
            users: getinroom(user.room)
        })

callback()
    })
    socket.on('sendmsg',(msg,callback)=>{
        const user=getuser(socket.id)
     const filter = new Filter()
     if(filter.isProfane(msg))
     return callback('no profanity')

        io.to(user.room).emit('message',generatemessage(user.username,msg))
        callback()
    })
    socket.on('disconnect',()=>{
        const user =removeuser(socket.id)
        if(user){
        io.to(user.room).emit('message',generatemessage(user.username,user.username+' has left the chat'))
        io.to(user.room).emit('roomdata',{
            room:user.room,
            users: getinroom(user.room)
        })
    }
    })
    socket.on('myloc',(loc,callback)=>{
        const user=getuser(socket.id)
        io.to(user.room).emit('location-message',  generatelocationmessage(user.username,`https://google.com/maps?q=${loc.latitude},${loc.longitude}`))
        callback()
    })
})

const publicpath= path.join(__dirname,'../public')
app.use(express.static(publicpath))

server.listen(PORT,()=>{
    console.log('up on port : '+PORT)
})
