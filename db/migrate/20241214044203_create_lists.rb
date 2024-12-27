class CreateLists < ActiveRecord::Migration[8.0]
  def change
    create_table :lists do |t|
      t.text :name

      t.timestamps
    end

    create_table :list_items do |t|
      t.belongs_to :list
      t.text :name
      t.integer :position

      t.timestamps
    end
  end
end
