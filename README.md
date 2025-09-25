# Rails Notion-Like Multiselect

[![Gem Version](https://badge.fury.io/rb/rails_notion_like_multiselect.svg)](https://badge.fury.io/rb/rails_notion_like_multiselect)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)

A beautiful, keyboard-navigable multiselect component for Rails applications, inspired by Notion's elegant UI/UX. This gem provides a fully-featured multiselect input with search, filtering, and the ability to create new items on the fly.

![Rails Notion-Like Multiselect Demo](demo.gif)

## Features

- 🎨 **Beautiful Notion-inspired UI** - Clean, modern design that fits seamlessly into any application
- ⌨️ **Full keyboard navigation** - Arrow keys, Enter, Escape, Tab, and Backspace support
- 🔍 **Real-time search/filtering** - Quickly find items as you type
- ➕ **Create new items** - Optional ability to create new items inline
- 🎯 **Smart selection display** - Selected items appear as compact badges inside the input
- 🌈 **Customizable colors** - Multiple badge color options (blue, green, purple, yellow, red)
- 🌓 **Dark mode support** - Automatically adapts to light and dark themes
- 📱 **Fully responsive** - Works great on mobile and desktop
- ♿ **Accessible** - Proper ARIA attributes and keyboard support
- 🚀 **Stimulus-powered** - Built with Hotwire Stimulus for modern Rails apps
- 🎨 **Tailwind CSS v4** - Styled with Tailwind CSS v4 for modern, customizable design

## Requirements

- Rails 7.0 - 8.x
- Ruby 3.0+
- Stimulus.js ~> 1.0 (included as dependency)
- Tailwind CSS 4.x (included via tailwindcss-rails gem)

## Installation

### From RubyGems (when published)

Add this line to your application's Gemfile:

```ruby
gem 'rails_notion_like_multiselect'
```

### From GitHub

To use the latest version directly from GitHub, add this to your Gemfile:

```ruby
gem 'rails_notion_like_multiselect', git: 'https://github.com/pageinteract/rails_notion_like_multiselect.git'
```

Or to use a specific version/tag:

```ruby
gem 'rails_notion_like_multiselect', git: 'https://github.com/pageinteract/rails_notion_like_multiselect.git', tag: 'v0.1.1'
```

Or to use a specific branch:

```ruby
gem 'rails_notion_like_multiselect', git: 'https://github.com/pageinteract/rails_notion_like_multiselect.git', branch: 'main'
```

Then execute:

```bash
bundle install
```

## Setup

### Quick Setup

After installation, run the generator to set up the component:

```bash
rails generate rails_notion_like_multiselect:install
```

This will:
- Copy the Stimulus controller to your application
- Register the controller in your Stimulus application
- Create an initializer with default configuration

### Prerequisites

The gem automatically includes `tailwindcss-rails` as a dependency. If you haven't set up Tailwind CSS in your application yet, run:

```bash
rails tailwindcss:install
```

This will create the necessary Tailwind configuration files and set up the build process.

**Important:** Make sure to include the gem's view paths in your Tailwind configuration to ensure all classes are properly compiled:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{erb,haml,html,slim,rb}',
    './node_modules/rails_notion_like_multiselect/**/*.{js,rb}',
    // Or if using the gem directly:
    './vendor/bundle/ruby/*/gems/rails_notion_like_multiselect-*/**/*.{js,rb}'
  ],
  // ... rest of your config
}
```

### Manual Setup (if not using generator)

#### 1. Import the JavaScript controller

In your `app/javascript/controllers/index.js`:

```javascript
import RailsNotionMultiselectController from "rails_notion_multiselect_controller"
application.register("rails-notion-multiselect", RailsNotionMultiselectController)
```

#### 2. Include the helper in your application

The helper is automatically included when you install the gem.

## Usage

### Basic Usage

In your Rails form:

```erb
<%= form_with model: @game do |form| %>
  <%= multiselect_field(
    form,
    :category_ids,
    collection: @categories,
    selected: @game.categories,
    placeholder: "Search categories...",
    label: "Categories"
  ) %>
