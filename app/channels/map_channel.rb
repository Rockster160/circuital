class MapChannel < ApplicationCable::Channel
  def self.broadcast
    broadcast_to("map", {
      lines: CoordLine.all.as_json,
      points: CoordPoint.all.as_json,
    })
  end

  def subscribed
    stream_for "map"
    MapChannel.broadcast
  end
end
