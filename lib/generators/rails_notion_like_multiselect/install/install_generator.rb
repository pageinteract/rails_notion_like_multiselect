# frozen_string_literal: true

module RailsNotionLikeMultiselect
  module Generators
    class InstallGenerator < Rails::Generators::Base
      source_root File.expand_path('templates', __dir__)

      def copy_javascript_controller
        copy_file(
          '../../../../app/javascript/rails_notion_multiselect_controller.js',
          'app/javascript/controllers/rails_notion_multiselect_controller.js'
        )
      end

      def add_to_stimulus_index
        inject_into_file 'app/javascript/controllers/index.js', after: /import { application } from.*\n/ do
          <<~JS
            import RailsNotionMultiselectController from "./rails_notion_multiselect_controller"
            application.register("rails-notion-multiselect", RailsNotionMultiselectController)
          JS
        end
      end

      def create_initializer
        create_file 'config/initializers/rails_notion_like_multiselect.rb', <<~RUBY
          # frozen_string_literal: true

          RailsNotionLikeMultiselect.setup do |config|
            # Default badge color for selected items
            # Options: "blue", "green", "purple", "yellow", "red"
            config.default_badge_color = "blue"
          #{'  '}
            # Default placeholder text
            config.default_placeholder = "Search or select..."
          #{'  '}
            # Enable keyboard navigation
            config.enable_keyboard_navigation = true
          end
        RUBY
      end

      def display_post_install
        say "\n✅ Rails Notion-Like Multiselect has been installed!", :green
        say "\nTo use the multiselect in your forms:", :yellow
        say <<~USAGE

          <%= multiselect_field(
            form,
            :field_name,
            collection: @items,
            selected: @selected_items,
            allow_create: true,
            placeholder: "Search or create...",
            badge_color: "blue"
          ) %>
        USAGE

        say "\n📚 For more options and examples, see: https://github.com/yourusername/rails_notion_like_multiselect",
            :cyan
      end
    end
  end
end
