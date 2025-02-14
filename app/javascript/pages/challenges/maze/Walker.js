import { weightedChoice, oddsOf, sample } from "components/calc";

import Maze from "pages/challenges/maze/Maze";
import Direction from "pages/challenges/maze/Direction";

export default class Walker {
  static walkedCells = new Set()

  constructor(map, cell) {
    this.map = map
    this.x = cell.x
    this.y = cell.y
    this.walking = true
    this.direction = null
    this.path = []
    this.startDistance = null

    this.addCell(cell)
    this.walk()
  }

  // static spawn(map) {
  //   let availableCells = this.availableStartingCells()
  //   if (availableCells.length == 0) { return map.connectIslands() }

  //   const cell = sample(availableCells)
  //   map.spawnWalker(cell)
  //   if (cell != maze.first) { cell.locked = true } // Leave possibility for start to branch out
  // }

  // static availableStartingCells() {
  //   return [...this.walkedCells].filter((cell) => !cell.cascadeLock())
  // }

  addCell(cell, dir, prevCell) {
    this.startDistance = this.startDistance || cell.distance || 0
    if (dir && prevCell) {
      prevCell.connect(dir, cell, this.path.length + this.startDistance - 1) // Adds connection and recounts
    }
    // Push after open so that first cell is 0 distance
    this.path.push(cell)

    // Walker.walkedCells.add(cell)
    cell.walked = true
    cell.walker = true
    cell.walking = true
    cell.last = true
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
        if (Maze.adjacentBias == 0) { return }
        return directions[dir.name] = 1/Maze.adjacentBias
      }

      directions[dir.name] = dir == currentDir ? Maze.straightPreference : 1
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
      if (oddsOf(Maze.loopProbability)) {
        this.addCell(this.cell(), this.direction, prevCell)
        return this.die("loop")
      } else {
        return this.die("deadend")
      }
    } else {
      this.addCell(this.cell(), this.direction, prevCell)
    }

    setTimeout(() => this.walk(), Maze.frameDelay);
  }

  die(msg) {
    this.path.forEach((cell) => cell.walking = false)
    this.walking = false
    setTimeout(() => this.map.spawnWalker(), Maze.frameDelay);
  }
}
