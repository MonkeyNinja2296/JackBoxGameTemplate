const socket = io()
const prompts = ["You have 6 words or less to make a group of people mad", "You are a fast food worker, and an angry customor is demanding a _____", "A stupid saying that only idiots say", "What are some horrible names for a pet?", "You are selling a hole puncher door-to-door, what do you say to angry customors", "You are a teacher, and you need to name a student", "Last words before you spontainiously combust", "What do you say to your dog in the winter?", "if grimmace walked up to you in an allyway what would you do?", "Breaking news a Florida man ________ in the middle of a walmart", "You invented a new cheese called _____"];
let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "o", "p", "q", "r",
  "s", "t", "u", "v", "w", "x", "y", "z"];
let isHost = false;
let isClient = false;

let onMobile = false;
let lastDraw = false;
let drawSize = 10;
let drawColor = "red";

let undoButton;


let drawSlider;
let drawSliderLastValue = 5;

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

let isInfluencing = false;

let isDisconected = false;

let currentPrompt = -1;


class player {
  constructor(name, id, score, timeTillKill = 10, CP = []) {
    this.name = name;
    this.id = id;
    this.score = score
    this.timeTillKill = timeTillKill;
    this.CP = CP;
  }
}
me = new player("Player", -1, 0)
let tempMe = new player("Player", -1, 0);
let spriteOrder = [];
let spritesToDraw = [];
let response = [];

setInterval(() => {
  resizeCanvas(window.innerWidth, window.innerHeight);
}, 1000)
let cnv
async function setup() {
  filter(BLUR, -100)
  cnv = createCanvas(window.innerWidth, window.innerHeight);
  background(153);
  textSize(40)
  let video;

  text("Loading...", width / 2, height / 2)
  createHostButton();
  createInputCode();
  createNameInput();
  sprites = ['Sprites/DiamondPickaxe.png',
    'Sprites/New Piskel (2).gif', 'Sprites/New Piskel (3).gif', 'Sprites/New Piskel (4).gif', 'Sprites/New Piskel (39).png', 'Sprites/New Piskel (40).png', 'Sprites/New Piskel (41).png', 'Sprites/New Piskel (42).png'];
  let temp = [];
  for (let i = 0; i < sprites.length; i++) {
    temp.push(i)
  }
  for (let i = 0; i < temp.length; i++) {
    console.log(temp + "   " + spriteOrder)
    let randomNumber = random(0, temp.length);
    spriteOrder.push(temp.splice(randomNumber, 1)[0]);
    i--;
  }
  if (getItem("me") != null) {
    tempMe = getItem("me");
    createReconectButton();
  }
}

let txt;
let topText;
let tutorialDone = false;
let tutorialStarted = false;
let percentageOfScoreBar = 0;

let playerOne = [];
let playerTwo = [];


