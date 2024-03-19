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



setInterval(function(){
  for(let i = 0; i < rooms.length; i++){
    for(let j = 0; j < rooms[i].players.length; j++){
      rooms[i].players[j].timeTillKill -= 1;
      if(rooms[i].players[j].timeTillKill <= 0 && !rooms[i].gameStarted){
        rooms[i].players.splice(j,1)
        io.in(rooms[i].code).emit("changeID",j);
      }
    }
  }
}, 1000)

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
  socket.on("save", function(input, code, id, prompts, isGood){
    console.log(code)
    io.in(code + " host").emit("input", input, id, prompts, isGood)
  })

  socket.on("can reconect", function(person,code){
    console.log(code)
    for(let i = 0; i < rooms.length; i++){
      if(rooms[i].code == code){
        socket.emit("reconect")
        socket.join(code);
        break;
      }
    }
  })
  socket.on("prompt", function(prompt,code){
    io.in(code).emit("prompt", prompt)
  })
  socket.on("influence", function(code,input,arr){
    io.in(code).emit("influence", input,arr)
  })
  socket.on("skip", function(code){
    io.in(code).emit("skip")
  })
  socket.on("end game", function(code){
    for(let i = 0; i < rooms.length; i++){
      if(rooms[i].code == code){
        rooms.splice(i,1);
        roomCodes.splice(i,1);


      }
    }
    for(let i = 0; i < roomCodes.length; i++){
      if(roomCodes == code){
        roomCodes.splice(i,1);

        break;
      }
    }
  })
  socket.on("Start", function(code){
    for(let i = 0; i < rooms.length; i++){
      if(rooms[i].code == code){
        rooms[i].gameStarted = true;
      }
    }
    io.in(code).emit("start");
  })
  socket.on("begin game", function(code){
    io.in(code).emit("round start");
  })
  socket.on("end round", function(code){
    io.in(code).emit("end round");
  });
  socket.on("Vote", function(code,p1,p2){
    io.in(code).emit("vote", p1, p2)
  });
  socket.on("vote", function(code,num,id,vote){
    io.in(code + " host").emit("playerVoted", num, id,vote);
  })
  socket.on("score", function(code,id,score){
    io.in(code).emit("playerScore", id, score);
  })
  socket.on("show score", function(code){
    io.in(code).emit("score time");
  })
  socket.on("Y'all should save", function(code){
    io.in(code).emit("save now");
  })
  socket.on("player information", function(code, player){
    for(let i = 0; i < rooms.length; i++){
      if(rooms[i].code == code){
        rooms[i].players[player.id] = player;
      }
    }
  })

})


server.listen(port, function() {

  console.log("🟢 " + port);
});

let posi = []


class room{
  constructor(host, code, players = [], gameStarted = false){
    this.players = players;
    this.host = host;
    this.code = code
    this.gameStarted = gameStarted;
  }
}
class player{
  constructor(name, id, score, timeTillKill){
    this.name = name;
    this.id = id;
    this.score = score;
    this.timeTillKill = 10;

  }  
}