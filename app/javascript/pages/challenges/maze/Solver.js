// import { rand, randf, rand1In, weightedChoice, tally, minMax, oddsOf, sample, findMin, findMax } from "components/calc";

// import Keyboard from "components/keyboard";
// import Maze from "pages/challenges/maze/Maze";
// import Cell from "pages/challenges/maze/Cell";
// import Walker from "pages/challenges/maze/Walker";
// import Direction from "pages/challenges/maze/Direction";

const moveDelay = 0

export default class Solver {
  constructor(map) {
    this.map = map
    this.startCell = map.first
    this.finishCell = map.finish
    this.walkers = []
    this.moveInterval = undefined
  }

  solve() {
    console.log("Solving")
    const walker = new SolverWalker(this, [this.startCell])
    this.moveInterval = setInterval(() => {
      this.tick()
    }, moveDelay);
  }

  complete(walker) {
    console.log("Complete!", walker.distance, walker)
    clearInterval(this.moveInterval)
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
    this.move(mine)
    splits.forEach(splitCell => this.split(splitCell))
  }

  move(cell) {
    if (!cell) { this.dead() }

    cell.addClass("solver")
    this.path = [...this.path, cell]
    this.distance = this.path.length

    if (cell.hasClass("finish")) {
      this.solver.complete(this)
    }
  }

  split(nextCell) {
    new SolverWalker(this.solver, [...this.path, nextCell])
  }

  dead() {
    this.active = false
  }
}
