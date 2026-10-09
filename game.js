'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.points = POINTS[size];
    this.special = false;   // los asteroides especiales marcan true
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz (asteroide especial) ───────────────────────────────────────
const STAR_TTL       = 5;    // segundos en pantalla antes de desaparecer
const STAR_SPAWN_MIN = 6;    // intervalo mínimo entre apariciones (s)
const STAR_SPAWN_MAX = 12;   // intervalo máximo entre apariciones (s)

class ShootingStar extends Asteroid {
  constructor() {
    // Nace en un borde aleatorio, apuntando hacia el interior del campo
    const edge = randInt(0, 3);   // 0: izq, 1: der, 2: arriba, 3: abajo
    let x, y;
    if      (edge === 0) { x = 0;     y = rand(0, H); }
    else if (edge === 1) { x = W;     y = rand(0, H); }
    else if (edge === 2) { x = rand(0, W); y = 0;     }
    else                 { x = rand(0, W); y = H;     }
    super(x, y, 1);

    this.special = true;
    this.points  = 300;
    this.ttl     = STAR_TTL;
    this.life    = STAR_TTL;

    // Mucho más rápida que un asteroide normal
    const angle = Math.atan2(rand(H * 0.25, H * 0.75) - y,
                             rand(W * 0.25, W * 0.75) - x) + rand(-0.25, 0.25);
    const speed = rand(260, 340);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-3, 3);
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() { return []; }   // nunca se fragmenta

  draw() {
    // Parpadeo al estar por desaparecer
    if (this.ttl < 2 && Math.floor(this.ttl * 6) % 2 === 0) return;
    const alpha = Math.min(1, this.ttl / 2);

    // Estela detrás del movimiento
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = '#ffd24a';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.15, this.y - this.vy * 0.15);
    ctx.stroke();
    ctx.restore();

    // Cuerpo: estrella de 5 puntas
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#ffd24a';
    ctx.fillStyle   = 'rgba(255, 210, 74, 0.25)';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? this.radius : this.radius * 0.45;
      const a = (i / 10) * Math.PI * 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else         ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = speedTimer > 0 ? 520 : 260;  // px/s² (x2 con Velocidad)
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta clásica: triángulo con muesca trasera
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nariz
    ctx.lineTo(-12, -9);   // ala izquierda
    ctx.lineTo( -7,  0);   // muesca trasera
    ctx.lineTo(-12,  9);   // ala derecha
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor (cian con Velocidad activa)
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = speedTimer > 0 ? 'rgba(0, 220, 255, 0.85)'
                                       : 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-up ──────────────────────────────────────────────────────────────────
const SPEED_DURATION = 5;       // segundos de efecto
const SPEED_DROP_CHANCE = 0.15; // probabilidad de drop al destruir un asteroide
const SHIELD_DURATION = 5;      // segundos de efecto del Escudo
const SHIELD_HITS     = 3;      // golpes que absorbe el Escudo
const SHIELD_DROP_CHANCE = 0.1; // probabilidad de drop de Escudo

// Color por tipo de power-up
const PU_COLORS = { speed: '#0dcfff', shield: '#b47cff' };

class PowerUp {
  constructor(x, y, type = 'speed') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = PU_COLORS[type] || PU_COLORS.speed;
    this.radius = 13;
    this.ttl = 8;    // vida en campo si no se recoge
    this.dead = false;
    this.rot = rand(0, Math.PI * 2);
  }

