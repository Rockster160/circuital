# == Schema Information
#
# Table name: coord_points
#
#  id             :bigint           not null, primary key
#  color          :text
#  name           :text
#  shape          :integer          default("circle")
#  x              :float
#  y              :float
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  coord_point_id :bigint
#
# Indexes
#
#  index_coord_points_on_coord_point_id  (coord_point_id)
#
# Foreign Keys
#
#  fk_rails_...  (coord_point_id => coord_points.id)
#

class CoordPoint < ApplicationRecord
  validates :x, :y, :color, :shape, presence: true

  enum :shape, { circle: 0, triangle: 1, square: 2, star: 3 }
end
