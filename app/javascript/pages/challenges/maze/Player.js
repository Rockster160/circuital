import { rand, randf, rand1In, weightedChoice, tally, minMax, oddsOf, sample, findMin, findMax } from "components/calc";

import Keyboard from "components/keyboard";
import Maze from "pages/challenges/maze/Maze";
import Cell from "pages/challenges/maze/Cell";
import Walker from "pages/challenges/maze/Walker";
import Direction from "pages/challenges/maze/Direction";
import { cellWidth, cellMargin, cellOffset } from "pages/challenges/maze/Maze";

const moveDelay = 30
const holdDelay = 100

export default class Player {
  static get instance() { return this._instance || (this._instance = new Player(Maze.instance)) }
  static moveInterval = undefined
  static moveTimeout = undefined

  constructor(maze) {
    this.map = maze
    this.map.player = this
    this.generate()
    this.cell = this.map.first || this.map.randCell()
    this._direction = null
    this.keys = new Set()
    Player._instance = this
  }

  static resetInterval() {
    this.stop()

    this.moveTimeout = setTimeout(() => {
      this.moveInterval = setInterval(() => this.tick(), moveDelay);
    }, holdDelay-moveDelay);
  }

  static tick() {
    Direction.directions.find(dir => {
      if (Keyboard.isPressed(dir.arrow)) { return Player.instance.move(dir, Keyboard.isPressed("Shift")) }
    }) || this.stop()
  }

  static move(dir, run=false) {
    Player.instance.move(dir, run)
    this.resetInterval()
  }

  static stop() {
    clearInterval(this.moveInterval)
    clearTimeout(this.moveTimeout)
  }

  get direction() { return this._direction }
  set direction(newDir) { this._direction = newDir }

  get x() { return this._x }
  set x(newX) {
    this._x = newX
    this.ele.style.left = (newX * cellOffset) + "px"
  }
  get y() { return this._y }
  set y(newY) {
    this._y = newY
    this.ele.style.top = (newY * cellOffset) + "px"
  }
  get cell() { return this._cell }
  set cell(cell) {
    this._cell = cell
    ;[this.x, this.y] = [cell.x, cell.y]
  }

  moveToCell(cell) {
    this.cell = cell
    if (this.cell.finish) { this.win() }
  }

  move(dir, run=false) {
    let nextCell = this.cell[dir.name]
    if (nextCell) {
      if (nextCell.key) {
        this.keys.add(nextCell.key)
        nextCell.key = null
      }

      if (nextCell.door) {
        const correctKey = Array.from(this.keys).find(inventoryKey => {
          return inventoryKey.code === nextCell.door.code
        })

        if (correctKey) {
          this.keys.delete(correctKey)
          nextCell.door = null
        } else {
          return false
        }
      }

      if (run) {
        let forwardCell
        while (forwardCell = nextCell[dir.name]) { nextCell = forwardCell }
      }

      this.direction = dir
      this.moveToCell(nextCell)

      return true
    }
  }

  win() {
    if (this._win) { return }
    this._win = true
    this.ele.classList.add("winner")
    console.log("You won!")
  }

  generate() {
    this.ele = document.createElement("div")
    this.ele.classList.add("player")
    this.map.ele.appendChild(this.ele)
  }
}

Direction.directions.forEach(dir => {
  Keyboard.on(dir.arrow, (evt) => Player.move(dir, Keyboard.isPressed("Shift")))
})
