import Player from "pages/space_game/player";

const canvas = document.getElementById("space-game");
const ctx = canvas.getContext("2d");

let width = canvas.clientWidth;
let height = canvas.clientHeight;

const player = Player.instance
player.x = width/2;
player.y = height/2;
player.width = 10;

const observer = new ResizeObserver((entries) => {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
});
observer.observe(canvas)

function render(time) {
  console.log("Hi")
  canvas.width = width;
  canvas.height = height;

  Player.tick(ctx)

  requestAnimationFrame(render)
}
requestAnimationFrame(render)
