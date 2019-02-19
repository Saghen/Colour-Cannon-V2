const PIXI = require('pixi.js');
const Deque = require("double-ended-queue");

const app = new PIXI.Application({
  autoResize: true,
  resolution: devicePixelRatio
});

let container = new PIXI.ParticleContainer(100000, { uvs: false, tint: false, rotation: false, vertices: false });
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

  update(delta) {
    if (this.y > mousePos.y + 20 && this.active) {
      let x = mousePos.x - this.x;
      let y = mousePos.y - this.y;
      let h = Math.sqrt(x ** 2 + y ** 2);
      this.direction = [x / h, y / h];
    }
    else this.active = false;

    this.x += this.direction[0] * speed;
    this.y += this.direction[1] * speed;
  }

  delete() {
    container.removeChild(this.sprite);
  }
}

let circles = new Deque([]);

(function init() {
  resizeCanvas();
})()

const graphic = new PIXI.Graphics();
graphic.beginFill(0xFF0000);
graphic.drawRect(0, 0, 6, 6);
const texture = app.renderer.generateTexture(graphic);

function spawnCircles() {
  if (mouseDown) {
    for (let i = 0; i < columns; i++)
      circles.push(new Circle(app.view.width * i / columns, i, PIXI.Sprite.from(texture)));
  }
}

function updateCircles(delta) {
  let counter = 0;
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