# == Schema Information
#
# Table name: coord_points
#
#  id         :bigint           not null, primary key
#  color      :text
#  name       :text
#  shape      :integer          default("circle")
#  x          :float
#  y          :float
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class CoordPoint < ApplicationRecord
  # Lines
  has_many :lines_from, class_name: "CoordLine", foreign_key: :line_from_id, dependent: :destroy
  has_many :lines_to, class_name: "CoordLine", foreign_key: :line_to_id, dependent: :destroy
  # Points
  has_many :line_tos, through: :lines_from, source: :line_to
  has_many :line_froms, through: :lines_to, source: :line_from

  validates :x, :y, :color, :shape, presence: true

  enum :shape, {
    circle:   0,
    triangle: 1,
    square:   2,
    star:     3,
  }

  def line_to_ids
    line_tos.ids
  end

  def connect_to_id=(new_id)
    lines_from.create(line_to_id: new_id)
  end

  def connect_from_id=(new_id)
    lines_to.create(line_from_id: new_id)
  end
end
