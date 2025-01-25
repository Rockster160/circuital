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
    this.width = width || 8
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
      // const px = point.clientX()
      // const py = point.clientY()
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
      // console.log("Created:", data);
    }).catch((error) => {
      console.error("[ERROR] Failed to destroy:", error);
    })
  }

  // clientX() { return this.map.fx(this.x) }
  // clientY() { return this.map.fy(this.y) } // negative y?

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
