export const railsController = document.querySelector("body").dataset.controller
export const railsAction = document.querySelector("body").dataset.action

export const singularize = (word) => {
  // if (word.match(/(s|x|z|sh|ch)es$/)) {
  //   return word.replace(/es$/, "");
  // }
  if (word.endsWith("ies")) {
    return word.replace(/.{3}$/, "y");
  }
  if (word.endsWith("es")) {
    return word.replace(/es$/, "");
  }
  return word.replace(/s$/, "");
};

export const pluralize = (word) => {
  // if (word.match(/(s|x|z|sh|ch)$/)) {
  //   return word + "es"
  // }
  if (word.match(/[^aeiou](y)$/)) {
    return word.replace("y", "ies")
  }
  return word + "s"
}

export function currentTime() {
  let now = new Date()
  let hours = String(now.getHours()).padStart(2, "0")
  let minutes = String(now.getMinutes()).padStart(2, "0")
  let seconds = String(now.getSeconds()).padStart(2, "0")

  return `${hours}:${minutes}:${seconds}`
}

export function duration(startTime, endTime) {
  let [startH, startM, startS] = startTime.split(":").map(Number)
  let [endH, endM, endS] = endTime.split(":").map(Number)

  let startInSeconds = startH * 3600 + startM * 60 + startS
  let endInSeconds = endH * 3600 + endM * 60 + endS

  let diffInSeconds = Math.abs(endInSeconds - startInSeconds)

  let hours = Math.floor(diffInSeconds / 3600)
  let minutes = Math.floor((diffInSeconds % 3600) / 60)
  let seconds = diffInSeconds % 60

  return `${hours}h ${minutes}m ${seconds}s`
}
