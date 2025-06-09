// SWADE Character Creator v2 - Attributes Manager Module

export class AttributesManager {
    constructor(characterManager, calculationsManager, uiManager) {
        this.characterManager = characterManager;
        this.calculationsManager = calculationsManager;
        this.uiManager = uiManager;
        this.skillsManager = null; // Will be set by main app
        
        this.attributeNames = ['agility', 'smarts', 'spirit', 'strength', 'vigor'];
        this.attributeControls = new Map();
    }

    setSkillsManager(skillsManager) {
        this.skillsManager = skillsManager;
    }

    async initializeUI() {
        const container = document.getElementById('attributesGrid');
        this.uiManager.clearElement(container);
        
        this.attributeNames.forEach(attrName => {
            const character = this.characterManager.getCharacter();
            const currentValue = character.attributes[attrName];
            
            const control = this.uiManager.createAttributeControl(
                attrName,
                currentValue,
                () => this.incrementAttribute(attrName),
                () => this.decrementAttribute(attrName)
            );
            
            this.attributeControls.set(attrName, control);
            container.appendChild(control.container);
        });
        
        this.updateDisplay();
    }

    incrementAttribute(attributeName) {
        const character = this.characterManager.getCharacter();
        const canAfford = this.calculationsManager.canAffordAttributeIncrease(character, attributeName);
        
        if (canAfford) {
            this.characterManager.incrementAttribute(attributeName);
            this.uiManager.showNotification(
                `${this.capitalizeFirst(attributeName)} increased to d${character.attributes[attributeName] + 2}`, 
                'success', 
                2000
            );
        } else {
            const remaining = this.calculationsManager.calculateAttributePointsRemaining(character);
            if (remaining <= 0) {
                this.uiManager.showNotification('No attribute points remaining!', 'warning');
            } else if (character.attributes[attributeName] >= 12) {
                this.uiManager.showNotification('Attribute already at maximum (d12)!', 'warning');
            }
        }
    }

    decrementAttribute(attributeName) {
        const character = this.characterManager.getCharacter();
        const currentValue = character.attributes[attributeName];
        
        if (currentValue > 4) {
            this.characterManager.decrementAttribute(attributeName);
            this.uiManager.showNotification(
                `${this.capitalizeFirst(attributeName)} decreased to d${currentValue - 2}`, 
                'info', 
                2000
            );
        } else {
            this.uiManager.showNotification('Attribute already at minimum (d4)!', 'warning');
        }
    }

    updateDisplay() {
        const character = this.characterManager.getCharacter();
        const remaining = this.calculationsManager.calculateAttributePointsRemaining(character);
        
        // Update each attribute control
        this.attributeNames.forEach(attrName => {
            const control = this.attributeControls.get(attrName);
            if (control) {
                const currentValue = character.attributes[attrName];
                const canIncrement = this.calculationsManager.canAffordAttributeIncrease(character, attrName);
                const canDecrement = currentValue > 4;
                
                control.updateValue(currentValue);
                control.setEnabled(canIncrement, canDecrement);
                
                // Add visual feedback for affordability
                if (canIncrement) {
                    this.uiManager.removeClass(control.incrementBtn, 'disabled');
                } else {
                    this.uiManager.addClass(control.incrementBtn, 'disabled');
                }
                
                if (canDecrement) {
                    this.uiManager.removeClass(control.decrementBtn, 'disabled');
                } else {
                    this.uiManager.addClass(control.decrementBtn, 'disabled');
                }
            }
        });
        
        // Update points display
        const pointsElement = document.getElementById('attributePoints');
        if (pointsElement) {
            pointsElement.textContent = `Attribute Points Remaining: ${remaining}`;
            
            // Color code based on remaining points
            pointsElement.className = 'points-remaining';
            if (remaining < 0) {
                this.uiManager.addClass(pointsElement, 'over-limit');
            } else if (remaining === 0) {
                this.uiManager.addClass(pointsElement, 'at-limit');
            }
        }
        
        // Update info panel
        this.updateInfoPanel();
        
        // Trigger skills update if skills manager is available
        if (this.skillsManager) {
            this.skillsManager.updateDisplay();
        }
    }

    updateInfoPanel() {
        const character = this.characterManager.getCharacter();
        const used = this.calculationsManager.calculateAttributePointsUsed(character);
        const remaining = this.calculationsManager.calculateAttributePointsRemaining(character);
        const total = 5; // Base attribute points
        
        const infoElement = document.getElementById('attributeInfo');
        if (infoElement) {
            let infoText = `You have ${total} Attribute points. Attributes start at d4 and cost 1 point per step.`;
            
            if (used > 0) {
                infoText += `\n\nSpent: ${used} points`;
                
                if (remaining > 0) {
                    infoText += `\nRemaining: ${remaining} points`;
                } else if (remaining < 0) {
                    infoText += `\n⚠️ Over limit by ${Math.abs(remaining)} points!`;
                }
            }
            
            infoElement.textContent = infoText;
        }
    }

