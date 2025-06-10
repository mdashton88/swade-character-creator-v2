// SWADE Character Creator v2 - UI Manager Module
// EMERGENCY CLEAN VERSION - Minimal changes to avoid breaking anything

export class UIManager {
    constructor() {
        this.version = 'V1.0023'; // Version tracker for debugging
        console.log(`🎯 UIManager ${this.version} initialized - Clean emergency version with smart buttons`);
        this.notificationContainer = null;
        this.initializeNotifications();
        this.loadDiceIcons();
        this.addVersionDisplay();
        
        // Initialize smart button logic after everything loads
        setTimeout(() => this.initializeSmartButtons(), 500);
    }

    initializeNotifications() {
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

    // Add version display to header for debugging
    addVersionDisplay() {
        setTimeout(() => {
            // Look for the header area
            const header = document.querySelector('.header') || 
                          document.querySelector('header') || 
                          document.querySelector('[class*="header"]') ||
                          document.querySelector('h1') ||
                          document.querySelector('.title');
            
            if (header) {
                // Create version display
                const versionDisplay = document.createElement('div');
                versionDisplay.id = 'version-display';
                versionDisplay.textContent = this.version;
                versionDisplay.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 20px;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    background: rgba(0,0,0,0.3);
                    padding: 4px 8px;
                    border-radius: 4px;
                    z-index: 1000;
                    font-family: monospace;
                `;
                
                // Make header relative if it's not already positioned
                const headerStyle = window.getComputedStyle(header);
                if (headerStyle.position === 'static') {
                    header.style.position = 'relative';
                }
                
                header.appendChild(versionDisplay);
                console.log(`✅ Version ${this.version} displayed in header`);
            } else {
                // Fallback: add to body top-right
                const versionDisplay = document.createElement('div');
                versionDisplay.id = 'version-display';
                versionDisplay.textContent = this.version;
                versionDisplay.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 20px;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    background: rgba(139, 0, 0, 0.8);
                    padding: 6px 12px;
                    border-radius: 4px;
                    z-index: 10000;
                    font-family: monospace;
                    border: 1px solid rgba(255,255,255,0.3);
                `;
                
                document.body.appendChild(versionDisplay);
                console.log(`✅ Version ${this.version} displayed as overlay`);
            }
        }, 100);
    }

    loadDiceIcons() {
        this.diceIcons = {
            d4: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 22H21L12 2Z" fill="currentColor" opacity="0.8"/>
                <path d="M12 6L6 18H18L12 6Z" fill="currentColor" opacity="0.6"/>
                <text x="12" y="15" text-anchor="middle" font-size="6" fill="white" font-weight="bold">4</text>
            </svg>`,
            d6: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.8"/>
                <rect x="5" y="5" width="14" height="14" rx="1" fill="currentColor" opacity="0.6"/>
                <circle cx="8" cy="8" r="1.5" fill="white"/>
                <circle cx="16" cy="8" r="1.5" fill="white"/>
                <circle cx="8" cy="12" r="1.5" fill="white"/>
                <circle cx="16" cy="12" r="1.5" fill="white"/>
                <circle cx="8" cy="16" r="1.5" fill="white"/>
                <circle cx="16" cy="16" r="1.5" fill="white"/>
            </svg>`,
            d8: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="currentColor" opacity="0.8"/>
                <path d="M12 4L19 12L12 20L5 12L12 4Z" fill="currentColor" opacity="0.6"/>
                <text x="12" y="15" text-anchor="middle" font-size="6" fill="white" font-weight="bold">8</text>
            </svg>`,
            d10: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 8L16 22H8L4 8L12 2Z" fill="currentColor" opacity="0.8"/>
                <path d="M12 4L18 9L15 20H9L6 9L12 4Z" fill="currentColor" opacity="0.6"/>
                <text x="12" y="15" text-anchor="middle" font-size="5" fill="white" font-weight="bold">10</text>
            </svg>`,
            d12: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L18 6L22 12L18 18L12 22L6 18L2 12L6 6L12 2Z" fill="currentColor" opacity="0.8"/>
                <path d="M12 4L16 7L19 12L16 17L12 20L8 17L5 12L8 7L12 4Z" fill="currentColor" opacity="0.6"/>
                <text x="12" y="15" text-anchor="middle" font-size="5" fill="white" font-weight="bold">12</text>
            </svg>`,
            d20: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 7L22 15L12 22L2 15L4 7L12 2Z" fill="currentColor" opacity="0.8"/>
                <path d="M12 4L18 8L19 14L12 20L5 14L6 8L12 4Z" fill="currentColor" opacity="0.6"/>
                <text x="12" y="15" text-anchor="middle" font-size="5" fill="white" font-weight="bold">20</text>
            </svg>`
        };
    }

    getDiceIcon(dieType) {
        const cleanType = dieType.toString().toLowerCase().replace('d', '');
        return this.diceIcons[`d${cleanType}`] || this.diceIcons.d6;
    }

    clearElement(element) {
        try {
            if (element) {
                element.innerHTML = '';
            }
        } catch (error) {
            console.error('Error clearing element:', error);
        }
    }

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
            const fallback = document.createElement('div');
            fallback.textContent = textContent || 'Error creating element';
            return fallback;
        }
    }

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

    showNotification(message, type = 'info', duration = 3000) {
        try {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
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

            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 10);

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
            alert(message);
        }
    }

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

    setTextContent(element, text) {
        try {
            if (element) {
                element.textContent = text;
            }
        } catch (error) {
            console.error('Error setting text content:', error);
        }
    }

    showElement(element) {
        if (element) {
            element.style.display = '';
        }
    }

    hideElement(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    setEnabled(element, enabled) {
        if (element) {
            element.disabled = !enabled;
            if (enabled) {
                this.removeClass(element, 'disabled');
            } else {
                this.addClass(element, 'disabled');
            }
        }
    }

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

            // Enhanced event listeners with smart button state management
            incrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onIncrement) {
                    onIncrement();
                    // Update button states after action
                    setTimeout(() => this.updateAttributeButtonStates(), 50);
                }
            });

            decrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDecrement) {
                    onDecrement();
                    // Update button states after action
                    setTimeout(() => this.updateAttributeButtonStates(), 50);
                }
            });

            return {
                container: container,
                incrementBtn: incrementBtn,
                decrementBtn: decrementBtn,
                updateValue: function(newValue) {
                    valueDisplay.textContent = `d${newValue}`;
                    // Update button states when value changes
                    setTimeout(() => this.updateAttributeButtonStates(), 50);
                }.bind(this),
                setEnabled: function(enabled) {
                    // Keep the old method for compatibility, but don't use it for both buttons
                    // Individual button logic will override this
                }.bind(this)
            };
        } catch (error) {
            console.error('Error creating attribute control:', error);
            const fallback = document.createElement('div');
            fallback.textContent = `${attributeName}: Error`;
            return { container: fallback, updateValue: () => {}, setEnabled: () => {} };
        }
    }

    // Smart button state management - allows - button even at 0 points
    updateAttributeButtonStates() {
        try {
            // Get character data
            const character = window.characterCreator?.characterManager?.getCharacter();
            if (!character) return;

            // Get remaining points
            const availablePoints = window.characterCreator?.calculationsManager?.getAvailableAttributePoints?.(character);
            const remainingPoints = availablePoints?.remaining || 0;

            // Update each attribute control
            const attributeControls = document.querySelectorAll('.attribute-control');
            
            attributeControls.forEach(control => {
                const incrementBtn = control.querySelector('.btn-increment');
                const decrementBtn = control.querySelector('.btn-decrement');
                const valueDisplay = control.querySelector('.attribute-value');
                const label = control.querySelector('.attribute-label');
                
                if (incrementBtn && decrementBtn && valueDisplay && label) {
                    // Extract current value from display (d6 -> 6)
                    const currentValueText = valueDisplay.textContent.replace('d', '');
                    const currentValue = parseInt(currentValueText) || 4;
                    
                    // Smart increment logic: disabled if no points OR at maximum
                    const canIncrement = remainingPoints > 0 && currentValue < 12;
                    incrementBtn.disabled = !canIncrement;
                    incrementBtn.style.opacity = canIncrement ? '1' : '0.5';
                    incrementBtn.style.cursor = canIncrement ? 'pointer' : 'not-allowed';
                    
                    // Smart decrement logic: disabled ONLY if at minimum (regardless of points)
                    const canDecrement = currentValue > 4;
                    decrementBtn.disabled = !canDecrement;
                    decrementBtn.style.opacity = canDecrement ? '1' : '0.5'; 
                    decrementBtn.style.cursor = canDecrement ? 'pointer' : 'not-allowed';
                }
            });
            
            console.log('🎯 Updated button states - remaining points:', remainingPoints);
        } catch (error) {
            console.error('Error updating attribute button states:', error);
        }
    }

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

            incrementBtn.addEventListener('click', () => {
                if (onIncrement) onIncrement();
            });

            decrementBtn.addEventListener('click', () => {
                if (onDecrement) onDecrement();
            });

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

    formatSkillValue(value) {
        if (value === 0) {
            return 'd4-2';
        } else {
            return `d${value}`;
        }
    }

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

            checkbox.addEventListener('change', (e) => {
                if (onChange) {
                    onChange(e.target.checked);
                }
            });

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

    createSkillItem(skillName, linkedAttribute, value, onChange) {
        return this.createSkillControl(skillName, value, linkedAttribute, 
            () => onChange(skillName, 1), 
            () => onChange(skillName, -1), 
            false, false);
    }

    // Initialize smart button behavior for existing controls
    initializeSmartButtons() {
        // Set up periodic button state updates
        setInterval(() => {
            this.updateAttributeButtonStates();
        }, 1000);
        
        // Initial update
        this.updateAttributeButtonStates();
        
        console.log('🎯 Smart button system initialized');
    }
}
