class Markdown
  include ActionView::Helpers::TagHelper

  attr_accessor :text

  def initialize(text)
    @raw = text
    @text = text
  end

  def to_html
    @text = ::ERB::Util.html_escape(@text)
    replace_wrap({ /```(?<language>\w*)\n?/ => /\n?```/ }, :codeblock)
    replace_wrap({ "`" => "`" }, :code)
    replace(
      /^# (.*?)$/           => wrap('\1', :h1),
      /^## (.*?)$/          => wrap('\1', :h2),
      /^### (.*?)$/         => wrap('\1', :h3),
      /^#### (.*?)$/        => wrap('\1', :h4),
      /^##### (.*?)$/       => wrap('\1', :h5),
      /^###### (.*?)$/      => wrap('\1', :h6),
      /\*(.*?)\*/           => wrap('\1', :strong),
      /_(.*?)_/             => wrap('\1', :em),
      /~(.*?)~/             => wrap('\1', :del),
      /!\[(.*?)\]\((.*?)\)/ => wrap(nil, :img, src: '\2', alt: '\1'),
      /\[(.*?)\]\((.*?)\)/  => wrap('\1', :a, href: '\2'),
      /^( *\* (?:.*?\n))+/m => -> (match) {
        content = match[0]
        lines = content.split("\n").map { |li| wrap(li[/^\s*\* (.*?)$/, 1] || li, :li) }.join.html_safe
        wrap(lines, :ul) + "\n"
      },
      /^( *1[\.\)-:]? +(?:.*?\n))+/m => -> (match) {
        content = match[0]
        lines = content.split("\n").map { |li| wrap(li[/^\s*1[\.\)-:]? +(.*?)$/, 1] || li, :li) }.join.html_safe
        wrap(lines, :ol) + "\n"
      },
    )
      # Do this at the end, and make sure to ignore any already wrapped links
      # /\b(https?:\/\/\S+)\b/ => wrap('\1', :a, href: '\1'),
    wrap(@text.html_safe, :div, class: "markdown-wrapper").html_safe
  end

  def p(content, **opts)
    wrap(content, :p, opts)
  end

  def replace(replacements)
    replacements.each do |pattern, replacement|
      if replacement.is_a?(Proc)
        @text.gsub!(pattern) do |found|
          replacement.call(Regexp.last_match)
        end
      else
        @text.gsub!(pattern, replacement)
      end
    end
  end

  def wrap(content, tag, **opts, &block)
    content_tag(tag, block_given? ? block.call(content.to_s) : content.to_s, opts)
  end

  # Calls block with matching content and pair data
  # Expects the return to be the new data to input in place
  def replace_wrap(wrapper, tag=nil, **opts, &block)
    return replace_wrap(wrapper.to_h, content, &block) if wrapper.is_a?(::Array)
    return replace_wrap({ wrapper => wrapper }, content, &block) unless wrapper.is_a?(::Hash)

    wrapper.each do |pair_open, pair_close|
      last_idx = -1
      loop do
        pair_data = find_unescaped_pair(@text, pair_open, pair_close, after: last_idx)
        break if pair_data.nil?

        internal_range = (pair_data[:start_idx_end]+1...pair_data[:end_idx_start])
        external_range = (pair_data[:start_idx_start]..pair_data[:end_idx_end])

        if tag.present?
          # Removes wrapping pair
          @text[external_range] = content_tag(tag, pair_data[:content], opts)
        elsif block_given?
          @text[external_range] = block.call(pair_data[:content], pair_data)
        end
        last_idx = pair_data[:end_idx_end]
      end
    end
    @text
  end

  # returns [start_index, full_match]
  def find_unescaped_pair(str, pair_open, pair_close=nil, after: -1)
    pair_close ||= pair_open

    first_idx_start, first_idx_end, first_match = find_unescaped_index(str, pair_open, after: after)&.values
    return if first_idx_start.nil?

    next_idx_start, next_idx_end, last_match = find_unescaped_index(str, pair_close, after: first_idx_start)&.values
    return if next_idx_start.nil?

    {
      start_idx_start: first_idx_start,
      start_idx_end: first_idx_end,
      first_match: first_match,
      wrap_begin: str[first_idx_start..first_idx_end],
      content: str[first_idx_end+1...next_idx_start],
      wrap_end: str[next_idx_start..next_idx_end],
      last_match: last_match,
      end_idx_start: next_idx_start,
      end_idx_end: next_idx_end,
    }
  end

  # returns [start_index, end_index]
  def find_unescaped_index(str, char, after: -1)
    # if regex, don't escape
    str.enum_for(:scan, /(?:#{char.is_a?(String) ? Regexp.escape(char) : char})/m).find { |m|
      idx = Regexp.last_match.begin(0)
      next unless idx > after

      escapes = str[...idx][/\\*\z/].length
      return { start_idx: idx, end_idx: idx+Regexp.last_match.to_s.length-1, match: Regexp.last_match } if escapes.even?
    }
  end
end
