import fetchJson from "components/fetchJson";

const listId = document.querySelector(".list-title").dataset.listId
const itemsWrapper = document.querySelector("#list-items")
let draggingElement = null;
let placeholder = null;

function orderedItemIds() {
  return Array.from(itemsWrapper.querySelectorAll(".list-item:not(.placeholder")).map(item => item.dataset.itemId)
}
let currentOrder = orderedItemIds()

function updateOrder() {
  const newOrder = orderedItemIds()
  if (newOrder.join(",") === currentOrder.join(",")) { return }

  itemsWrapper.querySelectorAll(".list-item").forEach((item) => item.classList.add("pending"))

  fetchJson(`/lists/${listId}/items`, {
    method: "PUT",
    body: { item_ids: orderedItemIds() }
  }).catch((error) => {
    console.error("[ERROR] Failed to update order:", error);
  });
}

const createPlaceholder = () => {
  const placeholder = document.createElement("div");
  placeholder.classList.add("placeholder");

  return placeholder
}

const dropItem = (evt) => {
  const dropped = draggingElement && placeholder
  if (dropped) {
    itemsWrapper.insertBefore(draggingElement, placeholder)
  } else {
  }

  draggingElement?.classList?.remove("dragging")
  placeholder?.remove()
  placeholder = null
  draggingElement = null

  if (dropped) { updateOrder() }
}

const createDragImage = (element) => {
  const dragImage = element.cloneNode(true);
  dragImage.classList.add("drag-image");
  dragImage.style.position = "absolute";
  dragImage.style.top = "-9999px";
  dragImage.style.left = "-9999px";

  document.body.appendChild(dragImage);

  setTimeout(() => document.body.removeChild(dragImage), 0);
  return dragImage
}

itemsWrapper.addEventListener("dragstart", (event) => {
  const item = event.target.closest(".list-item")
  if (!item) { return }

  draggingElement = item
  draggingElement.classList.add("dragging")

  placeholder = createPlaceholder();
  itemsWrapper.appendChild(placeholder);
  itemsWrapper.insertBefore(placeholder, draggingElement.nextElementSibling);

  event.dataTransfer.setDragImage(createDragImage(item), 0, 0);
  event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/html", item.outerHTML)
})

itemsWrapper.addEventListener("dragover", (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = "move"
  const item = event.target.closest(".list-item")
  if (!item || !placeholder) { return }

  const rect = item.getBoundingClientRect()
  const next = (event.clientY - rect.top) / (rect.bottom - rect.top) > 0.5
  itemsWrapper.insertBefore(placeholder, next ? item.nextElementSibling : item)
})

itemsWrapper.addEventListener("drop", dropItem)
itemsWrapper.addEventListener("dragend", dropItem)