<% end %>
```

### With Create Capability

Allow users to create new items on the fly:

```erb
<%= multiselect_field(
  form,
  :tags,
  collection: @existing_tags,
  selected: @game.tags,
  allow_create: true,
  placeholder: "Search or create tags...",
  label: "Tags",
  help_text: "Type and press Enter to create new tags"
) %>
```

### With Explicit Theme

Force a specific theme regardless of system settings:

```erb
<%= multiselect_field(
  form,
  :category_ids,
  collection: @categories,
  selected: @game.categories,
  theme: "dark",  # Options: "light", "dark", "auto"
  label: "Categories"
) %>
```

### With Custom Colors

Use different badge colors for different types of data:

```erb
<%= multiselect_field(
  form,
  :category_ids,
  collection: @categories,
  selected: @game.categories,
  badge_color: "green",  # Options: blue, green, purple, yellow, red
  label: "Categories"
) %>
```

### With API Endpoint

For server-side creation of new items:

```erb
<%= multiselect_field(
  form,
  :tags,
  collection: @tags,
  selected: @game.tags,
  allow_create: true,
  api_endpoint: "/api/tags",
  item_type: "tag"
) %>
```

## Options

| Option         | Type    | Default                 | Description                            |
| -------------- | ------- | ----------------------- | -------------------------------------- |
| `collection`   | Array   | `[]`                    | Array of items to select from          |
| `selected`     | Array   | `[]`                    | Currently selected items               |
| `allow_create` | Boolean | `false`                 | Allow creating new items               |
| `placeholder`  | String  | `"Search or select..."` | Input placeholder text                 |
| `label`        | String  | Field name              | Label for the field                    |
| `item_type`    | String  | Field singularized      | Type of items (for create prompt)      |
| `badge_color`  | String  | `"blue"`                | Color scheme for badges                |
| `api_endpoint` | String  | `nil`                   | API endpoint for server-side creation  |
| `help_text`    | String  | `nil`                   | Help text below the field              |
| `theme`        | String  | `"auto"`                | Theme mode: "light", "dark", or "auto" |

## Keyboard Shortcuts

- **↓/↑** - Navigate through options
- **Enter** - Select highlighted option or create new item
- **Escape** - Close dropdown
- **Backspace** - Remove last selected item (when input is empty)
- **Tab** - Close dropdown and move to next field
- **Any character** - Open dropdown and start searching

## Configuration

You can configure default settings in an initializer:

```ruby
# config/initializers/rails_notion_like_multiselect.rb
RailsNotionLikeMultiselect.setup do |config|
  config.default_badge_color = "green"
  config.default_placeholder = "Type to search..."
  config.enable_keyboard_navigation = true
end
```

## Styling

The component is built with Tailwind CSS v4 and uses its utility classes for styling. The gem requires Tailwind CSS v4 to be properly installed in your Rails application for the component to render correctly.

### Dark Mode Support

The multiselect component supports three theme modes:

- **`"auto"` (default)**: Automatically adapts to your application's dark mode settings using Tailwind's dark mode classes
- **`"light"`**: Forces light theme styling regardless of system settings
- **`"dark"`**: Forces dark theme styling regardless of system settings

Theme behaviors:
- **Light mode**: Light colored badges with dark text, white background
- **Dark mode**: Dark colored badges with light text, dark background
- **Automatic contrast**: All elements adjust for optimal readability

To enable dark mode in your application, configure Tailwind CSS:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' for system preference
  // ... rest of your config
}
```

### Custom Styling

If you need to customize the styles, you can override these classes in your Tailwind configuration or target them directly:

- `.rails-notion-multiselect-container` - Main container
- `.rails-notion-multiselect-input` - Input field
- `.rails-notion-multiselect-badge` - Selected item badges
- `.rails-notion-multiselect-dropdown` - Dropdown container
- `.rails-notion-multiselect-option` - Individual options

## Examples

### Categories with Predefined Options

```erb
<%= multiselect_field(
  form,
  :category_ids,
  collection: Category.active.ordered,
  selected: @product.categories,
  placeholder: "Select categories...",
  label: "Product Categories",
  badge_color: "blue",
  help_text: "Choose all applicable categories"
) %>
```

### Tags with Creation

```erb
<%= multiselect_field(
  form,
  :tags,
  collection: ["Ruby", "Rails", "JavaScript", "React", "Vue"],
  selected: @post.tags || [],
  allow_create: true,
  placeholder: "Add tags...",
  label: "Post Tags",
  badge_color: "green",
  item_type: "tag",
  help_text: "Select existing tags or create new ones"
) %>
```

### Users Assignment

```erb
<%= multiselect_field(
  form,
  :assigned_user_ids,
  collection: User.active.map { |u| { id: u.id, name: u.full_name } },
  selected: @task.assigned_users,
  placeholder: "Assign team members...",
  label: "Assigned To",
  badge_color: "purple"
) %>
```

## Controller Actions

If you're using the `api_endpoint` option for server-side creation, implement a controller action like:

```ruby
class TagsController < ApplicationController
  def create
    tag = Tag.find_or_create_by(name: params[:tag][:name])
    render json: { id: tag.id, name: tag.name }
  end
end
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake spec` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/pageinteract/rails_notion_like_multiselect. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the code of conduct.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

The gem is available as open source under the terms of the [MIT License](LICENSE.txt).

### Note on Tailwind CSS Usage

This gem uses only open-source Tailwind CSS utility classes. No Tailwind UI/Plus components or proprietary code are used in this implementation. All styling is created using the freely available Tailwind CSS framework under the MIT license.

## Acknowledgments

- Inspired by [Notion](https://notion.so)'s excellent multiselect component
- Built with [Stimulus](https://stimulus.hotwired.dev/) for modern Rails applications
- Styled with [Tailwind CSS](https://tailwindcss.com/) for beautiful, responsive design

## Author

**Sulman Baig**
- GitHub: [@sulmanweb](https://github.com/sulmanweb)
- Email: sulmanweb@gmail.com

## Dependencies

- [Rails](https://rubyonrails.org/) - MIT License
- [Stimulus](https://stimulus.hotwired.dev/) - MIT License  
- [Tailwind CSS](https://tailwindcss.com/) - MIT License (via tailwindcss-rails gem)