# Usage Example for Rails Notion-Like Multiselect

## Quick Start Guide

### 1. Add to Gemfile

```ruby
# Gemfile
gem 'rails_notion_like_multiselect', git: 'https://github.com/pageinteract/rails_notion_like_multiselect.git', tag: 'v0.1.2'
```

### 2. Install

```bash
bundle install
rails generate rails_notion_like_multiselect:install
```

### 3. Example Model Setup

```ruby
# app/models/game.rb
class Game < ApplicationRecord
  has_and_belongs_to_many :categories
  serialize :tags, Array
end

# app/models/category.rb
class Category < ApplicationRecord
  has_and_belongs_to_many :games
end
```

### 4. Controller

```ruby
# app/controllers/games_controller.rb
class GamesController < ApplicationController
  def new
    @game = Game.new
    @categories = Category.all
  end
  
  def create
    @game = Game.new(game_params)
    if @game.save
      redirect_to @game
    else
      render :new
    end
  end
  
  private
  
  def game_params
    params.require(:game).permit(:name, category_ids: [], tags: [])
  end
end
```

### 5. View Implementation

```erb
<!-- app/views/games/_form.html.erb -->
<%= form_with model: @game do |form| %>
  <!-- Basic usage with categories -->
  <%= multiselect_field(
    form,
    :category_ids,
    collection: @categories,
    selected: @game.categories,
    placeholder: "Select categories...",
    label: "Game Categories",
    theme: "dark"  # or "light" or "auto"
  ) %>
  
  <!-- With creation capability for tags -->
  <%= multiselect_field(
    form,
    :tags,
    collection: ["Action", "Adventure", "RPG", "Strategy"],
    selected: @game.tags || [],
    allow_create: true,
    placeholder: "Add tags...",
    label: "Tags",
    badge_color: "green",
    theme: "dark",
    help_text: "Select existing tags or create new ones"
  ) %>

  <!-- Using objects with custom attributes -->
  <%= multiselect_field(
    form,
    :author_slugs,
    collection: @authors,          # Objects with .slug and .full_name methods
    selected: @game.authors,       # Selected author objects
    value_method: :slug,           # Use slug for the value (saved to DB)
    text_method: :full_name,       # Use full_name for display text
    label: "Authors",
    badge_color: "purple"
  ) %>

  <!-- Using hash format with custom keys -->
  <%= multiselect_field(
    form,
    :platform_ids,
    collection: [
      { platform_id: 1, platform_name: 'PlayStation 5' },
      { platform_id: 2, platform_name: 'Xbox Series X' },
      { platform_id: 3, platform_name: 'Nintendo Switch' }
    ],
    selected: @game.selected_platforms || [],  # Array of hashes
    value_method: :platform_id,    # Use platform_id for the value
    text_method: :platform_name,   # Use platform_name for display text
    label: "Gaming Platforms",
    badge_color: "yellow"
  ) %>

  <!-- Simple strings for skills/genres -->
  <%= multiselect_field(
    form,
    :skills,
    collection: ["Ruby on Rails", "JavaScript", "React", "Vue.js", "Python"],
    selected: @game.required_skills || [],  # Array of strings
    allow_create: true,
    label: "Required Skills",
    badge_color: "red",
    help_text: "Skills return as strings: ['Ruby on Rails', 'JavaScript']"
  ) %>
  
  <%= form.submit %>
<% end %>
```

### 6. For Dark Theme Applications

If your application uses a dark theme, you can set the theme globally:

```ruby
# config/initializers/rails_notion_like_multiselect.rb
RailsNotionLikeMultiselect.setup do |config|
  config.default_badge_color = "blue"
  config.default_placeholder = "Search or select..."
  config.enable_keyboard_navigation = true
end
```

And use in your views:

```erb
<%= multiselect_field(
  form,
  :category_ids,
  collection: @categories,
  selected: @game.categories,
  theme: "dark"  # Force dark theme
) %>
```

### 7. With API Endpoint for Server-Side Creation

```ruby
# config/routes.rb
resources :tags, only: [:create]

# app/controllers/tags_controller.rb
class TagsController < ApplicationController
  def create
    tag = Tag.find_or_create_by(name: params[:tag][:name])
    render json: { id: tag.id, name: tag.name }
  end
end

# In your view
<%= multiselect_field(
  form,
  :tag_ids,
  collection: Tag.all,
  selected: @game.tags,
  allow_create: true,
  api_endpoint: "/tags",
  item_type: "tag"
) %>
```

## Data Format Use Cases

### Case 1: ActiveRecord Objects with Custom Attributes

When working with ActiveRecord objects that use different attribute names:

```ruby
# Models with custom attributes
class Author < ApplicationRecord
  def slug
    name.parameterize
  end
  
  def full_name
    "#{first_name} #{last_name}"
  end
end

# In your controller
@authors = Author.all  # Objects with .slug and .full_name methods

# In your view
<%= multiselect_field(
  form,
  :author_slugs,
  collection: @authors,
  selected: @game.authors,
  value_method: :slug,        # Will save slugs to the database
  text_method: :full_name,    # Will display full names in dropdown
  label: "Authors"
) %>

# Form submission will contain:
# { game: { author_slugs: ["john-doe", "jane-smith"] } }
```

### Case 2: Simple String Arrays

When you want to work with simple strings:

```ruby
# In your controller
@skills = ["Ruby", "JavaScript", "Python", "Go"]

# In your view
<%= multiselect_field(
  form,
  :required_skills,
  collection: @skills,
  selected: @game.required_skills || [],
  allow_create: true,
  label: "Required Skills"
) %>

# Form submission will contain:
# { game: { required_skills: ["Ruby", "JavaScript", "NewSkill"] } }
```

## Keyboard Shortcuts

- **↓/↑** - Navigate through options
- **Enter** - Select highlighted option or create new item
- **Escape** - Close dropdown
- **Backspace** - Remove last selected item (when input is empty)
- **Tab** - Close dropdown and move to next field

## Customization Options

| Option         | Values                                               | Description                            |
| -------------- | ---------------------------------------------------- | -------------------------------------- |
| `theme`        | `"light"`, `"dark"`, `"auto"`                        | Control the color scheme               |
| `badge_color`  | `"blue"`, `"green"`, `"purple"`, `"yellow"`, `"red"` | Badge color for selected items         |
| `allow_create` | `true`, `false`                                      | Enable inline creation of new items    |
| `api_endpoint` | URL string                                           | Endpoint for server-side item creation |

## Troubleshooting

### Styles not appearing correctly

Ensure your Tailwind configuration includes the gem's paths:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{erb,haml,html,slim,rb}',
    './vendor/bundle/ruby/*/gems/rails_notion_like_multiselect-*/**/*.{js,rb}'
  ],
  darkMode: 'class', // for dark mode support
  // ...
}
```

### JavaScript not working

Ensure Stimulus is properly configured and the controller is registered:

```javascript
// app/javascript/controllers/index.js
import { application } from "./application"
import RailsNotionMultiselectController from "rails_notion_multiselect_controller"
application.register("rails-notion-multiselect", RailsNotionMultiselectController)
```
