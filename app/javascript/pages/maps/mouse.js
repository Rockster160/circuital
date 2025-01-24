export default class Mouse {
  constructor(evt, map) {
    this.clientX = evt.clientX
    this.clientY = evt.clientY

    this.x = map.absX(evt.clientX)
    this.y = -map.absY(evt.clientY)

    this.button = evt.button
    this.point = null

    this.dragging = false
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
