import consumer from "channels/consumer"

const id = window.location.pathname.match(/lists\/(\d+)/)[1]
consumer.subscriptions.create({ channel: "ListChannel", list_id: id }, {
  connected() {
    console.log("Connected!");
  },

  disconnected() {
    console.log("Disconnected!");
  },

  received(data) {
    console.log("Received data!", data);
    document.querySelector("#list-items").innerHTML = data.html;
  }
});
