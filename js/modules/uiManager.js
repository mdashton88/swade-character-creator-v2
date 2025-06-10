// SWADE Character Creator v2 - UIManager Module v1.0028
// Emergency fix: Patch existing controls instead of creating new ones

export class UIManager {
    constructor() {
        this.VERSION = "V1.0028";
        this.displayVersion();
        this.setupWhiteHeaderText();
        this.patchExistingAttributeControls();
        this.addClearButton();
        console.log(`🎯 UIManager ${this.VERSION} initialized - Existing controls patched!`);
    }

    displayVersion() {
        // Remove any existing version displays
        const existingVersions = document.querySelectorAll('[id*="version-display"]');
        existingVersions.forEach(el => el.remove());

        // Create version overlay (always visible)
        const versionOverlay = document.createElement('div');
        versionOverlay.id = 'version-display-overlay';
        versionOverlay.textContent = this.VERSION;
        versionOverlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #dc3545;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 18px;
            font-weight: bold;
            z-index: 9999;
            border: 2px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(versionOverlay);
        console.log(`✅ Version ${this.VERSION} overlay displayed`);
    }

    setupWhiteHeaderText() {
        // Target only the red header block for white text
        const headerCSS = `
            <style id="white-header-text">
            [style*="background-color: #a72c2c"] *:not(button):not(input):not(select) {
                color: white !important;
            }
            header[style*="background"] * {
                color: white !important;
            }
            .header-title, .header-subtitle {
                color: white !important;
            }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', headerCSS);
        console.log('✅ White header text CSS applied (red header only)');
    }

    patchExistingAttributeControls() {
        // Find all existing attribute controls and add missing methods
        console.log('🔍 Looking for existing attribute controls to patch...');
        
        // Try multiple selectors to find attribute controls
        const possibleSelectors = [
            '[data-attribute]',
            '.attribute-control',
            '[id*="attribute"]',
            '.dice-control',
            'div[data-attribute]'
        ];

        let foundControls = [];
        
        for (const selector of possibleSelectors) {
            const controls = document.querySelectorAll(selector);
            if (controls.length > 0) {
                foundControls = Array.from(controls);
                console.log(`✅ Found ${controls.length} controls with selector: ${selector}`);
                break;
            }
        }

        // If no controls found, try a delayed patch
        if (foundControls.length === 0) {
            console.log('⚠️ No controls found immediately, scheduling delayed patch...');
            setTimeout(() => this.patchExistingAttributeControls(), 1000);
            return;
        }

        // Patch each control with required methods
        foundControls.forEach((control, index) => {
            this.patchControl(control, index);
        });

        console.log(`🎯 Patched ${foundControls.length} existing attribute controls`);
    }

    patchControl(control, index) {
        // Add updateValue method if it doesn't exist
        if (!control.updateValue) {
            control.updateValue = (newValue) => {
                console.log(`🎯 UpdateValue called on control ${index}: ${newValue}`);
                
                // Try to find and update value display
                const valueSelectors = [
                    '.die-value',
                    '.attribute-value', 
                    '[data-value]',
                    'span:contains("d")',
                    'span'
                ];
                
                for (const selector of valueSelectors) {
                    const valueElement = control.querySelector(selector);
                    if (valueElement && valueElement.textContent.includes('d')) {
                        valueElement.textContent = `d${newValue}`;
                        console.log(`✅ Updated value display to d${newValue}`);
                        break;
                    }
                }
            };
        }

        // Add getValue method if it doesn't exist
        if (!control.getValue) {
            control.getValue = () => {
                const valueElement = control.querySelector('.die-value, .attribute-value, [data-value], span');
                if (valueElement) {
                    const match = valueElement.textContent.match(/d(\d+)/);
                    return match ? parseInt(match[1]) : 4;
                }
                return 4; // Default to d4
            };
        }

        // Add setEnabled method if it doesn't exist
        if (!control.setEnabled) {
            control.setEnabled = (enabled) => {
                const buttons = control.querySelectorAll('button');
                buttons.forEach(button => {
                    button.disabled = !enabled;
                    button.style.opacity = enabled ? '1' : '0.5';
                    button.style.cursor = enabled ? 'pointer' : 'not-allowed';
                });
            };
        }

        console.log(`🔧 Patched control ${index} with required methods`);
    }

    addClearButton() {
        // Find the Randomize button using proper CSS selectors
        let randomizeButton = null;
        
        // Method 1: Look for buttons with "Randomize" text
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
            if (button.textContent && button.textContent.includes('Randomize')) {
                randomizeButton = button;
                break;
            }
        }
        
        // Method 2: Look by ID or class if method 1 fails
        if (!randomizeButton) {
            randomizeButton = document.querySelector('#randomize-button, .randomize-button, button[id*="randomize"]');
        }

        if (randomizeButton) {
            const clearButton = this.createClearButton();
            randomizeButton.parentNode.insertBefore(clearButton, randomizeButton);
            console.log('✅ Clear button added successfully');
        } else {
            console.log('⚠️ Randomize button not found - Clear button not added');
            
            // Fallback: Try again after a short delay
            setTimeout(() => {
                this.addClearButton();
            }, 1000);
        }
    }

    createClearButton() {
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.innerHTML = '🗑️ Clear';
        clearButton.className = 'btn btn-secondary me-2'; // Bootstrap classes if available
        
        // Style to match Randomize button
        clearButton.style.cssText = `
            background-color: #6c757d;
            border: 1px solid #5c636a;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            margin-right: 8px;
        `;

        // Add hover effect
        clearButton.addEventListener('mouseenter', () => {
            clearButton.style.backgroundColor = '#5c636a';
        });
        
        clearButton.addEventListener('mouseleave', () => {
            clearButton.style.backgroundColor = '#6c757d';
        });

        // Add click functionality
        clearButton.addEventListener('click', () => {
            this.clearAllAttributes();
        });

        return clearButton;
    }

    clearAllAttributes() {
        try {
            // Method 1: Use character manager if available
            if (window.characterCreator && window.characterCreator.attributesManager) {
                const attributeNames = ['agility', 'smarts', 'spirit', 'strength', 'vigor'];
                attributeNames.forEach(attr => {
                    // Reset to d4 (minimum)
                    const character = window.characterCreator.characterManager.getCharacter();
                    if (character && character.attributes) {
                        character.attributes[attr] = 4; // d4 = 4
                    }
                });
                
                // Refresh the UI
                if (window.characterCreator.attributesManager.refreshDisplay) {
                    window.characterCreator.attributesManager.refreshDisplay();
                }
                
                this.showNotification('Attributes cleared!', 'success');
            } else {
                // Method 2: Direct UI manipulation fallback
                const attributeControls = document.querySelectorAll('[data-attribute]');
                attributeControls.forEach(control => {
                    const valueElement = control.querySelector('.die-value, .attribute-value');
                    if (valueElement) {
                        valueElement.textContent = 'd4';
                    }
                });
                
                this.showNotification('Attributes reset to d4', 'success');
            }
            
            console.log('🗑️ All attributes cleared');
        } catch (error) {
            console.error('Error clearing attributes:', error);
            this.showNotification('Error clearing attributes', 'error');
        }
    }

    createAttributeControl(attributeName, currentValue = 4, availablePoints = 5, onIncrement, onDecrement) {
        const container = document.createElement('div');
        container.className = 'attribute-control';
        container.dataset.attribute = attributeName;
        
        // Calculate dimensions for half-width
        container.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: calc(50% - 4px);
            min-height: 32px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 6px;
            margin: 2px;
            font-size: 13px;
        `;

        // Create dice icon (32px - 200% bigger)
        const diceIcon = this.createDiceIcon(currentValue);
        
        // Create attribute name (capitalized)
        const nameSpan = document.createElement('span');
        nameSpan.textContent = this.capitalizeFirst(attributeName);
        nameSpan.style.cssText = `
            font-weight: 500;
            margin-left: 8px;
            flex-grow: 1;
        `;

        // Create control section: - d6 +
        const controlsDiv = document.createElement('div');
        controlsDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
        `;

        // Minus button (60% width = 17px)
        const minusBtn = document.createElement('button');
        minusBtn.textContent = '-';
        minusBtn.style.cssText = `
            width: 17px;
            height: 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            font-weight: bold;
        `;

        // Die value display
        const valueSpan = document.createElement('span');
        valueSpan.className = 'die-value';
        valueSpan.textContent = `d${currentValue}`;
        valueSpan.style.cssText = `
            min-width: 20px;
            text-align: center;
            font-weight: bold;
        `;

        // Plus button (60% width = 17px)
        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.style.cssText = `
            width: 17px;
            height: 20px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            font-weight: bold;
        `;

        // Add event listeners
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🎯 Decrement clicked for: ${attributeName}`);
            if (onDecrement) onDecrement(attributeName);
        });

        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🎯 Increment clicked for: ${attributeName}`);
            if (onIncrement) onIncrement(attributeName);
        });

        // Assemble the control
        controlsDiv.appendChild(minusBtn);
        controlsDiv.appendChild(valueSpan);
        controlsDiv.appendChild(plusBtn);

        container.appendChild(diceIcon);
        container.appendChild(nameSpan);
        container.appendChild(controlsDiv);

        // Add required updateValue method that AttributesManager expects
        container.updateValue = (newValue) => {
            valueSpan.textContent = `d${newValue}`;
            // Update dice icon
            const newDiceIcon = this.createDiceIcon(newValue);
            container.replaceChild(newDiceIcon, diceIcon);
            console.log(`🎯 Updated ${attributeName} to d${newValue}`);
        };

        // Add other methods AttributesManager might expect
        container.getValue = () => {
            const match = valueSpan.textContent.match(/d(\d+)/);
            return match ? parseInt(match[1]) : 4;
        };

        container.setEnabled = (enabled) => {
            minusBtn.disabled = !enabled;
            plusBtn.disabled = !enabled;
            minusBtn.style.opacity = enabled ? '1' : '0.5';
            plusBtn.style.opacity = enabled ? '1' : '0.5';
        };

        return container;
    }

    createDiceIcon(dieValue) {
        const diceTypes = {
            4: 'd4', 6: 'd6', 8: 'd8', 
            10: 'd10', 12: 'd12', 20: 'd20'
        };
        
        const diceType = diceTypes[dieValue] || 'd6';
        
        // Create SVG dice icon (32px size)
        const diceContainer = document.createElement('div');
        diceContainer.style.cssText = `
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(45deg, #fff 0%, #f0f0f0 100%);
            border: 1px solid #ccc;
            border-radius: 6px;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            font-size: 10px;
            font-weight: bold;
            color: #333;
        `;
        
        diceContainer.textContent = diceType;
        return diceContainer;
    }

    createAttributePointsDisplay(totalPoints, standardPoints, hindrancePoints, spentPoints) {
        const container = document.createElement('div');
        container.className = 'attribute-points-display';
        container.style.cssText = `
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 12px;
            font-size: 14px;
        `;

        // Create first line
        const firstLine = document.createElement('div');
        if (hindrancePoints > 0) {
            firstLine.textContent = `You have ${totalPoints} Attribute points (${standardPoints} standard plus ${hindrancePoints} from Hindrances).`;
        } else {
            firstLine.textContent = `You have ${totalPoints} Attribute points.`;
        }

        // Create second line
        const secondLine = document.createElement('div');
        secondLine.textContent = `Spent: ${spentPoints} points`;
        secondLine.style.marginTop = '4px';

        container.appendChild(firstLine);
        container.appendChild(secondLine);

        // Add update method
        container.updateDisplay = (newTotal, newStandard, newHindrance, newSpent) => {
            if (newHindrance > 0) {
                firstLine.textContent = `You have ${newTotal} Attribute points (${newStandard} standard plus ${newHindrance} from Hindrances).`;
            } else {
                firstLine.textContent = `You have ${newTotal} Attribute points.`;
            }
            secondLine.textContent = `Spent: ${newSpent} points`;
        };

        return container;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
        `;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // All the other methods remain the same...
    createElement(tagName, className = '', textContent = '') {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    createSelect(options, selectedValue = '', className = '') {
        const select = document.createElement('select');
        if (className) select.className = className;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value || option;
            optionElement.textContent = option.text || option;
            if (optionElement.value === selectedValue) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });
        
        return select;
    }

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

    clearElement(element) {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
        console.log('🎯 clearElement called on:', element);
    }

    setTextContent(element, text) {
        if (element) {
            element.textContent = text;
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
            element.style.opacity = enabled ? '1' : '0.5';
            element.style.cursor = enabled ? 'pointer' : 'not-allowed';
        }
    }
}
