class CreateCoordLine < ActiveRecord::Migration[8.0]
  def change
    add_column :coord_points, :shape, :integer, default: 0

    create_table :coord_lines do |t|
      t.float :x1, null: false
      t.float :x2, null: false
      t.float :y1, null: false
      t.float :y2, null: false
      t.text :color, null: false
      t.text :name, null: false

      t.timestamps
    end
  end
end
