import Modal from "components/modal";
import Map from "pages/maps/map";

export default class Point {
  static points = []
  constructor({ id, x, y, color, name }) {
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.name = name
    this.map = Map.instance
    this.width = 8
  }

  static add(point_data) {
    const point = new Point(point_data)
    Point.points = Point.points.filter((other) => other.id !== point.id)

    Point.points.push(point)
  }

  static at(x, y) {
    return this.points.find((point) => {
      const { x1, x2, y1, y2 } = point.outerBounds()
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        // Check for actual collision
        return true
      } else {
        return false
      }
    })
  }

  static new(x, y) {
    this.form({ x, y })
  }

  static edit(point) {
    this.form(point)
  }

  static form({ id, x, y, name, color}) {
    if (id) {
      document.querySelector("input#id").value = id
      document.querySelector(".delete-coord").classList.remove("hidden")
    } else {
      document.querySelector("input#id").value = null
      document.querySelector(".delete-coord").classList.add("hidden")
    }
    document.querySelector("input#x").value = Math.round(x)
    document.querySelector("input#y").value = Math.round(y)
    document.querySelector("input#color").value = color || "#0160FF"
    document.querySelector("input#name").value = name || ""

    if (!Modal.shown()) { Modal.show("#new_point") }
  }

  static setPoints(points) {
    Point.points = []
    points.forEach((point_data) => Point.add(point_data))
  }

  static draw() {
    let map = Map.instance
    this.points.forEach((point) => {
      const px = map.fx(point.x)
      const py = map.fy(-point.y)
      map.ctx.fillStyle = point.color || "#00F"
      map.ctx.beginPath()
      map.ctx.arc(px, py, point.width, 0, 2 * Math.PI)
      map.ctx.fill()

      map.ctx.fillStyle = "white"
      map.ctx.font = "10px Arial"
      map.ctx.textAlign = "left";
      map.ctx.fillText(`(${point.x},${point.y})`, 5 + px, 10 + py)
      map.ctx.fillText(point.name, 5 + px, 20 + py)
    })
  }

  widthFx() { return this.width * this.map.invZoom }
  heightFy() { return this.width * this.map.invZoom }
  outerBounds() {
    const width = this.widthFx()
    const height = this.heightFy()
    return {
      x1: this.x - width,
      x2: this.x + width,
      y1: this.y - height,
      y2: this.y + height,
    }
  }
}
