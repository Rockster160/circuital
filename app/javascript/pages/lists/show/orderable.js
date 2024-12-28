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

itemsWrapper.addEventListener("dragstart", (event) => {
  const item = event.target.closest(".list-item")
  if (!item) { return }

  draggingElement = item
  draggingElement.classList.add("dragging")
  console.log("draggingElement", draggingElement)

  placeholder = createPlaceholder();
  itemsWrapper.appendChild(placeholder);
  itemsWrapper.insertBefore(placeholder, draggingElement.nextElementSibling);

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


// domReady(function() {
//   const table = document.querySelector("table[data-orderable]");
//   if (!table) { return }

//   const tbody = table.querySelector("tbody");
//   const url = table.dataset.orderable;
//   let draggingElement = null;
//   let placeholder = null;

  // const createPlaceholder = () => {
  //   const placeholder = document.createElement("tr");
  //   placeholder.className = "placeholder";
  //   const cell = document.createElement("td");
  //   cell.colSpan = 100;
  //   placeholder.appendChild(cell);

  //   return placeholder
  // }

//   table.querySelectorAll("tr:has(.handle)").forEach(row => {
//     // row.setAttribute("draggable", "true");
//     const handle = row.querySelector(".handle");
//     handle.addEventListener("mousedown", (evt) => {
//       row.setAttribute("draggable", "true");
//     });
//     handle.addEventListener("mouseup", (evt) => {
//       row.setAttribute("draggable", "false");
//     });
//   });

//   table.addEventListener("dragstart", (evt) => {
//     const row = evt.target.closest("tr");
//     if (!row) { return }

//     draggingElement = row;
//     draggingElement.classList.add("dragging");

//     placeholder = createPlaceholder();
//     tbody.appendChild(placeholder);
//     tbody.insertBefore(placeholder, draggingElement.nextElementSibling);

//     evt.dataTransfer.effectAllowed = "move";
//     evt.dataTransfer.setData("text/html", draggingElement.outerHTML);
//   });

//   table.addEventListener("dragover", (evt) => {
//     evt.preventDefault();
//     evt.dataTransfer.dropEffect = "move";
//     const row = evt.target.closest("tr");
//     if (!row || !placeholder) { return }

//     const rect = row.getBoundingClientRect();
//     const next = (evt.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
//     tbody.insertBefore(placeholder, next ? row.nextElementSibling : row);
//   });

//   table.addEventListener("drop", (evt) => {
//     evt.preventDefault();
//     evt.stopPropagation();
//     if (draggingElement && placeholder) {
//       tbody.insertBefore(draggingElement, placeholder);
//     }
//     draggingElement.setAttribute("draggable", "false");
//     draggingElement?.classList?.remove("dragging");
//     placeholder?.remove();
//     placeholder = null;
//     updateOrder();
//   });

//   table.addEventListener("dragend", () => {
//     draggingElement?.classList?.remove("dragging");
//     draggingElement.setAttribute("draggable", "false");
//     placeholder?.remove();
//     placeholder = null;
//     draggingElement = null;
//   });
