const CHARS = ['4', '0', '4'];
const COUNT = 90;
const REPEL_RADIUS = 140;
const REPEL_STRENGTH = 6.5;
const FRICTION = 0.88;
const RETURN_SPEED = 0.032;

const PALETTES = [
  [
    [255, 90,  50],
    [255, 150, 60],
    [255, 200, 80],
    [200, 220, 255],
    [160, 180, 255],
    [255, 255, 255],
  ],
  
  [
    [255, 60,  60],
    [255, 100, 50],
    [200, 40,  40],
    [255, 130, 80],
    [180, 30,  30],
    [255, 180, 100],
  ],
 
  [
    [255, 220, 50],
    [255, 200, 80],
    [230, 180, 20],
    [255, 240, 120],
    [200, 160, 10],
    [255, 255, 180],
  ],
 
  [
    [160, 180, 255],
    [120, 150, 255],
    [200, 210, 255],
    [100, 130, 220],
    [180, 200, 255],
    [80,  110, 200],
  ],
  
  [
    [80,  220, 180],
    [50,  190, 160],
    [120, 240, 200],
    [30,  160, 140],
    [160, 255, 220],
    [20,  130, 120],
  ],

  [
    [220, 120, 255],
    [180, 80,  230],
    [200, 150, 255],
    [140, 60,  200],
    [240, 180, 255],
    [100, 40,  180],
  ],
];

const GHOST_COLORS = [
  [255, 255, 255],
  [255, 90,  50],
  [255, 200, 80],
  [160, 180, 255],
  [80,  220, 180],
  [220, 120, 255],
];

let particles = [];
let cursorOrb;
let colorIndex = 0;

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(init) {
    this.ox = random(width);
    this.oy = random(height);
    this.x  = init ? this.ox : random(width);
    this.y  = init ? this.oy : random(height);
    this.vx = 0;
    this.vy = 0;
    this.char = CHARS[floor(random(CHARS.length))];
    this.size = random(10, 44);
    this.baseAlpha = random(30, 140);
    this.alpha = this.baseAlpha;
    this.rotSpeed = random(-0.003, 0.003);
    this.angle = random(-0.4, 0.4);
    this.paletteIndex = floor(random(PALETTES[colorIndex].length));
    this.driftX = random(-0.12, 0.12);
    this.driftY = random(-0.12, 0.12);
    this.wobble = random(1000);
    this.wobbleAmp = random(0.3, 0.8);
  }

  updateColor() {
    this.paletteIndex = floor(random(PALETTES[colorIndex].length));
  }

  update() {
    let dx = this.x - mouseX;
    let dy = this.y - mouseY;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist < REPEL_RADIUS && dist > 0) {
      let force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
      force = force * force * REPEL_STRENGTH;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
      this.alpha = lerp(this.alpha, 255, 0.08);
    } else {
      this.alpha = lerp(this.alpha, this.baseAlpha, 0.04);
    }

    this.vx += (this.ox - this.x) * RETURN_SPEED;
    this.vy += (this.oy - this.y) * RETURN_SPEED;

    this.vx += this.driftX + noise(this.wobble, frameCount * 0.008) * this.wobbleAmp - this.wobbleAmp * 0.5;
    this.vy += this.driftY + noise(this.wobble + 100, frameCount * 0.008) * this.wobbleAmp - this.wobbleAmp * 0.5;

    this.vx *= FRICTION;
    this.vy *= FRICTION;

    this.x += this.vx;
    this.y += this.vy;

    let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
    this.angle += this.rotSpeed + speed * 0.01;
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    textAlign(CENTER, CENTER);
    textSize(this.size);
    textStyle(BOLD);

    let col = PALETTES[colorIndex][this.paletteIndex];
    let r = col[0];
    let g = col[1];
    let b = col[2];

    let dx = this.x - mouseX;
    let dy = this.y - mouseY;
    let dist = sqrt(dx * dx + dy * dy);
    let proximity = constrain(1 - dist / REPEL_RADIUS, 0, 1);

    if (proximity > 0) {
      fill(r, g, b, this.alpha * proximity * 0.3);
      text(this.char, 3, 3);
    }

    fill(r, g, b, this.alpha);
    text(this.char, 0, 0);
    pop();
  }
}

class CursorOrb {
  constructor() {
    this.trail = [];
    this.maxTrail = 18;
  }

  update() {
    this.trail.push({ x: mouseX, y: mouseY });
    if (this.trail.length > this.maxTrail) this.trail.shift();
  }

  draw() {
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      let t = i / this.trail.length;
      let r = lerp(4, 0, t);
      let a = lerp(180, 0, 1 - t);
      fill(255, 100, 50, a * t);
      ellipse(this.trail[i].x, this.trail[i].y, r * 2);
    }

    if (this.trail.length > 0) {
      let tip = this.trail[this.trail.length - 1];
      noFill();
      stroke(255, 100, 50, 200);
      strokeWeight(1);
      ellipse(tip.x, tip.y, 14);
      fill(255, 100, 50, 255);
      noStroke();
      ellipse(tip.x, tip.y, 4);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();

  for (let i = 0; i < COUNT; i++) {
    particles.push(new Particle());
  }

  cursorOrb = new CursorOrb();
}

function draw() {
  background(9, 12, 20, 30);

  cursorOrb.update();

  for (let pt of particles) {
    pt.update();
    pt.draw();
  }

  cursorOrb.draw();

 
  let gc = GHOST_COLORS[colorIndex];
  push();
  textAlign(CENTER, CENTER);
  textSize(min(width * 0.22, 220));
  textStyle(BOLD);
  noFill();
  stroke(gc[0], gc[1], gc[2], 12);
  strokeWeight(1);
  text('404', width / 2, height / 2 - 20);
  pop();


  push();
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(NORMAL);
  noStroke();
  fill(255, 255, 255, 60);
  text('PAGE NOT FOUND', width / 2, height / 2 + min(width * 0.12, 130));
  fill(255, 255, 255, 28);
  textSize(11);
  pop();
}

function mouseClicked() {
  colorIndex = (colorIndex + 1) % PALETTES.length;
  for (let pt of particles) {
    pt.updateColor();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let pt of particles) {
    pt.ox = random(width);
    pt.oy = random(height);
  }
}

let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-container");