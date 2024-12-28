module ApplicationHelper
  def pagejs(page=nil)
    return if page.nil? && !File.file?("app/javascript/pages/#{params[:action]}.js")

    content_for :after_body_js do
      javascript_include_tag "pages/#{page || params[:action]}", defer: true, type: :module
    end
  end
end
