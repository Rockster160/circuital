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
        // Released after dragging, but did not start on a point
      }
    } else { // Regular left click
      if (mouse.point) {
        Point.edit(mouse.point)
      }
    }
  } else if (mouse.right) {
    if (mouse.dragging) {
      const [x, y] = [map.absX(evt.clientX), -map.absY(evt.clientY)]
      if (mouse.point) { // Right mouse released after dragging a point
        const nextPoint = Point.at(x, y)
        if (nextPoint) { // Released ON a point
          mouse.point.save({ connect_to_id: nextPoint.id })
        } else { // Released NOT on a point
          Point.create({ ...mouse.point.toJson(), id: null, x, y, name: null, connect_from_id: mouse.point.id })
        }
      } else { // Right mouse released after dragging without a point
        console.log("[ERROR] Still no point - should have created a point on drag start")
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

  if (mouse?.left && mouse.point) { // Dragging point to new location
    mouse.point.x = Math.round(map.absX(evt.clientX))
    mouse.point.y = Math.round(-map.absY(evt.clientY))
  }
  if (mouse?.right && !mouse.point) { // Create new default point and draw line to it
    mouse.point = Point.create({ x: Math.round(mouse.x), y: Math.round(mouse.y) })
    mouse.x = mouse.point.x
    mouse.y = mouse.point.y
  }
})
