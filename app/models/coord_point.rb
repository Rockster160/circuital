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
#  line_to_id :bigint
#
# Indexes
#
#  index_coord_points_on_line_to_id  (line_to_id)
#
# Foreign Keys
#
#  fk_rails_...  (line_to_id => coord_points.id)
#

class CoordPoint < ApplicationRecord
  validates :x, :y, :color, :shape, presence: true
  belongs_to :line_to, optional: true, foreign_key: :coord_point_id, class_name: "CoordPoint"

  enum :shape, { circle: 0, triangle: 1, square: 2, star: 3 }
end
