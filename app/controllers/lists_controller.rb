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
