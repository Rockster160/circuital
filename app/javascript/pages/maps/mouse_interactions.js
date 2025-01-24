import Point from "pages/maps/point";
import Map from "pages/maps/map";

let clickTimeout = null
let clickedPoint = null
let clickedBtn = null

class Mouse {
  constructor(evt, map) {
    this.x = map.absX(evt.clientX)
    this.y = -map.absY(evt.clientY)
    this.button = evt.button
  }

  get btn() {
    if (this.button === 0) { return "left" }
    if (this.button === 1) { return "middle" }
    if (this.button === 2) { return "right" }
  }
  get left() { return this.btn == "left" }
  get middle() { return this.btn == "middle" }
  get right() { return this.btn == "right" }
}

// Disable normal right click
window.oncontextmenu = function(evt) { evt.preventDefault() }

document.addEventListener("mousedown", (evt) => {
  const map = Map.instance
  const mouse = new Mouse(evt, map)

  const point = Point.at(mouse.x, mouse.y)
  if (point) {
    Point.edit(point)
  } else {
    if (mouse.right) {
      Point.new(mouse.x, mouse.y)
    }
  }
})