async function draw() {
  //background(153);
  let w = width
  let h = height
  textSize(20)

  if (isHost) {
    
    background('blue')
    fill('black')
    if (votingTime) {
      textSize(20)
      if (currentPrompt != -1) {
        text(currentPrompts[currentPrompt].text, width / 2, 100);
      }
      if (playerOne) {
        
        strokeWeight(drawSize);
        stroke(drawColor);
        for (let i = 0; i < playerOne.length; i++) {
          if (typeof playerOne[i] === 'object') {
            
            if (playerOne[i].a.x == playerOne[i].b.x && playerOne[i].a.y == playerOne[i].b.y) {
              line(playerOne[i].a.x - 150, playerOne[i].a.y, playerOne[i].b.x -149, playerOne[i].b.y + 1)
            }
            line(playerOne[i].a.x - 150, playerOne[i].a.y, playerOne[i].b.x - 150, playerOne[i].b.y)
          } else {

            if (playerOne[i].substring(0, 2) == "sW") {
              strokeWeight(playerOne[i].substring(parseInt(2)))
            } else if(playerOne[i].substring(0,2) == "CC"){
                noErase()
                stroke(playerOne[i].substring(2))
            } else if(playerOne[i] == "erase"){

                erase()
            }
          }
        }
        noErase();
        for (let i = 0; i < playerTwo.length; i++) {
          if (typeof playerTwo[i] === 'object') {

            if (playerTwo[i].a.x == playerTwo[i].b.x && playerTwo[i].a.y == playerTwo[i].b.y) {
              line(playerTwo[i].a.x + 150, playerTwo[i].a.y, playerTwo[i].b.x + 151, playerTwo[i].b.y + 1)
            }
            line(playerTwo[i].a.x + 150, playerTwo[i].a.y, playerTwo[i].b.x + 150, playerTwo[i].b.y)
          } else {

            if (playerTwo[i].substring(0, 2) == "sW") {
              strokeWeight(playerTwo[i].substring(parseInt(2)))
            } else if(playerTwo[i].substring(0,2) == "CC"){
                noErase()
                stroke(playerTwo[i].substring(2))
            } else if(playerTwo[i] == "erase"){

                erase()
            }
          }
        }
        
      }
      noErase()
      
      stroke("black")
      strokeWeight(1)
    }
    for (let i = 0; i < players.length; i++) {
      //sprites[spriteOrder[i]].style('pagespeed_no_transform')
      if (spritesToDraw[i] == null && i < sprites.length) {
        spritesToDraw[i] = createElement('img').style('image-rendering', 'pixelated').position(w / 4, i * h / 8 + 25).size(50, 50)
        spritesToDraw[i].elt.src = sprites[spriteOrder[i]];
      }
      textAlign(LEFT);
      text(i + 1 + ". " + players[i].name, spritesToDraw[i].x, spritesToDraw[i].y);
    }
    

    if (tutorialStarted == false && theGameHasBegun) {
      video = createVideo('Videos/example.mp4').size(w, h).position(0, 0).onended(() => {
        video.remove();
        tutorialDone = true;
        socket.emit("begin game", currentRoomCode)
      });
      video.play()
      tutorialStarted = true;
    }
    if (timer > 0) {
      text(Math.round(timer) + " ", w / 2, 25)
      timer -= deltaTime / 1000;
      if (timer < 0) {
        timer = 0;
      }
      if (curInput.length == players.length && !votingTime) {
        let everyOneSubbmitted = true
        for (let i = 0; i < curInput.length; i++) {
          if (!curInput[i]) {
            everyOneSubbmitted = false;
            break;
          }
        }
        if (everyOneSubbmitted) {
          timer = 0;
        }
      }
    }
    if (scoreTime) {
      if (percentageOfScoreBar < 1) {
        percentageOfScoreBar += .01;
      }
      for (let i = 0; i < players.length; i++) {
        fill("green")
        rect(w / 8 * i, height - players[i].score * percentageOfScoreBar / (20000 / h), 50, players[i].score * percentageOfScoreBar / (20000 / h))
        spritesToDraw[i].position(w / 8 * i, height - players[i].score * percentageOfScoreBar / (20000 / h) - 50)
      }
    }
    if (Math.round(timer) == 0 && !votingTime && !scoreTime && !isInfluencing) {

      isInfluencing = true;
      // end of round
      setTimeout(() => {
        let arrs = [players.length-1];
        for (let i = 0; i < players.length-1; i++){
          arrs.push(i)
        }
        socket.emit("influence", currentRoomCode, curInput,arrs)
        console.log("influence");
        curInput = [];
        
        for (let i = 0; i < spritesToDraw.length; i++) {
          spritesToDraw[i].position(width / players.length * i, height - 150)
        }
      },3000)
      timer = -11;
    }
    else if (Math.round(timer) == 0 && votingTime && curInput.length > 0 && !scoreTime) {

      timer = 20;
      if (currentPrompt != -1) {
        socket.emit("score", currentRoomCode, parseInt(playerOne[playerOne.length-1].substring(2)), p1Votes)
        socket.emit("score", currentRoomCode, parseInt(playerTwo[playerTwo.length-1].substring(2)), p2Votes)
      }

      currentPrompt++;

      if (currentPrompt >= players.length) {
        curInput = []
        votingTime = false;
        currentPrompt = -1;
        socket.emit("show score", currentRoomCode)
        percentageOfScoreBar = 0;
        timer = setTimer;
      } else {
        let p1 = null;
        let p2;
        for (let i = 0; i < curInput.length; i++) {
          console.log(curInput[i]);
          if (curInput[i][0][0].id == currentPrompt) {
            if (p1 == null) {
              p1 = curInput[i][1];
              p2 = [];
              for(let i = 0; i < p1.length; i++){
                if (typeof p1[i] != 'object' && p1[i].substring(0, 2) == "me"){
                  p2.push(p1[i])
                  break;
                } else {
                  p2.push(p1[i])
                }
              }
            } else {
              p2 = curInput[i][1];
            }
          }

          
        }
        console.log(p1)
        playerOne = p1;
        playerTwo = p2;
        socket.emit("Vote", currentRoomCode, p1, p2)
      }

    }
    else if (scoreTime && Math.round(timer) == 0) {
      timer = -11;
      socket.emit("begin game", currentRoomCode)
      curInput = [];
      scoreTime = false;
    } else if(Math.round(timer) == 0 && !votingTime && !scoreTime && isInfluencing){
      isInfluencing = false;
      // end of round
      socket.emit("end round", currentRoomCode)
      timer = -10;
    }
  } else {
    fill("white")
    rect(0, 0, width, height)
  }



  textAlign(CENTER);
  textSize(50)
  text(txt, width / 2 - 415 / 2, height / 2, 415, 720)
  if (!isHost) {
    if (currentPrompts.length > 0) {
      topText = currentPrompts[0].text;
    } else {
      topText = "";
    }
  }
  textSize(20)
  text(topText, width / 2 - 415 / 2, 50, 415)

  if (!onMobile && touches.length > 0) {
    onMobile = true;
  }
  if (isHost || submitButton == null) {
    return;
  }
  cnv.touchStarted(() => {

    lastDraw = false;
    prevMouseX = 0;
    prevMouseY = 0;

  })
  cnv.touchEnded(() => {

    lastDraw = true;
  })

  if (drawSlider) {
    drawSize = drawSlider.value();
    if (drawSize != drawSliderLastValue) {
      response.push("sW" + drawSize)
    } else if (response.length == 0) {
      response.push("sW" + drawSize)
    }
  }
  if (response[response.length - 1] != "END" &&
             typeof response[response.length -1] === 'object' && !mouseIsPressed) {
    response.push("END");
  }
  if (lastDraw) {


  } else {
    

    strokeWeight(drawSize);
    fill(drawColor)
    
    if (mouseIsPressed) {
      stroke(drawColor);
      if (mouseX > w / 2 + 150 || mouseX < w / 2 - 150 || mouseY > h / 2 + 75 || mouseY < h / 2 - 225 || prevMouseX > w / 2 + 150 || prevMouseX < w / 2 - 150 || prevMouseY > h / 2 + 75 || prevMouseY < h / 2 - 225) {
        console.log("No draw")
      } else {

        line(mouseX, mouseY, prevMouseX, prevMouseY)
        //uncomment below if you want it to be a drawing game
        response.push({ a: { x: mouseX, y: mouseY }, b: { x: prevMouseX, y: prevMouseY } })
      }
    } 
  }
  stroke("green")
  strokeWeight(3);
  fill("white")
  rect(w / 2 - 150, h / 2 - 225, 300, 300);
  strokeWeight(drawSize);
  stroke(drawColor);
  for (let i = 0; i < response.length; i++) {
    if (typeof response[i] === 'object') {
      if (response[i].a.x == response[i].b.x && response[i].a.y == response[i].b.y) {
        line(response[i].a.x, response[i].a.y, response[i].b.x + 1, response[i].b.y + 1)
      }
      line(response[i].a.x, response[i].a.y, response[i].b.x, response[i].b.y)
    } else {
    
      if (response[i].substring(0, 2) == "sW") {
        strokeWeight(response[i].substring(parseInt(2)))
        
      } else if(response[i].substring(0,2) == "CC"){
          noErase();
          stroke(response[i].substring(2))
      } else if(response[i] == "erase"){

          erase()
      }

    }
  }
  noErase();
  strokeWeight(1);

  prevMouseX = mouseX;
  prevMouseY = mouseY;
  if (drawSlider) {
    drawSliderLastValue = drawSlider.value();
  }

}

