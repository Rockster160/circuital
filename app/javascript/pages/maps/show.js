import "channels/map_channel";
import fullCanvasTick from "components/fullCanvasTick";
import Modal from "components/modal";
import Point from "pages/maps/point";
import Map from "pages/maps/map";
import fetchJson from "components/fetchJson";
import Keyboard from "components/keyboard"

let map = null

fullCanvasTick("coord-map", {
  setup: (canvas, ctx) => {
    map = new Map(canvas, ctx)
  },
  tick: (canvas, ctx, time) => {
    map.drawGrid()
    Point.draw(map)

    map.ctx.fillStyle = "white"
    map.ctx.font = "10px Arial"
    map.ctx.fillText("(0,0)", 5 + map.fx(0), 10 + map.fy(0))

    const mx = Math.round(map.absX(map.mouseX))
    const my = Math.round(map.absY(map.mouseY))
    if (map.mouseX !== null || map.mouseY !== null) {
      map.ctx.fillText(`(${mx},${my})`, 10 + map.mouseX, 5 + map.mouseY)
    }
  },
})

Keyboard.on("Enter", () => Map.constrain())

Modal.onShow((modal) => map.dragging = false)
Modal.onHide((modal) => map.dragging = false)

window.oncontextmenu = function(evt) {
  evt.preventDefault()

  const coordX = map.absX(evt.clientX)
  const coordY = -map.absY(evt.clientY)

  Point.new(coordX, coordY)
}

document.addEventListener("mousedown", (evt) => {
  if (evt.button !== 0) { return }

  const mapX = map.absX(evt.clientX)
  const mapY = -map.absY(evt.clientY)

  const point = Point.at(mapX, mapY)
  if (!point) { return }

  Point.edit(point)
})

const form = document.querySelector(".modal form")
form.addEventListener("submit", (evt) => {
  evt.preventDefault();

  Modal.hide()

  const formData = new FormData(form)
  const formJson = Object.fromEntries(formData.entries())

  fetchJson(form.action, { method: "POST", body: formJson }).then((data) => {
    // console.log("Created:", data);
  }).catch((error) => {
    console.error("[ERROR] Failed to create:", error);
  })
})

document.querySelector(".delete-coord").addEventListener("click", (evt) => {
  const btn = evt.target
  const id = document.querySelector("input#id").value
  if (!id) { return }
  evt.preventDefault()

  Modal.hide()

  fetchJson(btn.href.replace(".%7Bid%7D", `/${id}`), { method: "DELETE" }).then((data) => {
    // console.log("Deleted:", data);
  }).catch((error) => {
    console.error("[ERROR] Failed to delete:", error);
  })
})
