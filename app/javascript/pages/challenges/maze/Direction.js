import { rand } from "components/calc";

export default class Direction {
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
    if (typeof x === "number") { return [this.x + x, this.y + y] }
    if (Array.isArray(x)) { return [this.x + x[0], this.y + x[1]] }

    return [this.x + x.x, this.y + x.y]
  }
  get opposite() { return this._opposite = this._opposite || Direction.directions[(this.idx + 2) % 4] }
}