function createHostButton() {
  hostButton = createButton('Host');
  hostButton.size(100, 50);
  hostButton.position(width / 2 - 50, height / 2 - 100);
  hostButton.mousePressed(() => {
    let code = "" + random(letters) + random(letters) + random(letters) + random(letters) + random(letters);
    isHost = true;

    socket.emit("make room", code);
    txt = code;
    removeElements(hostButton)
  });
}
let submitButton;

function createSubmitButton() {
  submitButton = createButton('SUBMIT');
  submitButton.size(100, 50);
  submitButton.position(width / 2 - 50, height / 2 + 100);
  submitButton.mousePressed(() => {
      let j = width/2-150
      let i = height/2 -225
      response.push("x" + j)
      response.push("y" + i)
      response.push("me" + me.id)
      console.log(response);
      socket.emit("save", response, currentRoomCode, me.id, currentPrompts);
      removeElements()
      responce = [];
    
  });
}
function createEraserButton() {
  submitButton = createButton('ERASE');
  submitButton.size(50, 50);
  submitButton.position(width / 2 + 50, height / 2 - 275);
  submitButton.mousePressed(() => {


      response.push("erase")

  });
}

function createSkipButton() {
  submitButton = createButton('Skip tutorial');
  submitButton.size(100, 50);
  submitButton.position(width / 2 - 50, height / 2 + 100);
  submitButton.mousePressed(() => {

    socket.emit("skip", currentRoomCode);
    removeElements()
  });
}

