import consumer from "channels/consumer"
import Point from "pages/maps/point";
import Map from "pages/maps/map";

let centered = false

consumer.subscriptions.create({ channel: "MapChannel" }, {
  connected() {
    // console.log("connected")
  },
  disconnected() {
    // console.log("disconnected")
  },
  received(data) {
    Point.setPoints(data.points)
    if (!centered) {
      Map.constrain()
      centered = true
    }
  }
});
