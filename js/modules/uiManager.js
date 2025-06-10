// SWADE Character Creator v2 - UIManager Module v1.0045
// Final version - Complete DOM utilities + robust data handling + setSelected method + setAvailable method

export class UIManager {
    constructor() {
        this.VERSION = "V1.0045";
        this.displayVersion();
        this.setupWhiteHeaderText();
        this.patchExistingControls();
        console.log(`✅ UIManager ${this.VERSION} initialized - Added setAvailable method for hindrances!`);
    }

    displayVersion() {
        const versionOverlay = document.createElement('div');
        versionOverlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(139, 0, 0, 0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-family: 'Crimson Text', serif;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            border: 1px solid #FFD700;
        `;
        versionOverlay.textContent = `${this.VERSION}`;
        document.body.appendChild(versionOverlay);
        console.log(`✅ Version ${this.VERSION} overlay displayed`);
    }

    setupWhiteHeaderText() {
        const style = document.createElement('style');
        style.textContent = `
            .header h1 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            }
        `;
        document.head.appendChild(style);
        console.log('✅ White header text CSS applied (red header only)');
    }

    patchExistingControls() {
        console.log('🔍 Looking for existing attribute controls to patch...');
        
        // Try multiple selectors to find existing controls
        const selectors = [
            '.attribute-control',
            '[data-attribute]',
            '.control-group',
            '#attributes-controls .control',
            '.dice-control'
        ];
        
        let foundControls = 0;
        
        selectors.forEach(selector => {
            const controls = document.querySelectorAll(selector);
            controls.forEach((control, index) => {
                if (control && !control.updateValue) {
                    this.addMethodsToControl(control, `Control ${foundControls}`);
                    foundControls++;
                }
            });
        });

        if (foundControls === 0) {
            console.log('⚠️ No existing controls found - AttributesManager will create them');
        } else {
            console.log(`✅ Patched ${foundControls} existing controls`);
        }
    }

    addMethodsToControl(control, debugName) {
        try {
            control.updateValue = function(newValue) {
                console.log(`🔧 ${debugName} updateValue called with: ${newValue}`);
                const valueDisplay = this.querySelector('.value, .die-value, [class*="value"]');
                if (valueDisplay) {
                    valueDisplay.textContent = newValue;
                }
            };

            control.getValue = function() {
                const valueDisplay = this.querySelector('.value, .die-value, [class*="value"]');
                return valueDisplay ? parseInt(valueDisplay.textContent.replace(/\D/g, '')) || 4 : 4;
            };

            control.setEnabled = function(incrementEnabled, decrementEnabled) {
                const buttons = this.querySelectorAll('button');
                if (buttons.length >= 2) {
                    buttons[0].disabled = !decrementEnabled;
                    buttons[1].disabled = !incrementEnabled;
                }
            };

            console.log(`🔧 Patched ${debugName} with required methods`);
        } catch (error) {
            console.error(`❌ Error patching ${debugName}:`, error);
        }
    }

    createAttributeControl(attributeName, linkedAttribute) {
        console.log(`🎯 Creating attribute control for: ${attributeName}`);
        
        try {
            const container = document.createElement('div');
            container.className = 'attribute-control';
            container.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 10px 0;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                background: white;
            `;

            const label = document.createElement('span');
            label.textContent = attributeName;
            label.style.cssText = `
                font-weight: bold;
                min-width: 80px;
            `;

            const controlsGroup = document.createElement('div');
            controlsGroup.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
            `;

            const minusBtn = document.createElement('button');
            minusBtn.textContent = '−';
            minusBtn.style.cssText = `
                width: 30px;
                height: 30px;
                border: 1px solid #8B0000;
                background: #8B0000;
                color: white;
                border-radius: 3px;
                cursor: pointer;
            `;

            const valueDisplay = document.createElement('span');
            valueDisplay.textContent = 'd4';
            valueDisplay.className = 'die-value';
            valueDisplay.style.cssText = `
                min-width: 30px;
                text-align: center;
                font-weight: bold;
            `;

            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';
            plusBtn.style.cssText = `
                width: 30px;
                height: 30px;
                border: 1px solid #8B0000;
                background: #8B0000;
                color: white;
                border-radius: 3px;
                cursor: pointer;
            `;

            controlsGroup.appendChild(minusBtn);
            controlsGroup.appendChild(valueDisplay);
            controlsGroup.appendChild(plusBtn);

            container.appendChild(label);
            container.appendChild(controlsGroup);

            // Create the control object with all required properties and methods
            const controlObj = {
                container: container,
                incrementBtn: plusBtn,
                decrementBtn: minusBtn,
                title: '',
                
                updateValue: function(newValue) {
                    console.log(`🔧 ${attributeName} updateValue: ${newValue}`);
                    if (typeof newValue === 'number') {
                        valueDisplay.textContent = `d${newValue}`;
                    } else {
                        valueDisplay.textContent = newValue;
                    }
                },
                
                getValue: function() {
                    const text = valueDisplay.textContent;
                    const match = text.match(/d(\d+)/);
                    return match ? parseInt(match[1]) : 4;
                },
                
                setEnabled: function(incrementEnabled, decrementEnabled) {
                    if (arguments.length === 2) {
                        plusBtn.disabled = !incrementEnabled;
                        minusBtn.disabled = !decrementEnabled;
                    } else {
                        const enabled = incrementEnabled;
                        plusBtn.disabled = !enabled;
                        minusBtn.disabled = !enabled;
                    }
                }
            };

            // Add direct property access using Object.defineProperty
            Object.defineProperty(controlObj, 'title', {
                get: function() { return this._title || ''; },
                set: function(value) { 
                    this._title = value;
                    container.title = value;
                },
                enumerable: true,
                configurable: true
            });

            console.log(`✅ Successfully created attribute control for: ${attributeName}`, controlObj);
            return controlObj;

        } catch (error) {
            console.error(`❌ Error creating attribute control for ${attributeName}:`, error);
            
            // Return a fallback object
            return {
                container: document.createElement('div'),
                incrementBtn: document.createElement('button'),
                decrementBtn: document.createElement('button'),
                title: '',
                updateValue: function() { console.log('Fallback updateValue'); },
                getValue: function() { return 4; },
                setEnabled: function() { console.log('Fallback setEnabled'); }
            };
        }
    }

    createSkillControl(skillName, linkedAttribute) {
        console.log(`🎯 Creating skill control for: ${skillName}`);
        
        try {
            const container = document.createElement('div');
            container.className = 'skill-control';
            container.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 5px 0;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 3px;
                background: white;
            `;

            const label = document.createElement('span');
            label.textContent = `${skillName} (${linkedAttribute})`;
            label.style.cssText = `
                font-size: 14px;
                min-width: 120px;
            `;

            const controlsGroup = document.createElement('div');
            controlsGroup.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
            `;

            const minusBtn = document.createElement('button');
            minusBtn.textContent = '−';
            minusBtn.style.cssText = `
                width: 25px;
                height: 25px;
                border: 1px solid #666;
                background: #666;
                color: white;
                border-radius: 2px;
                cursor: pointer;
                font-size: 12px;
            `;

            const valueDisplay = document.createElement('span');
            valueDisplay.textContent = '—';
            valueDisplay.className = 'skill-value';
            valueDisplay.style.cssText = `
                min-width: 25px;
                text-align: center;
                font-size: 12px;
            `;

            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';
            plusBtn.style.cssText = `
                width: 25px;
                height: 25px;
                border: 1px solid #666;
                background: #666;
                color: white;
                border-radius: 2px;
                cursor: pointer;
                font-size: 12px;
            `;

            controlsGroup.appendChild(minusBtn);
            controlsGroup.appendChild(valueDisplay);
            controlsGroup.appendChild(plusBtn);

            container.appendChild(label);
            container.appendChild(controlsGroup);

            // Create the skill control object
            const controlObj = {
                container: container,
                incrementBtn: plusBtn,
                decrementBtn: minusBtn,
                title: '',
                
                updateValue: function(newValue) {
                    console.log(`🔧 ${skillName} updateValue: ${newValue}`);
                    if (newValue === 0) {
                        valueDisplay.textContent = '—';
                    } else {
                        valueDisplay.textContent = `d${newValue}`;
                    }
                },
                
                getValue: function() {
                    const text = valueDisplay.textContent;
                    if (text === '—') return 0;
                    const match = text.match(/d(\d+)/);
                    return match ? parseInt(match[1]) : 0;
                },
                
                setEnabled: function(incrementEnabled, decrementEnabled) {
                    if (arguments.length === 2) {
                        plusBtn.disabled = !incrementEnabled;
                        minusBtn.disabled = !decrementEnabled;
                    } else {
                        const enabled = incrementEnabled;
                        plusBtn.disabled = !enabled;
                        minusBtn.disabled = !enabled;
                    }
                },
                
                setExpensive: function(isExpensive) {
                    console.log(`🔧 ${skillName} setExpensive: ${isExpensive}`);
                    if (isExpensive) {
                        container.style.backgroundColor = '#fffacd'; // Light yellow
                    } else {
                        container.style.backgroundColor = 'white';
                    }
                },
                
                setTitle: function(title) {
                    console.log(`🔧 ${skillName} setTitle: ${title}`);
                    this.title = title;
                    container.title = title;
                }
            };

            // Add direct title property
            Object.defineProperty(controlObj, 'title', {
                get: function() { return this._title || ''; },
                set: function(value) { 
                    this._title = value;
                    container.title = value;
                },
                enumerable: true,
                configurable: true
            });

            console.log(`✅ Successfully created skill control for: ${skillName}`, controlObj);
            return controlObj;

        } catch (error) {
            console.error(`❌ Error creating skill control for ${skillName}:`, error);
            
            // Return a fallback object
            return {
                container: document.createElement('div'),
                incrementBtn: document.createElement('button'),
                decrementBtn: document.createElement('button'),
                title: '',
                updateValue: function() { console.log('Fallback updateValue'); },
                getValue: function() { return 0; },
                setEnabled: function() { console.log('Fallback setEnabled'); },
                setExpensive: function() { console.log('Fallback setExpensive'); },
                setTitle: function() { console.log('Fallback setTitle'); }
            };
        }
    }

    /**
     * Creates a select dropdown element with options - THE MISSING METHOD!
     * @param {string} id - The ID for the select element
     * @param {Array} options - Array of option objects with {value, text} properties
     * @param {string} defaultValue - Default selected value (optional)
     * @param {string} className - CSS class to apply (optional)
     * @returns {HTMLSelectElement} The created select element
     */
    createSelect(id, options = [], defaultValue = '', className = '') {
        console.log(`🔧 createSelect called: ${id}`);
        
        try {
            // Create the select element
            const select = document.createElement('select');
            select.id = id;
            
            if (className) {
                select.className = className;
            }
            
            // Add default styling to match your UI theme
            select.style.cssText = `
                padding: 5px 8px;
                margin: 5px;
                border: 1px solid #8B0000;
                border-radius: 3px;
                background: white;
                color: #333;
                font-family: 'Crimson Text', serif;
                font-size: 14px;
                cursor: pointer;
            `;
            
            // Add options
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text || option.label || option.value;
                
                if (option.value === defaultValue) {
                    optionElement.selected = true;
                }
                
                select.appendChild(optionElement);
            });
            
            console.log(`✅ Successfully created select element: ${id} with ${options.length} options`);
            return select;
            
        } catch (error) {
            console.error(`❌ Error creating select ${id}:`, error);
            
            // Return a fallback empty select
            const fallbackSelect = document.createElement('select');
            fallbackSelect.id = id;
            return fallbackSelect;
        }
    }

    clearElement(element) {
        console.log('🔧 clearElement called');
        
        if (!element) {
            console.warn('⚠️ No element provided to clear');
            return;
        }

        // Clear all child elements
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        
        console.log(`✅ Cleared element: ${element.tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className : ''}`);
    }

    addClass(element, className) {
        console.log(`🔧 addClass called: ${className}`);
        
        if (!element) {
            console.warn('⚠️ No element provided to addClass');
            return;
        }

        if (element.classList) {
            element.classList.add(className);
        } else {
            // Fallback for older browsers
            if (!element.className.includes(className)) {
                element.className += ` ${className}`;
            }
        }
        
        console.log(`✅ Added class "${className}" to element`);
    }

    removeClass(element, className) {
        console.log(`🔧 removeClass called: ${className}`);
        
        if (!element) {
            console.warn('⚠️ No element provided to removeClass');
            return;
        }

        if (element.classList) {
            element.classList.remove(className);
        } else {
            // Fallback for older browsers
            element.className = element.className.replace(new RegExp(`\\b${className}\\b`, 'g'), '').trim();
        }
        
        console.log(`✅ Removed class "${className}" from element`);
    }

    hasClass(element, className) {
        if (!element) {
            console.warn('⚠️ No element provided to hasClass');
            return false;
        }

        if (element.classList) {
            return element.classList.contains(className);
        } else {
            // Fallback for older browsers
            return element.className.includes(className);
        }
    }

    createCheckboxItem(item, type = 'hindrance') {
        console.log(`🔧 createCheckboxItem called: ${item.name || 'undefined'} (${item.description || item.effect || 'no description'})`);
        
        try {
            // Handle different data structures - some items might not have a 'name' property
            const itemName = item.name || item.title || item.id || `${type}-item-${Math.random().toString(36).substr(2, 9)}`;
            const itemDescription = item.description || item.effect || item.text || 'No description available';
            
            const container = this.createElement('div', {
                className: `${type}-item`,
                style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    margin: '8px 0',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                }
            });

            const checkbox = this.createElement('input', {
                attributes: {
                    type: 'checkbox',
                    id: `${type}-${itemName.toString().replace(/\s+/g, '-').toLowerCase()}`,
                    name: type,
                    value: itemName
                },
                style: {
                    marginRight: '10px',
                    marginTop: '2px'
                }
            });

            const labelContainer = this.createElement('div', {
                style: {
                    flex: '1'
                }
            });

            const label = this.createElement('label', {
                attributes: {
                    for: checkbox.id
                },
                style: {
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginRight: '10px'
                }
            });

            // Set label text based on item structure
            if (item.type) {
                label.textContent = `${itemName} (${item.type})`;
            } else {
                label.textContent = itemName;
            }

            const description = this.createElement('div', {
                className: `${type}-description`,
                style: {
                    fontSize: '13px',
                    color: '#666',
                    marginTop: '4px',
                    lineHeight: '1.4'
                }
            });

            // Set description text
            description.textContent = itemDescription;

            // Show point value if available
            if (item.points || item.value) {
                const pointValue = item.points || item.value;
                const pointsSpan = this.createElement('span', {
                    textContent: ` (${pointValue > 0 ? '+' : ''}${pointValue} points)`,
                    style: {
                        fontWeight: 'bold',
                        color: pointValue > 0 ? '#008000' : '#800000'
                    }
                });
                label.appendChild(pointsSpan);
            }

            labelContainer.appendChild(label);
            labelContainer.appendChild(description);

            container.appendChild(checkbox);
            container.appendChild(labelContainer);

            // Return an object with the container and useful methods
            const checkboxItem = {
                container: container,
                checkbox: checkbox,
                label: label,
                description: description,
                
                isChecked: function() {
                    return checkbox.checked;
                },
                
                setChecked: function(checked) {
                    checkbox.checked = checked;
                    console.log(`🔧 ${itemName} setChecked: ${checked}`);
                },
                
                setEnabled: function(enabled) {
                    checkbox.disabled = !enabled;
                    if (enabled) {
                        container.style.opacity = '1';
                    } else {
                        container.style.opacity = '0.6';
                    }
                },
                
                setSelected: function(selected) {
                    checkbox.checked = selected;
                    console.log(`🔧 ${itemName} setSelected: ${selected}`);
                    if (selected) {
                        container.style.borderColor = '#8B0000';
                        container.style.backgroundColor = '#fff5f5';
                    } else {
                        container.style.borderColor = '#ddd';
                        container.style.backgroundColor = 'white';
                    }
                },
                
                setAvailable: function(available) {
                    checkbox.disabled = !available;
                    console.log(`🔧 ${itemName} setAvailable: ${available}`);
                    if (available) {
                        container.style.opacity = '1';
                        container.style.pointerEvents = 'auto';
                    } else {
                        container.style.opacity = '0.5';
                        container.style.pointerEvents = 'none';
                    }
                },
                
                getValue: function() {
                    return checkbox.checked ? (item.points || item.value || 1) : 0;
                },
                
                getItem: function() {
                    return item;
                }
            };

            console.log(`✅ Successfully created checkbox item for: ${itemName}`, checkboxItem);
            return checkboxItem;

        } catch (error) {
            console.error(`❌ Error creating checkbox item for ${item?.name || 'unknown item'}:`, error);
            
            // Return a fallback object
            const fallbackName = `fallback-${Math.random().toString(36).substr(2, 9)}`;
            return {
                container: this.createElement('div'),
                checkbox: this.createElement('input'),
                label: this.createElement('label'),
                description: this.createElement('div'),
                isChecked: function() { return false; },
                setChecked: function() { console.log('Fallback setChecked'); },
                setEnabled: function() { console.log('Fallback setEnabled'); },
                setSelected: function() { console.log('Fallback setSelected'); },
                setAvailable: function() { console.log('Fallback setAvailable'); },
                getValue: function() { return 0; },
                getItem: function() { return item; }
            };
        }
    }

    createElement(tagName, options = {}) {
        console.log(`🔧 createElement called: ${tagName}`);
        
        const element = document.createElement(tagName);
        
        // Set attributes if provided
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.className || options.class) {
            element.className = options.className || options.class;
        }
        
        if (options.textContent || options.text) {
            element.textContent = options.textContent || options.text;
        }
        
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        // Set any other attributes
        if (options.attributes) {
            for (const [key, value] of Object.entries(options.attributes)) {
                element.setAttribute(key, value);
            }
        }
        
        // Set styles if provided
        if (options.style) {
            if (typeof options.style === 'string') {
                element.style.cssText = options.style;
            } else {
                Object.assign(element.style, options.style);
            }
        }
        
        // Add event listeners if provided
        if (options.events) {
            for (const [event, handler] of Object.entries(options.events)) {
                element.addEventListener(event, handler);
            }
        }
        
        console.log(`✅ Created element: ${tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className : ''}`);
        return element;
    }

    toggleClass(element, className) {
        console.log(`🔧 toggleClass called: ${className}`);
        
        if (!element) {
            console.warn('⚠️ No element provided to toggleClass');
            return;
        }

        if (this.hasClass(element, className)) {
            this.removeClass(element, className);
        } else {
            this.addClass(element, className);
        }
    }

    addClearButton(targetElement) {
        console.log('🔧 Adding clear button functionality');
        
        if (!targetElement) {
            console.warn('⚠️ No target element provided for clear button');
            return;
        }

        // Find randomize button and add clear functionality
        const randomizeButtons = document.querySelectorAll('button');
        for (let button of randomizeButtons) {
            if (button.textContent.toLowerCase().includes('randomize')) {
                button.addEventListener('click', () => {
                    console.log('🎲 Randomize button clicked');
                    // Add randomize functionality here if needed
                });
                break;
            }
        }
    }
}
