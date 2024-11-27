class Blog < ApplicationRecord
  def to_html
    content
  end
end
