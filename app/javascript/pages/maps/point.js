import Modal from "components/modal";

export default class Point {
  static points = []
  constructor({ id, x, y, color, name }) {
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.name = name
    this.width = 8
  }

  static add(point_data) {
    const point = new Point(point_data)
    Point.points = Point.points.filter((other) => other.id !== point.id)

    Point.points.push(point)
  }

  static at(x, y) {
    return this.points.find((point) => {
      if (point.x - point.width > x) { return false }
      if (point.x + point.width < x) { return false }
      if (point.y - point.width > y) { return false }
      if (point.y + point.width < y) { return false }

      return true
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

    if (!Modal.shown()) { Modal.show("#new_coord") }
  }

  static setPoints(points) {
    Point.points = []
    points.forEach((point_data) => Point.add(point_data))
  }

  static draw(map) {
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

  path(map) {
    const circle = new Path2D()

    return circle
  }
}
