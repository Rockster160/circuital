import consumer from "channels/consumer"
import fetchJson from "components/fetchJson";

const listsPath = window.location.pathname.match(/lists\/(\d+)/)
const id = listsPath && listsPath[1]
const form = document.querySelector("#list-item-form")
const itemsWrapper = document.querySelector("#list-items")
let clickTimeout = null

consumer.subscriptions.create({ channel: "ListChannel", list_id: id }, {
  // connected() {
  //   TODO: Hide the red dot
  // },

  // disconnected() {
  //   TODO: Show a little red dot somewhere
  // },

  received(data) {
    if (data.list.name) {
      document.querySelector(".list-title").innerText = data.list.name;
    }

    if (data.item_html) {
      itemsWrapper.innerHTML = data.item_html;
    }
  }
});

document.addEventListener("click", (evt) => {
  const item = evt.target.closest("a.list-item")
  if (item) { evt.preventDefault() }
})

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const newItemInput = form.querySelector("input[type=text]");
  const name = newItemInput.value.trim()

  if (name === "") { return }

  const template = document.querySelector("template#list-item-template").content.cloneNode(true)
  template.querySelector(".item-title").textContent = name
  itemsWrapper.prepend(template)

  fetchJson(form.action, { method: "POST", body: { name } }).catch((error) => {
    console.error("[ERROR] Failed to create:", error);
  })
  newItemInput.value = ""
})

document.addEventListener("mousedown", (event) => {
  const target = event.target
  const item = target.closest(".list-item")
  if (!item) { return }

  const deleteItem = target.closest(".delete-item")
  if (deleteItem) {
    item.classList.add("deleting")
    fetchJson(item.href, { method: "DELETE" }).catch((error) => {
      console.error("[ERROR] Failed to destroy:", error);
    });
    return false;
  }

  function markComplete() {
    removeListeners()
    item.classList.add("toggling")
    const completed = item.classList.contains("completed")
    fetchJson(item.href, { method: "PATCH", body: { completed: !completed } }).catch((error) => {
      console.error("[ERROR] Failed to mark completed:", error);
    });
    return false;
  }

  function removeListeners() {
    clearTimeout(clickTimeout)
    item.removeEventListener("dragstart", removeListeners)
    item.removeEventListener("mouseup", markComplete)
  }

  clearTimeout(clickTimeout)
  clickTimeout = setTimeout(() => {
    editItem(item)
    removeListeners()
  }, 500)
  item.addEventListener("dragstart", removeListeners)
  item.addEventListener("mouseup", markComplete)
})

function editItem(item) {
  const value = item.querySelector(".item-title").textContent
  const input = document.createElement("input")

  input.classList.add("form-control", "edit-list-field")
  input.type = "text"
  input.dataset.originalValue = value
  input.value = value

  function save() {
    input.setAttribute("disabled", "disabled")
    fetchJson(item.href, { method: "PATCH", body: { name: input.value } }).then(() => {
      item.innerText = input.value
    }).catch((error) => {
      input.removeAttribute("disabled", "disabled")
      console.error("[ERROR] Failed to update name:", error);
    });
  }

  item.innerHTML = ""
  item.appendChild(input)
  input.focus()
  input.select()

  input.addEventListener("blur", save)
  input.addEventListener("focusout", save)
  input.addEventListener("keypress", (evt) => {
    if (evt.key === "Enter") {
      evt.preventDefault()
      save()
    }
  })
}