let startButton;
function createStartButton() {
  startButton = createButton('Start');
  startButton.size(100, 50);
  startButton.position(width / 2 - 50, height / 2 + 100);
  startButton.mousePressed(() => {


    socket.emit("Start", currentRoomCode);
    removeElements()
  });
}
function createSizeSlider() {
  drawSlider = createSlider(1, 10, 5, 1)
  drawSlider.position(width / 2 - 150, height / 2 - 250).size(80)
}
let colorPicker;
function createColorGrab() {
  console.log("Is the color picker created?")
  colorPicker = createColorPicker('deeppink');
  colorPicker.position(width / 2 - 50, height / 2 - 250).size(80)
  colorPicker.changed(() => {
      response.push("CC" + colorPicker.value());
    });
}
let reconectButton;
function createReconectButton() {
  reconectButton = createButton('Re-connect');
  reconectButton.size(100, 50);
  reconectButton.position(width / 2 - 50, height / 2 + 200);
  reconectButton.mousePressed(() => {


    socket.emit("can reconect", me, tempMe[1]);

  });
}


function createUndoButton() {
  undoButton = createButton('↩️');
  undoButton.size(50, 50);
  undoButton.position(width / 2 + 100, height / 2 - 275);
  undoButton.mousePressed(() => {
    let foundFirst = false;
    for (let i = response.length - 1; i >= 0; i--) {
      if (response[i] == "END" && !foundFirst) {
        foundFirst = true;

      } else if (response[i] == "END" && foundFirst) {
        response.push("sW" + drawSlider.value());
        break;
      }
      if (foundFirst) {
        response.splice(i, 1);

      }
    }
  });
}

