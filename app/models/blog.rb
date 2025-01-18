# == Schema Information
#
# Table name: blogs
#
#  id         :integer          not null, primary key
#  title      :text
#  content    :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Blog < ApplicationRecord
  def to_html
    Markdown.new(content).to_html
  end
end
