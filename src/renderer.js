let columns = 40;
let size = 6;
let speed = 35;
let objectType = 'square';
let colourCount = 10;

const typeElem = document.querySelector('#type')
typeElem.addEventListener('input', e => { objectType = typeElem.value });

const sizeElem = document.querySelector('#size')
sizeElem.addEventListener('input', e => size = +sizeElem.value);

const speedElem = document.querySelector('#speed')
speedElem.addEventListener('input', e => speed = +speedElem.value);

const columnsElem =document.querySelector('#columns')
columnsElem.addEventListener('input', e => columns = +columnsElem.value);

const PIXI = require('pixi.js');
const Deque = require("double-ended-queue");

const app = new PIXI.Application({
  autoResize: true,
  resolution: devicePixelRatio
});

let container = new PIXI.ParticleContainer(1000000, { uvs: false, rotation: false, vertices: false });
app.stage.addChild(container);

document.body.appendChild(app.view);

// Listen for animate update
app.ticker.add((delta) => {
  spawnCircles();
  updateCircles(delta);
  drawCircles();
});

function resizeCanvas() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resizeCanvas)

let mouseDown = false;
document.body.onmousedown = function () {
  mouseDown = true;
}
document.body.onmouseup = function () {
  mouseDown = false;
}

let mousePos = {
  x: 0,
  y: 0
};

function getMousePos(e) {
  var rect = app.view.getBoundingClientRect();
  mousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

window.addEventListener('mousemove', getMousePos);

class Circle {
  constructor(x, column, sprite) {
    this.x = x;
    this.y = app.view.height;
    this.active = true;
    this.direction = [0, 0];
    this.column = column;
    this.sprite = sprite;

    container.addChild(sprite);
  }

  update() {
    if (this.y > mousePos.y + 20 && this.active) {
      let x = mousePos.x - this.x;
      let y = mousePos.y - this.y;
      let h = Math.sqrt(x ** 2 + y ** 2);
      this.direction = [x / h, y / h];
    }
    else this.active = false;

    this.x += this.direction[0] * speed;
    this.y += this.direction[1] * speed;

    let hue = (this.y / app.view.height) + counter / 180 + Math.abs(this.column - (columns / 2)) / (columns * 1);

    hue = Math.max(Math.floor(hue % 3 / 3 * colourCount ** 2), 0);

    this.sprite.tint = colours[Math.floor(hue / colourCount)][hue % colourCount][1];
  }
}

let circles = new Deque([]);

(function init() {
  resizeCanvas();
})()

const graphic = new PIXI.Graphics();
graphic.beginFill(0xFFFFFF);
graphic.drawRect(0, 0, 6, 6);
const texture = app.renderer.generateTexture(graphic);

function spawnCircles() {
  if (mouseDown) {
    for (let i = 0; i < columns; i++)
      circles.push(new Circle(app.view.width * i / (columns - 1), i, PIXI.Sprite.from(texture)));
  }
}

function updateCircles(delta) {
  for (let i = 0; i < circles.length; i++) {
    circles.get(i).update(delta);
  }

  for (let i = 0; i < circles.length; i++) {
    let circle = circles.get(i);
    if (circle.y < 0 || circle.x < 0 || circle.x > app.view.width || circle.y > app.view.height) {
      container.children.shift();
      circles.shift();
    } else break;
  }

  container.onChildrenChange(0);

  counter++;
}


let counter = 0;

function drawCircles() {
  for (let i = 0; i < circles.length; i++) {
    let circle = circles.get(i);
    circle.sprite.x = circle.x;
    circle.sprite.y = circle.y;
  }
}

function updateSize() {
  size = +document.querySelector('input[name=size]').value;
  updateCircleImgs();
}

function toHex(x) {
  x = x.toString(16);
  return x.length === 1 ? '0' + x : x;
};

function hsvToRgb(h, s, v) {
  var r, g, b;
  var i;
  var f, p, q, t;

  // Make sure our arguments stay in-range
  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(100, s));
  v = Math.max(0, Math.min(100, v));

  // We accept saturation and value arguments from 0 to 100 because that's
  // how Photoshop represents those values. Internally, however, the
  // saturation and value are calculated from a range of 0 to 1. We make
  // That conversion here.
  s /= 100;
  v /= 100;

  if (s == 0) {
    // Achromatic (grey)
    r = g = b = v;
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  }

  h /= 60; // sector 0 to 5
  i = Math.floor(h);
  f = h - i; // factorial part of h
  p = v * (1 - s);
  q = v * (1 - s * f);
  t = v * (1 - s * (1 - f));

  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;

    case 1:
      r = q;
      g = v;
      b = p;
      break;

    case 2:
      r = p;
      g = v;
      b = t;
      break;

    case 3:
      r = p;
      g = q;
      b = v;
      break;

    case 4:
      r = t;
      g = p;
      b = v;
      break;

    default: // case 5:
      r = v;
      g = p;
      b = q;
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
}

const colours = [];

for (let i = 0; i < colourCount; i++) {
  let min = 360 / colourCount * i;
  let max = 360 / colourCount * (i + 1);
  let diff = max - min;
  colours.push([])
  for (let j = 0; j < colourCount; j++) {
    let rgb = hsvToRgb(diff * j / colourCount + min, 50, 100);
    colours[i][j] = [
      rgb.map(val => val / 255), 
      parseInt(`${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`, 16)
    ]
  }
}

console.log(colours);