import Keyboard from "components/keyboard";
import Timer from "components/Timer";
import { currentTime, duration } from "components/helpers";
import Maze from "pages/challenges/maze/Maze";
import FetchMaze from "pages/challenges/maze/FetchMaze";
import Solver from "pages/challenges/maze/Solver";

const params = window.location.search.split(/[\?\&]/).reduce((acc, str) => {
  if (str && str.includes("=")) {
    const [k,v] = str.split("=")
    acc[k] = v
  }
  return acc
}, {})

Maze.frameDelay = 0

Maze.straightPreference = 4/1 // (4/1)
// straightPreference - Results in paths tending to go straight instead of turning
// 1 is no bias. 2 is twice as likely to go straight, when given the option.
// 0..1 will cause paths to turn more often than go straight
Maze.branchBias = 1/2 // (1/4)
// 0 means cells never branch (3 way or 4 way)
// 1 means every cell will try to have 3 directions (unless blocked by cells that are already complete)
Maze.adjacentBias = 1/4 // (1/4)
// - When paths run alongside each other, controls the tendency to turn into it vs away from it.
// 0 means avoid paths in favor of open cells - this will cause `loopProbability` to be ignored
// 0.5 means half as likely to choose over preferring an "open" route
// 1 no bias - treat paths and open cells equally
// 1+ is valid, but causes weirdness because the walker will TRY to connect instead of taking the open path.
// This will cause more dead ends instead of running along each other or turning away.
Maze.loopProbability = 1/4 // (1/4)
// - When a walker reaches a previous path, this is the likelihood of connecting to it.
// 0 means no loops, prefer dead ends
// 1 means every cell will try to reconnect to a previous path (unless locked via branchBias)

// const token = () => Math.random().toString(36).slice(2, 6).toUpperCase()
// I'd like to avoid a 2x2 "loop", but not sure how to. 🤔

const startTime = currentTime()
console.log("Started", startTime)

window.timer = new Timer()
let fetcher = undefined

if (params.width && !params.height) { params.height = params.width }
if (params.height && !params.width) { params.width = params.height }
if (params.width && params.height) {
  window.maze = new Maze(parseInt(params.width), parseInt(params.height))
  maze.spawnWalker()
} else {
  fetcher = await FetchMaze.generate()
  window.maze = fetcher.maze
}

maze.onComplete = () => {
  const endTime = currentTime()
  console.log("Completed", endTime)
  console.log("Duration: " + duration(startTime, endTime))

  maze.toggleClean(true)
  maze.farthest.finish = true
}

document.addEventListener("click", (evt) => {
  const cellEle = evt.target.closest(".cell")
  if (cellEle) {
    const cell = maze.at(parseInt(cellEle.dataset.x), parseInt(cellEle.dataset.y))
    debugger
  }
})

Keyboard.on("Space", () => maze.toggleClean())

Keyboard.on("?", () => {
  console.log("Checking...")
  let data = { valid: 0, walked: 0, island: 0, invalid: 0 }
  maze.cells.forEach(cell => {
    if (cell.walked) { data.walked += 1 } else { return data.island += 1 }
    const bad = cell.connections().every(conn => Math.abs(cell.distance - conn.distance) == 1)
    if (cell.bad) { data.invalid += 1 } else { data.valid += 1 }
  })
  console.log(data)
})

Keyboard.on("Enter", () => {
  const solver = new Solver(maze)
  solver.solve(() => fetcher?.submit(solver))
})

Keyboard.on("e", () => {
  maze.player
})
