import Maze from "pages/challenges/maze/Maze";
import Direction from "pages/challenges/maze/Direction";

export default class FetchMaze {
  static async generate() {
    const instance = new FetchMaze()
    await instance.fetch()
    instance.maze = new Maze(instance.width, instance.height)
    instance.maze.toggleClean(true)
    instance.connectCells()
    return instance
  }

  constructor() {
    this.maze = undefined
    this.seed = undefined
    this.board = undefined
    this.height = undefined
    this.width = undefined
  }

  atBoard(x, y) {
    return this.board[y]?.[x]
  }

  connectCells() {
    this.board.forEach((row, ridx) => {
      row.forEach((str, cidx) => {
        if (str === "#") { return }
        const [x, y] = [cidx, ridx]
        const cell = this.maze.at(x, y)
        cell.walked = true
        if (str == "o") { cell.first = true }
        if (str == "x") { cell.finish = true }

        Direction.directions.map((dir) => {
          const [cx, cy] = [x + dir.x, y + dir.y]
          const neighborStr = this.atBoard(cx, cy)
          if (!neighborStr || neighborStr === "#") { return }
          cell.connect(dir, null, 0)
        })
      })
    })
  }

  submit(solver) {
    if (!this.seed) { return }

    const path = solver.solvedWalker.path
    let strPath = ""
    path.forEach((cell, idx) => {
      const nextCell = path[idx+1]
      if (!nextCell) { return }
      const dir = Direction.between(cell, nextCell)
      strPath += dir.name[0].toUpperCase()
    })

    this.post(strPath)
  }

  post(moves) {
    fetch(`https://ardesian.com/maze/${this.seed}/solve?width=10&height=10`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),
    }).then((res) => {
      res.text().then((text) => {
        if (res.status === 200) {
          console.log("Submitted successfully!")
        } else if (res.status === 206) {
          console.log("Maze still incomplete!")
        } else if (res.status === 422) {
          console.log("Illegal move!")
        } else {
          console.log("Unknown error!", { res, text })
        }
      })
    })
  }

  async fetch() {
    const res = await fetch("https://ardesian.com/maze?width=10&height=10")
    this.seed = res.headers.get("X-Maze-Seed")
    const text = await res.text()
    const rows = text.split("\n")
    // const rows = [
    //   "# # # # # # # # # # # # # # # # # # # # #",
    //   "#       #               #               #",
    //   "#   #   # # # # # # #   #   # # #   #   #",
    //   "#   #               #   #   #   #   #   #",
    //   "#   # # # # # # #   #   #   #   #   #   #",
    //   "#   #           #   #           #   #   #",
    //   "#   # # #   # # #   # # # # # # #   #   #",
    //   "#       #                           #   #",
    //   "#   #   # # # # # # # # # # # # # # #   #",
    //   "#   #   #           #               #   #",
    //   "#   #   #   # # #   #   #   # # # # #   #",
    //   "#   #       #   #   #   #               #",
    //   "#   # # # # #   #   # # #   # # # # # # #",
    //   "#       #       #       #       #       #",
    //   "# # #   #   # # # # #   # # #   #   #   #",
    //   "#       #   #           #   #       #   #",
    //   "#   # # #   #   # # # # #   # # # # #   #",
    //   "#           #   #           #   #       #",
    //   "# # # # # # #   #   # # #   #   #   # # #",
    //   "# o         #   #       #       #       #",
    //   "# # # # #   #   #   #   # # # # # # #   #",
    //   "#           #   #   #   #       #       #",
    //   "#   # # # # #   #   #   #   #   #   # # #",
    //   "#               # x #       #           #",
    //   "# # # # # # # # # # # # # # # # # # # # #",
    // ]

    this.board = rows.map(row => row.split("").filter((_, i) => i % 2 === 0))
    this.height = this.board.length
    this.width = this.board[0].length
  }
}
