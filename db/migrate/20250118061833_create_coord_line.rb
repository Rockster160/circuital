class CreateCoordLine < ActiveRecord::Migration[8.0]
  def change
    add_column :coord_points, :shape, :integer, default: 0

    create_table :coord_lines do |t|
      t.references :line_from, null: false, foreign_key: { to_table: :coord_points }
      t.references :line_to, null: false, foreign_key: { to_table: :coord_points }
    end
  end
end
