// SWADE Character Creator v2 - UI Manager Module

export class UIManager {
    constructor() {
        this.notificationContainer = null;
        this.initializeNotifications();
    }

    initializeNotifications() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.className = 'notification-container';
            this.notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(this.notificationContainer);
        } else {
            this.notificationContainer = document.querySelector('.notification-container');
        }
    }

    // Generic element creation
    createElement(tagName, className = '', textContent = '') {
        try {
            const element = document.createElement(tagName);
            if (className) {
                element.className = className;
            }
            if (textContent) {
                element.textContent = textContent;
            }
            return element;
        } catch (error) {
            console.error('Error creating element:', error);
            // Return a fallback div
            const fallback = document.createElement('div');
            fallback.textContent = textContent || 'Error creating element';
            return fallback;
        }
    }

    // Create select dropdown
    createSelect(options, className = '', selectedValue = '') {
        try {
            const select = document.createElement('select');
            if (className) {
                select.className = className;
            }

            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                if (option.value === selectedValue) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            });

            return select;
        } catch (error) {
            console.error('Error creating select:', error);
            const fallback = document.createElement('div');
            fallback.textContent = 'Error creating select';
            return fallback;
        }
    }

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        try {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            // Style the notification
            notification.style.cssText = `
                background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : type === 'error' ? '#f44336' : '#2196F3'};
                color: white;
                padding: 12px 16px;
                margin-bottom: 10px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;

            this.notificationContainer.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Auto remove
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);

        } catch (error) {
            console.error('Error showing notification:', error);
            // Fallback to alert
            alert(message);
        }
    }

    // Utility methods for adding/removing CSS classes
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

    // Create attribute control - Returns object with methods
    createAttributeControl(attributeName, currentValue, onIncrement, onDecrement) {
        try {
            const container = document.createElement('div');
            container.className = 'attribute-control';

            const label = document.createElement('span');
            label.className = 'attribute-label';
            label.textContent = attributeName;

            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'attribute-value';
            valueDisplay.textContent = `d${currentValue}`;

            const decrementBtn = document.createElement('button');
            decrementBtn.className = 'btn btn-small btn-decrement';
            decrementBtn.textContent = '-';
            decrementBtn.type = 'button';

            const incrementBtn = document.createElement('button');
            incrementBtn.className = 'btn btn-small btn-increment';
            incrementBtn.textContent = '+';
            incrementBtn.type = 'button';

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'attribute-controls';
            controlsDiv.appendChild(decrementBtn);
            controlsDiv.appendChild(valueDisplay);
            controlsDiv.appendChild(incrementBtn);

            container.appendChild(label);
            container.appendChild(controlsDiv);

            // Add event listeners
            incrementBtn.addEventListener('click', () => {
                if (onIncrement) onIncrement();
            });

            decrementBtn.addEventListener('click', () => {
                if (onDecrement) onDecrement();
            });

            // Return object with methods that AttributesManager expects
            return {
                container: container,
                incrementBtn: incrementBtn,
                decrementBtn: decrementBtn,
                updateValue: function(newValue) {
                    valueDisplay.textContent = `d${newValue}`;
                },
                setEnabled: function(enabled) {
                    incrementBtn.disabled = !enabled;
                    decrementBtn.disabled = !enabled;
                    if (enabled) {
                        this.removeClass(container, 'disabled');
                    } else {
                        this.addClass(container, 'disabled');
                    }
                }.bind(this)
            };
        } catch (error) {
            console.error('Error creating attribute control:', error);
            const fallback = document.createElement('div');
            fallback.textContent = `${attributeName}: Error`;
            return { container: fallback, updateValue: () => {}, setEnabled: () => {} };
        }
    }

    // Create skill control - Returns object with methods
    createSkillControl(skillName, currentValue, linkedAttribute, onIncrement, onDecrement, isCore, isExpensive) {
        try {
            const container = document.createElement('div');
            container.className = `skill-item ${isCore ? 'core-skill' : ''} ${isExpensive ? 'expensive-skill' : ''}`;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'skill-name';
            nameSpan.textContent = skillName;

            const attributeSpan = document.createElement('span');
            attributeSpan.className = 'skill-attribute';
            attributeSpan.textContent = `(${linkedAttribute})`;

            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'skill-value';
            valueDisplay.textContent = this.formatSkillValue(currentValue);

            const decrementBtn = document.createElement('button');
            decrementBtn.className = 'btn btn-small btn-decrement';
            decrementBtn.textContent = '-';
            decrementBtn.type = 'button';

            const incrementBtn = document.createElement('button');
            incrementBtn.className = 'btn btn-small btn-increment';
            incrementBtn.textContent = '+';
            incrementBtn.type = 'button';

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'skill-controls';
            controlsDiv.appendChild(decrementBtn);
            controlsDiv.appendChild(valueDisplay);
            controlsDiv.appendChild(incrementBtn);

            const labelDiv = document.createElement('div');
            labelDiv.className = 'skill-label';
            labelDiv.appendChild(nameSpan);
            labelDiv.appendChild(attributeSpan);

            container.appendChild(labelDiv);
            container.appendChild(controlsDiv);

            // Add event listeners
            incrementBtn.addEventListener('click', () => {
                if (onIncrement) onIncrement();
            });

            decrementBtn.addEventListener('click', () => {
                if (onDecrement) onDecrement();
            });

            // Return object with methods that SkillsManager expects
            return {
                container: container,
                incrementBtn: incrementBtn,
                decrementBtn: decrementBtn,
                updateValue: function(newValue) {
                    valueDisplay.textContent = this.formatSkillValue(newValue);
                }.bind(this),
                setEnabled: function(enabled) {
                    incrementBtn.disabled = !enabled;
                    decrementBtn.disabled = !enabled;
                    if (enabled) {
                        this.removeClass(container, 'disabled');
                    } else {
                        this.addClass(container, 'disabled');
                    }
                }.bind(this),
                setExpensive: function(expensive) {
                    if (expensive) {
                        this.addClass(container, 'expensive-skill');
                    } else {
                        this.removeClass(container, 'expensive-skill');
                    }
                }.bind(this)
            };
        } catch (error) {
            console.error('Error creating skill control:', error);
            const fallback = document.createElement('div');
            fallback.textContent = `${skillName}: Error`;
            return { container: fallback, updateValue: () => {}, setEnabled: () => {}, setExpensive: () => {} };
        }
    }

    // Helper method to format skill values
    formatSkillValue(value) {
        if (value === 0) {
            return 'd4-2'; // Untrained
        } else {
            return `d${value}`;
        }
    }

    // Create checkbox item - Returns object with methods (used by Hindrances and Edges)
    createCheckboxItem(name, description, meta, isSelected, isAvailable, onChange) {
        try {
            const container = document.createElement('div');
            container.className = `checkbox-item ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox-${name.replace(/\s+/g, '-').toLowerCase()}`;
            checkbox.checked = isSelected;
            checkbox.disabled = !isAvailable;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.className = 'checkbox-label';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'item-name';
            nameSpan.textContent = name;

            const descSpan = document.createElement('span');
            descSpan.className = 'item-description';
            descSpan.textContent = description;

            const metaSpan = document.createElement('span');
            metaSpan.className = 'item-meta';
            metaSpan.textContent = meta;

            label.appendChild(nameSpan);
            label.appendChild(descSpan);
            if (meta) {
                label.appendChild(metaSpan);
            }

            container.appendChild(checkbox);
            container.appendChild(label);

            // Add change event listener
            checkbox.addEventListener('change', (e) => {
                if (onChange) {
                    onChange(e.target.checked);
                }
            });

            // Return object with methods that HindrancesManager and EdgesManager expect
            return {
                container: container,
                checkbox: checkbox,
                setSelected: function(selected) {
                    checkbox.checked = selected;
                    if (selected) {
                        this.addClass(container, 'selected');
                    } else {
                        this.removeClass(container, 'selected');
                    }
                }.bind(this),
                setAvailable: function(available) {
                    checkbox.disabled = !available;
                    if (available) {
                        this.removeClass(container, 'disabled');
                    } else {
                        this.addClass(container, 'disabled');
                    }
                }.bind(this)
            };
        } catch (error) {
            console.error('Error creating checkbox item:', error);
            const fallback = document.createElement('div');
            fallback.textContent = `${name}: Error`;
            return { 
                container: fallback, 
                checkbox: null,
                setSelected: () => {}, 
                setAvailable: () => {} 
            };
        }
    }

    // Create skill grid section
    createSkillGridSection(title) {
        try {
            const section = document.createElement('div');
            section.className = 'skill-section';

            const header = document.createElement('h3');
            header.className = 'skill-section-header';
            header.textContent = title;

            const container = document.createElement('div');
            container.className = 'skill-grid';

            section.appendChild(header);
            section.appendChild(container);

            return {
                section: section,
                container: container,
                title: header
            };
        } catch (error) {
            console.error('Error creating skill grid section:', error);
            const fallback = document.createElement('div');
            fallback.textContent = `${title}: Error`;
            return { section: fallback, container: fallback, title: fallback };
        }
    }

    // Create skill item (different from createSkillControl)
    createSkillItem(skillName, linkedAttribute, value, onChange) {
        return this.createSkillControl(skillName, value, linkedAttribute, 
            () => onChange(skillName, 1), 
            () => onChange(skillName, -1), 
            false, false);
    }
}
