class ListChannel < ApplicationCable::Channel
  def subscribed
    stream_for List.find(params[:list_id])
  end
end
