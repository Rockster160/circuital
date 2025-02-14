// import { rand, randf, rand1In, weightedChoice, tally, minMax, oddsOf, sample, findMin, findMax } from "components/calc";

// import Keyboard from "components/keyboard";
// import Maze from "pages/challenges/maze/Maze";
// import Cell from "pages/challenges/maze/Cell";
// import Walker from "pages/challenges/maze/Walker";
// import Direction from "pages/challenges/maze/Direction";

const moveDelay = 50
const walkDelay = 50

export default class Solver {
  constructor(map) {
    this.map = map
    this.startCell = map.first
    this.finishCell = map.finish
    this.walkers = []
    this.solvedWalker = undefined
    this.solveInterval = undefined
    this.walkInterval = undefined

    this.player = undefined
    this.playerPath = undefined
  }

  solve() {
    console.log("Solving")
    const walker = new SolverWalker(this, [this.startCell])
    this.solveInterval = setInterval(() => {
      this.tick()
    }, moveDelay);
  }

  walk() {
    console.log("Walking")
    if (!this.playerPath?.length) { return }
    this.player.moveToCell(this.playerPath.shift())

    setTimeout(() => this.walk(), walkDelay)
  }

  complete(walker) {
    this.solvedWalker = walker
    clearInterval(this.solveInterval)
    console.log("Complete!", walker.distance, walker)

    this.player = this.map.player
    this.playerPath = this.solvedWalker.path
    console.log("Path", this.playerPath.length)
    this.walk()
  }

  tick() {
    this.walkers.forEach(walker => walker.tick())
  }
}

class SolverWalker {
  constructor(solver, path=[]) {
    this.solver = solver
    this.active = true
    this.distance = path.length
    solver.walkers.push(this)

    const nextCell = path.pop()
    this.path = path
    this.move(nextCell)
  }

  get currentCell() { return this.path[this.path.length-1] }

  tick() {
    if (!this.active) { return }

    const opts = this.currentCell.connections().filter(cell => !cell.hasClass("solver"))
    if (!opts.length) { return this.dead() }

    const [mine, ...splits] = opts
    splits.forEach(splitCell => this.split(splitCell))
    this.move(mine)
  }

  move(cell) {
    if (!cell) { this.dead() }

    cell.addClass("solver")
    this.path = [...this.path, cell]
    this.distance = this.path.length

    if (cell.hasClass("finish")) {
      this.solver.complete(this)
      this.path.forEach(cell => cell.addClass("path"))
    }
  }

  split(nextCell) {
    new SolverWalker(this.solver, [...this.path, nextCell])
  }

  dead() {
    this.active = false
  }
}
