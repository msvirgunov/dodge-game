const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const player = { x: 330, y: 440, w: 60, h: 20, speed: 300, dx: 0 };
let obstacles = [];
let score = 0;
let highScore = 0;
let speedMultiplier = 1;
let running = false;
let lastTime = 0;

function drawPlayer() {
  ctx.fillStyle = 'skyblue';
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawObstacles() {
  ctx.fillStyle = 'red';
  for (let o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h);
}

function updatePlayer(dt) {
  player.x += player.dx * dt;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
}

function spawnObstacle() {
  const w = Math.random() * 100 + 20;
  const x = Math.random() * (canvas.width - w);
  obstacles.push({ x, y: -20, w, h: 20, speed: 150 * speedMultiplier });
}

function updateObstacles(dt) {
  for (let o of obstacles) o.y += o.speed * dt;
  obstacles = obstacles.filter(o => o.y < canvas.height);
}

function checkCollision() {
  for (let o of obstacles) {
    if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
      running = false;
      if (score > highScore) highScore = score;
    }
  }
}

function update(dt) {
  updatePlayer(dt);
  updateObstacles(dt);
  score += dt * 50;
  speedMultiplier += dt * 0.01;
  if (Math.random() < dt * 0.5) spawnObstacle();
  checkCollision();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawObstacles();
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + Math.floor(score), 10, 20);
  ctx.fillText('High: ' + highScore, 10, 40);
}

function loop(timestamp) {
  if (!running) return;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

document.getElementById('btn-start').onclick = () => {
  running = true;
  score = 0;
  obstacles = [];
  lastTime = performance.now();
  requestAnimationFrame(loop);
};

document.getElementById('btn-pause').onclick = () => running = !running;
document.getElementById('btn-reset').onclick = () => { score = 0; obstacles = []; };

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') player.dx = -player.speed;
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') player.dx = player.speed;
});
window.addEventListener('keyup', e => {
  if (['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)) player.dx = 0;
});

draw();

