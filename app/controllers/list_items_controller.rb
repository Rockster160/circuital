class ListItemsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    @list_item = list.list_items.create!(list_item_params)

    serialize
  end

  def update
    @list_item = list.list_items.find(params[:id])

    @list_item.update!(list_item_params)

    serialize
  end

  def destroy
    @list_item = list.list_items.find(params[:id])

    @list_item.destroy!

    serialize
  end

  private

  def serialize
    @list_items = @list.list_items.ordered

    ListChannel.broadcast(@list)

    render json: {
      list: @list.as_json,
      data: @list_items,
    }
  end

  def list
    @list ||= List.find(params[:list_id])
  end

  def list_item_params
    params.permit(
      :name,
      :completed,
    )
  end
end
