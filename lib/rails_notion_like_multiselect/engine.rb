# frozen_string_literal: true

module RailsNotionLikeMultiselect
  class Engine < ::Rails::Engine
    isolate_namespace RailsNotionLikeMultiselect

    # Add helpers to Rails applications
    initializer 'rails_notion_like_multiselect.helpers' do
      ActiveSupport.on_load(:action_view) do
        include RailsNotionLikeMultiselect::Helpers::MultiselectHelper
      end
    end

    # Add JavaScript to importmap
    initializer 'rails_notion_like_multiselect.importmap', before: 'importmap' do |app|
      app.config.importmap.paths << Engine.root.join('config/importmap.rb') if defined?(Importmap)
    end

    # Add assets to precompile
    initializer 'rails_notion_like_multiselect.assets' do |app|
      app.config.assets.paths << Engine.root.join('app/javascript')
      app.config.assets.precompile += %w[
        rails_notion_like_multiselect_controller.js
      ]
    end
  end
end
