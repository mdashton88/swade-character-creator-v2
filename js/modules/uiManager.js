// SWADE Character Creator v2 - UI Manager Module

export class UIManager {
    constructor() {
        this.notifications = [];
        this.modals = new Map();
        this.debounceTimers = new Map();
    }

    // Element creation utilities
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    createButton(text, className = '', onClick = null) {
        const button = this.createElement('button', className, text);
        if (onClick) button.addEventListener('click', onClick);
        return button;
    }

    createInput(type, className = '', placeholder = '') {
        const input = this.createElement('input', className);
        input.type = type;
        if (placeholder) input.placeholder = placeholder;
        return input;
    }

    createSelect(options, className = '', onChange = null) {
        const select = this.createElement('select', className);
        options.forEach(option => {
            const optionElement = this.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        if (onChange) select.addEventListener('change', onChange);
        return select;
    }

    // Clear all child elements
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Debounce utility
    debounce(func, wait, id) {
        if (this.debounceTimers.has(id)) {
            clearTimeout(this.debounceTimers.get(id));
        }
        
        const timeout = setTimeout(() => {
            func();
            this.debounceTimers.delete(id);
        }, wait);
        
        this.debounceTimers.set(id, timeout);
    }

    // Loading states
    showLoading(element, message = 'Loading...') {
        this.clearElement(element);
        const loadingDiv = this.createElement('div', 'loading');
        loadingDiv.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        element.appendChild(loadingDiv);
    }

    hideLoading(element) {
        const loadingDiv = element.querySelector('.loading');
        if (loadingDiv) loadingDiv.remove();
    }

    // Error display
    showError(element, message) {
        const errorDiv = this.createElement('div', 'error-message', message);
        element.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // Notifications
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification.id), duration);
        }

