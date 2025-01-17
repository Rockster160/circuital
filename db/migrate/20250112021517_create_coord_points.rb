class CreateCoordPoints < ActiveRecord::Migration[8.0]
  def change
    create_table :coord_points do |t|
      t.float :x
      t.float :y
      t.text :description

      t.timestamps
    end
  end
end
