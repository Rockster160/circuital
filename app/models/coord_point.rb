class CoordPoint < ApplicationRecord
  validates :x, :y, :color, presence: true
end
