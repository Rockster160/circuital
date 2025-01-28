import { rand, randf, weightedChoice, tally, minMax } from "components/calc";

export default class Walker {
  static walkers = []
  static straightTendency = 2

  constructor(map, args) {
    this.map = map
    this.x = null
    this.y = null
    this.walking = true
    this._direction = rand(4)

    if (args) {
      for (const [key, val] of Object.entries(args)) { this[key] = val }
    }

    Walker.walkers.push(this)
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

  availableDirections() {
    const currentDir = this.direction
    const reverseDir = this.reverseDir()
    return ["up", "right", "down", "left"].filter((dir) => {
      // if (this.x == 0 || this.y == 0 || this.x == this.map.width - 1 || this.y == this.map.height - 1) { debugger }
      // Do not allow flipping 180
      if (dir == reverseDir) { return false }

      // Make sure the next coord is within bounds.
      const [x, y] = this.nextCoord(dir)
      const cell = this.map.at(x, y)
      if (!cell) { return false }

      // Make sure next coord is not locked.
      if (cell.locked) { return false }

      return true
    })
  }

  nextCoord(dir) {
    dir = dir || this.direction
    let x = this.x, y = this.y
    return {
      up:    () => [x, y - 1],
      down:  () => [x, y + 1],
      left:  () => [x + 1, y],
      right: () => [x - 1, y],
    }[dir]()
  }

  directionsWithWeights() {
    let directions = Object.fromEntries(this.availableDirections().map(key => [key, 1]))
    if (directions[this.direction]) { // Able to walk straight
      directions[this.direction] = Walker.straightTendency // Increase tendency to go straight
    }
    return directions
  }

  walk() {
    const prevX = this.x, prevY = this.y
    const nextDir = weightedChoice(this.directionsWithWeights())
    if (!nextDir) { return die() }

    this.cell().ele.classList.remove("walker")
    this.cell().ele.classList.add("walked")

    this.direction = nextDir
    const nextCoord = this.nextCoord(nextDir)
    this.x = nextCoord[0]
    this.y = nextCoord[1]
    // [this.x, this.y] = this.nextCoord(nextDir)

   this.cell().ele.classList.add("walker")
  //  console.log({ x: this.x, y: this.y, nextDir, prevX, prevY })
  }

  die() {
    // TODO: Remove self from walkers array and stop walking
  }
}

class Cell {
  constructor(x, y) {
    this.x = x
    this.y = y
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
  }

  at(x, y) { return this.board[y]?.[x] }
}

const maze = new Maze(20, 10)
let walker = new Walker(maze, { x: rand(maze.width), y: rand(maze.height) })
console.log("Start:", walker.x, walker.y)

const boardEle = document.getElementById("maze")
maze.board.forEach((row) => {
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

setInterval(() => {
  walker.walk()
}, 100)