let responseInput;
function createInputResponce() {
  responseInput = createInput('').attribute('maxlength', 50)
  responseInput.size(200, 50);
  responseInput.position(width / 2 - 100, height / 2 - 100);
  responseInput.elt.placeholder = 'EX: Why did the chicken cross the road? Because his name was gary!';
  responseInput.input(() => {
    //response = responseInput.value();
    //removeElements();
  })
}
function createInputCode() {
  inputCode = createInput('')
  inputCode.size(100, 50);
  inputCode.position(width / 2 - 50, height / 2);
  inputCode.elt.placeholder = 'EX: XXXXX';
  inputCode.changed(() => {
    socket.emit("join room", inputCode.value().toLowerCase(), me);

    //removeElements();
  })
}
function createNameInput() {
  nameInput = createInput('').attribute('maxlength', 30)
  nameInput.size(100, 50);
  nameInput.position(width / 2 - 50, height / 2 - 200);
  nameInput.elt.placeholder = 'EX: NAME';
  nameInput.changed(() => {
    me.name = nameInput.value();
    //removeElements();
  })
}
let votingTime = false;
function voteBegin() {
  timer = -12;
  setTimeout(() => {
    votingTime = true;
    timer = 0;
    for (let i = 0; i < players.length; i++) {
      if (curInput[i] == null) {
        curInput[i] = [{ text: i, Pid: i, id: promptNumbers[i][0] }, { text: i, Pid: i, id: promptNumbers[i][1] }]
      }
    }
  }, 3000)

  //socket.emit("vote begin",currentRoomCode);

}






socket.on("room code", function(number) {
  currentRoomCode = number;
  storeItem('me', [me, currentRoomCode])
})
socket.on("room not found", function(number) {
  console.log("Room not found")
})
socket.on("id", function(number) {
  console.log(number)
  me.id = number;
  storeItem('me', [me, currentRoomCode])
  removeElements()

  if (me.id == 0) {
    createStartButton()
    txt = "Start the game when ready";
  }
})
let players = [];
socket.on("Player info", function(info) {

  players = info;
})
let curInput = [];
socket.on("input", function(input, id, prompt) {
  console.log("Got input")
  curInput[id] = []
  curInput[id][0] = prompt
  curInput[id][0][0].Pid = id;
  curInput[id][1] = input;
  spritesToDraw[id].position(spritesToDraw[id].x, height / 2)


})
let theGameHasBegun = false;
socket.on("start", function() {
  theGameHasBegun = true;
  storeItem('me', [me, currentRoomCode]);
  if (!isHost) {
    removeElements()
    txt = "Wait for tutorial";
    if (me.id == 0) {
      createSkipButton();
    }
  }
})
let currentPrompts = []
let promptNumbers = []
socket.on("round start", function() {
  round++;
  if (round >= 3) {
    socket.emit("end game", currentRoomCode);
    txt = "GAME DONE";
    return;
  }
  txt = "";
  if (!isHost) {
    //topText = "Say a funny";
    response = [];
    removeElements();

    createSubmitButton()
    createSizeSlider()
    createUndoButton()
    createColorGrab() 
    createEraserButton()

    currentPrompts = [];
    me.CP = currentPrompts;
    storeItem('me', [me, currentRoomCode])
  }
  if (isHost) {
    promptNumbers = [];
    for (let i = 0; i < players.length; i++) {
      promptNumbers.push(i);
    }
    curInput = [];
    currentPrompts = [];
    for (let i = 0; i < spritesToDraw.length; i++) {
      spritesToDraw[i].position(width / players.length * i, height - 150)
    }
    timer = setTimer;
    
    for (let i = 0; i < players.length; i++) {
      
      let prompt = { text: random(prompts), id: i, player1: i, player2: 0 }
      
      
      
      

      
      currentPrompts.push(prompt);
      socket.emit("prompt", prompt, currentRoomCode)



    }

  }
})
socket.on("end round", function() {
  if (!isHost) {
    console.log("end round")
    while (response.length < 2) {
      response.push({ text: responseInput.value(), id: currentPrompts[0].id, Pid: me.id });
      currentPrompts.splice(0, 1);
    }
    socket.emit("save", response, currentRoomCode, me.id, currentPrompts);
    topText = "";
    currentPrompts = [];
    me.CP = currentPrompts;
    storeItem('me', [me, currentRoomCode])
    txt = "Wait for voting to begin"
    removeElements()
  } else {
    voteBegin()
  }

})

