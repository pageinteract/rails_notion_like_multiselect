# frozen_string_literal: true

module RailsNotionLikeMultiselect
  module Helpers
    module MultiselectHelper
      # Renders a Notion-like multiselect component
      #
      # @param form [ActionView::Helpers::FormBuilder] The form builder object
      # @param field [Symbol] The field name (e.g., :category_ids, :tag_ids)
      # @param options [Hash] Options for customizing the multiselect
      # @option options [Array] :collection The collection of items to select from
      # @option options [Array] :selected The currently selected items
      # @option options [Boolean] :allow_create Whether to allow creating new items (default: false)
      # @option options [String] :placeholder Placeholder text for the input
      # @option options [String] :label Label text for the field
      # @option options [String] :item_type Type of items (e.g., 'category', 'tag')
      # @option options [String] :badge_color Color scheme for badges (e.g., 'blue', 'green', 'purple')
      # @option options [String] :api_endpoint API endpoint for creating new items
      # @option options [String] :help_text Help text to display below the field
      # @option options [String] :theme Theme mode ('light', 'dark', or 'auto')
      #
      def multiselect_field(form, field, options = {})
        collection = options[:collection] || []
        selected = options[:selected] || []
        allow_create = options[:allow_create] || false
        placeholder = options[:placeholder] || RailsNotionLikeMultiselect.default_placeholder
        label = options[:label] || field.to_s.humanize
        item_type = options[:item_type] || field.to_s.singularize
        badge_color = options[:badge_color] || RailsNotionLikeMultiselect.default_badge_color
        api_endpoint = options[:api_endpoint]
        help_text = options[:help_text]
        theme = options[:theme] || 'auto'
        input_name = "#{form.object_name}[#{field}][]"

        # Determine theme-specific classes based on theme option
        is_dark_theme = theme == 'dark'
        is_light_theme = theme == 'light'
        
        # Support both light and dark modes with proper contrast
        badge_classes = if is_dark_theme
                          # Force dark theme styles
                          case badge_color
                          when 'green'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-green-900/30 text-green-200 border border-green-800'
                          when 'purple'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-purple-900/30 text-purple-200 border border-purple-800'
                          when 'yellow'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-yellow-900/30 text-yellow-200 border border-yellow-800'
                          when 'red'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-red-900/30 text-red-200 border border-red-800'
                          else
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-blue-900/30 text-blue-200 border border-blue-800'
                          end
                        elsif is_light_theme
                          # Force light theme styles
                          case badge_color
                          when 'green'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-green-100 text-green-800 border border-green-200'
                          when 'purple'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-purple-100 text-purple-800 border border-purple-200'
                          when 'yellow'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          when 'red'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-red-100 text-red-800 border border-red-200'
                          else
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          end
                        else
                          # Auto mode - use Tailwind's dark: variants
                          case badge_color
                          when 'green'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-green-100 text-green-800 border border-green-200 ' +
                            'dark:bg-green-900/30 dark:text-green-200 dark:border-green-800'
                          when 'purple'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-purple-100 text-purple-800 border border-purple-200 ' +
                            'dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800'
                          when 'yellow'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-yellow-100 text-yellow-800 border border-yellow-200 ' +
                            'dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800'
                          when 'red'
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-red-100 text-red-800 border border-red-200 ' +
                            'dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
                          else
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                            'bg-blue-100 text-blue-800 border border-blue-200 ' +
                            'dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
                          end
                        end

        content_tag :div,
                    data: {
                      controller: 'rails-notion-multiselect',
                      rails_notion_multiselect_allow_create_value: allow_create,
                      rails_notion_multiselect_item_type_value: item_type,
                      rails_notion_multiselect_input_name_value: input_name,
                      rails_notion_multiselect_placeholder_value: placeholder,
                      rails_notion_multiselect_create_prompt_value: "Create \"#{item_type}\"",
                      rails_notion_multiselect_badge_class_value: badge_classes,
                      rails_notion_multiselect_api_endpoint_value: api_endpoint,
                      rails_notion_multiselect_theme_value: theme
                    },
                    class: 'relative',
                    style: 'z-index: auto;' do
          # Label
          label_class = if is_dark_theme
                          'block text-sm font-medium text-gray-300 mb-2'
                        elsif is_light_theme
                          'block text-sm font-medium text-gray-700 mb-2'
                        else
                          'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                        end
          label_html = content_tag(:label, label, class: label_class)

          # Input container with selected items inside
          input_container_class = if is_dark_theme
                                     'flex flex-wrap items-center gap-1.5 rounded-lg ' +
                                     'bg-gray-900 py-2 px-3 text-sm text-white ' +
                                     'border border-gray-700 ' +
                                     'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ' +
                                     'min-h-[42px]'
                                   elsif is_light_theme
                                     'flex flex-wrap items-center gap-1.5 rounded-lg ' +
                                     'bg-white py-2 px-3 text-sm text-gray-900 ' +
                                     'border border-gray-300 ' +
                                     'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ' +
                                     'min-h-[42px]'
                                   else
                                     'flex flex-wrap items-center gap-1.5 rounded-lg ' +
                                     'bg-white dark:bg-gray-900 ' +
                                     'py-2 px-3 text-sm ' +
                                     'text-gray-900 dark:text-white ' +
                                     'border border-gray-300 dark:border-gray-700 ' +
                                     'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ' +
                                     'min-h-[42px]'
                                   end
          input_container_html = content_tag :div,
                                             class: input_container_class,
                                             data: { action: 'click->rails-notion-multiselect#focusInput' } do
            # Selected items display inside input
            selected_items_html = content_tag :div,
                                              data: { rails_notion_multiselect_target: 'selectedItems' },
                                              class: 'flex flex-wrap gap-1.5 items-center' do
              selected.map do |item|
                item_id = item.respond_to?(:id) ? item.id.to_s : item.to_s
                item_name = item.respond_to?(:name) ? item.name : item.to_s

                content_tag :span,
                            class: badge_classes,
                            data: { item_id: item_id } do
                  content_tag(:span, item_name, data: { item_name: true }) +
                    button_class = if is_dark_theme
                                     'ml-1 group relative h-3.5 w-3.5 rounded-sm hover:bg-gray-400/20'
                                   elsif is_light_theme
                                     'ml-1 group relative h-3.5 w-3.5 rounded-sm hover:bg-gray-600/20'
                                   else
                                     'ml-1 group relative h-3.5 w-3.5 rounded-sm hover:bg-gray-600/20 dark:hover:bg-gray-400/20'
                                   end
                    content_tag(:button,
                                type: 'button',
                                data: { action: 'click->rails-notion-multiselect#handleRemove', item_id: item_id },
                                class: button_class) do
                      content_tag(:svg, 
                                        xmlns: 'http://www.w3.org/2000/svg',
                                        viewBox: '0 0 14 14',
                                        fill: 'none',
                                        stroke: 'currentColor',
                                        'stroke-width': '2',
                                        'stroke-linecap': 'round',
                                        'stroke-linejoin': 'round',
                                        class: 'h-3.5 w-3.5 opacity-60 group-hover:opacity-100') do
                        tag.path(d: 'M4 4l6 6m0-6l-6 6')
                      end
                    end
                end
              end.join.html_safe
            end

            # Input field
            input_placeholder_class = if is_dark_theme
                                         'placeholder-gray-500'
                                       elsif is_light_theme
                                         'placeholder-gray-400'
                                       else
                                         'placeholder-gray-400 dark:placeholder-gray-500'
                                       end
            input_html = tag.input(type: 'text',
                                   placeholder: selected.empty? ? placeholder : '',
                                   data: { rails_notion_multiselect_target: 'input' },
                                   class: "flex-1 bg-transparent border-0 outline-none focus:outline-none min-w-[120px] #{input_placeholder_class}")

            selected_items_html + input_html
          end

          # Dropdown
          dropdown_class = if is_dark_theme
                             'absolute mt-1 w-full rounded-lg bg-gray-800 shadow-lg ring-1 ring-white/10'
                           elsif is_light_theme
                             'absolute mt-1 w-full rounded-lg bg-white shadow-lg ring-1 ring-black/5'
                           else
                             'absolute mt-1 w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10'
                           end
          dropdown_html = content_tag :div,
                                      data: { rails_notion_multiselect_target: 'dropdown' },
                                      style: 'display: none; z-index: 9999;',
                                      class: dropdown_class do
            content_tag :div,
                        data: { rails_notion_multiselect_target: 'optionsList' },
                        class: 'max-h-60 overflow-auto py-1' do
              collection.map do |item|
                item_id = item.respond_to?(:id) ? item.id.to_s : item.to_s
                item_name = item.respond_to?(:name) ? item.name : item.to_s
                is_selected = selected.any? { |s| 
                  s_id = s.respond_to?(:id) ? s.id.to_s : s.to_s
                  s_id == item_id
                }

                content_tag :div,
                            data: {
                              option_id: item_id,
                              option_name: item_name
                            },
                            class: "px-3 py-2 text-sm cursor-pointer flex items-center #{if is_selected
                                                                                           if is_dark_theme
                                                                                             'bg-blue-600 text-white hover:bg-blue-700'
                                                                                           elsif is_light_theme
                                                                                             'bg-blue-500 text-white hover:bg-blue-600'
                                                                                           else
                                                                                             'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                                                                                           end
                                                                                         elsif is_dark_theme
                                                                                           'text-gray-300 hover:bg-gray-700'
                                                                                         elsif is_light_theme
                                                                                           'text-gray-700 hover:bg-gray-100'
                                                                                         else
                                                                                           'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                                         end}" do
                  content_tag(:span, item_name, class: 'flex-1')
                end
              end.join.html_safe
            end
          end

          # Hidden inputs container
          hidden_inputs_html = content_tag :div, data: { rails_notion_multiselect_target: 'hiddenInputs' } do
            if selected.any?
              selected.map do |item|
                item_id = item.respond_to?(:id) ? item.id.to_s : item.to_s
                tag.input(type: 'hidden', name: input_name, value: item_id)
              end.join.html_safe
            else
              tag.input(type: 'hidden', name: input_name, value: '')
            end
          end

          # Help text
          help_text_class = if is_dark_theme
                              'mt-1 text-xs text-gray-400'
                            elsif is_light_theme
                              'mt-1 text-xs text-gray-500'
                            else
                              'mt-1 text-xs text-gray-500 dark:text-gray-400'
                            end
          help_text_html = if help_text.present?
                             content_tag(:p, help_text, class: help_text_class)
                           else
                             ''.html_safe
                           end

          label_html + input_container_html + dropdown_html + hidden_inputs_html + help_text_html
        end
      end
    end
  end
end
