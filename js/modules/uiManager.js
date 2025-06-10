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

    // Enhanced create attribute control - compact vertical layout, no hover movement, no info text
    createAttributeControl(attributeName, currentValue, onIncrement, onDecrement) {
        console.log('🎯 Enhanced createAttributeControl called for:', attributeName);
        try {
            const container = document.createElement('div');
            container.className = 'attribute-control enhanced';

            // Compact vertical styling - no hover movement
            container.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                margin: 4px 0;
                background: linear-gradient(145deg, #f8f9fa, #e9ecef);
                border: 1px solid #dee2e6;
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                min-height: 40px;
            `;

            // Left side: Dice icon + Attribute name
            const leftSide = document.createElement('div');
            leftSide.style.cssText = 'display: flex; align-items: center; flex: 1; justify-content: flex-start;';

            // Dice icon with 3D effect (smaller for compact layout)
            const diceIcon = document.createElement('div');
            diceIcon.innerHTML = this.getDiceIcon(currentValue);
            diceIcon.style.cssText = `
                margin-right: 10px;
                color: #6c757d;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.2));
                transform: scale(0.9);
            `;

            // Compact attribute label
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

            // Center: Compact value display
            const valueContainer = document.createElement('div');
            valueContainer.style.cssText = 'display: flex; align-items: center; flex: 0 0 auto;';

            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'attribute-value';
            valueDisplay.textContent = `d${currentValue}`;
            valueDisplay.style.cssText = `
                font-weight: bold;
                font-size: 14px;
                color: #495057;
                min-width: 35px;
                text-align: center;
                background: rgba(255,255,255,0.8);
                padding: 3px 6px;
                border-radius: 3px;
                margin: 0 6px;
            `;

            valueContainer.appendChild(valueDisplay);

            // Right side: Compact +/- buttons (50% wider, no hover movement)
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'attribute-controls';
            controlsDiv.style.cssText = 'display: flex; gap: 3px; flex: 0 0 auto;';

            const decrementBtn = document.createElement('button');
            decrementBtn.className = 'btn btn-small btn-decrement';
            decrementBtn.textContent = '−';
            decrementBtn.type = 'button';
            decrementBtn.style.cssText = `
                width: 32px;
                height: 24px;
                background: linear-gradient(145deg, #dc3545, #c82333);
                color: white;
                border: none;
                border-radius: 3px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s ease;
                box-shadow: 0 1px 2px rgba(220,53,69,0.3);
            `;

            const incrementBtn = document.createElement('button');
            incrementBtn.className = 'btn btn-small btn-increment';
            incrementBtn.textContent = '+';
            incrementBtn.type = 'button';
            incrementBtn.style.cssText = `
                width: 32px;
                height: 24px;
                background: linear-gradient(145deg, #28a745, #218838);
                color: white;
                border: none;
                border-radius: 3px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s ease;
                box-shadow: 0 1px 2px rgba(40,167,69,0.3);
            `;

            // Button hover effects (no movement, just color change)
            decrementBtn.addEventListener('mouseenter', () => {
                decrementBtn.style.background = 'linear-gradient(145deg, #c82333, #bd2130)';
            });
            decrementBtn.addEventListener('mouseleave', () => {
                decrementBtn.style.background = 'linear-gradient(145deg, #dc3545, #c82333)';
            });

            incrementBtn.addEventListener('mouseenter', () => {
                incrementBtn.style.background = 'linear-gradient(145deg, #218838, #1e7e34)';
            });
            incrementBtn.addEventListener('mouseleave', () => {
                incrementBtn.style.background = 'linear-gradient(145deg, #28a745, #218838)';
            });

            controlsDiv.appendChild(decrementBtn);
            controlsDiv.appendChild(incrementBtn);

            // Assemble the container
            container.appendChild(leftSide);
            container.appendChild(valueContainer);
            container.appendChild(controlsDiv);

            // Add event listeners with proper binding
            incrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Increment clicked for:', attributeName);
                if (onIncrement) {
                    onIncrement();
                }
            });

            decrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Decrement clicked for:', attributeName);
                if (onDecrement) {
                    onDecrement();
                }
            });

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

    // Create simple attribute points display (2 lines, no extra text)
    createAttributePointsDisplay(totalPoints, standardPoints, hindrancePoints, spentPoints) {
        try {
            const container = document.createElement('div');
            container.className = 'attribute-points-display';
            container.style.cssText = `
                background: linear-gradient(145deg, #e3f2fd, #f8f9fa);
                border: 1px solid #90caf9;
                border-radius: 6px;
                padding: 12px;
                margin: 8px 0;
                font-size: 14px;
                line-height: 1.4;
            `;

            // Line 1: Simple available points
            const availableLine = document.createElement('div');
            availableLine.style.cssText = 'font-weight: 600; color: #1976d2; margin-bottom: 4px;';
            availableLine.textContent = `You have ${totalPoints} Attribute points.`;

            // Line 2: Spent points
            const spentLine = document.createElement('div');
            spentLine.style.cssText = 'color: #555; font-weight: 500;';
            spentLine.textContent = `Spent: ${spentPoints} points`;

            container.appendChild(availableLine);
            container.appendChild(spentLine);

            return {
                container: container,
                availableLine: availableLine,
                spentLine: spentLine,
                updateDisplay: function(newTotalPoints, newStandardPoints, newHindrancePoints, newSpentPoints) {
                    // Update available points line (simple)
                    availableLine.textContent = `You have ${newTotalPoints} Attribute points.`;
                    
                    // Update spent points line
                    spentLine.textContent = `Spent: ${newSpentPoints} points`;
                    
                    // Color coding based on remaining points
                    const remaining = newTotalPoints - newSpentPoints;
                    if (remaining < 0) {
                        container.style.borderColor = '#f44336';
                        container.style.background = 'linear-gradient(145deg, #ffebee, #f8f9fa)';
                        availableLine.style.color = '#d32f2f';
                    } else if (remaining === 0) {
                        container.style.borderColor = '#ff9800';
                        container.style.background = 'linear-gradient(145deg, #fff3e0, #f8f9fa)';
                        availableLine.style.color = '#f57c00';
                    } else {
                        container.style.borderColor = '#90caf9';
                        container.style.background = 'linear-gradient(145deg, #e3f2fd, #f8f9fa)';
                        availableLine.style.color = '#1976d2';
                    }
                }
            };
        } catch (error) {
            console.error('Error creating attribute points display:', error);
            const fallback = document.createElement('div');
            fallback.textContent = 'Error creating points display';
            return { container: fallback, updateDisplay: () => {} };
        }
    }

    // Create enhanced skill points display (similar pattern for skills)
    createSkillPointsDisplay(totalPoints, standardPoints, attributeBonus, hindranceBonus, spentPoints) {
        try {
            const container = document.createElement('div');
            container.className = 'skill-points-display';
            container.style.cssText = `
                background: linear-gradient(145deg, #e8f5e8, #f8f9fa);
                border: 1px solid #81c784;
                border-radius: 6px;
                padding: 12px;
                margin: 8px 0;
                font-size: 14px;
                line-height: 1.4;
            `;

            // Line 1: Available points with conditional bonuses
            const availableLine = document.createElement('div');
            availableLine.style.cssText = 'font-weight: 600; color: #388e3c; margin-bottom: 4px;';
            
            let availableText = `You have ${totalPoints} Skill points`;
            
            // Build breakdown if there are bonus points
            const bonuses = [];
            if (attributeBonus > 0) bonuses.push(`${attributeBonus} from Smarts`);
            if (hindranceBonus > 0) bonuses.push(`${hindranceBonus} from Hindrances`);
            
            if (bonuses.length > 0) {
                availableText += ` (${standardPoints} standard plus ${bonuses.join(', ')})`;
            }
            
            availableLine.textContent = availableText;

            // Line 2: Spent points
            const spentLine = document.createElement('div');
            spentLine.style.cssText = 'color: #555; font-weight: 500;';
            spentLine.textContent = `Spent: ${spentPoints} points`;

            container.appendChild(availableLine);
            container.appendChild(spentLine);

            return {
                container: container,
                availableLine: availableLine,
                spentLine: spentLine,
                updateDisplay: function(newTotalPoints, newStandardPoints, newAttributeBonus, newHindranceBonus, newSpentPoints) {
                    // Update available points line
                    let updatedText = `You have ${newTotalPoints} Skill points`;
                    
                    const newBonuses = [];
                    if (newAttributeBonus > 0) newBonuses.push(`${newAttributeBonus} from Smarts`);
                    if (newHindranceBonus > 0) newBonuses.push(`${newHindranceBonus} from Hindrances`);
                    
                    if (newBonuses.length > 0) {
                        updatedText += ` (${newStandardPoints} standard plus ${newBonuses.join(', ')})`;
                    }
                    
                    availableLine.textContent = updatedText;
                    spentLine.textContent = `Spent: ${newSpentPoints} points`;
                    
                    // Color coding
                    const remaining = newTotalPoints - newSpentPoints;
                    if (remaining < 0) {
                        container.style.borderColor = '#f44336';
                        container.style.background = 'linear-gradient(145deg, #ffebee, #f8f9fa)';
                        availableLine.style.color = '#d32f2f';
                    } else if (remaining === 0) {
                        container.style.borderColor = '#ff9800';
                        container.style.background = 'linear-gradient(145deg, #fff3e0, #f8f9fa)';
                        availableLine.style.color = '#f57c00';
                    } else {
                        container.style.borderColor = '#81c784';
                        container.style.background = 'linear-gradient(145deg, #e8f5e8, #f8f9fa)';
                        availableLine.style.color = '#388e3c';
                    }
                }
            };
        } catch (error) {
            console.error('Error creating skill points display:', error);
            const fallback = document.createElement('div');
            fallback.textContent = 'Error creating skill points display';
            return { container: fallback, updateDisplay: () => {} };
        }
    }
}
