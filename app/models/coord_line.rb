# == Schema Information
#
# Table name: coord_lines
#
#  id         :integer          not null, primary key
#  x1         :float            not null
#  x2         :float            not null
#  y1         :float            not null
#  y2         :float            not null
#  color      :text             not null
#  name       :text             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class CoordLine < ApplicationRecord
end
