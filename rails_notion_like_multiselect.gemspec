# frozen_string_literal: true

require_relative 'lib/rails_notion_like_multiselect/version'

Gem::Specification.new do |spec|
  spec.name = 'rails_notion_like_multiselect'
  spec.version = RailsNotionLikeMultiselect::VERSION
  spec.authors = ['Sulman Baig']
  spec.email = ['sulmanweb@gmail.com']

  spec.summary = 'A Notion-like multiselect component for Rails applications with Tailwind CSS'
  spec.description = "A beautiful, keyboard-navigable multiselect component for Rails applications, " \
                     "inspired by Notion's elegant UI/UX. Features include real-time search, inline item creation, " \
                     "full keyboard navigation, dark mode support, and customizable themes. " \
                     "Built with Hotwire Stimulus and Tailwind CSS for modern Rails applications."
  spec.homepage = 'https://github.com/pageinteract/rails_notion_like_multiselect'
  spec.license = 'MIT'
  spec.required_ruby_version = '>= 3.0.0'

  spec.metadata['allowed_push_host'] = 'https://rubygems.org'
  spec.metadata['homepage_uri'] = spec.homepage
  spec.metadata['source_code_uri'] = "#{spec.homepage}/tree/main"
  spec.metadata['changelog_uri'] = "#{spec.homepage}/blob/main/CHANGELOG.md"
  spec.metadata['bug_tracker_uri'] = "#{spec.homepage}/issues"
  spec.metadata['documentation_uri'] = "#{spec.homepage}#readme"

  # Specify which files should be added to the gem when it is released.
  spec.files = Dir.chdir(__dir__) do
    Dir['{app,config,lib}/**/*', 'LICENSE.txt', 'README.md', 'CHANGELOG.md', 'Rakefile'].select { |f| File.file?(f) }
  end
  spec.bindir = 'exe'
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  # Runtime dependencies
  spec.add_dependency 'rails', '>= 7.0', '< 9'
  spec.add_dependency 'stimulus-rails', '~> 1.0'
  spec.add_dependency 'tailwindcss-rails', '~> 4.0'
  
  # Development dependencies
  spec.add_development_dependency 'bundler', '~> 2.0'
  spec.add_development_dependency 'rake', '~> 13.0'
  spec.add_development_dependency 'rspec', '~> 3.0'
end
