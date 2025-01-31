import { rand, randf, rand1In, weightedChoice, tally, minMax, oddsOf, sample, findMin, findMax } from "components/calc";
import Keyboard from "components/keyboard";
import { currentTime, duration } from "components/helpers";

const frameDelay = 0

const straightPreference = 4/1 // (4/1)
// straightPreference - Results in paths tending to go straight instead of turning
// 1 is no bias. 2 is twice as likely to go straight, when given the option.
// 0..1 will cause paths to turn more often than go straight
const branchBias = 1/2 // (1/4)
// 0 means cells never branch (3 way or 4 way)
// 1 means every cell will try to have 3 directions (unless blocked by cells that are already complete)
const adjacentBias = 1/4 // (1/4)
// - When paths run alongside each other, controls the tendency to turn into it vs away from it.
// 0 means avoid paths in favor of open cells - this will cause `loopProbability` to be ignored
// 0.5 means half as likely to choose over preferring an "open" route
// 1 no bias - treat paths and open cells equally
// 1+ is valid, but causes weirdness because the walker will TRY to connect instead of taking the open path.
// This will cause more dead ends instead of running along each other or turning away.
const loopProbability = 2/4 // (1/4)
// - When a walker reaches a previous path, this is the likelihood of connecting to it.
// 0 means no loops, prefer dead ends
// 1 means every cell will try to reconnect to a previous path (unless locked via branchBias)


// I'd like to avoid a 2x2 "loop", but not sure how to. 🤔

const startTime = currentTime()
console.log("Started", startTime)

class Direction {
  static names = ["up", "right", "down", "left"]
  static arrows = ["↑", "→", "↓", "←"]
  static coords = [[0, -1], [1, 0], [0, 1], [-1, 0]]
  static directions = this.names.map((name, idx) => new Direction(name))

  constructor(dir) {
    this.idx = Direction.names.indexOf(dir)
    this.name = Direction.names[this.idx]
    this.arrow = Direction.arrows[this.idx]
    this.coord = Direction.coords[this.idx]
    ;[this.x, this.y] = this.coord
  }

  static from(name) { return this.directions[this.names.indexOf(name)] }
  static between(cell1, cell2) {
    if (cell1.x == cell2.x) {
      if (cell1.y > cell2.y) { return this.up() }
      if (cell1.y < cell2.y) { return this.down() }
    } if (cell1.y == cell2.y) {
      if (cell1.x > cell2.x) { return this.left() }
      if (cell1.x < cell2.x) { return this.right() }
    }
  }

  static rand()  { return this.directions[rand(4)] }
  static up()    { return this.directions[0] }
  static right() { return this.directions[1] }
  static down()  { return this.directions[2] }
  static left()  { return this.directions[3] }

  from(x, y) {
    if (x instanceof Walker) { return [this.x + x.x, this.y + x.y] }
    if (x instanceof Cell) { return [this.x + x.x, this.y + x.y] }
    if (Array.isArray(x)) { return [this.x + x[0], this.y + x[1]] }
    return [this.x + x, this.y + y]
  }
  get opposite() { return this._opposite = this._opposite || Direction.directions[(this.idx + 2) % 4] }
}

export class Walker {
  static walkedCells = new Set()

  constructor(map, cell) {
    this.map = map
    this.x = cell.x
    this.y = cell.y
    this.walking = true
    this.direction = null
    this.path = []
    this.startDistance = null

    cell.start = true
    this.addCell(cell)

    this.interval = setInterval(() => { this.walk() }, frameDelay)
  }

  static spawn(map) {
    let availableCells = this.availableStartingCells()
    if (availableCells.length == 0) { return map.connectIslands() }

    const cell = sample(availableCells)
    map.spawnWalker(cell)
    if (cell != maze.first) { cell.locked = true } // Leave possibility for start to branch out
  }

  static availableStartingCells() {
    return [...this.walkedCells].filter((cell) => !cell.cascadeLock())
  }

  addCell(cell, dir, prevCell) {
    this.startDistance = this.startDistance || cell.distance || 0
    if (dir && prevCell) {
      prevCell.open(dir, cell, this.path.length + this.startDistance - 1) // Adds connection and recounts
    }
    // Push after open so that first cell is 0 distance
    this.path.push(cell)

    Walker.walkedCells.add(cell)
    cell.walked = true
    cell.walker = true
    cell.walking = true
    cell.last = true
    cell.end = true
  }

  cell() { return this.map.at(this.x, this.y) }

