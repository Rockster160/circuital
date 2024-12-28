class ListsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    @lists = List.all
  end

  def show
    @list = List.find(params[:id])
    @list_items = @list.list_items.ordered
  end

  def new
    @list = List.new

    render :form
  end

  def edit
    @list = List.find(params[:id])

    render :form
  end

  def create
    @list = List.new(list_params)

    if @list.save
      redirect_to @list
    else
      render :form
    end
  end

  def order_items
    @list = List.find(params[:list_id])

    params[:item_ids].reverse.each_with_index do |id, index|
      @list.list_items.find(id).update(position: index)
    end
    @list_items = @list.list_items.ordered

    ListChannel.broadcast_to(@list, {
      list: @list.as_json,
      items: @list_items,
      item_html: render_to_string(partial: "list_items/index", formats: :html, layout: false),
    })

    render json: {
      list: @list.as_json,
      data: @list_items,
    }
  end

  def update
    @list = List.find(params[:id])

    if @list.update(list_params )
      redirect_to @list
    else
      render :form
    end
  end

  def destroy
    @list = List.find(params[:id])

    if @list.destroy
      redirect_to lists_path
    else
      render :form
    end
  end

  private

  def list_params
    params.require(:list).permit(
      :name,
    )
  end
end
