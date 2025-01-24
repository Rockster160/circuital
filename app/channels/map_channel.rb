class MapChannel < ApplicationCable::Channel
  def self.broadcast
    broadcast_to("map", {
      points: CoordPoint.includes(:line_tos).as_json(methods: :line_to_ids),
    })
  end

  def subscribed
    stream_for "map"
    MapChannel.broadcast
  end
end
