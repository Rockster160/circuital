class ListItem < ApplicationRecord
  belongs_to :list

  before_save { self.position ||= list.list_items.maximum(:position).to_i + 1 }

  scope :ordered, -> { order(position: :desc) }
end
