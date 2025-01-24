import Point from "pages/maps/point";
import Mouse from "pages/maps/mouse";

let map = null
let mouse = null

export function addMapListeners(newMap) {
  map = newMap
  map.canvas.addEventListener("wheel", (evt) => {
    let zoomIn = evt.deltaY < 0
    map.zoom = map.zoom * (zoomIn ? 1.1 : 0.9)
  })
  map.canvas.onmouseup = (evt) => map.dragging = false
  map.canvas.onmouseleave = (evt) => map.dragging = false
  map.canvas.onmousemove = (evt) => {
    map.hoverX = evt.clientX
    map.hoverY = evt.clientY

    if (!map.dragging) { return }
    if (mouse?.dragging) { return } // Don't pan if holding a point

    map.x = map.x - (evt.movementX * map.invZoom)
    map.y = map.y - (evt.movementY * map.invZoom)
  }
}

// Disable normal right click
window.oncontextmenu = function(evt) { evt.preventDefault() }

document.addEventListener("mousedown", (evt) => {
  mouse = new Mouse(evt, map)
  map.mouse = mouse

  const point = Point.at(mouse.x, mouse.y)
  mouse.point = point // Might be null

  if (!point) { return map.dragging = true }

  // Set mouse coords so dragged line is centered on point
  mouse.x = point.x
  mouse.y = point.y
})

document.addEventListener("mouseup", (evt) => {
  if (!mouse) { return }

  if (mouse.left) {
    if (mouse.dragging) {
      if (mouse.point) {
        // TODO: save point coords
      } else {
        console.log("[INVALID] Mouse left dragging, but no point")
      }
    } else { // Regular left click
      if (mouse.point) {
        Point.edit(mouse.point)
      }
    }
  } else if (mouse.right) {
    if (mouse.dragging) {
      if (mouse.point) {
        const nextPoint = Point.at(mouse.x, mouse.y)
        if (nextPoint) {
          // TODO: push `connect_to_id: nextPoint.id`
        } else {
          // TODO: Open Point.new, fill in `hidden:connect_to_id` with nextPoint.id
        }
      } else {
        console.log("[INVALID] Mouse dragging, but no point")
      }
    } else { // Regular right click
      Point.new(mouse.x, mouse.y)
    }
  }

  map.mouse = null
  mouse = null
})

document.addEventListener("mousemove", (evt) => {
  if (!mouse?.point) { return }

  mouse.dragging = true // Mouse can only be set to dragging if there is a Point

  if (mouse.left) { // Drag point to new location
    mouse.point.x = Math.round(map.absX(evt.clientX))
    mouse.point.y = Math.round(-map.absY(evt.clientY))
  }
  // if (mouse.right) {}
})
