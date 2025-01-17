module ApplicationHelper
  def pagejs(page=nil)
    return if page.nil? && !File.file?("app/javascript/pages/#{params[:action]}.js")

    content_for :after_body_js do
      javascript_include_tag "pages/#{page || params[:action]}", defer: true, type: :module
    end
  end

  def modal_btn(text, id, opts={}, &block)
    if block_given?
      link_to(text, **opts, data: { modal: "##{id}" }, &block)
    else
      link_to(text, "#", **opts, data: { modal: "##{id}" })
    end
  end

  def render_modal(id, &block)
    render layout: "layouts/modal", locals: { id: id } do
      block.call
    end
  end
end
