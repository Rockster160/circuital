import { rand, randf, rand1In, weightedChoice, tally, minMax, oddsOf, sample } from "components/calc";

// Also still having missed cells - does this matter, or should we allow islands?

const frameDelay = 20

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

    cell.ele.classList.add("start")
    this.addCell(cell)

    this.interval = setInterval(() => { this.walk() }, frameDelay)
  }

  static spawn(map) {
    document.querySelectorAll(".cell").forEach((ele) => ele.classList.remove("walker", "walked", "start", "end"))

    const startingCells = this.availableStartingCells()
    if (startingCells.length == 0) { return console.log("no starting cells") }
    document.querySelectorAll(".cell").forEach((ele) => ele.classList.remove("last"))

    const cell = startingCells[rand(startingCells.length)]
    new Walker(map, cell)
    cell.locked = true
  }

  static availableStartingCells() {
    return [...this.walkedCells].filter((cell) => !cell.locked)
  }

  addCell(cell) {
    this.startDistance = this.startDistance || cell.distance || 0
    cell.distance = Math.min(cell.distance || Infinity, this.path.length + this.startDistance)
    this.path.push(cell)

    Walker.walkedCells.add(cell)
    cell.ele.classList.add("walker", "walked")
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

      // Do not walk into locked cells
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
    prevCell.ele.classList.remove("walker")

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
    this.cell().ele.classList.add("end", "last")
    clearInterval(this.interval)
    Walker.spawn(this.map)
  }
}

class Cell {
  constructor(map, x, y) {
    this.map = map
    this.x = x
    this.y = y
    this.walked = false
    this.locked = false

    this.up = null
    this.right = null
    this.down = null
    this.left = null
    this.distance = null
  }

  neighbor(dir) { return this.map.at(...dir.from(this)) }
  neighbors() {
    return Direction.directions.map((dir) => this.neighbor(dir))
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
    // if (this.locked) { this.ele.classList.add("locked") }
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

  randCell() { return this.cells[rand(this.cells.length)] }

  unlockedCells() {
    return this.cells.filter((cell) => !cell.locked)
  }

  missedCells() {
    return this.cells.filter((cell) => !cell.walked)
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

  spawnWalker() {
    return this.walker = new Walker(this, this.randCell())
  }
}

window.maze = new Maze(45, 25)
window.maze.spawnWalker()
maze.walker.cell().ele.classList.add("first")
