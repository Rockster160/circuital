class CoordLinesController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    @line = line_id ? CoordLine.find(line_id) : CoordLine.new

    @line.update!(line_params)

    serialize
  end

  def destroy
    @line = CoordLine.find(line_id)

    @line.destroy!

    serialize
  end

  private

  def line_id
    params[:id].presence
  end

  def serialize
    MapChannel.broadcast

    render json: {}
  end

  def line_params
    params.permit(
      :x1,
      :x2,
      :y1,
      :y2,
      :name,
      :color,
    )
  end
end
