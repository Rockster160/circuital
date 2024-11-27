class Blog < ApplicationRecord
  def to_html
    Markdown.new(content).to_html
  end
end
