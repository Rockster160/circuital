import Cell from "pages/challenges/maze/Cell";

export default class Solver {
  constructor(map, opts={}) {
    this.map = map
    Cell.removeClass("solver")

    this.startCell = opts.startCell || map.first
    this.finishCell = opts.finishCell || map.finish
    this.walkers = []
    this.solvedWalker = undefined

    this.callback = undefined
  }

  async solve(callback) {
    this.callback = callback
    const walker = new SolverWalker(this, [this.startCell])
    while (!this.solvedWalker) {
      this.tick()
    }
  }

  cells() {
    const cellsList = new Set()
    this.walkers.forEach((walker) => {
      walker.path.forEach((cell) => {
        cellsList.add(cell)
      })
    })
    return cellsList
  }

  tick() {
    this.walkers.forEach(walker => walker.tick())
  }

  complete(walker) {
    this.solvedWalker = walker
    this.callback?.(this)
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

    if (cell === this.solver.finishCell) {
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
