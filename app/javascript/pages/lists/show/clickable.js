import fetchJson from "components/fetchJson";

const itemsWrapper = document.querySelector("#list-items")
const form = document.querySelector("#list-item-form")
let clickTimeout = null

document.addEventListener("click", (evt) => {
  const item = evt.target.closest("a.list-item")
  if (item) { evt.preventDefault() }
})

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const newItemInput = form.querySelector("input[type=text]");
  const name = newItemInput.value.trim()

  if (name === "") { return }

  const newItem = document.querySelector("template#list-item-template").content.cloneNode(true)
  newItem.querySelector(".list-item").classList.add("pending")
  newItem.querySelector(".item-title").textContent = name
  itemsWrapper.prepend(newItem)

  fetchJson(form.action, { method: "POST", body: { name } }).catch((error) => {
    console.error("[ERROR] Failed to create:", error);
  })
  newItemInput.value = ""
})

document.addEventListener("mousedown", (event) => {
  const target = event.target
  const item = target.closest(".list-item")
  if (!item) { return } // Not an item, don't trigger mouse events

  const input = target.closest("input")
  if (input) { return } // Clicking on an input, don't mark completed or drag or delete

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
    if (input.value === input.dataset.originalValue) { return }

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
