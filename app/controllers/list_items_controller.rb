class ListItemsController < ApplicationController
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

    ListChannel.broadcast_to(@list, {
      list: @list.as_json,
      items: @list.list_items,
      html: render_to_string(partial: "list_items/index"),
    })
  end

  def list
    @list ||= List.find(params[:list_id])
  end

  def list_item_params
    params.require(:list_item).permit(
      :name,
    )
  end
end
