# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-09-25

### Added
- Added `value_method` and `text_method` options for flexible attribute handling
- Support for objects with custom attribute names (e.g., `slug` instead of `id`, `title` instead of `name`)
- Enhanced documentation with examples for different data formats

### Enhanced
- Improved `extract_item_data` method to handle configurable attribute methods
- Better support for hash formats with custom keys
- Maintained backward compatibility with existing `id`/`name` defaults

### Use Cases Supported
- ActiveRecord objects with any attribute names: `value_method: :slug, text_method: :title`
- Simple string arrays that return selected strings as-is
- Hash formats with custom keys
- Mixed data formats in the same collection

## [0.1.1] - 2025-09-25

### Fixed
- Fixed install generator template path issue
- Resolved gemspec warnings with proper version constraints
- Updated GitHub repository URL to pageinteract organization
- Fixed create new item functionality to capture full text instead of first character
- Added newly created items to dropdown with selected state
- Improved dark mode support and theme handling

### Changed
- Updated Rails dependency to support versions 7.0 through 8.x
- Set Tailwind CSS dependency specifically to version 4.x
- Improved SVG rendering for close buttons on badges
- Enhanced ID comparison for consistent string handling

## [0.1.0] - 2025-09-25

### Added
- Initial release of Rails Notion-Like Multiselect gem
- Beautiful, keyboard-navigable multiselect component inspired by Notion's UI/UX
- Full keyboard navigation support (Arrow keys, Enter, Escape, Tab, Backspace)
- Real-time search and filtering capabilities
- Create new items inline with optional API endpoint support
- Theme support (light, dark, auto modes)
- Customizable badge colors (blue, green, purple, yellow, red)
- Smart selection display with compact badges
- Fully responsive design
- Proper ARIA attributes for accessibility
- Built with Hotwire Stimulus for modern Rails applications
- Tailwind CSS v4 styling with automatic dark mode adaptation
- Support for Rails 7.0+ applications
- Comprehensive helper methods for easy integration
- Installation generator for quick setup

### Features
- Multiselect field helper for Rails forms
- Dynamic item creation with "Create" option
- Persistent selections across form submissions
- Server-side item creation with API endpoint support
- Automatic ID management for created items
- Visual feedback for selected items in dropdown
- Smooth keyboard navigation with highlighting
- Click outside to close dropdown
- Empty state handling
- Customizable placeholder and help text

### Technical
- MIT License
- Ruby 3.0+ required
- Rails 7.0+ required
- Stimulus.js required
- Tailwind CSS required (via tailwindcss-rails gem)
