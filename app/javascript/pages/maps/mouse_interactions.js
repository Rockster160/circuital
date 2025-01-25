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

  if (!point) { return map.dragging = mouse.left }

  // Set mouse coords so dragged line is centered on point
  mouse.x = point.x
  mouse.y = point.y
})

document.addEventListener("mouseup", (evt) => {
  if (!mouse) { return }

  if (mouse.left) {
    if (mouse.dragging) {
      if (mouse.point) {
        mouse.point.save()
      } else {
        // Released, but did not start on a point
      }
    } else { // Regular left click
      if (mouse.point) {
        Point.edit(mouse.point)
      }
    }
  } else if (mouse.right) {
    if (mouse.dragging) {
      if (mouse.point) {
        const [x, y] = [map.absX(evt.clientX), -map.absY(evt.clientY)]
        const nextPoint = Point.at(x, y)
        if (nextPoint) {
          mouse.point.save({ connect_to_id: nextPoint.id })
        } else {
          Point.create({ ...mouse.point.toJson(), id: null, x, y, name: null, connect_from_id: mouse.point.id })
        }
      } else {
        // Released, but did not start on a point
      }
    } else { // Regular right click
      Point.new({ x: mouse.x, y: mouse.y })
    }
  }

  map.mouse = null
  mouse = null
})

document.addEventListener("mousemove", (evt) => {
  if (!mouse) { return }
  mouse.dragging = true

  if (mouse?.left && mouse.point) { // Drag point to new location
    mouse.point.x = Math.round(map.absX(evt.clientX))
    mouse.point.y = Math.round(-map.absY(evt.clientY))
  }
})
