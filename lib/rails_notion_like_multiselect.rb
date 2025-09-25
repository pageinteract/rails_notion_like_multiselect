# frozen_string_literal: true

require_relative 'rails_notion_like_multiselect/version'
require_relative 'rails_notion_like_multiselect/engine'
require_relative 'rails_notion_like_multiselect/helpers/multiselect_helper'

module RailsNotionLikeMultiselect
  class Error < StandardError; end

  # Configuration
  mattr_accessor :default_badge_color
  @@default_badge_color = 'blue'

  mattr_accessor :default_placeholder
  @@default_placeholder = 'Search or select...'

  mattr_accessor :enable_keyboard_navigation
  @@enable_keyboard_navigation = true

  # Setup block for configuration
  def self.setup
    yield self
  end
end