  directionWeights() {
    const currentDir = this.direction
    const reverseDir = this.direction?.opposite
    let directions = {};
    Direction.directions.forEach((dir) => {
      // Do not allow flipping 180
      if (dir == reverseDir) { return }

      // Make sure the next coord is within bounds.
      const [x, y] = dir.from(this)
      const cell = this.map.at(x, y)
      if (!cell) { return }

      // Do not walk into locked cells
      if (cell.locked) { return }
      // Try to avoid walking into already walked cells
      if (cell.walked) {
        if (adjacentBias == 0) { return }
        return directions[dir.name] = 1/adjacentBias
      }

      directions[dir.name] = dir == currentDir ? straightPreference : 1
    })
    return directions
  }

  walk() {
    const prevCell = this.cell()
    prevCell.walker = false

    const dirName = weightedChoice(this.directionWeights())
    const nextDir = Direction.from(dirName)
    if (!nextDir) { return this.die("stuck") }

    this.direction = nextDir
    const nextCoord = nextDir.from(this)
    ;[this.x, this.y] = nextCoord

    if (this.cell().walked) {
      if (oddsOf(loopProbability)) {
        this.addCell(this.cell(), this.direction, prevCell)
        return this.die("loop")
      } else {
        return this.die("deadend")
      }
    } else {
      this.addCell(this.cell(), this.direction, prevCell)
    }
  }

  die(msg) {
    this.path.forEach((cell) => cell.walking = false)
    this.map.start = null
    this.map.end = null
    clearInterval(this.interval)
    Walker.spawn(this.map)
  }
}

