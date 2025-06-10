// SWADE Character Creator v2 - UI Manager Module

export class UIManager {
    constructor() {
        this.notifications = [];
        this.modals = new Map();
        this.debounceTimers = new Map();
    }

    // Element creation utilities - ALWAYS returns a valid DOM element
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
        if (!element) return;
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

    // Create checkbox item - ROBUST VERSION
    createCheckboxItem(name, description, meta, isSelected = false, isAvailable = true, onChange = null) {
        // Always create valid DOM elements using basic DOM API
        const container = document.createElement('div');
        container.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${(name || '').toLowerCase().replace(/\s+/g, '-')}-checkbox`;
        checkbox.checked = isSelected;
        checkbox.disabled = !isAvailable;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'item-name';
        nameSpan.textContent = name || '';
        label.appendChild(nameSpan);
        
        if (description) {
            const descSpan = document.createElement('span');
            descSpan.className = 'item-description';
            descSpan.textContent = description;
            label.appendChild(descSpan);
        }
        
        if (meta) {
            const metaSpan = document.createElement('span');
            metaSpan.className = 'item-meta';
            metaSpan.textContent = meta;
            label.appendChild(metaSpan);
        }
        
        container.appendChild(checkbox);
        container.appendChild(label);
        
        if (!isAvailable) {
            container.classList.add('unavailable');
        }
        
        if (onChange && typeof onChange === 'function') {
            checkbox.addEventListener('change', (e) => {
                onChange(e.target.checked);
            });
        }
        
        // Return an object with the expected properties - guaranteed to have valid DOM elements
        return {
            container: container,
            checkbox: checkbox,
            
            setSelected: function(selected) {
                if (checkbox) checkbox.checked = selected;
            },
            
            setAvailable: function(available) {
                if (checkbox) checkbox.disabled = !available;
                if (container) {
                    if (!available) {
                        container.classList.add('unavailable');
                    } else {
                        container.classList.remove('unavailable');
                    }
                }
            }
        };
    }

    // Create attribute control - CORRECTED VERSION
    createAttributeControl(attributeName, currentValue, onIncrement, onDecrement) {
        // Create the main container
        const container = document.createElement('div');
        container.className = 'attribute-control';
        
        // Create label
        const label = document.createElement('label');
        label.className = 'attribute-label';
        label.textContent = attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
        container.appendChild(label);
        
        // Create control group
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        
        // Create decrease button
        const decrementBtn = document.createElement('button');
        decrementBtn.className = 'attribute-btn decrease';
        decrementBtn.textContent = '-';
        decrementBtn.onclick = onDecrement;
        
        // Create value display
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'attribute-value';
        valueDisplay.textContent = `d${currentValue}`;
        
        // Create increase button
        const incrementBtn = document.createElement('button');
        incrementBtn.className = 'attribute-btn increase';
        incrementBtn.textContent = '+';
        incrementBtn.onclick = onIncrement;
        
        // Assemble control group
        controlGroup.appendChild(decrementBtn);
        controlGroup.appendChild(valueDisplay);
        controlGroup.appendChild(incrementBtn);
        container.appendChild(controlGroup);
        
        // Return an object with the expected properties and methods
        return {
            container: container,
            incrementBtn: incrementBtn,
            decrementBtn: decrementBtn,
            
            updateValue: function(newValue) {
                valueDisplay.textContent = `d${newValue}`;
            },
            
            setEnabled: function(canIncrement, canDecrement) {
                incrementBtn.disabled = !canIncrement;
                decrementBtn.disabled = !canDecrement;
            }
        };
    }

    // Create skill control - CORRECTED VERSION
    createSkillControl(skillName, currentValue, linkedAttribute, onIncrement, onDecrement, isCore, isExpensive) {
        // Create the main container
        const container = document.createElement('div');
        container.className = 'skill-control';
        if (isCore) container.classList.add('core-skill');
        if (isExpensive) container.classList.add('expensive-skill');
        
        // Create skill name label
        const nameLabel = document.createElement('label');
        nameLabel.className = 'skill-name';
        nameLabel.textContent = skillName;
        
        // Create linked attribute label
        const linkedLabel = document.createElement('span');
        linkedLabel.className = 'skill-linked';
        linkedLabel.textContent = `(${linkedAttribute})`;
        
        // Create control group
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        
        // Create decrease button
        const decrementBtn = document.createElement('button');
        decrementBtn.className = 'skill-btn decrease';
        decrementBtn.textContent = '-';
        decrementBtn.onclick = onDecrement;
        
        // Create value display
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'skill-value';
        valueDisplay.textContent = this.formatSkillValue(currentValue);
        
        // Create increase button
        const incrementBtn = document.createElement('button');
        incrementBtn.className = 'skill-btn increase';
        incrementBtn.textContent = '+';
        incrementBtn.onclick = onIncrement;
        
        // Assemble control group
        controlGroup.appendChild(decrementBtn);
        controlGroup.appendChild(valueDisplay);
        controlGroup.appendChild(incrementBtn);
        
        // Assemble container
        container.appendChild(nameLabel);
        container.appendChild(linkedLabel);
        container.appendChild(controlGroup);
        
        // Return an object with the expected properties and methods
        return {
            container: container,
            incrementBtn: incrementBtn,
            decrementBtn: decrementBtn,
            
            updateValue: function(newValue) {
                valueDisplay.textContent = this.formatSkillValue(newValue);
            }.bind(this),
            
            setEnabled: function(canIncrement, canDecrement) {
                incrementBtn.disabled = !canIncrement;
                decrementBtn.disabled = !canDecrement;
            },
            
            setExpensive: function(isExpensive) {
                if (isExpensive) {
                    container.classList.add('expensive-skill');
                } else {
                    container.classList.remove('expensive-skill');
                }
            }
        };
    }

    // Helper method to format skill values
    formatSkillValue(value) {
        if (value === 0 || !value) return 'd4-2';
        return `d${value}`;
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

    // Helper methods for class manipulation
    addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    }

    removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    }

    // Create a simple div wrapper
    createWrapper(className = '') {
        return this.createElement('div', className);
    }

    // Create a form group
    createFormGroup(label, input) {
        const group = this.createElement('div', 'form-group');
        const labelElement = this.createElement('label', '', label);
        group.appendChild(labelElement);
        group.appendChild(input);
        return group;
    }
}
