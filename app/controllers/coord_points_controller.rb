class CoordPointsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    @point = point_id ? CoordPoint.find(point_id) : CoordPoint.new

    @point.update!(point_params)

    serialize
  end

  def update
    @point = CoordPoint.find(point_id)

    @point.update!(point_params)

    serialize
  end

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
      :shape,
      :connect_to_id,
      :connect_from_id,
    )
  end
end
