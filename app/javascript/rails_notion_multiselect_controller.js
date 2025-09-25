import { Controller } from "@hotwired/stimulus"

// Rails Notion-like Multiselect Controller
// Provides a beautiful multiselect with search, creation, and keyboard navigation
export default class extends Controller {
  static targets = ["input", "selectedItems", "hiddenInputs", "dropdown", "optionsList", "createOption"]
  
  static values = {
    allowCreate: Boolean,      // Whether to allow creating new items
    itemType: String,          // Type of items (e.g., 'category', 'tag')
    inputName: String,         // Name for hidden inputs (e.g., 'game[category_ids][]')
    placeholder: String,       // Placeholder text for input
    createPrompt: String,      // Prompt for creating new items (e.g., 'Create tag')
    badgeClass: String,        // CSS classes for badges
    apiEndpoint: String,       // Optional API endpoint for fetching items
    theme: String              // Theme mode: 'light', 'dark', or 'auto'
  }
  
  connect() {
    this.selectedItems = new Map()
    this.allOptions = new Map()
    this.isOpen = false
    this.highlightedIndex = -1
    
    // Set default values
    this.itemTypeValue = this.itemTypeValue || 'item'
    this.placeholderValue = this.placeholderValue || 'Search or select...'
    this.createPromptValue = this.createPromptValue || `Create "${this.itemTypeValue}"`
    this.themeValue = this.themeValue || 'auto'
    this.inputNameValue = this.inputNameValue || 'item_ids[]'
    
    // Set default badge classes based on theme
    if (!this.badgeClassValue) {
      if (this.themeValue === 'dark') {
        this.badgeClassValue = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                               'bg-blue-900/30 text-blue-200 border border-blue-800'
      } else if (this.themeValue === 'light') {
        this.badgeClassValue = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                               'bg-blue-100 text-blue-800 border border-blue-200'
      } else {
        this.badgeClassValue = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1 ' +
                               'bg-blue-100 text-blue-800 border border-blue-200 ' +
                               'dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
      }
    }
    
    // Initialize existing selections
    this.initializeExistingSelections()
    
    // Store all available options
    this.storeAllOptions()
    
    // Set up event listeners
    this.setupEventListeners()
    
    // Close dropdown when clicking outside
    this.handleClickOutside = this.closeOnClickOutside.bind(this)
    document.addEventListener('click', this.handleClickOutside)
  }
  
  disconnect() {
    document.removeEventListener('click', this.handleClickOutside)
  }
  
  initializeExistingSelections() {
    // Get existing badges that were rendered by Rails
    const existingBadges = this.selectedItemsTarget.querySelectorAll('[data-item-id]')
    
    // Process each existing badge to extract its data
    existingBadges.forEach(badge => {
      const itemId = badge.dataset.itemId
      if (!itemId) return
      
      // Try multiple ways to get the item name
      let nameText = ''
      
      // Method 1: Look for child span with data-item-name attribute
      const nameSpan = badge.querySelector('[data-item-name]')
      if (nameSpan) {
        // First try the data attribute value
        nameText = nameSpan.getAttribute('data-item-name')
        // If empty or "true", get the text content
        if (!nameText || nameText === '' || nameText === 'true') {
          nameText = nameSpan.textContent?.trim() || ''
        }
      }
      
      // Method 2: Get text from first span child
      if (!nameText) {
        const firstSpan = badge.querySelector('span:first-child')
        if (firstSpan) {
          nameText = firstSpan.textContent?.trim() || ''
        }
      }
      
      // Method 3: Get any text directly in the badge
      if (!nameText) {
        // Get all text nodes in the badge
        const walker = document.createTreeWalker(
          badge,
          NodeFilter.SHOW_TEXT,
          null,
          false
        )
        let node
        while (node = walker.nextNode()) {
          const text = node.textContent?.trim()
          if (text && text !== '×') {
            nameText = text
            break
          }
        }
      }
      
      // Store the item in our map
      if (nameText && itemId) {
        this.selectedItems.set(String(itemId), nameText)
        
        // Ensure the badge has proper event handlers
        const removeBtn = badge.querySelector('button')
        if (removeBtn && !removeBtn.hasAttribute('data-action')) {
          removeBtn.setAttribute('data-action', 'click->rails-notion-multiselect#handleRemove')
          removeBtn.setAttribute('data-item-id', itemId)
        }
      }
    })
    
    // DON'T call updateDisplay() here - we want to keep the existing badges!
    this.updateSelectedState()
    this.updateHiddenInputs()
  }
  
