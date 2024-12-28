import consumer from "channels/consumer"
import fetchJson from "components/fetchJson";

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
    if (data.item_html) {
      itemsWrapper.innerHTML = data.item_html;
    }
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

document.addEventListener("click", (event) => {
  const listItem = event.target.closest("a.list-item")

  const deleteItem = event.target.closest(".item-delete")
  if (deleteItem) {
    event.preventDefault();
    event.stopImmediatePropagation();

    fetchJson(listItem.href, { method: "DELETE" }).catch((error) => {
      console.error("[ERROR] Failed to destroy:", error);
    });
    return false;
  }

  if (listItem) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const completed = listItem.classList.contains("completed")
    fetchJson(listItem.href, { method: "PATCH", body: { completed: !completed } }).catch((error) => {
      console.error("[ERROR] Failed to mark completed:", error);
    });
    return false;
  }
})
