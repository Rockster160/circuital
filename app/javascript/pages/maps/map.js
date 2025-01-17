import Point from "pages/maps/point";
export default class Map {
  static #instance = null
  static get instance() { return Map.#instance }

  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx

    this.zoom = 1
    this.x = -100
    this.y = -100

    this.mouseX = null
    this.mouseY = null

    this.init()
    Map.#instance = this
  }

  static recenter(x, y, zoom) {
    console.log("recenter", x, y, zoom)
    let map = this.instance
    map.zoom = zoom || 1
    map.x = (x === undefined ? 0 : x) - map.widthFx/2
    map.y = (y === undefined ? 0 : y) - map.heightFy/2
  }

  static constrain() {
    let map = this.instance
    const points = Point.points
    if (points.length === 0) { return this.recenter() }
    if (points.length === 1) { return this.recenter(points[0].x, -points[0].y) }

    let minX = null
    let minY = null
    let maxX = null
    let maxY = null
    points.forEach(point => {
      if (minX === null || point.x < minX) { minX = point.x }
      if (minY === null || -point.y < minY) { minY = -point.y }
      if (maxX === null || point.x > maxX) { maxX = point.x }
      if (maxY === null || -point.y > maxY) { maxY = -point.y }
    })
    minX -= 100
    minY -= 100
    maxX += 100
    maxY += 100
    let zoom = Math.max(0.1, Math.min(map.width / (maxX - minX), map.height / (maxY - minY))) || 0.1
    if (!isFinite(map.zoom)) { map.zoom = 2 }

    this.recenter((maxX + minX)/2, (maxY + minY)/2, zoom)
  }

  init() {
    this.dragging = false
    this.canvas.addEventListener("wheel", (evt) => {
      let zoomIn = evt.deltaY < 0
      this.zoom = this.zoom * (zoomIn ? 1.1 : 0.9)
    })
    this.canvas.onmousedown = (evt) => { this.dragging = true }
    this.canvas.onmouseup = (evt) => { this.dragging = false }
    this.canvas.onmousemove = (evt) => {
      this.mouseX = evt.clientX
      this.mouseY = evt.clientY

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
