import { rand, randf, rand1In, weightedChoice, tally, minMax, oddsOf } from "components/calc";

const arrow = (dir) => {
  return {
    up:    "↑",
    down:  "↓",
    left:  "←",
    right: "→",
  }[dir]
}

// Occasionally getting 4 ways
// This is because, despite locking on too many neighbors, the links are single directional
// Could solve this by adding the "open" to both cells and/or actually linking cells in data
// cellA.left = cellB; cellB.right = cellA
// Also still having missed cells - does this matter, or should we allow islands?

const frameDelay = 20

export default class Walker {
  static walkedCells = new Set()
  static straightTendency = 2

  constructor(map, args) {
    this.map = map
    this.x = null
    this.y = null
    this.walking = true
    this._direction = rand(4)
    this.path = []

    if (args) {
      for (const [key, val] of Object.entries(args)) { this[key] = val }
    }

    this.cell().ele.classList.add("start")
    this.interval = setInterval(() => { this.walk() }, frameDelay)
  }

  static spawn(map) {
    document.querySelectorAll(".cell").forEach((ele) => ele.classList.remove("walker", "walked", "start", "end"))

    const startingCells = this.availableStartingCells()
    if (startingCells.length == 0) { return console.log("no starting cells") }

    const cell = startingCells[rand(startingCells.length)]
    console.log("spawn", cell)
    new Walker(map, { x: cell.x, y: cell.y })
    cell.locked = true
  }

  static availableStartingCells() {
    return [...this.walkedCells].filter((cell) => !cell.locked)
  }

  cell() { return this.map.at(this.x, this.y) }

  get direction() {
    return ["up", "right", "down", "left"][this._direction]
  }
  set direction(newDirection) {
    this._direction = ["up", "right", "down", "left"].indexOf(newDirection)
  }
  reverseDir() {
    return {
      up:    "down",
      down:  "up",
      left:  "right",
      right: "left",
    }[this.direction]
  }

  directionWeights() {
    const currentDir = this.direction
    const reverseDir = this.reverseDir()
    let directions = {};
    // directions[this.direction] = Walker.straightTendency // Increase tendency to go straight
    (["up", "right", "down", "left"]).forEach((dir) => {
      // Do not allow flipping 180
      if (dir == reverseDir) { return false }

      // Make sure the next coord is within bounds.
      const [x, y] = this.nextCoord(dir)
      const cell = this.map.at(x, y)
      if (!cell) { return false }

      if (cell.locked) { return false }
      if (cell.walked) {
        directions[dir] = 0.2
        return
      }

      directions[dir] = dir == currentDir ? Walker.straightTendency : 1
    })
    return directions
  }

  nextCoord(dir) {
    dir = dir || this.direction
    let x = this.x, y = this.y
    return {
      up:    () => [x, y - 1],
      down:  () => [x, y + 1],
      left:  () => [x - 1, y],
      right: () => [x + 1, y],
    }[dir]()
  }

  walk() {
    // const prevX = this.x, prevY = this.y
    const prevCell = this.cell()
    this.path.push(prevCell)
    Walker.walkedCells.add(prevCell)
    const nextDir = weightedChoice(this.directionWeights())
    prevCell.ele.classList.remove("walker")

    if (!nextDir) { return this.die() }
    // console.log([this.x, this.y], this.directionWeights(), nextDir)

    this.direction = nextDir
    const nextCoord = this.nextCoord(nextDir)
    this.x = nextCoord[0]
    this.y = nextCoord[1]

    this.cell().ele.classList.add("walker")

    if (this.cell().walked) { return this.die() }
    // if (this.cell().walked && oddsOf(3/4)) { return this.die() } // 25% chance of connecting if walking into a walked cell
    prevCell.open(this.direction)
  }

  die() {
    console.log("died at", this.x, this.y)
    this.cell().ele.classList.add("end")
    clearInterval(this.interval)
    Walker.spawn(this.map)
  }
}

class Cell {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.walked = false
    this.locked = false

    this.up = null
    this.right = null
    this.down = null
    this.left = null
    // distance from start
    // directions - array of up/left/down/right where the cell opens up
  }

  directions() {
    return ["up", "right", "down", "left"].filter((dir) => this[dir])
  }

  open(dir) {
    this.walked = true
    this.ele.classList.add("walked")
    this.ele.dataset.direction = arrow(dir)
    this[dir] = true
    this.ele.dataset[dir] = true
    if (this.directions().length == 2 && !this.locked) { this.locked = rand1In(4) }
    if (this.directions().length >= 3) { this.locked = true }
  }
}

class Maze {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.board = [] // Array of arrays of cells, corresponding with layout
    this.cells = Array.from({ length: width * height }, (_, idx) => {
      const cell = new Cell(idx % width, Math.floor(idx / width))
      this.board[cell.y] = this.board[cell.y] || []
      this.board[cell.y][cell.x] = cell
      return cell
    })

    this.generate()
  }

  unlockedCells() {
    return this.cells.filter((cell) => !cell.locked)
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
}

const maze = new Maze(45, 25)

new Walker(maze, { x: rand(maze.width), y: rand(maze.height) })
