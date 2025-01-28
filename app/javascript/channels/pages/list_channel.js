import consumer from "channels/consumer"

const listId = document.querySelector(".list-title").dataset.listId
const itemsWrapper = document.querySelector("#list-items")

consumer.subscriptions.create({ channel: "ListChannel", list_id: listId }, {
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
