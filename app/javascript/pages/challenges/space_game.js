import Player from "pages/challenges/space_game/player";
import fullCanvasTick from "components/fullCanvasTick";

fullCanvasTick("space-game", {
  tick: (canvas, ctx, time) => {
    Player.tick(canvas, ctx)
  }
})
