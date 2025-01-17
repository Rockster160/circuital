import Keyboard from "components/keyboard"

export default class Modal {
  static show(id) {
    this.hide({ except: id })
    document.querySelector(id)?.classList?.add("show")
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
      modal.id !== data?.except && modal.classList.remove("show")
    })
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
