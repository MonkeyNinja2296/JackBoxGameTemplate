const socket = io()
const prompts = ["You have 6 words or less to make a group of people mad", "You are a fast food worker, and an angry customor is demanding a _____", "A stupid saying that only idiots say","What are some horrible names for a pet?", "You are selling a hole puncher door-to-door, what do you say to angry customors", "You are a teacher, and you need to name a student", "Last words before you spontainiously combust"];
let letters =["a","b","c","d","e","f","g","h","i","j","k","l","m","o","p","q","r",
"s","t","u","v","w","x","y","z"];
let isHost = false;
let isClient = false;

let onMobile = false;


let round = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let hostButton;
let currentRoomCode = "";
let inputCode;
let nameInput;
let sprites = [];
let timer = -1;
let setTimer = 80;

let currentPrompt = -1;

class player{
  constructor(name, id, score){
    this.name = name;
    this.id = id;
    this.score = score
  }
}
me = new player("Player",-1,0)
let spriteOrder = [];
let spritesToDraw = [];
let responce = [];


async function setup() {
  filter(BLUR, -100)
  createCanvas(window.innerWidth, window.innerHeight);
  background(153);
  textSize(40)
  let video;

  text("Loading...", width/2, height/2)
  createHostButton();
  createInputCode();
  createNameInput();
  sprites = ['Sprites/DiamondPickaxe.png',
             'Sprites/New Piskel (2).gif','Sprites/New Piskel (3).gif','Sprites/New Piskel (4).gif','Sprites/New Piskel (39).png','Sprites/New Piskel (40).png','Sprites/New Piskel (41).png', 'Sprites/New Piskel (42).png'];
  let temp = [];
  for(let i = 0; i < sprites.length; i++){
    temp.push(i)
  }
  for(let i = 0; i < temp.length; i++){
    console.log(temp + "   " + spriteOrder)
    let randomNumber = random(0,temp.length);
    spriteOrder.push(temp.splice(randomNumber,1)[0]);
    i--;
  }
}

let txt;
let topText;
let tutorialDone = false;
let tutorialStarted = false;

let playerOne = {text:""};
let playerTwo = {text:""};


