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

    createButton(text, className = 'action-button', onClick = null) {
        const button = this.createElement('button', className, text);
        if (onClick) button.addEventListener('click', onClick);
        return button;
    }

    createInput(type = 'text', className = '', placeholder = '') {
        const input = document.createElement('input');
        input.type = type;
        if (className) input.className = className;
        if (placeholder) input.placeholder = placeholder;
        return input;
    }

    createSelect(options = [], className = '', defaultValue = '') {
        const select = document.createElement('select');
        if (className) select.className = className;
        
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value || option;
            optElement.textContent = option.text || option;
            if (option.value === defaultValue || option === defaultValue) {
                optElement.selected = true;
            }
            select.appendChild(optElement);
        });
        
        return select;
    }

    // DOM manipulation utilities
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    appendChildren(parent, children) {
        children.forEach(child => {
            if (child) parent.appendChild(child);
        });
    }

    setElementContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                this.clearElement(element);
                element.appendChild(content);
            }
        }
    }

    setElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // CSS class utilities
    addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    }

    hasClass(element, className) {
        return element && element.classList.contains(className);
    }

    // Show/hide utilities
    show(element) {
        if (element) {
            element.style.display = '';
            this.removeClass(element, 'hidden');
        }
    }

    hide(element) {
        if (element) {
            element.style.display = 'none';
            this.addClass(element, 'hidden');
        }
    }

    toggle(element) {
        if (element) {
            if (element.style.display === 'none' || this.hasClass(element, 'hidden')) {
                this.show(element);
            } else {
                this.hide(element);
            }
        }
    }

    // Attribute/skill control creators
    createAttributeControl(attributeName, currentValue, onIncrement, onDecrement) {
        const container = this.createElement('div', 'attribute-item');
        
        const label = this.createElement('div', 'attribute-label', 
            attributeName.charAt(0).toUpperCase() + attributeName.slice(1));
        
        const controls = this.createElement('div', 'attribute-controls');
        
        const decrementBtn = this.createButton('-', 'attr-button', onDecrement);
        const valueDisplay = this.createElement('div', 'attribute-value', `d${currentValue}`);
        const incrementBtn = this.createButton('+', 'attr-button', onIncrement);
        
        this.appendChildren(controls, [decrementBtn, valueDisplay, incrementBtn]);
        this.appendChildren(container, [label, controls]);
        
        return {
            container,
            decrementBtn,
            incrementBtn,
            valueDisplay,
            updateValue: (newValue) => {
                valueDisplay.textContent = `d${newValue}`;
            },
            setEnabled: (increment, decrement) => {
                incrementBtn.disabled = !increment;
                decrementBtn.disabled = !decrement;
            }
        };
    }

    createSkillControl(skillName, currentValue, linkedAttribute, onIncrement, onDecrement, isCore = false, isExpensive = false) {
        const container = this.createElement('div', 'skill-item');
        
        if (isCore) this.addClass(container, 'core-skill');
        if (isExpensive) this.addClass(container, 'expensive');
        
        const labelContainer = this.createElement('div', 'skill-label');
        const nameSpan = this.createElement('span', '', skillName);
        const attrSpan = this.createElement('small', 'text-muted', ` (${linkedAttribute})`);
        
        this.appendChildren(labelContainer, [nameSpan, attrSpan]);
        
        const controls = this.createElement('div', 'skill-controls');
        
        const decrementBtn = this.createButton('-', 'skill-button', onDecrement);
        const valueDisplay = this.createElement('div', 'skill-value', 
            currentValue > 0 ? `d${currentValue}` : '—');
        const incrementBtn = this.createButton('+', 'skill-button', onIncrement);
        
        this.appendChildren(controls, [decrementBtn, valueDisplay, incrementBtn]);
        this.appendChildren(container, [labelContainer, controls]);
        
        return {
            container,
            decrementBtn,
            incrementBtn,
            valueDisplay,
            updateValue: (newValue) => {
                valueDisplay.textContent = newValue > 0 ? `d${newValue}` : '—';
            },
            setEnabled: (increment, decrement) => {
                incrementBtn.disabled = !increment;
                decrementBtn.disabled = !decrement;
            },
            setExpensive: (expensive) => {
                if (expensive) {
                    this.addClass(container, 'expensive');
                } else {
                    this.removeClass(container, 'expensive');
                }
            }
        };
    }

    // UPDATED: No more checkboxes - clickable containers instead
    createCheckboxItem(name, description, meta, isSelected = false, isAvailable = true, onChange = null) {
        // Create the main container
        const container = this.createElement('div', 'checkbox-item');
        
        // Add state classes
        if (isSelected) {
            this.addClass(container, 'selected');
        }
        
        if (!isAvailable) {
            this.addClass(container, 'unavailable');
        }
        
        // Create content structure
        const contentDiv = this.createElement('div', 'checkbox-content');
        
        // Create header with name
        const headerDiv = this.createElement('div', 'checkbox-header');
        const nameSpan = this.createElement('span', 'checkbox-name', name);
        headerDiv.appendChild(nameSpan);
        
        // Add selection indicator (visual replacement for checkbox)
        const indicator = this.createElement('div', 'selection-indicator');
        indicator.innerHTML = isSelected ? '✓' : '';
        headerDiv.appendChild(indicator);
        
        // Create description
        const descDiv = this.createElement('div', 'checkbox-description', description);
        
        // Create meta info
        let metaDiv = null;
        if (meta) {
            metaDiv = this.createElement('div', 'checkbox-meta', meta);
        }
        
        // Assemble content
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(descDiv);
        if (metaDiv) {
            contentDiv.appendChild(metaDiv);
        }
        container.appendChild(contentDiv);
        
        // Make the whole container clickable
        container.style.cursor = isAvailable ? 'pointer' : 'not-allowed';
        
        // Add click handler
        const handleClick = () => {
            if (!isAvailable) return;
            
            const newSelected = !isSelected;
            
            // Update visual state
            if (newSelected) {
                this.addClass(container, 'selected');
                indicator.innerHTML = '✓';
            } else {
                this.removeClass(container, 'selected');
                indicator.innerHTML = '';
            }
            
            isSelected = newSelected;
            
            // Call the change handler
            if (onChange) onChange(newSelected);
        };
        
        container.addEventListener('click', handleClick);
        
        // Return control object with methods for external updates
        return {
            container: container,
            setSelected: (selected) => {
                isSelected = selected;
                if (selected) {
                    this.addClass(container, 'selected');
                    indicator.innerHTML = '✓';
                } else {
                    this.removeClass(container, 'selected');
                    indicator.innerHTML = '';
                }
            },
            setAvailable: (available) => {
                isAvailable = available;
                if (available) {
                    this.removeClass(container, 'unavailable');
                    container.style.cursor = 'pointer';
                } else {
                    this.addClass(container, 'unavailable');
                    container.style.cursor = 'not-allowed';
                }
            }
        };
    }

    // Notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = this.createElement('div', `notification notification-${type}`);
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles if not already added
        this.ensureNotificationStyles();
        
        // Add to page
        document.body.appendChild(notification);
        
        // Position notification
        const index = this.notifications.length;
        notification.style.top = `${20 + (index * 70)}px`;
        notification.style.right = '20px';
        
        this.notifications.push(notification);
        
        // Auto-remove
        const removeNotification = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
                this.notifications = this.notifications.filter(n => n !== notification);
                this.repositionNotifications();
            }
        };
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', removeNotification);
        
        // Auto-hide
        if (duration > 0) {
            setTimeout(removeNotification, duration);
        }
        
        // Animate in
        setTimeout(() => this.addClass(notification, 'notification-show'), 10);
        
        return notification;
    }

    repositionNotifications() {
        this.notifications.forEach((notification, index) => {
            notification.style.top = `${20 + (index * 70)}px`;
        });
    }

    ensureNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    z-index: 10000;
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    padding: 15px;
                    min-width: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                }
                .notification-show {
                    opacity: 1;
                    transform: translateX(0);
                }
                .notification-info { border-left: 4px solid #17a2b8; }
                .notification-success { border-left: 4px solid #28a745; }
                .notification-warning { border-left: 4px solid #ffc107; }
                .notification-error { border-left: 4px solid #dc3545; }
                .notification-message { flex: 1; }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                    opacity: 0.5;
                }
                .notification-close:hover { opacity: 1; }
            `;
            document.head.appendChild(styles);
        }
    }

    // Modal system
    createModal(id, title, content, options = {}) {
        const modal = this.createElement('div', 'modal');
        modal.id = id;
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        `;
        
        // Add content
        const body = modal.querySelector('.modal-body');
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        // Add buttons
        const footer = modal.querySelector('.modal-footer');
        if (options.buttons) {
            options.buttons.forEach(button => {
                const btn = this.createButton(button.text, button.className || 'action-button', button.onClick);
                footer.appendChild(btn);
            });
        }
        
        // Event handlers
        const closeModal = () => this.closeModal(id);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
        
        this.ensureModalStyles();
        this.modals.set(id, modal);
        
        return modal;
    }

    showModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            document.body.appendChild(modal);
            setTimeout(() => this.addClass(modal, 'modal-show'), 10);
        }
    }

    closeModal(id) {
        const modal = this.modals.get(id);
        if (modal && modal.parentNode) {
            this.removeClass(modal, 'modal-show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    ensureModalStyles() {
        if (!document.getElementById('modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .modal-show { opacity: 1; }
                .modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                }
                .modal-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                    min-width: 400px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: hidden;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #ddd;
                    background: #f8f9fa;
                }
                .modal-header h3 { margin: 0; color: #333; }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    opacity: 0.5;
                }
                .modal-close:hover { opacity: 1; }
                .modal-body {
                    padding: 20px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #ddd;
                    text-align: right;
                    background: #f8f9fa;
                }
                .modal-footer button {
                    margin-left: 10px;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Debounced input handling
    debounce(key, func, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }

    // Utility methods
    formatDieValue(value) {
        return value > 0 ? `d${value}` : '—';
    }

    formatPoints(current, max) {
        return `${current}/${max}`;
    }

    formatCurrency(amount) {
        return `$${amount.toLocaleString()}`;
    }

    // Height equalization for consistent layouts
    equalizeHeights(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;
        
        // Reset heights
        elements.forEach(el => el.style.height = 'auto');
        
        // Get maximum height
        let maxHeight = 0;
        elements.forEach(el => {
            const height = el.offsetHeight;
            if (height > maxHeight) maxHeight = height;
        });
        
        // Set all to maximum height
        elements.forEach(el => el.style.height = `${maxHeight}px`);
    }

    // Responsive utilities
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    // Animation utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = '';
        
        const start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress.toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        const start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = (initialOpacity * (1 - progress)).toString();
            
            if (progress >= 1) {
                element.style.display = 'none';
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}
