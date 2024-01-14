const socket = io()
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

class player{
  constructor(name, id, score){
    this.name = name;
    this.id = id;
    this.score = score
  }
}
me = new player("Player",-1,0)
let spriteOrder = [];
let spritesToDraw = [null,null,null,null,null,null,null,null,null,null,null,null,null];
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
async function draw(){
  //background(153);
  let w = width
  let h = height
  textSize(20)

  if(isHost){

    rect(0,0,w,h)
    for(let i = 0; i < players.length; i++){
      //sprites[spriteOrder[i]].style('pagespeed_no_transform')
      if(spritesToDraw[i] == null && i < sprites.length){
        spritesToDraw[i] = createElement('img').style('image-rendering', 'pixelated').position(w/4,i * h/8 +25).size(50,50).elt.src = sprites[spriteOrder[i]];
      }

      text(i+1 + ". " + players[i].name,w/4 + 25, i * h/8 +15);
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
    }
    if(Math.round(timer) == 0){
      // end of round
      socket.emit("end round",currentRoomCode)
      timer = -1;
    }
  } else {
    rect(width/2-415/2,height/2-720/2,415,720)
  }
  
   
  
  textAlign(CENTER);
  textSize(50)
  text(txt, width/2-415/2, height/2, 415, 720)
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
    

    socket.emit("save",responce,currentRoomCode, me.id);
    removeElements()
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
    responceInput.changed(() => {
    responce = responceInput.value();
    //removeElements();
  })
}
function createInputCode(){
  inputCode = createInput('')
  inputCode.size(100, 50);
  inputCode.position(width/2 - 50, height/2);
  inputCode.elt.placeholder = 'EX: XXXXX';
  inputCode.changed(() => {
    socket.emit("join room", inputCode.value(),me);
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
  
  
})
let theGameHasBegun = false;
socket.on("start", function(){
  theGameHasBegun = true;
  if(!isHost){
    removeElements()
    txt = "Wait for tutorial";
  }
})
socket.on("round start", function(){
  round += 1;
  if(!isHost){ 
    topText = "Say a funny";
    txt = "";
    createSubmitButton()
    createInputResponce()
  }
  if(isHost){
    timer = setTimer;
  }
})
socket.on("end round", function(){
  if(!isHost){
    console.log("end round")
    socket.emit("save",responce,currentRoomCode, me.id);
    topText = "";
    txt = "Wait for voting to begin (or put into the game)"
  }
})