async function draw(){
  //background(153);
  let w = width
  let h = height
  textSize(20)

  if(isHost){

    rect(0,0,w,h)
    if(votingTime){
      textSize(20)
      if(currentPrompt != -1){
        text(currentPrompts[currentPrompt].text,width/2,100);
      }
      if(playerOne){
        text(playerOne.text,width/3,200);
        text(playerTwo.text,width/1.5,200);
      }
    }
    for(let i = 0; i < players.length; i++){
      //sprites[spriteOrder[i]].style('pagespeed_no_transform')
      if(spritesToDraw[i] == null && i < sprites.length){
        spritesToDraw[i] = createElement('img').style('image-rendering', 'pixelated').position(w/4,i * h/8 +25).size(50,50)
          spritesToDraw[i].elt.src = sprites[spriteOrder[i]];
      }
      textAlign(LEFT);
      text(i+1 + ". " + players[i].name,spritesToDraw[i].x, spritesToDraw[i].y);
    }
    //Un-comment if you want this to be a drawing game 
    /*for(let j = 0; j < curInput.length; j++){
      for(let i = 0; i < curInput[j].length; i++){
        line(curInput[j][i].a.x/5 + (width/8)*j,curInput[j][i].a.y/5,
             curInput[j][i].b.x/5 + (width/8)*j,curInput[j][i].b.y/5)
      }
    }*/

    if(tutorialStarted == false && theGameHasBegun){
      video = createVideo('Videos/example.mp4').size(w,h).position(0,0).onended(() => {
        video.remove();
        tutorialDone = true;
        socket.emit("begin game",currentRoomCode)
      });
      video.play()
      tutorialStarted = true;
    }
    if(timer > 0){
      text(Math.round(timer) + " ",25,25)
      timer -= deltaTime/1000;
      if(curInput.length == players.length && !votingTime){
        let everyOneSubbmitted = true
        for(let i = 0; i < curInput.length; i++){
          if(!curInput[i]){
            everyOneSubbmitted = false;
            break;
          }
        }
        if(everyOneSubbmitted){
          timer = 0;
        }
      }
    }
    if(Math.round(timer) == 0 && !votingTime){
      console.log("")
      
      // end of round
      socket.emit("end round",currentRoomCode)
      timer = -10;
    } else if(Math.round(timer) == 0 && votingTime && curInput.length > 0){
      timer = 20;
      if(currentPrompt != -1){
        socket.emit("score", currentRoomCode,playerOne.Pid,p1Votes)
        socket.emit("score", currentRoomCode,playerTwo.Pid,p2Votes)
      }

      currentPrompt++;

      if(currentPrompt >= players.length){
        curInput = []
        votingTime = false;
        currentPrompt = -1;
        socket.emit("begin game",currentRoomCode)
        timer = setTimer;
      } else {
        let p1 = null;
        let p2;
        for(let i = 0; i < curInput.length; i++){
          console.log(i);
          if(curInput[i][0].id == currentPrompt){
            if(p1 == null){
              p1 = curInput[i][0];
            } else {
              p2 = curInput[i][0];
            }
          }

          if(curInput[i][1].id == currentPrompt){
            if(p1 == null){
              p1 = curInput[i][1];
            } else {
              p2 = curInput[i][1];
            }
          }
        }
        console.log(p1)
        playerOne = p1;
        playerTwo = p2;
        socket.emit("Vote",currentRoomCode,p1,p2)
      }

    }
  } else {
    rect(width/2-415/2,height/2-720/2,415,720)
  } 



  textAlign(CENTER);
  textSize(50)
  text(txt, width/2-415/2, height/2, 415, 720)
  if(!isHost){
    if(currentPrompts.length > 0){
      topText = currentPrompts[0].text;
    } else {
      topText = "";
    }
  }
  textSize(20)
  text(topText, width/2-415/2, 50, 415)

  if(!onMobile && touches.length > 0){
    onMobile = true;
  }

  strokeWeight(10);
  if(mouseIsPressed){
    stroke('red');
    line(mouseX,mouseY,prevMouseX,prevMouseY)
    //uncomment below if you want it to be a drawing game
    //responce.push({a:{x:mouseX,y:mouseY},b:{x:prevMouseX,y:prevMouseY}})
  }
  strokeWeight(1);
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function createHostButton(){
  hostButton = createButton('Host');
  hostButton.size(100, 50);
  hostButton.position(width/2 - 50, height/2 - 100);
  hostButton.mousePressed(() => {
    let code = "" + random(letters) + random(letters) + random(letters) + random(letters) + random(letters);
    isHost = true;

    socket.emit("make room",code);
    txt = code;
    removeElements(hostButton)
  });
}
let submitButton;

function createSubmitButton(){
    submitButton = createButton('SUBMIT');
    submitButton.size(100, 50);
    submitButton.position(width/2 - 50, height/2 + 100);
    submitButton.mousePressed(() => {

    if(currentPrompts.length > 0){

      responce.push({text:responceInput.value(),id:currentPrompts[0].id,Pid:me.id})
      currentPrompts.splice(0,1);
      responceInput.value("");
    } if(currentPrompts.length == 0) {
      socket.emit("save",responce,currentRoomCode, me.id);
      removeElements()
    }
  });
}

let startButton;
function createStartButton(){
      startButton = createButton('Start');
      startButton.size(100, 50);
      startButton.position(width/2 - 50, height/2 + 100);
      startButton.mousePressed(() => {


    socket.emit("Start",currentRoomCode);
    removeElements()
  });
}

let responceInput;
function createInputResponce(){
    responceInput = createInput('')
    responceInput.size(200, 50);
    responceInput.position(width/2 - 100, height/2 - 100);
    responceInput.elt.placeholder = 'EX: Why did the chicken cross the road? Because his name was gary!';
    responceInput.input(() => {
    //responce = responceInput.value();
    //removeElements();
  })
}
function createInputCode(){
  inputCode = createInput('')
  inputCode.size(100, 50);
  inputCode.position(width/2 - 50, height/2);
  inputCode.elt.placeholder = 'EX: XXXXX';
  inputCode.changed(() => {
    socket.emit("join room", inputCode.value().toLowerCase(),me);
    //removeElements();
  })
}
function createNameInput(){
    nameInput = createInput('')
    nameInput.size(100, 50);
    nameInput.position(width/2 - 50, height/2 - 200);
    nameInput.elt.placeholder = 'EX: NAME';
  nameInput.changed(() => {
    me.name = nameInput.value();
    //removeElements();
  })
}
let votingTime = false;
function voteBegin(){
  votingTime = true;
  timer = 0;
  //socket.emit("vote begin",currentRoomCode);

}




socket.on("room code", function(number){
  currentRoomCode = number;
})
socket.on("room not found", function(number) {
  console.log("Room not found")
})
socket.on("id", function(number) {
  console.log(number)
  me.id = number;
  removeElements()
  //createSubmitButton()
  if(me.id == 0){
    createStartButton()
    txt = "Start the game when ready";
  }
})
let players = [];
socket.on("Player info", function(info ){

  players = info;
})
let curInput = [];
socket.on("thing", function(input,id){
  console.log("Got input")
  curInput[id] = input;
  spritesToDraw[id].position(spritesToDraw[id].x, height/2)


})
let theGameHasBegun = false;
socket.on("start", function(){
  theGameHasBegun = true;
  if(!isHost){
    removeElements()
    txt = "Wait for tutorial";
  }
})
let currentPrompts = []
socket.on("round start", function(){
  round += 1;
  txt = "";
  if(!isHost){ 
    //topText = "Say a funny";
    responce = [];
    removeElements();

    createSubmitButton()
    createInputResponce()
  }
  if(isHost){
    curInput = [];
    currentPrompts = [];
    for(let i = 0; i < spritesToDraw.length; i++){
      spritesToDraw[i].position(width/players.length * i,height-150)
    }
    timer = setTimer;
    let playerTimes = []
    for(let i = 0; i < players.length; i++){
      playerTimes[i] = 0;
    }
    for(let i = 0; i < players.length; i++){
      console.log(playerTimes)
      let prompt = {text:random(prompts),id:i,player1:0,player2:0}
      let p1 = Math.floor(random(0,players.length));
      let p2 = Math.floor(random(0,players.length));
      while(p2 == p1){
        p2 = Math.floor(random(0,players.length));
      }
      if(playerTimes[p2] == 2 || playerTimes[p1] == 2){
        i--;
        console.log(i)
        continue;
      }
      playerTimes[p1] += 1
      playerTimes[p2] += 1
      prompt.player1 = p1;
      prompt.player2 = p2;
      currentPrompts.push(prompt);
      socket.emit("prompt",prompt,currentRoomCode)



    }

  }
})
socket.on("end round", function(){
  if(!isHost){
    console.log("end round")
    while(responce.length < 2){
    responce.push({text:responceInput.value(),id:currentPrompts[0].id,Pid:me.id});
      currentPrompts.splice(0,1);
    }
    socket.emit("save",responce,currentRoomCode, me.id);
    topText = "";
    currentPrompts = [];
    txt = "Wait for voting to begin (or put into the game)"
    removeElements()
  } else {
    voteBegin()
  }

})

socket.on("prompt", function(prompt){
  if(prompt.player1 == me.id || prompt.player2 == me.id){
    currentPrompts.push(prompt);
  }
})
let voteButton1
let voteButton2
let votedBefore = 0;

socket.on("vote", function(p1,p2){
  if(!isHost){
    removeElements();
    voteButton1 = createButton(p1.text).position(0,height/4).size(width,100).mousePressed(() =>{
        socket.emit("vote",currentRoomCode,1,me.id,votedBefore);
      votedBefore = 1;
      });
    voteButton2 = createButton(p2.text).position(0,height/4 + 105).size(width,100).mousePressed(() =>{

      socket.emit("vote",currentRoomCode,2,me.id,votedBefore);
      votedBefore = 2;
    });
  }
})

let p1Votes = 0;
let p2Votes = 0;
let playersWhoVoted = [];

socket.on("playerVoted", function(player,id,prevVote){
  if(playersWhoVoted.includes(id)){
    console.log(prevVote)
    if(prevVote == 1){
      p1Votes--;
    } else {
      p2Votes--;
    }
  } else {
    playersWhoVoted.push(id)
  }
  if(player == 1){
    p1Votes++;
    spritesToDraw[id].position(0, height/8 * id + 25)
  } else {
    p2Votes++;
    spritesToDraw[id].position(width/1.2, height/8 * id + 25)
  }

})

socket.on("playerScore", function(id, score){
  if(me.id == id){
    me.score += score*1000;
  }

})

setInterval(function (){
  if(!isHost){
    socket.emit("player information", currentRoomCode,me)
  }
}, 1000)