class Cell {
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
    const mapValCell = this.map[val]
    if (bool) {
      if (mapValCell == this) { return }
      if (mapValCell) { mapValCell[val] = false }
      this.map.cellCache[val] = this
      this.addClass(val)
    } else {
      if (mapValCell != this) { return }
      this.map.cellCache[val] = null
      this.removeClass(val)
    }
  }

  setMapSet(val, bool) {
    if (bool && val !== "islands") { this.island = false }

    const mapSet = this.map[val]
    if (bool) {
      if (mapSet.has(this)) { return }
      mapSet.add(this)
      this.addClass(val)
    } else {
      if (!mapSet.has(this)) { return }
      mapSet.delete(this)
      this.removeClass(val)
    }
  }

  get start()        { return this._start }
  get end()          { return this._end }
  get first()        { return this._first }
  get last()         { return this._last }
  get farthest()     { return this._farthest }
  set start(bool)    { this._start = bool; this.setMapSingle("start", bool) }
  set end(bool)      { this._end = bool; this.setMapSingle("end", bool) }
  set first(bool)    { this._first = bool; this.setMapSingle("first", bool) }
  set last(bool)     { this._last = bool; this.setMapSingle("last", bool) }
  set farthest(bool) { this._farthest = bool; this.setMapSingle("farthest", bool) }

  get walked() { return this._walked }
  get locked() { return this._locked }
  set walked(bool) {
    if (bool == this._walked) { return }
    this._walked = bool
    this.setMapSet("walked", bool)
  }
  set locked(bool) {
    if (bool == this._locked) { return }
    if (bool && !this.walked) { this.walked = true } // Have to walk to lock
    this._locked = bool
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

  open(dir, neighbor, nextDist=null) {
    this.walked = true
    neighbor = neighbor || this.neighbor(dir)

    if (!neighbor) { console.log("no neighbor", this); debugger }
    if (nextDist === null) {
      nextDist = neighbor.distance === null ? null : neighbor.distance+1
      if (nextDist === null) { console.log("unknown dist"); debugger }
    }

    this[dir.name] = neighbor
    this.ele.dataset[dir.name] = true
    if (neighbor[dir.opposite.name] === null) { neighbor.open(dir.opposite, this, nextDist+1) }

    const conns = this.connections()
    if (conns.length == 2 && !this.locked && oddsOf(branchBias)) { this.locked = true }
    if (conns.length >= 3) { this.locked = true }

    if (this.distance === null) {
      this.distance = nextDist
      if (this.distance > this.map.farthest.distance) {
        this.map.farthest = this
      }
    } else {
      this.recountDistance()
    }
  }

  recountDistance(newVal, farthestCell=null) {
    if (this.first) { return this.distance = 0 }
    const conns = this.connections()
    const minDistCell = findMin(conns, (cell) => cell.distance)
    if (!minDistCell) { console.log("no connections in recount"); debugger }

    const nextDist = minDistCell.distance + 1
    if (this.distance === null) {
      this.distance = nextDist
    } else if (this.distance > nextDist) {
      this.distance = nextDist
      conns.forEach((cell) => cell.recountDistance())
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

class Maze {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.cellCache = {
      first:    null, // First cell in the maze
      last:     null, // Last cell to be generated
      start:    null, // Current walker start
      end:      null, // Current walker end
      farthest: null,
      walked:   new Set(),
      locked:   new Set(),
      walking:  new Set(),
      walkers:  new Set(),
      islands:  new Set(),
    }
    this.board = [] // Array of arrays of cells, corresponding with layout
    this.cells = Array.from({ length: width * height }, (_, idx) => {
      const cell = new Cell(this, idx % width, Math.floor(idx / width))
      this.board[cell.y] = this.board[cell.y] || []
      this.board[cell.y][cell.x] = cell
      return cell
    })

    this.generate()
  }

  get start() { return this.cellCache.start }       // single cell
  get end() { return this.cellCache.end }           // single cell
  get first() { return this.cellCache.first }       // single cell
  get last() { return this.cellCache.last }         // single cell
  get farthest() { return this.cellCache.farthest || this.findFarthestCell() } // single cell

  get walked() { return this.cellCache.walked }     // cell list
  get locked() { return this.cellCache.locked }     // cell list
  get walking() { return this.cellCache.walking }   // cell list
  get walkers() { return this.cellCache.walkers }     // cell list
  get islands() { return this.cellCache.islands }   // cell list

  unset(val) {
    const cell = this.cellCache[val]
    if (cell) { cell[val] = false }
  }

  set start(newCell) { newCell ? (newCell.start = true) : (this.unset("start")) }
  set end(newCell) { newCell ? (newCell.end = true) : (this.unset("end")) }
  set first(newCell) { newCell ? (newCell.first = true) : (this.unset("first")) }
  set last(newCell) { newCell ? (newCell.last = true) : (this.unset("last")) }
  set farthest(newCell) { newCell ? (newCell.farthest = true) : (this.unset("farthest")) }

  randCell() { return this.cells[rand(this.cells.length)] }

  findFarthestCell() {
    console.log("Finding farthest")
    const farthest = findMax(this.walked, (cell) => cell.distance)
    if (farthest) { return this.cellCache.farthest = farthest }
  }

  connectIslands(islands=null) {
    islands = islands === null ? this.islands : islands
    const cell = sample(islands)
    if (!cell) {
      const endTime = currentTime()
      console.log("Completed", endTime)
      console.log("Duration: " + duration(startTime, endTime))
      return
    }
    let isoCells = []
    let isoConnCount = null

    cell.neighbors().forEach((neighbor) => {
      const connCount = neighbor.connections().length
      if (connCount == 0) { return }
      if (!isoConnCount || connCount < isoConnCount) {
        isoCells = [neighbor]
        isoConnCount = connCount
      } else if (connCount == isoConnCount) {
        isoCells.push(neighbor)
      }
    })

    if (isoCells.length == 0) { // Deserted island, retry to find one with connections
      const withoutSkipped = Array.from(islands).filter((iso) => iso != cell)
      return this.connectIslands(withoutSkipped)
    }

    const neighbor = sample(isoCells)
    const isoDir = Direction.between(cell, neighbor)
    cell.open(isoDir, neighbor)
    this.spawnWalker(neighbor)
  }

  at(x, y) { return this.board[y]?.[x] }

  generate() {
    const boardEle = document.getElementById("maze")
    this.board.forEach((row) => {
      let rowEle = document.createElement("div")
      rowEle.classList.add("row")
      row.forEach((cell) => {
        let cellEle = document.createElement("div")
        cellEle.classList.add("cell")
        cellEle.dataset.x = cell.x
        cellEle.dataset.y = cell.y
        rowEle.appendChild(cellEle)
        cell.ele = cellEle
        cell.island = true
      })
      boardEle.appendChild(rowEle)
    })
  }

  spawnWalker(cell) {
    cell = cell || this.randCell()
    if (!this.first) {
      cell.first = true
      cell.distance = 0
    }
    return this.walker = new Walker(this, cell)
  }
}

window.Direction = Direction
window.Walker = Walker
window.Cell = Cell
window.Maze = Maze

// window.maze = new Maze(100, 50)
window.maze = new Maze(45, 25)
// window.maze = new Maze(10, 10)

maze.spawnWalker(maze.randCell())

document.addEventListener("click", (evt) => {
  const cellEle = evt.target.closest(".cell")
  if (cellEle) {
    const cell = maze.at(parseInt(cellEle.dataset.x), parseInt(cellEle.dataset.y))
    debugger
  }
})


let cleanCells = false
Keyboard.on("Space", () => {
  if (cleanCells) {
    Cell.removeClass("clean")
    cleanCells = false
  } else {
    Cell.addClass("clean")
    cleanCells = true
  }
})

Keyboard.on("Enter", () => {
  console.log("Checking...")
  let data = { valid: 0, walked: 0, island: 0, invalid: 0 }
  maze.cells.forEach(cell => {
    if (cell.walked) { data.walked += 1 } else { return data.island += 1 }
    const bad = cell.connections().every(conn => Math.abs(cell.distance - conn.distance) == 1)
    if (cell.bad) { data.invalid += 1 } else { data.valid += 1 }
  })
  console.log(data)
})
