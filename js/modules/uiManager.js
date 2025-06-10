// SWADE Character Creator v2 - UI Manager Module
// VERSION 9 - Enhanced with Dice Icons & Dual Info Systems

export class UIManager {
    constructor() {
        console.log('🎯 UIManager v9 initialized - Enhanced with dice icons & dual info!');
        this.notificationContainer = null;
        this.initializeNotifications();
        this.loadDiceIcons();
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

    // Load high-quality dice icons from Iconduck (Material Design)
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

    // Get dice icon HTML for a specific die type
    getDiceIcon(dieType) {
        const cleanType = dieType.toString().toLowerCase().replace('d', '');
        return this.diceIcons[`d${cleanType}`] || this.diceIcons.d6;
    }

    // ===== CRITICAL METHOD THAT WAS MISSING =====
    clearElement(element) {
        console.log('🎯 clearElement called on:', element);
        try {
            if (element) {
                element.innerHTML = '';
                console.log('✅ Element cleared successfully');
            } else {
                console.warn('⚠️ clearElement called with null/undefined element');
            }
        } catch (error) {
            console.error('❌ Error clearing element:', error);
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
            alert(message);
        }
    }

    // Utility methods for DOM manipulation
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

    // Enhanced create attribute control with dice icons and dual info systems
    createAttributeControl(attributeName, currentValue, onIncrement, onDecrement) {
        console.log('🎯 Enhanced createAttributeControl called for:', attributeName);
        try {
            const container = document.createElement('div');
            container.className = 'attribute-control enhanced';

            // Enhanced styling with dice icon and better layout
            container.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                margin: 8px 0;
                background: linear-gradient(145deg, #f8f9fa, #e9ecef);
                border: 1px solid #dee2e6;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.2s ease;
                position: relative;
            `;

            // Add hover effect
            container.addEventListener('mouseenter', () => {
                container.style.transform = 'translateY(-1px)';
                container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            });

            container.addEventListener('mouseleave', () => {
                container.style.transform = 'translateY(0)';
                container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            });

            // Left side: Dice icon + Attribute name
            const leftSide = document.createElement('div');
            leftSide.style.cssText = 'display: flex; align-items: center; flex: 1; justify-content: flex-start;';

            // Dice icon with 3D effect
            const diceIcon = document.createElement('div');
            diceIcon.innerHTML = this.getDiceIcon(currentValue);
            diceIcon.style.cssText = `
                margin-right: 12px;
                color: #6c757d;
                filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
                transition: all 0.2s ease;
            `;

            // Enhanced attribute label
            const label = document.createElement('span');
            label.className = 'attribute-label';
            label.textContent = this.capitalizeFirstLetter(attributeName);
            label.style.cssText = `
                font-weight: 600;
                font-size: 14px;
                color: #343a40;
                text-align: left;
            `;

            leftSide.appendChild(diceIcon);
            leftSide.appendChild(label);

            // Center: Enhanced value display with dice
            const valueContainer = document.createElement('div');
            valueContainer.style.cssText = 'display: flex; align-items: center; flex: 0 0 auto;';

            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'attribute-value';
            valueDisplay.textContent = `d${currentValue}`;
            valueDisplay.style.cssText = `
                font-weight: bold;
                font-size: 16px;
                color: #495057;
                min-width: 40px;
                text-align: center;
                background: rgba(255,255,255,0.8);
                padding: 4px 8px;
                border-radius: 4px;
                margin: 0 8px;
            `;

            valueContainer.appendChild(valueDisplay);

            // Right side: Enhanced +/- buttons (50% wider as requested)
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'attribute-controls';
            controlsDiv.style.cssText = 'display: flex; gap: 4px; flex: 0 0 auto;';

            const decrementBtn = document.createElement('button');
            decrementBtn.className = 'btn btn-small btn-decrement';
            decrementBtn.textContent = '−';
            decrementBtn.type = 'button';
            decrementBtn.style.cssText = `
                width: 36px;
                height: 28px;
                background: linear-gradient(145deg, #dc3545, #c82333);
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(220,53,69,0.3);
            `;

            const incrementBtn = document.createElement('button');
            incrementBtn.className = 'btn btn-small btn-increment';
            incrementBtn.textContent = '+';
            incrementBtn.type = 'button';
            incrementBtn.style.cssText = `
                width: 36px;
                height: 28px;
                background: linear-gradient(145deg, #28a745, #218838);
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(40,167,69,0.3);
            `;

            // Button hover effects
            [decrementBtn, incrementBtn].forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-1px)';
                    btn.style.boxShadow = btn === decrementBtn ? 
                        '0 4px 8px rgba(220,53,69,0.4)' : 
                        '0 4px 8px rgba(40,167,69,0.4)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = btn === decrementBtn ? 
                        '0 2px 4px rgba(220,53,69,0.3)' : 
                        '0 2px 4px rgba(40,167,69,0.3)';
                });
            });

            controlsDiv.appendChild(decrementBtn);
            controlsDiv.appendChild(incrementBtn);

            // Assemble the container
            container.appendChild(leftSide);
            container.appendChild(valueContainer);
            container.appendChild(controlsDiv);

            // Add event listeners
            incrementBtn.addEventListener('click', () => {
                if (onIncrement) onIncrement();
            });

            decrementBtn.addEventListener('click', () => {
                if (onDecrement) onDecrement();
            });

            // Enhanced info systems - both small text and identical tooltip
            this.addDualInfoSystems(container, attributeName, currentValue);

            // Return object with enhanced methods
            return {
                container: container,
                incrementBtn: incrementBtn,
                decrementBtn: decrementBtn,
                diceIcon: diceIcon,
                updateValue: function(newValue) {
                    valueDisplay.textContent = `d${newValue}`;
                    // Update dice icon
                    diceIcon.innerHTML = this.getDiceIcon(newValue);
                    // Update info systems with new calculations
                    this.updateDualInfoSystems(container, attributeName, newValue);
                }.bind(this),
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
            console.error('Error creating enhanced attribute control:', error);
            const fallback = document.createElement('div');
            fallback.textContent = `${attributeName}: Error`;
            return { container: fallback, updateValue: () => {}, setEnabled: () => {} };
        }
    }

    // Add dual info systems (small text + identical tooltip)
    addDualInfoSystems(container, attributeName, value) {
        const infoText = this.getAttributeInfoText(attributeName, value);
        
        // Always-visible small text
        const smallInfo = document.createElement('div');
        smallInfo.className = 'attribute-info-small';
        smallInfo.textContent = infoText;
        smallInfo.style.cssText = `
            position: absolute;
            bottom: -18px;
            left: 0;
            font-size: 11px;
            color: #6c757d;
            font-style: italic;
        `;

        // Identical hover tooltip
        container.title = infoText; // Simple tooltip
        
        container.appendChild(smallInfo);
        container.setAttribute('data-info-text', infoText);
    }

    // Update both info systems when value changes
    updateDualInfoSystems(container, attributeName, newValue) {
        const newInfoText = this.getAttributeInfoText(attributeName, newValue);
        
        // Update small text
        const smallInfo = container.querySelector('.attribute-info-small');
        if (smallInfo) {
            smallInfo.textContent = newInfoText;
        }
        
        // Update tooltip
        container.title = newInfoText;
        container.setAttribute('data-info-text', newInfoText);
    }

    // Generate info text for attributes (used by both systems)
    getAttributeInfoText(attributeName, value) {
        const name = attributeName.toLowerCase();
        
        // Mock calculations - replace with real calculation manager calls
        switch (name) {
            case 'agility':
                const pace = Math.max(6, value - 2);
                return `Pace: ${pace} (from Agility d${value})`;
            case 'vigor':
                const toughness = Math.floor(value / 2) + 2;
                return `Toughness: ${toughness} (Vigor d${value}/2 + 2)`;
            case 'spirit':
                return `Mental resistance d${value}, Healing rolls`;
            case 'strength':
                const carry = value * 5;
                return `Carry: ${carry} lbs, Melee damage`;
            case 'smarts':
                return `Skill points, Knowledge, Notice`;
            default:
                return `d${value} die for ${this.capitalizeFirstLetter(name)} checks`;
        }
    }

    // Utility to capitalize first letter
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Create skill control - Returns object with methods (keeping existing functionality)
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