        return notification.id;
    }

    renderNotification(notification) {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = this.createElement('div', 'notification-container');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }

        const notificationElement = this.createElement('div', `notification ${notification.type}`);
        notificationElement.dataset.notificationId = notification.id;
        notificationElement.innerHTML = `
            <span>${notification.message}</span>
            <button class="close-btn" onclick="uiManager.removeNotification(${notification.id})">&times;</button>
        `;

        container.appendChild(notificationElement);
    }

    removeNotification(id) {
        const element = document.querySelector(`[data-notification-id="${id}"]`);
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => element.remove(), 300);
        }
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    // Modal management
    createModal(id, title, content, options = {}) {
        const modal = this.createElement('div', 'modal');
        modal.id = `modal-${id}`;
        
        const modalContent = this.createElement('div', 'modal-content');
        
        const header = this.createElement('div', 'modal-header');
        header.innerHTML = `
            <h2>${title}</h2>
            <button class="close-btn" onclick="uiManager.closeModal('${id}')">&times;</button>
        `;
        
        const body = this.createElement('div', 'modal-body');
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        
        if (options.footer) {
            const footer = this.createElement('div', 'modal-footer');
            footer.appendChild(options.footer);
            modalContent.appendChild(footer);
        }
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        this.modals.set(id, modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(id);
        });
        
        return modal;
    }

    openModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Create checkbox item (now creates clickable containers without actual checkboxes)
    createCheckboxItem(name, description, meta, isSelected = false, isAvailable = true, onChange = null) {
        console.log('🎯 NEW createCheckboxItem called for:', name); // Debug line - remove after testing
        
        // Create the main container
        const container = this.createElement('div', 'checkbox-item');
        
        // Add classes based on state
        if (!isAvailable) {
            container.classList.add('unavailable');
        }
        if (isSelected) {
            container.classList.add('selected');
        }
        
        // Store state in data attributes
        container.dataset.selected = isSelected;
        container.dataset.available = isAvailable;
        container.dataset.name = name;
        
        // Create content wrapper
        const content = this.createElement('div', 'item-content');
        
        // Add name
        const nameElement = this.createElement('div', 'item-name', name);
        content.appendChild(nameElement);
        
        // Add description if provided
        if (description) {
            const descElement = this.createElement('div', 'item-description', description);
            content.appendChild(descElement);
        }
        
        // Add metadata if provided
        if (meta) {
            const metaElement = this.createElement('div', 'item-meta', meta);
            content.appendChild(metaElement);
        }
        
        // Add visual checkmark indicator
        const checkmark = this.createElement('div', 'item-checkmark', '✓');
        checkmark.style.display = isSelected ? 'block' : 'none';
        content.appendChild(checkmark);
        
        container.appendChild(content);
        
        // Add click handler if available
        if (isAvailable && onChange) {
            container.style.cursor = 'pointer';
            
            container.addEventListener('click', (e) => {
                // Prevent double-firing if clicking on child elements
                if (e.target !== container && !container.contains(e.target)) {
                    return;
                }
                
                // Toggle the selected state
                const wasSelected = container.dataset.selected === 'true';
                const newState = !wasSelected;
                
                // Update visual state
                container.dataset.selected = newState;
                container.classList.toggle('selected', newState);
                
                // Show/hide checkmark
                const checkmark = container.querySelector('.item-checkmark');
                if (checkmark) {
                    checkmark.style.display = newState ? 'block' : 'none';
                }
                
                // Create a fake event object that mimics a checkbox change event
                const fakeEvent = {
                    target: {
                        checked: newState,
                        value: name,
                        id: name.toLowerCase().replace(/\s+/g, '-')
                    },
                    preventDefault: () => {},
                    stopPropagation: () => {}
                };
                
                // Call the onChange handler
                onChange(fakeEvent);
                
                console.log(`[UIManager] Toggled ${name}: ${newState}`);
            });
            
            // Hover effect
            container.addEventListener('mouseenter', () => {
                if (isAvailable) {
                    container.style.transform = 'translateY(-1px)';
                    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }
            });
            
            container.addEventListener('mouseleave', () => {
                container.style.transform = '';
                container.style.boxShadow = '';
            });
        }
        
        return container;
    }

    // Create collapsible section
    createCollapsible(title, content, isOpen = false) {
        const container = this.createElement('div', 'collapsible');
        
        const header = this.createElement('div', 'collapsible-header');
        header.innerHTML = `
            <span>${title}</span>
            <span class="toggle-icon">${isOpen ? '▼' : '▶'}</span>
        `;
        
        const body = this.createElement('div', 'collapsible-body');
        if (!isOpen) body.style.display = 'none';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        header.addEventListener('click', () => {
            const isVisible = body.style.display !== 'none';
            body.style.display = isVisible ? 'none' : 'block';
            header.querySelector('.toggle-icon').textContent = isVisible ? '▶' : '▼';
        });
        
        container.appendChild(header);
        container.appendChild(body);
        
        return container;
    }

    // Tab system
    createTabs(tabs) {
        const container = this.createElement('div', 'tabs-container');
        const tabHeaders = this.createElement('div', 'tab-headers');
        const tabContents = this.createElement('div', 'tab-contents');
        
        tabs.forEach((tab, index) => {
            // Create header
            const header = this.createElement('button', 'tab-header', tab.label);
            if (index === 0) header.classList.add('active');
            header.addEventListener('click', () => this.switchTab(container, index));
            tabHeaders.appendChild(header);
            
            // Create content
            const content = this.createElement('div', 'tab-content');
            if (index === 0) content.classList.add('active');
            if (typeof tab.content === 'string') {
                content.innerHTML = tab.content;
            } else {
                content.appendChild(tab.content);
            }
            tabContents.appendChild(content);
        });
        
        container.appendChild(tabHeaders);
        container.appendChild(tabContents);
        
        return container;
    }

    switchTab(container, index) {
        container.querySelectorAll('.tab-header').forEach((header, i) => {
            header.classList.toggle('active', i === index);
        });
        container.querySelectorAll('.tab-content').forEach((content, i) => {
            content.classList.toggle('active', i === index);
        });
    }

    // Tooltip system
    addTooltip(element, text) {
        element.classList.add('has-tooltip');
        element.setAttribute('data-tooltip', text);
    }

    // Progress bar
    createProgressBar(value, max, label = '') {
        const container = this.createElement('div', 'progress-container');
        
        if (label) {
            const labelElement = this.createElement('div', 'progress-label', label);
            container.appendChild(labelElement);
        }
        
        const progressBar = this.createElement('div', 'progress-bar');
        const progressFill = this.createElement('div', 'progress-fill');
        progressFill.style.width = `${(value / max) * 100}%`;
        
        const progressText = this.createElement('span', 'progress-text', `${value} / ${max}`);
        
        progressBar.appendChild(progressFill);
        progressBar.appendChild(progressText);
        container.appendChild(progressBar);
        
        return container;
    }

    updateProgressBar(container, value, max) {
        const fill = container.querySelector('.progress-fill');
        const text = container.querySelector('.progress-text');
        if (fill) fill.style.width = `${(value / max) * 100}%`;
        if (text) text.textContent = `${value} / ${max}`;
    }
}
