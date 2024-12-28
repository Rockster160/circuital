import consumer from "channels/consumer"

const id = window.location.pathname.match(/lists\/(\d+)/)[1]
const form = document.querySelector("#list-item-form")
const itemsWrapper = document.querySelector("#list-items")

consumer.subscriptions.create({ channel: "ListChannel", list_id: id }, {
  // connected() {
  //   TODO: Hide the red dot
  // },

  // disconnected() {
  //   TODO: Show a little red dot somewhere
  // },

  received(data) {
    itemsWrapper.innerHTML = data.html;
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = form.querySelector("input[type=text]");
  const name = input.value.trim()

  if (name === "") { return }

  const template = document.querySelector("template#list-item-template").content.cloneNode(true)
  template.querySelector(".item-title").textContent = name
  itemsWrapper.prepend(template)

  form.submit()
  input.value = ""
})
