// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

document.querySelectorAll(".elastic").forEach(elastic)
document.addEventListener("input", (evt) => {
  elastic(evt.target.closest(".elastic"))
})

function elastic(textarea) {
  if (!textarea) { return }

  textarea.style.height = "5px";
  textarea.style.height = (textarea.scrollHeight+5) + "px";
}
