class CreateCoordLine < ActiveRecord::Migration[8.0]
  def change
    add_column :coord_points, :shape, :integer, default: 0
    add_reference :coord_points, :line_to, foreign_key: { to_table: :coord_points }
  end
end
