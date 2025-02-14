import { rand, sample, findMax } from "components/calc";

import Cell from "pages/challenges/maze/Cell";
import Walker from "pages/challenges/maze/Walker";
import Player from "pages/challenges/maze/Player";
import Direction from "pages/challenges/maze/Direction";

export const cellWidth = 20
export const cellMargin = 2
export const cellOffset = (cellWidth + (cellMargin*2))

export default class Maze {
  static get instance() { return this._instance }
  static frameDelay         = 100
  static straightPreference = 4/1
  static branchBias         = 1/4
  static adjacentBias       = 1/4
  static loopProbability    = 1/4

  constructor(width, height) {
    this.width = width
    this.height = height
    this.farthestDist = 0
    this.cellCache = {
      first:    null, // First cell in the maze
      last:     null, // Last cell to be generated
      farthest: null,
      finish:   null,
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
    Maze._instance = this

    this.generate()
    this.spawnWalker(this.randCell())
  }

  get first() { return this.cellCache.first }       // single cell
  get last() { return this.cellCache.last }         // single cell
  get farthest() { return this.cellCache.farthest || this.findFarthestCell() } // single cell

  get walked() { return this.cellCache.walked }     // cell list
  get locked() { return this.cellCache.locked }     // cell list
  get walking() { return this.cellCache.walking }   // cell list
  get walkers() { return this.cellCache.walkers }   // cell list
  get islands() { return this.cellCache.islands }   // cell list

  get player() { return this._player || new Player(this) }
  set player(newPlayer) { this._player = newPlayer }

  unset(val) {
    const cell = this.cellCache[val]
    if (cell) { cell[val] = false }
  }

  set first(newCell) { newCell ? (newCell.first = true) : (this.unset("first")) }
  set last(newCell) { newCell ? (newCell.last = true) : (this.unset("last")) }
  set farthest(newCell) { newCell ? (newCell.farthest = true) : this.unset("farthest") }

  randCell() { return this.cells[rand(this.cells.length)] }

  findFarthestCell() {
    const farthest = findMax(this.walked, (cell) => cell.distance)
    if (farthest) {
      this.farthestDist = farthest.distance
      return this.cellCache.farthest = farthest
    }
  }

  connectIslands(islands=null) {
    console.log("connectIslands", islands)
    if (islands !== null && islands.length == 0) { islands = null } // Put deserted islands back in
    islands = islands === null ? this.islands : islands
    const cell = sample(islands)
    if (!cell) {
      maze.onComplete?.()
      return
    }
    let connectableCells = []
    let isoConnCount = null

    cell.neighbors().forEach((neighbor) => {
      const connCount = neighbor.connections().length
      if (connCount == 0) { return } // Another island
      if (isoConnCount === null || connCount < isoConnCount) {
        connectableCells = [neighbor]
        isoConnCount = connCount
      } else if (connCount == isoConnCount) {
        connectableCells.push(neighbor)
      }
    })

    if (connectableCells.length == 0) { // Deserted island, retry to find one with connections
      console.log("deserted island")
      const withoutSkipped = Array.from(islands).filter((iso) => iso != cell)
      return this.connectIslands(withoutSkipped)
    }

    const neighbor = sample(connectableCells)
    const isoDir = Direction.between(cell, neighbor)
    cell.connect(isoDir, neighbor, neighbor.distance+1)
    console.log("island walker")
    this.spawnWalker(cell)
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
    this.ele = boardEle
  }

  randNextWalkerCell() {
    return sample(Array.from(this.walked).filter(cell => !cell.cascadeLock()))
  }

  spawnWalker(cell) {
    cell = cell || (this.first ? this.randNextWalkerCell() : this.randCell())
    if (!cell) { return this.connectIslands() }
    if (!this.first) {
      cell.first = true
      cell.distance = 0
    } else {
      cell.locked = true
    }
    return this.walker = new Walker(this, cell)
  }

  toggleClean(toggle) {
    this.cleanCells = toggle === null ? !this.cleanCells : toggle
    this.ele.classList.toggle("clean", this.cleanCells)
  }
}
