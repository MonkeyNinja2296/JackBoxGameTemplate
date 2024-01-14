// some imports

const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const port = 3000;

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

// uses static site from /public
app.use(express.static("public"));

let number;
let timesUpdated = 0
let roomCodes = [];
let rooms = [];




function dothething(){
  timesUpdated += 1


}



setInterval(function (){
  for(let i = 0; i < roomCodes.length; i++){
    io.in(roomCodes[i] + " host").emit("Player info",rooms[i].players)
  }
}, 1000)

io.on("connect", function(socket) {
  socket.on("disconnect", () => {
    console.log(socket.id); // undefined
  });


  // Will this work?
  socket.on("join room", function(code, player){

    if(roomCodes.includes(code)){
      socket.join(code);

      for(let i = 0; i < rooms.length; i++){
        if(rooms[i].code == code){
          player.id = rooms[i].players.length;
          rooms[i].players.push(player)
          socket.emit("id", player.id)
        }
      }
      io.in(code).emit("room code", code);
      //socket.emit()
    } else {
      socket.emit("room not found");
    }

  })
  socket.on("make room", async function(code){


    console.log("Make room with code: " + code)
    await socket.join(code);
    socket.join(code + " host")
    roomCodes.push(code)
    rooms.push(new room(socket,code))



    io.in(code).emit("room code", code);
    
  })
  socket.on("save", function(input, code, id){
    console.log(code)
    io.in(code + " host").emit("thing", input, id)
  })
  socket.on("Start", function(code){
    io.in(code).emit("start");
  })
  socket.on("begin game", function(code){
    io.in(code).emit("round start");
  })
  socket.on("end round", function(code){
    io.in(code).emit("end round");
  })

})


server.listen(port, function() {

  console.log("🟢 " + port);
});

let posi = []


class room{
  constructor(host, code, players = []){
    this.players = players;
    this.host = host;
    this.code = code
  }
}
class player{
  constructor(name, id, score){
    this.name = name;
    this.id = id;
    this.score = score;
  }  
}