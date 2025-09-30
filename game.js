const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const player = { x: 330, y: 440, w: 50, h: 30, speed: 300, dx: 0 };
let obstacles = [];
let stars = [];
let score = 0;
let highScore = 0;
let baseSpeed = 1; // базова швидкість з селектора
let running = false;
let lastTime = 0;

// ініціалізація зірок
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1
  });
}

// === малюємо гравця ===
function drawPlayer() {
  ctx.save();
  ctx.fillStyle = "#00eaff";
  ctx.shadowColor = "#00eaff";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(player.x + player.w / 2, player.y);
  ctx.lineTo(player.x, player.y + player.h);
  ctx.lineTo(player.x + player.w, player.y + player.h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// === перешкоди ===
function drawObstacles() {
  ctx.fillStyle = 'red';
  ctx.shadowColor = "red";
  ctx.shadowBlur = 10;
  for (let o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.shadowBlur = 0;
}

function updatePlayer(dt, speedMultiplier) {
  player.x += player.dx * dt;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
}

function spawnObstacle(speedMultiplier) {
  const w = Math.random() * 80 + 20;
  const x = Math.random() * (canvas.width - w);
  obstacles.push({ x, y: -20, w, h: 20, speed: 150 * speedMultiplier });
}

function updateObstacles(dt, speedMultiplier) {
  for (let o of obstacles) o.y += o.speed * dt;
  obstacles = obstacles.filter(o => o.y < canvas.height);
}

function checkCollision() {
  for (let o of obstacles) {
    if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
      running = false;
      if (score > highScore) highScore = score;
      document.getElementById("high").textContent = Math.floor(highScore);
    }
  }
}

function update(dt) {
  // швидкість залежить від рахунку і початкової швидкості
  let speedMultiplier = baseSpeed + score / 1000;

  updatePlayer(dt, speedMultiplier);
  updateObstacles(dt, speedMultiplier);

  // рахунок
  score += dt * 50;
  document.getElementById("score").textContent = Math.floor(score);
  document.getElementById("speed").textContent = speedMultiplier.toFixed(2) + "x";

  // більше блоків при високій швидкості
  let spawnRate = dt * (0.5 + speedMultiplier * 0.5);
  while (Math.random() < spawnRate) {
    spawnObstacle(speedMultiplier);
  }

  // рух фонів (зірок)
  for (let s of stars) {
    s.y += speedMultiplier * dt * 100;
    if (s.y > canvas.height) {
      s.y = -s.size;
      s.x = Math.random() * canvas.width;
    }
  }

  checkCollision();
}

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  for (let s of stars) {
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
}

// === повідомлення перед стартом ===
function drawStartMessage() {
  drawBackground();
  ctx.fillStyle = "#00eaff";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Натисніть Старт, щоб почати гру", canvas.width / 2, canvas.height / 2);
}

function draw() {
  if (!running) {
    drawStartMessage();
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawObstacles();
  }
}

function loop(timestamp) {
  if (!running) return;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// === кнопки ===
document.getElementById('btn-start').onclick = () => {
  running = true;
  score = 0;
  obstacles = [];
  // беремо швидкість із селектора
  baseSpeed = parseFloat(document.getElementById("speed-select").value);
  lastTime = performance.now();
  requestAnimationFrame(loop);
};

document.getElementById('btn-pause').onclick = () => running = !running;
document.getElementById('btn-reset').onclick = () => { 
  score = 0; 
  obstacles = []; 
  running = false;
  document.getElementById("score").textContent = 0;
  drawStartMessage();
};

// === керування ===
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') player.dx = -player.speed;
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') player.dx = player.speed;
});
window.addEventListener('keyup', e => {
  if (['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)) player.dx = 0;
});

// малюємо стартове повідомлення
drawStartMessage();