socket.on("prompt", function(prompt) {
  if (prompt.player1 == me.id || prompt.player2 == me.id) {
    currentPrompts.push(prompt);
    me.CP = currentPrompts;
    storeItem('me', [me, currentRoomCode]);
  }
})
let voteButton1
let voteButton2
let votedBefore = 0;

socket.on("vote", function(p1, p2) {
  if (!isHost) {
    currentPrompts = [];
    me.CP = currentPrompts;
    storeItem('me', [me, currentRoomCode])
    txt = "";
    removeElements();
    voteButton1 = createButton("LEFT").position(0, height / 4).size(width, 100).mousePressed(() => {
      socket.emit("vote", currentRoomCode, 1, me.id, votedBefore);
      votedBefore = 1;
    });
    voteButton2 = createButton("RIGHT").position(0, height / 4 + 105).size(width, 100).mousePressed(() => {

      socket.emit("vote", currentRoomCode, 2, me.id, votedBefore);
      votedBefore = 2;
    });
  } else {
    /*for(let i = 0; i < players.length; i++){
      if(curInput[i] == null){
        curInput[i] = [{text:"LOADING...",id:promptNumbers[i][0],Pid:i},{text:"LOADING...",id:promptNumbers[i][1],Pid:i}]
      }
    }*/
    for (let i = 0; i < players.length; i++) {
      spritesToDraw[i].position(width / players.length * i, height - 150)
    }
  }
})

let p1Votes = 0;
let p2Votes = 0;
let playersWhoVoted = [];

socket.on("playerVoted", function(player, id, prevVote) {
  if (playersWhoVoted.includes(id)) {
    console.log(prevVote)
    if (prevVote == 1) {
      p1Votes--;
    } else {
      p2Votes--;
    }
  } else {
    playersWhoVoted.push(id)
  }
  if (player == 1) {
    p1Votes++;
    spritesToDraw[id].position(0, height / 8 * id + 25)
  } else {
    p2Votes++;
    spritesToDraw[id].position(width / 1.2, height / 8 * id + 25)
  }

})

socket.on("playerScore", function(id, score) {
  if (me.id == id) {
    me.score += score * 1000;
  }
  storeItem('me', [me, currentRoomCode])
})
let scoreTime = false;
socket.on("score time", function() {
  if (isHost) {
    scoreTime = true;
    timer = 20;

  } else {
    txt = "Score time!";
    removeElements();
  }

})
socket.on("changeID", function(num) {
  if (theGameHasBegun) return;
  console.log("player die")

  if (me.id > num && !theGameHasBegun) {
    me.id--;
    storeItem("me", [me, currentRoomCode]);
  }

  if (me.id == 0) {
    createStartButton();
  }
  if (isHost && !theGameHasBegun) {
    players.splice(num, 1);
    removeElements();
    spritesToDraw = [];
  }

})
socket.on("reconect", function() {
  removeElements();
  console.log("reconect")
  me = tempMe[0];
  theGameHasBegun = true;
  currentPrompts = me.CP;
  currentRoomCode = tempMe[1];
  if (me.CP[0]) {
    createSubmitButton()
    createSizeSlider()
    createUndoButton()
    createColorGrab()
    createEraserButton()

  }
})


socket.on("skip", function() {
  if (isHost) {
    video.speed(5)
    console.log(video.elt.duration);
  }

})

socket.on("influence", function(input, arr) {
  if (!isHost) {
    response = input[arr[me.id]][1]
    console.log(response);
    let y = parseInt(response.splice(createInputResponce.length-2).substring(1))
    let x = parseInt(response.splice(createInputResponce.length-2).substring(1))
    for(let i = 0; i < response.length; i++){
      if(typeof response[i] === 'object'){
        response[i].a.x -= x;
        response[i].a.y -= y;
        response[i].b.x -= x;
        response[i].b.y -= y;
      }
    }
    createSubmitButton()
    createSizeSlider()
    createUndoButton()
    createColorGrab()
    createEraserButton()
  } else {
    timer = 80;
  }

})

setInterval(function() {
  if (!isHost) {
    socket.emit("player information", currentRoomCode, me)
  }
}, 1000)