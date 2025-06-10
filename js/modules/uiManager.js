// SWADE Character Creator v2 - UIManager Module v1.0039
// Clean version - Fixed all syntax errors

export class UIManager {
    constructor() {
        this.VERSION = "V1.0039";
        this.displayVersion();
        this.setupWhiteHeaderText();
        this.patchExistingControls();
        console.log(`✅ UIManager ${this.VERSION} initialized - Syntax errors fixed!`);
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
            console.log('⚠️ No existing controls found - will wait and try again');
            setTimeout(() => this.patchExistingControls(), 500);
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
