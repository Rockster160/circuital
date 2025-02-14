import { oddsOf, findMin } from "components/calc";

import Maze from "pages/challenges/maze/Maze";
import Direction from "pages/challenges/maze/Direction";

export default class Cell {
  constructor(map, x, y) {
    this.x = x
    this.y = y
    this._distance = null
    this._walked = false
    this._locked = false

    this.up = null
    this.right = null
    this.down = null
    this.left = null

    this._neighbors = null
    this.map = map
  }

  setMapSingle(val, bool) {
    if (this["_" + val] === bool) { return }
    const mapValCell = this.map.cellCache[val]
    if (bool) {
      if (mapValCell) { mapValCell[val] = false }
      this.map.cellCache[val] = this
      this.addClass(val)
    } else {
      this.map.cellCache[val] = null
      this.removeClass(val)
    }
    this["_" + val] = bool
  }

  setMapSet(val, bool) {
    if (this["_" + val] === bool) { return }
    if (bool && val !== "islands") { this.island = false }

    const mapSet = this.map.cellCache[val]
    if (bool) {
      mapSet.add(this)
      this.addClass(val)
    } else {
      mapSet.delete(this)
      this.removeClass(val)
    }
    this["_" + val] = bool
  }

  get first()        { return this._first }
  get last()         { return this._last }
  get farthest()     { return this._farthest }
  get finish()       { return this._finish }
  set first(bool)    { this.setMapSingle("first", bool) }
  set last(bool)     { this.setMapSingle("last", bool) }
  set farthest(bool) { this.setMapSingle("farthest", bool) }
  set finish(bool)   { this.setMapSingle("finish", bool) }

  get walked() { return this._walked }
  get locked() { return this._locked }
  get walking() { return this._walking }
  get walkers() { return this._walkers }
  get island() { return this._island }
  set walked(bool) { this.setMapSet("walked", bool) }
  set locked(bool) {
    if (bool && !this.walked) { this.walked = true } // Have to walk to lock
    this.setMapSet("locked", bool)
  }
  set walking(bool) { this.setMapSet("walking", bool) }
  set walker(bool) { this.setMapSet("walkers", bool) }
  set island(bool) { this.setMapSet("islands", bool) }

  get distance() { return this._distance }
  set distance(val) {
    if (val == this._distance) { return }
    this._distance = val
    this.content = val
    if (this.distance > this.map.farthestDist) {
      this.farthest = true
    }
    if (this.farthest) {
      this.map.farthestDist = this.distance
    }
  }

  set content(content) {
    const div = document.createElement("div")
    div.classList.add("cell-content")
    div.innerHTML = content
    this.ele.innerHTML = div.outerHTML
  }

  static addClass(...classNames) {
    document.querySelectorAll(".cell").forEach((ele) => ele.classList.add(...classNames))
  }
  static removeClass(...classNames) {
    document.querySelectorAll(".cell").forEach((ele) => ele.classList.remove(...classNames))
  }
  addClass(...classNames) {
    this.ele.classList.add(...classNames)
    return this
  }
  hasClass(className) {
    return this.ele.classList.contains(className)
  }
  removeClass(...classNames) {
    this.ele.classList.remove(...classNames)
    return this
  }

  neighbor(dir) { return this[dir.name] || this.map.at(...dir.from(this)) }
  neighbors() {
    return this._neighbors || (this._neighbors = Direction.directions.map((dir) => this.neighbor(dir)).filter(Boolean))
  }
  walkedNeighbors() {
    return this.neighbors().filter((cell) => cell?.walked)
  }
  connections() {
    return Direction.directions.map((dir) => this[dir.name]).filter(Boolean)
  }

  connect(dir, neighbor, nextDist=null) {
    this.walked = true
    neighbor = neighbor || this.neighbor(dir)

    if (!neighbor) { console.log("no neighbor", this); debugger }
    if (nextDist === null) {
      nextDist = neighbor.distance === null ? null : neighbor.distance+1
      if (nextDist === null) { console.log("unknown dist"); debugger }
    }

    this[dir.name] = neighbor
    this.ele.dataset[dir.name] = true
    if (neighbor[dir.opposite.name] === null) { neighbor.connect(dir.opposite, this, nextDist+1) }

    const conns = this.connections()
    if (conns.length == 2 && !this.locked && oddsOf(Maze.branchBias)) { this.locked = true }
    if (conns.length >= 3) { this.locked = true }

    if (this.distance === null) {
      this.distance = nextDist
    } else {
      this.recountDistance()
    }
  }

  recountDistance(prevCell=null) {
    if (this.first) { return this.distance = 0 }
    const conns = this.connections()
    const minDistCell = findMin(conns, (cell) => cell.distance)
    if (!minDistCell) { console.log("no connections in recount"); debugger }

    const nextDist = minDistCell.distance + 1
    if (this.distance === null) {
      this.distance = nextDist
    } else if (this.distance > nextDist) {
      this.distance = nextDist
      conns.forEach((cell) => prevCell != cell && cell.recountDistance(this))
    }
  }

  cascadeLock() {
    if (this.locked) { return this.locked }
    const walkedNeighbors = this.walkedNeighbors()
    if (walkedNeighbors.length == 4) {
      this.locked = true
      walkedNeighbors.forEach((cell) => cell.cascadeLock())
    }
    return this.locked
  }
}
