class AddColorToPoint < ActiveRecord::Migration[8.0]
  def change
    rename_column :coord_points, :description, :name
    add_column :coord_points, :color, :text
  end
end
