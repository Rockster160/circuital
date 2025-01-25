import Modal from "components/modal";
import Map from "pages/maps/map";
import fetchJson from "components/fetchJson";

export default class Point {
  static points = []
  constructor({ id, x, y, color, name, width, shape, line_to_ids }) {
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.name = name
    this.map = Map.instance
    this.width = width || 12
    this.shape = shape || "circle"
    this.line_to_ids = line_to_ids || []
  }

  static add(point_data) {
    const point = new Point(point_data)
    Point.points = Point.points.filter((other) => other.id !== point.id)

    Point.points.push(point)
  }

  static find(id) {
    return this.points.find((point) => point.id === Number(id))
  }

  static at(x, y) {
    return this.points.find((point) => {
      const { x1, x2, y1, y2 } = point.outerBounds()
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        // return point.isAt(x, y)
        // Map.instance.isPointInPath(point.path(), x, y)
        // Check for actual collision
        return true
      } else {
        return false
      }
    })
  }

  static new(args) {
    this.form(args)
  }

  static edit(point) {
    this.form(point)
  }

  static create(point) {
    this.form({ ...point, id: null, form: false })
  }

  static form({ id, x, y, name, color, shape, connect_from_id, form = true }) {
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
    document.querySelector("select#shape").value = shape || "circle"
    document.querySelector("input#connect_from_id").value = connect_from_id || null

    if (form) {
      if (!Modal.shown()) { Modal.show("#new_point") }
    } else {
      document.querySelector(".modal form").dispatchEvent(new Event("submit"))
    }
  }

  static setPoints(points) {
    Point.points = []
    points.forEach((point_data) => Point.add(point_data))
  }

  static draw() {
    let map = Map.instance
    // Draw lines first so they are underneath points
    this.points.forEach((point) => {
      point.line_to_ids.forEach((line_to_id) => {
        const otherPoint = Point.find(line_to_id)

        map.ctx.strokeStyle = point.color;
        map.ctx.lineWidth = 3;
        map.drawLine(map.fx(point.x), map.fy(-point.y), map.fx(otherPoint.x), map.fy(-otherPoint.y))
      })
    })
    // Draw points
    this.points.forEach((point) => {
      const px = point.clientX()
      const py = point.clientY()
      point.draw()

      map.ctx.fillStyle = "white"
      map.ctx.font = "10px Arial"
      map.ctx.textAlign = "left";
      map.ctx.fillText(`(${point.x},${point.y})`, 5 + px, 10 + py)
      map.ctx.fillText(point.name, 5 + px, 20 + py)
    })
  }

  toJson() {
    const skipAttrs = ["map", "line_to_ids"]
    let json = {}
    for (const key in this) { !skipAttrs.includes(key) && (json[key] = this[key]) }
    return json
  }

  save(json) {
    json = json || this.toJson()
    const form = document.querySelector(".modal form")
    fetchJson(form.action + `/${this.id}`, { method: "PATCH", body: json }).then((data) => {
      // console.log("Created:", data);
    }).catch((error) => {
      console.error("[ERROR] Failed to update:", error);
    })
  }

  destroy() {
    const form = document.querySelector(".modal form")
    fetchJson(form.action + `/${this.id}`, { method: "DELETE" }).then((data) => {
      // console.log("Destroyed:", data);
    }).catch((error) => {
      console.error("[ERROR] Failed to destroy:", error);
    })
  }

  clientX() { return this.map.fx(this.x) }
  clientY() { return this.map.fy(-this.y) } // negative y?

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

  isAt(x, y) {
    console.log(this.map.ctx.isPointInPath(this.path(), x, y), x, y, this.outerBounds())
    return this.map.ctx.isPointInPath(this.path(), x, y)
  }

  path() {
    const map = this.map
    let w = this.width

    if (this.shape === "circle") {
      w = w // Circle is the basis of the width
      return map.dotPath(this.clientX(), this.clientY(), w)
    } else if (this.shape === "square") {
      w *= 0.8 // Slightly decrease the size of squares to match circles
      return map.squarePath(this.clientX(), this.clientY(), w, w)
    } else if (this.shape === "triangle") {
      w *= 1.1
      return map.trianglePath(this.clientX(), this.clientY(), w)
    } else if (this.shape === "star") {
      w *= 1.4
      return map.pointyPolyPath(this.clientX(), this.clientY(), w, w/2, 5)
    } else {
      map.ctx.lineWidth = 2
      map.ctx.strokeStyle = "red"
      map.ctx.stroke(map.dotPath(this.clientX(), this.clientY(), w))
      return
    }
  }

  draw() {
    const map = this.map
    const ctx = map.ctx
    ctx.fillStyle = this.color || "#00F"
    ctx.fill(this.path())
  }
}
