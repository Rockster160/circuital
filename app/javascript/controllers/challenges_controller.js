import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="challenges"
export default class extends Controller {
  connect() {
    if (this.element.getAttribute("data-action") !== "welcome") { return }
    const typewriter = this.element.querySelector("h1");

    const text = typewriter.innerText;
    typewriter.innerText = "";

    let index = 0;
    let direction = "add";
    setInterval(() => {
      if (direction === "add") {
        if (index < text.length) {
          typewriter.textContent += text[index];
          index += 1;
        } else {
          direction = "remove";
        }
      } else {
        if (index > 0) {
          typewriter.textContent = text.slice(0, index - 1);
          index -= 1;
        } else {
          direction = "add";
        }
      }
    }, 100);
  }
}
