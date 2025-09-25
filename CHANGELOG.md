# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
