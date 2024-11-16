// import "./global"

document.addEventListener("DOMContentLoaded", () => {
  const controller = document.body.dataset.controllerName
  const action = document.body.dataset.actionName

  if (controller && action) {
    try {
      import(`./pages/${controller}/${action}.js`).then(module => {
        if (typeof module.default == "function") { module.default() }
      }).catch((e) => {
        console.warn(`Failed to import: ${controller}#${action}`, e)
      })
    } catch(e) {}
  }
})
