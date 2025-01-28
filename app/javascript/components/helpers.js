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
