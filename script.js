// frontend/script.js

// let bird = document.querySelector(".bird");
// let birdSelect = document.getElementById("bird-select");
let scoreVal = document.getElementById("score_val");
let leaderboardList = document.getElementById("leaderboard-list");
let leaderboard = document.querySelector(".leaderboard");
let gameState = "Start";
let gravity = 0.5;
let bird_dy = 0;
let pipes = [];
let move_speed = 3;
let pipeInterval;

let bird = document.querySelector(".bird");
let birdSelect = document.getElementById("bird-select");

let birdImages = {
  "Red Bird": ["./images/bird1.png", "./images/bird1U.png"],
  "Blue Bird": ["./images/bird2.png", "./images/bird2U.png"],
  "Green Bird": ["./images/bird3.png", "./images/bird3U.png"],
};

let currentBird = "Red Bird"; // Default bird selection

// Change the bird image on selection
birdSelect.addEventListener("change", () => {
  currentBird = birdSelect.options[birdSelect.selectedIndex].text;
  bird.src = birdImages[currentBird][0]; // Default image when idle
});

// Handle bird jump animation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === " ") {
    bird.src = birdImages[currentBird][1]; // Flap image
    bird_dy = -7.6;
  }
});

// Revert to idle bird image when falling
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === " ") {
    setTimeout(() => {
      bird.src = birdImages[currentBird][0]; // Idle image
    }, 100);
  }
});

function startGame() {
  gameState = "Play";

  // Hide UI elements during the game
  document.getElementById("bird-select").style.display = "none";
  document.querySelector(".message").style.display = "none";
  leaderboard.style.display = "none";

  let score = 0;
  scoreVal.innerText = score;
  bird.style.top = "40vh";
  bird_dy = 0;

  // ❌ Stop existing pipe generation interval
  clearInterval(pipeInterval);

  // ❌ Remove old pipes from previous game
  pipes.forEach((pipe) => pipe.remove());
  pipes = [];

  // ✅ Start fresh pipe generation
  createPipes();
  movePipes();

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
  clearInterval(pipeInterval); // Ensure old interval is cleared
  pipeInterval = setInterval(() => {
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
    bottomPipe.style.height = 100 - pipeHeight - pipeGap + "vh";
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

  // ✅ Show bird selection after game ends
  document.getElementById("bird-select").style.display = "block";

  // ✅ Show leaderboard after the game ends
  leaderboard.style.display = "block";

  // ✅ Reset bird to the starting position (same as the start of the game)
  bird.style.top = "40vh"; // Adjust this to match the initial position
  bird.style.left = "20vw"; // Ensure the bird starts from the left side
  bird_dy = 0; // Stop bird movement
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

// Animate the score when it increases
function updateScore() {
  let scoreElement = document.getElementById("score_val");
  scoreElement.innerText = parseInt(scoreElement.innerText) + 1;
  scoreElement.classList.add("increase");
  setTimeout(() => {
    scoreElement.classList.remove("increase");
  }, 200);
}
