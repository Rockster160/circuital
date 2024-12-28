import Player from "pages/challenges/space_game/player";

const canvas = document.getElementById("space-game");
const ctx = canvas.getContext("2d");

let width = canvas.clientWidth;
let height = canvas.clientHeight;

const player = new Player(canvas)

const observer = new ResizeObserver((entries) => {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
});
observer.observe(canvas)

function render(time) {
  canvas.width = width;
  canvas.height = height;

  Player.tick(ctx)

  requestAnimationFrame(render)
}
requestAnimationFrame(render)