    // Randomization support
    randomizeAttributes() {
        const character = this.characterManager.getCharacter();
        const totalPoints = 5;
        let pointsToSpend = totalPoints;
        
        // Reset all attributes to d4
        this.attributeNames.forEach(attr => {
            this.characterManager.setAttribute(attr, 4);
        });
        
        // Randomly distribute points
        while (pointsToSpend > 0) {
            const randomAttr = this.attributeNames[Math.floor(Math.random() * this.attributeNames.length)];
            const currentValue = this.characterManager.getAttribute(randomAttr);
            
            // Don't go above d12
            if (currentValue < 12) {
                this.characterManager.incrementAttribute(randomAttr);
                pointsToSpend--;
            } else {
                // If all attributes are at d12, break (shouldn't happen with 5 points)
                const allAtMax = this.attributeNames.every(attr => 
                    this.characterManager.getAttribute(attr) >= 12
                );
                if (allAtMax) break;
            }
        }
        
        this.uiManager.showNotification('Attributes randomized!', 'success');
    }

    // Validation support
    validateAttributes() {
        const character = this.characterManager.getCharacter();
        const errors = [];
        const warnings = [];
        
        // Check point limits
        const remaining = this.calculationsManager.calculateAttributePointsRemaining(character);
        if (remaining < 0) {
            errors.push(`Over attribute point limit by ${Math.abs(remaining)} points`);
        }
        
        // Check for unspent points
        if (remaining > 0) {
            warnings.push(`${remaining} unspent attribute points`);
        }
        
        // Check individual attribute limits
        this.attributeNames.forEach(attr => {
            const value = character.attributes[attr];
            if (value < 4) {
                errors.push(`${this.capitalizeFirst(attr)} below minimum (d4)`);
            }
            if (value > 12) {
                errors.push(`${this.capitalizeFirst(attr)} above maximum (d12)`);
            }
        });
        
        return { errors, warnings };
    }

    // Attribute analysis
    getAttributeAnalysis(character) {
        const analysis = {
            primary: [],      // Attributes at d8+
            secondary: [],    // Attributes at d6
            weak: []         // Attributes at d4
        };
        
        this.attributeNames.forEach(attr => {
            const value = character.attributes[attr];
            const name = this.capitalizeFirst(attr);
            
            if (value >= 8) {
                analysis.primary.push({ name, value, display: `d${value}` });
            } else if (value === 6) {
                analysis.secondary.push({ name, value, display: `d${value}` });
            } else {
                analysis.weak.push({ name, value, display: `d${value}` });
            }
        });
        
        return analysis;
    }

    // Get suggested attributes based on concept/edges
    getSuggestedAttributes(character) {
        const suggestions = {};
        
        // Analyze edges for attribute requirements
        character.edges.forEach(edgeName => {
            // This would analyze edge requirements and suggest attributes
            // For now, provide basic suggestions based on common edge patterns
            if (edgeName.includes('Combat') || edgeName.includes('Fighting')) {
                suggestions.agility = (suggestions.agility || 0) + 1;
                suggestions.strength = (suggestions.strength || 0) + 1;
            }
            if (edgeName.includes('Academic') || edgeName.includes('Scholar')) {
                suggestions.smarts = (suggestions.smarts || 0) + 1;
            }
            if (edgeName.includes('Leadership') || edgeName.includes('Charismatic')) {
                suggestions.spirit = (suggestions.spirit || 0) + 1;
            }
            if (edgeName.includes('Tough') || edgeName.includes('Hardy')) {
                suggestions.vigor = (suggestions.vigor || 0) + 1;
            }
        });
        
        return suggestions;
    }

    // Export attribute data for character sheet
    getAttributesForExport(character) {
        const attributes = {};
        
        this.attributeNames.forEach(attr => {
            attributes[attr] = {
                name: this.capitalizeFirst(attr),
                value: character.attributes[attr],
                display: `d${character.attributes[attr]}`
            };
        });
        
        return attributes;
    }

    // Utility methods
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getAttributeDescription(attributeName) {
        const descriptions = {
            agility: 'Dexterity, quickness, and general coordination',
            smarts: 'Reasoning ability, education, and common sense',
            spirit: 'Inner wisdom, willpower, and mental toughness',
            strength: 'Physical power and fitness',
            vigor: 'Endurance, resistance to disease, poison, and physical toughness'
        };
        
        return descriptions[attributeName] || '';
    }

    // Keyboard shortcuts support
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle if we're not in an input field
            if (e.target.tagName.toLowerCase() === 'input' || 
                e.target.tagName.toLowerCase() === 'textarea') {
                return;
            }
            
            // Alt + 1-5 for attributes
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                const keyNum = parseInt(e.key);
                if (keyNum >= 1 && keyNum <= 5) {
                    const attrName = this.attributeNames[keyNum - 1];
                    this.incrementAttribute(attrName);
                    e.preventDefault();
                }
            }
            
            // Ctrl + Alt + 1-5 for decrementing attributes
            if (e.ctrlKey && e.altKey && !e.shiftKey) {
                const keyNum = parseInt(e.key);
                if (keyNum >= 1 && keyNum <= 5) {
                    const attrName = this.attributeNames[keyNum - 1];
                    this.decrementAttribute(attrName);
                    e.preventDefault();
                }
            }
        });
    }

    // Cleanup
    destroy() {
        this.attributeControls.clear();
        // Remove any event listeners if needed
    }
}