  update(dt) {
    this.ttl -= dt;
    this.rot += dt * 2;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo al estar por expirar
    if (this.ttl < 2 && Math.floor(this.ttl * 6) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(this.rot);
    if (this.type === 'shield') {
      // Icono de escudo (hexágono aplanado)
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(6, -5);
      ctx.lineTo(6, 2);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 2);
      ctx.lineTo(-6, -5);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    } else {
      // Rayo ⚡
      ctx.beginPath();
      ctx.moveTo(2, -7);
      ctx.lineTo(-4, 1);
      ctx.lineTo(0, 1);
      ctx.lineTo(-2, 7);
      ctx.lineTo(4, -1);
      ctx.lineTo(0, -1);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let score, lives, level;
let speedTimer;   // segundos restantes de Velocidad (0 = inactiva)
let shieldTimer;  // segundos restantes de Escudo (0 = inactivo)
let shieldHits;   // golpes que aún absorbe el Escudo
let shieldFlash;  // destello tras absorber un impacto (s)
let shieldRot;    // rotación de los segmentos del anillo
let starTimer;    // cuenta atrás para la próxima estrella fugaz
let state;        // 'playing' | 'dead' | 'gameover'
let deadTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  speedTimer  = 0;
  shieldTimer = 0;
  shieldHits  = 0;
  shieldFlash = 0;
  shieldRot   = 0;
  starTimer  = rand(STAR_SPAWN_MIN, STAR_SPAWN_MAX);
  state  = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  speedTimer  = 0;
  shieldTimer = 0;
  shieldHits  = 0;
  shieldFlash = 0;
  starTimer  = rand(STAR_SPAWN_MIN, STAR_SPAWN_MAX);
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  // El escudo se pierde al morir
  shieldTimer = 0;
  shieldHits  = 0;
  shieldFlash = 0;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  if (speedTimer  > 0) speedTimer  = Math.max(0, speedTimer - dt);
  if (shieldTimer > 0) shieldTimer = Math.max(0, shieldTimer - dt);
  if (shieldTimer <= 0) shieldHits = 0;   // sin tiempo no quedan golpes
  if (shieldFlash > 0) shieldFlash = Math.max(0, shieldFlash - dt);
  shieldRot += dt * 0.8;   // rotación lenta de los segmentos del anillo

  // Aparición de estrellas fugaces
  starTimer -= dt;
  if (starTimer <= 0) {
    asteroids.push(new ShootingStar());
    starTimer = rand(STAR_SPAWN_MIN, STAR_SPAWN_MAX);
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += a.points;
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        if (!a.special) {
          if      (Math.random() < SPEED_DROP_CHANCE)  powerups.push(new PowerUp(a.x, a.y, 'speed'));
          else if (Math.random() < SHIELD_DROP_CHANCE) powerups.push(new PowerUp(a.x, a.y, 'shield'));
        }
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        if (shieldTimer > 0 && shieldHits > 0) {
          // El escudo absorbe el impacto
          shieldHits--;
          shieldFlash = 0.25;
          ship.invincible = 0.9;   // i-frames: no drena los golpes de una vez
          explode(ship.x, ship.y, 6);
          if (shieldHits <= 0) shieldTimer = 0;
        } else {
          killShip();
        }
        break;
      }
    }
  }

  // Nave vs power-up
  for (const p of powerups) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p.type === 'shield') {
        shieldTimer = SHIELD_DURATION;
        shieldHits  = SHIELD_HITS;
        shieldFlash = 0.25;
      } else {
        speedTimer = SPEED_DURATION;
      }
      explode(p.x, p.y, 6);
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nivel completado: solo cuenta si no quedan asteroides normales
  // (una estrella fugaz viva no bloquea el avance)
  if (!asteroids.some(a => !a.special)) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawShield() {
  if (shieldTimer <= 0 || shieldHits <= 0) return;
  // Parpadeo al estar por expirar
  if (shieldTimer < 1.5 && Math.floor(shieldTimer * 6) % 2 === 0) return;

  const R = ship.radius + 10;
  const flash = shieldFlash > 0;
  const alpha = 0.45 + 0.15 * Math.sin(shieldRot * 4);

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(shieldRot);
  ctx.strokeStyle = flash ? '#fff' : PU_COLORS.shield;
  ctx.globalAlpha = flash ? 1 : alpha;
  ctx.lineWidth   = flash ? 3 : 2;
  ctx.lineCap     = 'round';
  // 3 segmentos con huecos, rotando lentamente
  for (let i = 0; i < 3; i++) {
    const start = (i / 3) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(0, 0, R, start, start + 1.7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  // Temporizador del power-up Velocidad
  if (speedTimer > 0) {
    ctx.fillStyle = '#0dcfff';
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ ${speedTimer.toFixed(1)}`, 14, 48);
  }

  // Golpes y tiempo restantes del power-up Escudo
  if (shieldTimer > 0 && shieldHits > 0) {
    ctx.fillStyle = PU_COLORS.shield;
    ctx.textAlign = 'left';
    // Icono de escudo dibujado con paths (sin glifos unicode)
    ctx.save();
    ctx.translate(19, 63);
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5.5, -4);
    ctx.lineTo(5.5, 2);
    ctx.lineTo(0, 7);
    ctx.lineTo(-5.5, 2);
    ctx.lineTo(-5.5, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillText(`${shieldHits}  ${shieldTimer.toFixed(1)}`, 30, 68);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();
  drawShield();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
