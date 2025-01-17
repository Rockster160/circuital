class PointsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    @point = point_id ? CoordPoint.find(point_id) : CoordPoint.new

    @point.update!(point_params)

    serialize
  end

  # def update
  #   @point = CoordPoint.find(params[:id])

  #   @point.update!(point_params)

  #   serialize
  # end

  def destroy
    @point = CoordPoint.find(point_id)

    @point.destroy!

    serialize
  end

  private

  def point_id
    params[:id].presence
  end

  def serialize
    MapChannel.broadcast

    render json: {}
  end

  def point_params
    params.permit(
      :x,
      :y,
      :name,
      :color,
    )
  end
end