  storeAllOptions() {
    // Store all options from the dropdown
    if (!this.hasOptionsListTarget) {
      return
    }
    
    const options = this.optionsListTarget.querySelectorAll('[data-option-id]')
    options.forEach(option => {
      const id = String(option.dataset.optionId) // Ensure ID is a string
      const name = option.dataset.optionName || 
                  option.querySelector('span.flex-1')?.textContent?.trim() ||
                  option.textContent.trim()
      if (id && name) {
        this.allOptions.set(id, name)
      }
    })
  }
  
  setupEventListeners() {
    // Input field events
    if (this.hasInputTarget) {
      this.inputTarget.addEventListener('focus', () => this.openDropdown())
      this.inputTarget.addEventListener('input', () => this.handleSearch())
      this.inputTarget.addEventListener('keydown', (e) => this.handleKeydown(e))
    }
    
    // Option click and hover events
    if (this.hasOptionsListTarget) {
      const options = this.optionsListTarget.querySelectorAll('[data-option-id]')
      options.forEach((option, index) => {
        option.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          const name = option.dataset.optionName || 
                      option.querySelector('span.flex-1')?.textContent?.trim() ||
                      option.textContent.trim()
          this.toggleOption(String(option.dataset.optionId), name) // Ensure ID is a string
        })
        
        // Update highlight on mouse enter
        option.addEventListener('mouseenter', () => {
          const visibleOptions = this.getVisibleOptions()
          const optionIndex = visibleOptions.indexOf(option)
          if (optionIndex !== -1) {
            this.clearHighlight()
            this.highlightedIndex = optionIndex
            this.applyHighlight(option)
          }
        })
      })
    }
  }
  
  openDropdown() {
    if (!this.isOpen && this.hasDropdownTarget) {
      // Use style.display instead of classes for better reliability
      this.dropdownTarget.style.display = 'block'
      this.isOpen = true
      this.highlightedIndex = -1 // Reset highlight
      this.handleSearch() // Filter based on current input
    }
  }
  
  closeDropdown() {
    if (this.isOpen && this.hasDropdownTarget) {
      // Use style.display instead of classes for better reliability
      this.dropdownTarget.style.display = 'none'
      this.isOpen = false
      this.highlightedIndex = -1 // Reset highlight
      this.clearHighlight()
      if (this.hasInputTarget) {
        this.inputTarget.value = ''
      }
      this.resetSearch()
    }
  }
  
  closeOnClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.closeDropdown()
    }
  }
  
  handleSearch() {
    if (!this.hasInputTarget || !this.hasOptionsListTarget) {
      return
    }
    
    const query = this.inputTarget.value.toLowerCase().trim()
    const options = this.optionsListTarget.querySelectorAll('[data-option-id]')
    let hasVisibleOptions = false
    
    // Reset highlight when search changes
    this.highlightedIndex = -1
    this.clearHighlight()
    
    // Filter existing options
    options.forEach(option => {
      const text = (option.dataset.optionName || option.textContent).toLowerCase()
      const isVisible = text.includes(query)
      option.style.display = isVisible ? '' : 'none'
      if (isVisible) hasVisibleOptions = true
    })
    
    // Handle create option
    if (this.allowCreateValue && query.length > 0) {
      // Check if exact match exists
      const exactMatch = Array.from(this.allOptions.values()).some(
        name => name.toLowerCase() === query
      )
      
      if (!exactMatch) {
        this.showCreateOption(query)
      } else {
        this.hideCreateOption()
      }
    } else {
      this.hideCreateOption()
    }
  }
  
  showCreateOption(query) {
    if (!this.hasCreateOptionTarget) {
      // Create the create option element if it doesn't exist
      const createDiv = document.createElement('div')
      createDiv.dataset.railsNotionMultiselectTarget = 'createOption'
      createDiv.dataset.isCreateOption = 'true'
      createDiv.dataset.createQuery = query // Store the query
      // Apply theme-specific classes for create option
      if (this.themeValue === 'dark') {
        createDiv.className = 'px-3 py-2 text-sm cursor-pointer border-t text-gray-300 hover:bg-gray-700 border-gray-700'
      } else if (this.themeValue === 'light') {
        createDiv.className = 'px-3 py-2 text-sm cursor-pointer border-t text-gray-700 hover:bg-gray-100 border-gray-200'
      } else {
        createDiv.className = 'px-3 py-2 text-sm cursor-pointer border-t ' +
                              'text-gray-700 dark:text-gray-300 ' +
                              'hover:bg-gray-100 dark:hover:bg-gray-700 ' +
                              'border-gray-200 dark:border-gray-700'
      }
      createDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Create "<span class="font-medium text-white">${this.escapeHtml(query)}</span>"</span>
        </div>
      `
      this.optionsListTarget.appendChild(createDiv)
      
      createDiv.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Use the stored query from dataset
        const storedQuery = createDiv.dataset.createQuery
        if (storedQuery) {
          this.createNewItem(storedQuery)
        }
      })
      
      // Update highlight on mouse enter for create option
      createDiv.addEventListener('mouseenter', () => {
        const visibleOptions = this.getVisibleOptions()
        const optionIndex = visibleOptions.indexOf(createDiv)
        if (optionIndex !== -1) {
          this.clearHighlight()
          this.highlightedIndex = optionIndex
          this.applyHighlight(createDiv)
        }
      })
    } else {
      // Update existing create option
      this.createOptionTarget.style.display = ''
      this.createOptionTarget.dataset.createQuery = query // Update stored query
      const querySpan = this.createOptionTarget.querySelector('.font-medium')
      if (querySpan) {
        querySpan.textContent = query
      }
    }
  }
  
  hideCreateOption() {
    if (this.hasCreateOptionTarget) {
      this.createOptionTarget.style.display = 'none'
    }
  }
  
  addOptionToDropdown(itemId, itemName, isSelected = false) {
    // Check if option already exists
    const existingOption = this.optionsListTarget.querySelector(`[data-option-id="${itemId}"]`)
    if (existingOption) {
      return // Option already exists
    }
    
    // Create new option element
    const optionDiv = document.createElement('div')
    optionDiv.dataset.optionId = itemId
    optionDiv.dataset.optionName = itemName
    
    // Determine classes based on selection state and theme
    let optionClasses = 'px-3 py-2 text-sm cursor-pointer flex items-center '
    if (isSelected) {
      if (this.themeValue === 'dark') {
        optionClasses += 'bg-blue-600 text-white hover:bg-blue-700'
      } else if (this.themeValue === 'light') {
        optionClasses += 'bg-blue-500 text-white hover:bg-blue-600'
      } else {
        optionClasses += 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
      }
    } else {
      if (this.themeValue === 'dark') {
        optionClasses += 'text-gray-300 hover:bg-gray-700'
      } else if (this.themeValue === 'light') {
        optionClasses += 'text-gray-700 hover:bg-gray-100'
      } else {
        optionClasses += 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }
    }
    
    optionDiv.className = optionClasses
    optionDiv.innerHTML = `<span class="flex-1">${this.escapeHtml(itemName)}</span>`
    
    // Add click handler
    optionDiv.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.toggleOption(String(itemId), itemName)
    })
    
    // Add hover handler for highlighting
    optionDiv.addEventListener('mouseenter', () => {
      const visibleOptions = this.getVisibleOptions()
      const optionIndex = visibleOptions.indexOf(optionDiv)
      if (optionIndex !== -1) {
        this.clearHighlight()
        this.highlightedIndex = optionIndex
        this.applyHighlight(optionDiv)
      }
    })
    
    // Insert before create option if it exists, otherwise append
    if (this.hasCreateOptionTarget) {
      this.optionsListTarget.insertBefore(optionDiv, this.createOptionTarget)
    } else {
      this.optionsListTarget.appendChild(optionDiv)
    }
  }
  
  handleKeydown(event) {
    const visibleOptions = this.getVisibleOptions()
    
    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!this.isOpen) {
          this.openDropdown()
        } else {
          this.highlightNext(visibleOptions)
        }
        break
        
      case 'ArrowUp':
        event.preventDefault()
        if (this.isOpen) {
          this.highlightPrevious(visibleOptions)
        }
        break
        
      case 'Enter':
        event.preventDefault()
        if (this.isOpen && this.highlightedIndex >= 0 && this.highlightedIndex < visibleOptions.length) {
          // Select highlighted option
          const highlightedOption = visibleOptions[this.highlightedIndex]
          
          if (highlightedOption) {
            if (highlightedOption.dataset?.isCreateOption) {
              // It's the create option - use the stored query
              const storedQuery = highlightedOption.dataset.createQuery
              if (storedQuery) {
                this.createNewItem(storedQuery)
              }
            } else {
              // Regular option
              const id = highlightedOption.dataset.optionId
              // Use dataset.optionName which is reliable, or get the first span's text
              const name = highlightedOption.dataset.optionName || 
                          highlightedOption.querySelector('span.flex-1')?.textContent?.trim() ||
                          highlightedOption.textContent.trim()
              this.toggleOption(id, name)
            }
          }
        } else {
          // Handle create if no option is highlighted
          const query = this.inputTarget.value.trim()
          
          if (this.allowCreateValue && query.length > 0) {
            // Check if exact match exists
            const exactMatch = Array.from(this.allOptions.entries()).find(
              ([id, name]) => name.toLowerCase() === query.toLowerCase()
            )
            
            if (exactMatch) {
              // Select existing item
              this.toggleOption(exactMatch[0], exactMatch[1])
            } else {
              // Create new item
              this.createNewItem(query)
            }
          }
        }
        break
        
      case 'Escape':
        event.preventDefault()
        this.closeDropdown()
        break
        
      case 'Backspace':
        if (this.inputTarget.value === '') {
          // Remove last selected item when backspace on empty input
          event.preventDefault()
          this.removeLastSelected()
        }
        break
        
      case 'Tab':
        // Close dropdown on tab
        this.closeDropdown()
        break
        
      default:
        // Open dropdown on any text input
        if (!this.isOpen && event.key.length === 1) {
          this.openDropdown()
        }
    }
  }
  
  getVisibleOptions() {
    if (!this.hasOptionsListTarget) return []
    
    // Get all option elements and filter out hidden ones
    const allOptions = Array.from(this.optionsListTarget.querySelectorAll('[data-option-id]'))
      .filter(option => {
        // Check if element is visible (not hidden)
        return option.style.display !== 'none'
      })
    
    // Add create option at the end if it exists and is visible
    const createOption = this.hasCreateOptionTarget && this.createOptionTarget.style.display !== 'none' 
      ? this.createOptionTarget 
      : null
    
    if (createOption) {
      allOptions.push(createOption)
    }
    
    return allOptions
  }
  
  highlightNext(visibleOptions) {
    if (visibleOptions.length === 0) return
    
    // Clear previous highlight
    this.clearHighlight()
    
    // Move to next index
    this.highlightedIndex = (this.highlightedIndex + 1) % visibleOptions.length
    
    // Apply highlight
    this.applyHighlight(visibleOptions[this.highlightedIndex])
  }
  
  highlightPrevious(visibleOptions) {
    if (visibleOptions.length === 0) return
    
    // Clear previous highlight
    this.clearHighlight()
    
    // Move to previous index
    this.highlightedIndex = this.highlightedIndex <= 0 
      ? visibleOptions.length - 1 
      : this.highlightedIndex - 1
    
    // Apply highlight
    this.applyHighlight(visibleOptions[this.highlightedIndex])
  }
  
  applyHighlight(element) {
    if (!element) return
    
    if (this.themeValue === 'dark') {
      element.classList.add('bg-gray-600', 'ring-1', 'ring-blue-500')
    } else if (this.themeValue === 'light') {
      element.classList.add('bg-gray-100', 'ring-1', 'ring-blue-500')
    } else {
      element.classList.add('bg-gray-100', 'dark:bg-gray-600', 'ring-1', 'ring-blue-500')
    }
    element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  
  clearHighlight() {
    if (!this.hasOptionsListTarget) return
    
    // Clear all highlights based on theme
    const highlightClasses = this.themeValue === 'dark' 
      ? ['bg-gray-600', 'ring-1', 'ring-blue-500']
      : this.themeValue === 'light'
      ? ['bg-gray-100', 'ring-1', 'ring-blue-500']
      : ['bg-gray-100', 'dark:bg-gray-600', 'ring-1', 'ring-blue-500']
    
    this.optionsListTarget.querySelectorAll('.bg-gray-100, .bg-gray-600, .dark\\:bg-gray-600').forEach(el => {
      highlightClasses.forEach(cls => el.classList.remove(cls))
    })
    
    if (this.hasCreateOptionTarget) {
      highlightClasses.forEach(cls => this.createOptionTarget.classList.remove(cls))
    }
  }
  
  toggleOption(itemId, itemName) {
    const id = String(itemId) // Ensure ID is a string
    if (this.selectedItems.has(id)) {
      this.removeItem(id)
    } else {
      this.addItem(id, itemName)
    }
  }
  
  addItem(itemId, itemName) {
    this.selectedItems.set(String(itemId), itemName) // Ensure ID is a string
    this.updateDisplay()
    this.updateHiddenInputs()
    this.updateSelectedState()
    
    // Clear input and reset search
    if (this.hasInputTarget) {
      this.inputTarget.value = ''
    }
    this.handleSearch()
    
    // Reset highlight index after adding
    this.highlightedIndex = -1
    this.clearHighlight()
  }
  
  removeItem(itemId) {
    this.selectedItems.delete(String(itemId)) // Ensure ID is a string
    this.updateDisplay()
    this.updateHiddenInputs()
    this.updateSelectedState()
  }
  
  removeLastSelected() {
    if (this.selectedItems.size > 0) {
      const lastItem = Array.from(this.selectedItems.keys()).pop()
      this.removeItem(lastItem)
    }
  }
  
  createNewItem(name) {
    if (!name || name.trim() === '') return
    
    // Generate a temporary ID for new items
    const tempId = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Add to all options for future reference first
    this.allOptions.set(tempId, name)
    
    // Add the new item to the dropdown
    this.addOptionToDropdown(tempId, name, true)
    
    // Add to selected items (this will clear the input)
    this.addItem(tempId, name)
    
    // Optionally, you can trigger an AJAX request here to create the item on the server
    if (this.apiEndpointValue) {
      this.createItemOnServer(tempId, name)
    }
    
    // Hide create option after creating
    this.hideCreateOption()
  }
  
  async createItemOnServer(tempId, name) {
    // This is optional - implement server-side creation if needed
    try {
      const response = await fetch(this.apiEndpointValue, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ [this.itemTypeValue]: { name: name } })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Replace temp ID with real ID
        if (data.id) {
          const itemName = this.selectedItems.get(tempId)
          this.selectedItems.delete(tempId)
          this.allOptions.delete(tempId)
          
          const realId = data.id.toString()
          this.selectedItems.set(realId, itemName)
          this.allOptions.set(realId, itemName)
          
          // Update the dropdown option with real ID
          const tempOption = this.optionsListTarget.querySelector(`[data-option-id="${tempId}"]`)
          if (tempOption) {
            tempOption.dataset.optionId = realId
          }
          
          this.updateHiddenInputs()
          this.updateSelectedState()
        }
      }
    } catch (error) {
      console.error('Error creating item:', error)
    }
  }
  
  updateDisplay() {
    // Only update if we have items in our selectedItems map
    // Don't clear existing badges if selectedItems is empty (like on initial load)
    if (this.selectedItems.size === 0 && this.selectedItemsTarget.querySelectorAll('[data-item-id]').length > 0) {
      // We have existing badges but no items in our map yet - don't clear them!
      // This happens during initialization before initializeExistingSelections runs
      return
    }
    
    // Clear current display
    this.selectedItemsTarget.innerHTML = ''
    
    // Add badges for each selected item
    this.selectedItems.forEach((name, id) => {
      const badge = this.createBadge(id, name)
      this.selectedItemsTarget.appendChild(badge)
    })
    
    // Update placeholder visibility
    if (this.hasInputTarget) {
      this.inputTarget.placeholder = this.selectedItems.size > 0 ? '' : this.placeholderValue
    }
  }
  
  createBadge(itemId, itemName) {
    const span = document.createElement('span')
    span.className = this.badgeClassValue
    span.dataset.itemId = itemId
    
    // Apply theme-specific button classes
    const buttonClass = this.themeValue === 'dark'
      ? 'ml-1 group relative h-3.5 w-3.5 rounded-sm hover:bg-gray-400/20'
      : this.themeValue === 'light'
      ? 'ml-1 group relative h-3.5 w-3.5 rounded-sm hover:bg-gray-600/20'
      : 'ml-1 group relative h-3.5 w-3.5 rounded-sm hover:bg-gray-600/20 dark:hover:bg-gray-400/20'
    
    span.innerHTML = `
      <span data-item-name="${this.escapeHtml(itemName)}">${this.escapeHtml(itemName)}</span>
      <button type="button" 
              data-action="click->rails-notion-multiselect#handleRemove" 
              data-item-id="${itemId}"
              class="${buttonClass}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 opacity-60 group-hover:opacity-100">
          <path d="M4 4l6 6m0-6l-6 6" />
        </svg>
      </button>
    `
    
    return span
  }
  
  handleRemove(event) {
    event.preventDefault()
    event.stopPropagation()
    const itemId = event.currentTarget.dataset.itemId
    this.removeItem(itemId)
  }
  
  focusInput(event) {
    // Focus the input when clicking on the container (but not on badges)
    if (event.target === event.currentTarget || event.target.classList.contains('flex-wrap')) {
      if (this.hasInputTarget) {
        this.inputTarget.focus()
      }
    }
  }
  
  updateHiddenInputs() {
    // Clear current hidden inputs
    this.hiddenInputsTarget.innerHTML = ''
    
    // Add hidden input for each selected item
    this.selectedItems.forEach((name, id) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = this.inputNameValue
      input.value = id
      this.hiddenInputsTarget.appendChild(input)
    })
    
    // Add empty input if no items selected (to ensure Rails receives an empty array)
    if (this.selectedItems.size === 0) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = this.inputNameValue
      input.value = ''
      this.hiddenInputsTarget.appendChild(input)
    }
  }
  
  updateSelectedState() {
    // Update visual state of options in dropdown
    const options = this.optionsListTarget.querySelectorAll('[data-option-id]')
    options.forEach(option => {
      const isSelected = this.selectedItems.has(String(option.dataset.optionId)) // Ensure ID is a string
      
      // Remove all possible state classes first
      option.classList.remove('text-gray-700', 'text-gray-300', 'dark:text-gray-300', 
                              'hover:bg-gray-100', 'hover:bg-gray-700', 'dark:hover:bg-gray-700',
                              'bg-blue-500', 'bg-blue-600', 'text-white', 'hover:bg-blue-600', 'hover:bg-blue-700',
                              'dark:bg-blue-600', 'dark:hover:bg-blue-700',
                              'hover:bg-gray-700/50', 'bg-blue-600/30', 'text-blue-100', 'hover:bg-blue-600/40')
      
      if (isSelected) {
        // Add selected state classes based on theme
        if (this.themeValue === 'dark') {
          option.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700')
        } else if (this.themeValue === 'light') {
          option.classList.add('bg-blue-500', 'text-white', 'hover:bg-blue-600')
        } else {
          option.classList.add('bg-blue-500', 'text-white', 'hover:bg-blue-600', 'dark:bg-blue-600', 'dark:hover:bg-blue-700')
        }
      } else {
        // Add unselected state classes based on theme
        if (this.themeValue === 'dark') {
          option.classList.add('text-gray-300', 'hover:bg-gray-700')
        } else if (this.themeValue === 'light') {
          option.classList.add('text-gray-700', 'hover:bg-gray-100')
        } else {
          option.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700')
        }
      }
    })
  }
  
  resetSearch() {
    // Show all options
    const options = this.optionsListTarget.querySelectorAll('[data-option-id]')
    options.forEach(option => {
      option.style.display = ''
    })
    this.hideCreateOption()
  }
  
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
