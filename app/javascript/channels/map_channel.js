import consumer from "channels/consumer"
import Point from "pages/maps/point";

consumer.subscriptions.create({ channel: "MapChannel" }, {
  connected() {
    // console.log("connected")
  },
  disconnected() {
    // console.log("disconnected")
  },
  received(data) {
    console.log("map", data)
    Point.setPoints(data.points)
  }
});
