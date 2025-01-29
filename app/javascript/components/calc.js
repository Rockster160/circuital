// -- With max: returns a number between min and max (inclusive)
// -- Without max: returns a number between 0 and min (non-inclusive) - rand(4) has 4 possible results: 0,1,2,3
// -- Without any args: returns a number between 0 and 1 (inclusive)
// minMax(1000, () => rand(5)) #=> { min: 0, max: 4 }
// minMax(1000, () => rand(3, 5)) #=> { min: 3, max: 5 }
// minMax(1000, () => rand()) #=> { min: 0, max: 1 }
export const rand = (min, max) => {
  if (min === undefined) { min = 2 }
  if (max === undefined) { max = min - 1; min = 0 }
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// -- With max: returns a float between min and max (non-inclusive)
// -- Without max: returns a float between 0 and min (non-inclusive)
// -- Without any args: returns a float between 0 and 1 (non-inclusive)
// minMax(1000, () => randf(5)) #=> { min: 0.0034050510043459603, max: 4.998673204361572 }
// minMax(1000, () => randf(3, 5)) #=> { min: 3.000395893716148, max: 4.996939249096007 }
// minMax(1000, () => randf()) #=> { min: 0.0005342254527682666, max: 0.9992342495706343 }
export const randf = (min, max) => {
  if (min === undefined) { min = 1 }
  if (max === undefined) { max = min; min = 0 }
  return (Math.random() * (max - min)) + min
}

// -- Returns true 1 out of n times
export const rand1In = (n) => {
  return rand(n) == 0
}
// -- Returns true f percent of the time
// tally(1000, () => oddsOf(0.2)) #=> { true: 217, false: 783 }
// tally(1000, () => oddsOf(1/4)) #=> { true: 248, false: 752 }
export const oddsOf = (f) => {
  return randf() < f
}

// -- Given a hash of values mapped to "weights", returns a random value according to the weights.
// -- Works with floats or integers without concern of upper/lower boundaries
// weightedChoice({
//   orange: 4,
//   apple: 2,
// })
// -- returns "orange" twice as often as "apple"
export const weightedChoice = function(itemsWithWeights) {
  if (!itemsWithWeights || Object.keys(itemsWithWeights).length == 0) { return }
  const total = Object.values(itemsWithWeights).reduce((sum, val) => sum + val)
  let selectedIdx = randf(total)
  return Object.entries(itemsWithWeights).find((itemWithWeight) => {
    const [item, weight] = itemWithWeight
    if (selectedIdx <= weight) {
      return item
    } else {
      selectedIdx -= weight
    }
  })?.[0]
}

// -- Runs the given function x times and returns a hash with the count that each result occurred
// tally(1000, () => weightedChoice({ orange: 4, apple: 2 }))
// #=> { orange: 676, apple: 324 }
export const tally = (times, fn) => {
  let t = {}
  for (let i=0; i<times; i++) {
    let res = fn()
    t[res] = t[res] || 0
    t[res] += 1
  }
  return t
}

// -- Runs the given function x times and returns the lowest and highest values
// minMax(1000, () => randf(5))
// #=> { min: 0.0034050510043459603, max: 4.998673204361572 }
export const minMax = (times, fn) => {
  let min = null, max = null
  for (let i=0; i<times; i++) {
    const res = fn()
    if (min === null) { min = res }
    if (max === null) { max = res }
    if (res < min) { min = res }
    if (res > max) { max = res }
  }
  return { min, max }
}
