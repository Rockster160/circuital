import Keyboard from "components/keyboard"

export default class Modal {
  static hideCallbacks = []
  static showCallbacks = []

  static show(id) {
    this.hide({ except: id })
    let modal = document.querySelector(id)
    if (!modal) { return }

    !modal.classList.contains("show") && this.showCallbacks.forEach(callback => callback(modal))
    modal.classList?.add("show")
  }

  static toggle(id) {
    const modalWrapper = document.querySelector(id)
    if (modalWrapper?.classList?.contains("show")) {
      Modal.hide()
    } else {
      Modal.show(id)
    }
  }

  static hide(data) {
    document.querySelectorAll(".modal-wrapper").forEach(modal => {
      if (modal.id !== data?.except) {
        modal.classList.contains("show") && this.hideCallbacks.forEach(callback => callback(modal))
        modal.classList.remove("show")
      }
    })
  }

  static onHide(callback) {
    this.hideCallbacks.push(callback)
  }

  static onShow(callback) {
    this.showCallbacks.push(callback)
  }

  static shown() {
    return !!document.querySelector(".modal-wrapper.show")
  }
}

Keyboard.on("Escape", (evt) => {
  if (Modal.shown()) {
    evt.preventDefault()
    Modal.hide()
  }
})

document.addEventListener("click", function(evt) {
  if (evt.cancelBubble) { return }
  if (evt.defaultPrevented) { return }

  const opener = evt.target.closest("[data-modal]")
  if (opener) {
    return Modal.show(opener.getAttribute("data-modal"))
  }

  if (evt.target.classList.contains("modal-wrapper")) {
    return Modal.hide()
  }

  if (evt.target.classList.contains("close")) {
    return Modal.hide()
  }
})
