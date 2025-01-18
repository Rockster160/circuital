# == Schema Information
#
# Table name: list_items
#
#  id           :integer          not null, primary key
#  list_id      :integer
#  name         :text
#  position     :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  completed_at :datetime
#
# Indexes
#
#  index_list_items_on_list_id  (list_id)
#

class ListItem < ApplicationRecord
  belongs_to :list

  before_save { self.position ||= list.list_items.maximum(:position).to_i + 1 }

  scope :ordered, -> {
    order(Arel.sql("CASE WHEN completed_at IS NULL THEN 0 ELSE 1 END"), position: :desc)
  }

  def completed? = completed_at?
  def completed!(at=Time.current)
    return if completed?

    update!(completed_at: at)
  end
  def completed=(bool)
    self.completed_at = bool ? Time.current : nil
  end
end
