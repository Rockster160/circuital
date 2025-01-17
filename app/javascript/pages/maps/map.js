export default class Map {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx

    this.x = 0
    this.y = 0
    this.zoom = 1
    this.dragging = false

    this.init()
  }

  init() {
    this.canvas.addEventListener("wheel", (evt) => {
      let zoomIn = evt.deltaY < 0
      this.zoom = this.zoom * (zoomIn ? 1.1 : 0.9)
    })
    this.canvas.onmousedown = (evt) => { this.dragging = true }
    this.canvas.onmouseup = (evt) => { this.dragging = false }
    this.canvas.onmousemove = (evt) => {
      // console.log(evt.clientX, evt.clientY)
      if (!this.dragging) { return }

      this.x = this.x - (evt.movementX * this.invZoom)
      this.y = this.y - (evt.movementY * this.invZoom)
    }
  }

  get invZoom() { return 1 / this.zoom }
  get width() { return this.canvas.width }
  get height() { return this.canvas.height }
  get widthFx() { return this.width * this.invZoom }
  get heightFy() { return this.height * this.invZoom }

  // Convert "screen" coordinates to coordinates on the map
  absX(val) { return this.x + (val * this.invZoom) }
  absY(val) { return this.y + (val * this.invZoom) }

  // Convert coordinates on the map to "screen" coordinates
  fx(val) { return (val - this.x) * this.zoom }
  fy(val) { return (val - this.y) * this.zoom }

  viewport() {
    return {
      x1: this.x,
      y1: this.y,
      x2: this.x + this.widthFx,
      y2: this.y + this.heightFy,
    }
  }

  drawLine(x1, y1, x2, y2) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  drawGrid() {
    const vp = this.viewport()
    const div = 100

    const hAxis = (atX) => this.drawLine(0, this.fy(atX), this.width, this.fy(atX))
    const vAxis = (atY) => this.drawLine(this.fx(atY), 0, this.fx(atY), this.height)

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 3;
    hAxis(0)
    vAxis(0)

    this.ctx.strokeStyle = "grey";
    this.ctx.lineWidth = 0.1;
    for (let x = Math.floor(vp.x1/div)*div; x < vp.x2+div; x+=div) {
      for (let y = Math.floor(vp.y1/div)*div; y < vp.y2+div; y+=div) {
        if (x === 0 || y === 0) { continue }
        vAxis(x)
        hAxis(y)
      }
    }
  }
}
