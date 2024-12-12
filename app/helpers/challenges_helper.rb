module ChallengesHelper
  def pagejs(page)
    content_for :after_body_js do
      javascript_include_tag "pages/space_game", defer: true, type: :module
    end
  end
end
