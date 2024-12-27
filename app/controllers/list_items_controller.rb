class ListItemsController < ApplicationController
  # after_action :s erialize

  # def index
  #   @list_items = list.list_items.all
  # end

  # def show
  #   @list_item = list.list_items.find(params[:id])
  # end

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
    render json: {
      data: Array.wrap(@list_item || @list_items),
    }
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
