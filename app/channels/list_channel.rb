class ListChannel < ApplicationCable::Channel
  def self.broadcast(list)
    broadcast_to(list, {
      list: list.as_json,
      items: list.list_items.ordered,
      item_html: ApplicationController.renderer.render(partial: "list_items/index", formats: :html, layout: false, assigns: { list: list, list_items: list.list_items.ordered }),
    })
  end

  def subscribed
    stream_for List.find(params[:list_id])
  end
end
