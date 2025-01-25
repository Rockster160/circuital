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

    const mx = Math.round(map.absX(map.hoverX))
    const my = Math.round(map.absY(map.hoverY))
    if (map.hoverX !== null || map.hoverY !== null) {
      map.ctx.fillText(`(${mx},${my})`, 10 + map.hoverX, 5 + map.hoverY)
    }
  },
})

Keyboard.on("Enter", () => {
  if (Modal.shown()) {
    document.querySelector(".modal form").dispatchEvent(new Event("submit"))
  } else {
    Map.constrain()
  }
})
Keyboard.on("Backspace", () => {
  if (Modal.shown()) {
    if (document.activeElement.tagName !== "INPUT") {
      const id = document.querySelector("input#id").value
      Modal.hide()
      if (id) { Point.find(id).destroy() }
    }
  }
})

Modal.onShow((modal) => map.dragging = false)
Modal.onHide((modal) => map.dragging = false)

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
  const id = document.querySelector("input#id").value
  if (!id) { return }

  evt.preventDefault()

  Modal.hide()
  Point.find(id).destroy()
})
