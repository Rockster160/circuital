# == Schema Information
#
# Table name: lists
#
#  id         :bigint           not null, primary key
#  name       :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class List < ApplicationRecord
  has_many :list_items, dependent: :destroy
end
