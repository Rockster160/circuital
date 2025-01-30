import { rand, randf, rand1In, weightedChoice, tally, minMax, oddsOf, sample } from "components/calc";

const frameDelay = 0
let farthestCell = null

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
  static straightTendency = 2

  constructor(map, cell) {
    // console.log("spawn", cell)
    this.map = map
    this.x = cell.x
    this.y = cell.y
    this.walking = true
    this.direction = Direction.rand()
    this.path = []
    this.startDistance = null

    cell.addClass("start")
    this.addCell(cell)

    this.interval = setInterval(() => { this.walk() }, frameDelay)
  }

  static spawn(map) {
    Cell.removeClass("walker", "walking", "start", "end")

    let availableCells = this.availableStartingCells()
    if (availableCells.length == 0) {
      map.connectIslands()
      // console.log("Completed walking")
      return
    }
    Cell.removeClass("last")

    const cell = availableCells[rand(availableCells.length)]
    map.spawnWalker(cell)
    cell.locked = true
  }

  static availableStartingCells() {
    return [...this.walkedCells].filter((cell) => !cell.cascadeLock())
  }

  addCell(cell) {
    this.startDistance = this.startDistance || cell.distance || 0
    cell.distance = Math.min(cell.distance || Infinity, this.path.length + this.startDistance)
    if (!farthestCell || cell.distance > farthestCell.distance) {
      Cell.removeClass("farthest")
      farthestCell = cell.addClass("farthest")
    }
    this.path.push(cell)
    cell.walked = true

    Walker.walkedCells.add(cell)
    cell.addClass("walker", "walked", "walking")
    cell.content = cell.distance
  }

  cell() { return this.map.at(this.x, this.y) }

  directionWeights() {
    const currentDir = this.direction
    const reverseDir = this.direction.opposite
    let directions = {};
    Direction.directions.forEach((dir) => {
      // Do not allow flipping 180
      if (dir == reverseDir) { return }

      // Make sure the next coord is within bounds.
      const [x, y] = dir.from(this)
      const cell = this.map.at(x, y)
      if (!cell) { return }

      // Do not walk into _locked cells
      if (cell.locked) { return }
      // Try to avoid walking into already walked cells
      if (cell.walked) { return directions[dir.name] = 0.2 }

      directions[dir.name] = dir == currentDir ? Walker.straightTendency : 1
    })
    if (!Object.values(directions).some((weights) => weights >= 1)) {
      directions[null] = 0.5
    }
    return directions
  }

  walk() {
    const prevCell = this.cell()
    prevCell.removeClass("walker")

    const dirName = weightedChoice(this.directionWeights())
    const nextDir = Direction.from(dirName)
    if (!nextDir) { return this.die("stuck") }

    this.direction = nextDir
    const nextCoord = nextDir.from(this)
    ;[this.x, this.y] = nextCoord

    // When connecting to a previous path, this walker should end to prevent 4 ways
    if (this.cell().walked) { return this.die("intersection") }

    this.addCell(this.cell())
    prevCell.open(this.direction)
  }

  die(msg) {
    // console.log(`died by ${msg} at`, this.cell())
    this.cell().addClass("end", "last")
    clearInterval(this.interval)
    Walker.spawn(this.map)
  }
}

class Cell {
  constructor(map, x, y) {
    this.distance = null
    this.x = x
    this.y = y
    this.walked = false
    this._locked = false

    this.up = null
    this.right = null
    this.down = null
    this.left = null

    this._neighbors = null
    this.map = map
  }

  static addClass(...className) {
    document.querySelectorAll(".cell").forEach((ele) => ele.classList.add(...className))
  }
  static removeClass(...className) {
    document.querySelectorAll(".cell").forEach((ele) => ele.classList.remove(...className))
  }
  addClass(...className) {
    this.ele.classList.add(...className)
    return this
  }
  removeClass(...className) {
    this.ele.classList.remove(...className)
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

  set content(content) {
    const div = document.createElement("div")
    div.classList.add("cell-content")
    div.innerHTML = content
    this.ele.innerHTML = div.outerHTML
  }

  open(dir, walked = true) {
    const neighbor = this.neighbor(dir)
    this[dir.name] = neighbor

    if (walked) {
      this.walked = true
      this.ele.dataset.arrow = dir.arrow
      neighbor.open(dir.opposite, false)
    }

    this.ele.dataset[dir.name] = true
    if (this.connections().length == 2 && !this.locked) { this.locked = rand1In(4) }
    if (this.connections().length >= 3) { this.locked = true }
  }

  get locked() { return this._locked }
  set locked(bool) {
    if (bool && !this._locked) { this.addClass("locked") }
    if (bool && !this.walked) { this.addClass("walked").walked = true } // Have to walk to lock
    this._locked = bool
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
    this.board = [] // Array of arrays of cells, corresponding with layout
    this.cells = Array.from({ length: width * height }, (_, idx) => {
      const cell = new Cell(this, idx % width, Math.floor(idx / width))
      this.board[cell.y] = this.board[cell.y] || []
      this.board[cell.y][cell.x] = cell
      return cell
    })

    this.generate()
  }

  clean() {
    // leave "walked"
    Cell.removeClass("walker", "walking", "start", "end", "first", "last", "farthest", "locked")
    Cell.addClass("hide-content")
  }

  farthestCell() { return farthestCell }
  randCell() { return this.cells[rand(this.cells.length)] }

  unlockedCells() {
    return this.cells.filter((cell) => !cell.cascadeLock())
  }

  missedCells() {
    return this.cells.filter((cell) => !cell.walked)
  }

  connectIslands() {
    this.missedCells().forEach((cell) => {
      // console.log("island", cell)
      let isoCells = []
      let isoConnCount = null

      cell.neighbors().forEach((neighbor) => {
        const connCount = neighbor.connections().length
        if (!isoConnCount || connCount < isoConnCount) {
          isoCells = [neighbor]
          isoConnCount = connCount
        } else if (connCount == isoConnCount) {
          isoCells.push(neighbor)
        }
      })
      const neighbor = sample(isoCells)
      const isoDir = Direction.between(cell, neighbor)
      cell.open(isoDir)
      neighbor.walked = true
      cell.addClass("walked")
      neighbor.addClass("walked")
    })
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
      })
      boardEle.appendChild(rowEle)
    })
  }

  spawnWalker(cell) {
    return this.walker = new Walker(this, cell || this.randCell())
  }
}

// window.maze = new Maze(100, 50)
window.maze = new Maze(45, 25)
// window.maze = new Maze(10, 10)
window.maze.spawnWalker()
maze.walker.cell().addClass("first")

document.addEventListener("click", (evt) => {
  const cellEle = evt.target.closest(".cell")
  if (cellEle) {
    const cell = maze.at(parseInt(cellEle.dataset.x), parseInt(cellEle.dataset.y))
    debugger
  }
})
