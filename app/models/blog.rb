# == Schema Information
#
# Table name: blogs
#
#  id         :bigint           not null, primary key
#  content    :text
#  title      :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Blog < ApplicationRecord
  def to_html
    Markdown.new(content).to_html
  end
end
