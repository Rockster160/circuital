# == Schema Information
#
# Table name: coord_lines
#
#  id           :bigint           not null, primary key
#  line_from_id :bigint           not null
#  line_to_id   :bigint           not null
#
# Indexes
#
#  index_coord_lines_on_line_from_id  (line_from_id)
#  index_coord_lines_on_line_to_id    (line_to_id)
#
# Foreign Keys
#
#  fk_rails_...  (line_from_id => coord_points.id)
#  fk_rails_...  (line_to_id => coord_points.id)
#
class CoordLine < ApplicationRecord
  belongs_to :line_from, class_name: "CoordPoint"
  belongs_to :line_to, class_name: "CoordPoint"
end
