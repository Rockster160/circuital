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

  // TODO: Only submit if the order changes

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

const createDragImage = (element) => {
  const dragImage = element.cloneNode(true);
  dragImage.classList.add("drag-image");
  dragImage.style.position = "absolute";
  dragImage.style.top = "-9999px"; // Move it offscreen
  dragImage.style.left = "-9999px";

  // Add to the DOM temporarily
  document.body.appendChild(dragImage);

  // Remove it after a short delay (to ensure it's not visible on the page)
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

itemsWrapper.addEventListener("drop", (event) => {
  event.preventDefault()
  event.stopPropagation()
  if (draggingElement && placeholder) {
    itemsWrapper.insertBefore(draggingElement, placeholder)
  }
  draggingElement.setAttribute("draggable", "false")
  draggingElement?.classList?.remove("dragging")
  placeholder?.remove()
  placeholder = null
  updateOrder()
})

itemsWrapper.addEventListener("dragend", () => {
  draggingElement?.classList?.remove("dragging")
  draggingElement.setAttribute("draggable", "false")
  placeholder?.remove()
  placeholder = null
  draggingElement = null
})
