import Point from "pages/maps/point";
import { addMapListeners } from "pages/maps/mouse_interactions"
export default class Map {
  static #instance = null
  static get instance() { return Map.#instance }

  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx

    this.zoom = 1
    this.x = -100
    this.y = -100

    this.mouse = null
    this.hoverX = null
    this.hoverY = null

    this.init()
    Map.#instance = this
  }

  static recenter(x, y, zoom) {
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

    let minX = null, minY = null, maxX = null, maxY = null
    points.forEach(point => {
      minX = Math.min(point.x, minX === null ? point.x : minX)
      minY = Math.min(-point.y, minY === null ? point.y : minY)
      maxX = Math.max(point.x, maxX === null ? point.x : maxX)
      maxY = Math.max(-point.y, maxY === null ? point.y : maxY)
    })
    const zoomOffset = 0.1
    ;[minX, minY] = [minX, minY].map(val => val - val * -zoomOffset)
    ;[maxX, maxY] = [maxX, maxY].map(val => val + val * zoomOffset)

    let zoom = Math.max(zoomOffset, Math.min(map.width / (maxX - minX), map.height / (maxY - minY))) || zoomOffset
    if (!isFinite(map.zoom)) { map.zoom = 2 }

    this.recenter((maxX + minX)/2, (maxY + minY)/2, zoom)
  }

  init() {
    this.dragging = false
    addMapListeners(this)
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

  dotPath(cx, cy, diameter) {
    let path = new Path2D();
    path.arc(cx, cy, diameter/2, 0, 2 * Math.PI)
    return path
  }

  squarePath(cx, cy, w) {
    let path = new Path2D();
    path.rect(cx-w/2, cy-w/2, w, w)
    return path
  }

  trianglePath(cx, cy, w) { // TODO: Center this better
    let path = new Path2D();
    cy -= w/7
    path.moveTo(cx, cy-w/2);
    path.lineTo(cx+w/2, cy+w/2);
    path.lineTo(cx-w/2, cy+w/2);
    return path
  }

  pointyPolyPath(cx, cy, ow, iw, points) {
    let path = new Path2D();
    let rot = (Math.PI/2) * 3
    const step = Math.PI / points
    const outerRadius = ow/2
    const innerRadius = iw/2

    path.moveTo(cx, cy-outerRadius)
    for (let i=0; i<points; i++) {
      const outerX = cx + Math.cos(rot) * outerRadius;
      const outerY = cy + Math.sin(rot) * outerRadius;
      path.lineTo(outerX, outerY)
      rot += step

      const innerX = cx + Math.cos(rot) * innerRadius;
      const innerY = cy + Math.sin(rot) * innerRadius;
      path.lineTo(innerX, innerY)
      rot += step
    }
    path.lineTo(cx, cy-outerRadius);
    return path
  }

  drawGrid() {
    const lines = 10
    const vp = this.viewport()
    const xRangeSpan = vp.x2 - vp.x1
    const approxSpacing = xRangeSpan / lines
    const exp = Math.floor(Math.log10(approxSpacing))
    const div = [10, 5, 1].map(base => (base * (10**exp))).find(base => base <= approxSpacing)
    const startX = Math.floor(vp.x1/div)*div
    const startY = Math.floor(vp.y1/div)*div

    const hAxis = (atX) => this.drawLine(0, this.fy(atX), this.width, this.fy(atX))
    const vAxis = (atY) => this.drawLine(this.fx(atY), 0, this.fx(atY), this.height)

    this.ctx.strokeStyle = "#888";
    this.ctx.lineWidth = 0.1;
    for (let x = startX; x < vp.x2+div; x+=div) {
      for (let y = startY; y < vp.y2+div; y+=div) {
        if (x === 0 || y === 0) { continue }
        vAxis(x)
        hAxis(y)
      }
    }

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 3;
    hAxis(0)
    vAxis(0)

    if (this.mouse?.dragging && this.mouse.right && this.mouse.point) {
      this.ctx.strokeStyle = this.mouse.point.color;
      this.ctx.lineWidth = 3;
      this.drawLine(this.fx(this.mouse.x), this.fy(-this.mouse.y), this.hoverX, this.hoverY)
    }
  }
}
