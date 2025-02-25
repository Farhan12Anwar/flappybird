// frontend/script.js

let bird = document.querySelector(".bird");
let birdSelect = document.getElementById("bird-select");
let scoreVal = document.getElementById("score_val");
let leaderboardList = document.getElementById("leaderboard-list");
let leaderboard = document.querySelector(".leaderboard");
let gameState = "Start";
let gravity = 0.5;
let bird_dy = 0;
let pipes = [];
let move_speed = 3;

birdSelect.addEventListener("change", () => {
  bird.src = birdSelect.value;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && gameState !== "Play") {
    startGame();
  }
  if (e.key === "ArrowUp" || e.key === " ") {
    bird_dy = -7.6;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === " ") {
    bird_dy = 0;
  }
});

function startGame() {
    gameState = "Play";
    let score = 0;
    scoreVal.innerText = score;
    bird.style.top = "40vh";
    pipes.forEach((pipe) => pipe.remove());
    pipes = [];
    createPipes();
    movePipes();
  
    // Hide leaderboard during the game
    leaderboard.style.display = "none";
  
    let gameInterval = setInterval(() => {
      if (gameState !== "Play") {
        clearInterval(gameInterval);
        return;
      }
      score++;
      scoreVal.innerText = score;
    }, 1000);
  
    function applyGravity() {
      if (gameState !== "Play") return;
      bird_dy += gravity;
      bird.style.top = bird.offsetTop + bird_dy + "px";
      checkCollision();
      requestAnimationFrame(applyGravity);
    }
    requestAnimationFrame(applyGravity);
  }
function createPipes() {
    setInterval(() => {
      if (gameState !== "Play") return;
  
      let pipeHeight = Math.floor(Math.random() * 40) + 20; // Increase variation
      let pipeGap = 45; // Increase the gap size
  
      let topPipe = document.createElement("div");
      topPipe.className = "pipe";
      topPipe.style.height = pipeHeight + "vh";
      topPipe.style.top = "0";
      topPipe.style.left = "100vw";
      document.body.appendChild(topPipe);
      pipes.push(topPipe);
  
      let bottomPipe = document.createElement("div");
      bottomPipe.className = "pipe";
      bottomPipe.style.height = (100 - pipeHeight - pipeGap) + "vh";
      bottomPipe.style.bottom = "0";
      bottomPipe.style.left = "100vw";
      document.body.appendChild(bottomPipe);
      pipes.push(bottomPipe);
    }, 2000);
  }
  
  
function movePipes() {
    function move() {
      if (gameState !== "Play") return;
  
      pipes.forEach((pipe, index) => {
        let pipeRect = pipe.getBoundingClientRect();
        let birdRect = bird.getBoundingClientRect();
  
        if (pipeRect.right <= 0) {
          pipes.splice(index, 1);
          pipe.remove();
        } else {
          pipe.style.left = pipeRect.left - move_speed + "px";
        }
  
        // Only increase score if bird has successfully passed a pipe
        if (!pipe.passed && pipeRect.right < birdRect.left) {
          scoreVal.innerText = parseInt(scoreVal.innerText) + 1;
          pipe.passed = true;
        }
      });
  
      requestAnimationFrame(move);
    }
    requestAnimationFrame(move);
  }
  
  

function checkCollision() {
  let birdRect = bird.getBoundingClientRect();
  pipes.forEach((pipe) => {
    let pipeRect = pipe.getBoundingClientRect();
    if (
      birdRect.left < pipeRect.left + pipeRect.width &&
      birdRect.left + birdRect.width > pipeRect.left &&
      birdRect.top < pipeRect.top + pipeRect.height &&
      birdRect.top + birdRect.height > pipeRect.top
    ) {
      endGame();
    }
  });
  if (birdRect.top <= 0 || birdRect.bottom >= window.innerHeight) {
    endGame();
  }
}

function endGame() {
    gameState = "End";
    alert("Game Over!");
    saveScore(parseInt(scoreVal.innerText));
  
    // Show leaderboard after the game ends
    leaderboard.style.display = "block";
  }

async function saveScore(score) {
  let username = prompt("Enter your name:");
  if (!username) return;
  await fetch("http://localhost:5000/save-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score }),
  });
  loadLeaderboard();
}

async function loadLeaderboard() {
  let res = await fetch("http://localhost:5000/leaderboard");
  let scores = await res.json();
  leaderboardList.innerHTML = scores
    .map((s) => `<li>${s.username}: ${s.score}</li>`)
    .join("");
}

document.addEventListener("DOMContentLoaded", loadLeaderboard);

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && gameState !== "Play") {
      startGame();
    }
    if (e.key === "ArrowUp" || e.key === " ") {
      e.preventDefault(); // Prevent page scrolling
      bird_dy = -7.6;
    }
  });
  