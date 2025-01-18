# == Schema Information
#
# Table name: coord_points
#
#   id         :integer
#   x          :float
#   y          :float
#   name       :string
#   created_at :datetime
#   updated_at :datetime
#   color      :text
#   shape      :integer default("circle")
#

class CoordPoint < ApplicationRecord
  validates :x, :y, :color, presence: true

  enum shape: {
    circle: 0,
    triangle: 1,
    square: 2,
  }
end
