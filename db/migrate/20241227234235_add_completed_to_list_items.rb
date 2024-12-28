class AddCompletedToListItems < ActiveRecord::Migration[8.0]
  def change
    add_column :list_items, :completed_at, :datetime
  end
end
