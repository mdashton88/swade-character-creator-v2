// SWADE Character Creator v2 - Skills Manager Module

export class SkillsManager {
    constructor(dataManager, characterManager, calculationsManager, uiManager) {
        this.dataManager = dataManager;
        this.characterManager = characterManager;
        this.calculationsManager = calculationsManager;
        this.uiManager = uiManager;
        this.attributesManager = null; // Will be set by main app
        
        this.skillControls = new Map();
        this.allSkills = new Map(); // Combined standard + custom skills
    }

    setAttributesManager(attributesManager) {
        this.attributesManager = attributesManager;
    }

    async initializeUI() {
        this.updateAllSkillsList();
        this.createSkillsGrid();
        this.updateDisplay();
    }

    updateAllSkillsList() {
        this.allSkills.clear();
        
        // Add standard skills
        const standardSkills = this.dataManager.getSkills();
        Object.entries(standardSkills).forEach(([name, data]) => {
            this.allSkills.set(name, {
                ...data,
                isCustom: false,
                isCore: this.dataManager.getCoreSkills().includes(name)
            });
        });
        
        // Add custom skills
        const character = this.characterManager.getCharacter();
        const customSkills = character.customSkills || {};
        Object.entries(customSkills).forEach(([name, data]) => {
            this.allSkills.set(name, {
                attribute: data.attribute,
                description: 'Custom skill',
                isCustom: true,
                isCore: false
            });
        });
    }

    createSkillsGrid() {
        const container = document.getElementById('skillsGrid');
        this.uiManager.clearElement(container);
        this.skillControls.clear();
        
        // Sort skills alphabetically, with core skills first
        const sortedSkills = Array.from(this.allSkills.entries()).sort(([nameA, dataA], [nameB, dataB]) => {
            // Core skills first
            if (dataA.isCore && !dataB.isCore) return -1;
            if (!dataA.isCore && dataB.isCore) return 1;
            
            // Then alphabetical
            return nameA.localeCompare(nameB);
        });
        
        sortedSkills.forEach(([skillName, skillData]) => {
            const character = this.characterManager.getCharacter();
            const currentValue = character.skills[skillName] || 0;
            
            const control = this.uiManager.createSkillControl(
                skillName,
                currentValue,
                this.capitalizeFirst(skillData.attribute),
                () => this.incrementSkill(skillName),
                () => this.decrementSkill(skillName),
                skillData.isCore,
                this.calculationsManager.isSkillExpensive(character, skillName)
            );
            
            // Add custom skill removal button if it's a custom skill
            if (skillData.isCustom) {
                const removeBtn = this.uiManager.createButton('×', 'skill-button remove-custom', 
                    () => this.removeCustomSkill(skillName));
                removeBtn.title = 'Remove custom skill';
                control.container.appendChild(removeBtn);
            }
            
            // Add skill description tooltip
            control.container.title = skillData.description;
            
            this.skillControls.set(skillName, control);
            container.appendChild(control.container);
        });
    }

    incrementSkill(skillName) {
        const character = this.characterManager.getCharacter();
        const canAfford = this.calculationsManager.canAffordSkillIncrease(character, skillName);
        const currentValue = character.skills[skillName] || 0;
        
        if (canAfford && currentValue < 12) {
            this.characterManager.incrementSkill(skillName);
            
            const newValue = character.skills[skillName] || 0;
            const cost = this.getLastIncrementCost(character, skillName);
            
            this.uiManager.showNotification(
                `${skillName} increased to d${newValue} (${cost} point${cost > 1 ? 's' : ''})`, 
                'success', 
                2000
            );
        } else {
            const remaining = this.calculationsManager.calculateSkillPointsRemaining(character);
            if (remaining <= 0) {
                this.uiManager.showNotification('No skill points remaining!', 'warning');
            } else if (currentValue >= 12) {
                this.uiManager.showNotification('Skill already at maximum (d12)!', 'warning');
            } else {
                const cost = this.getIncrementCost(character, skillName);
                this.uiManager.showNotification(`Need ${cost} skill points for this increase!`, 'warning');
            }
        }
    }

    decrementSkill(skillName) {
        const character = this.characterManager.getCharacter();
        const currentValue = character.skills[skillName] || 0;
        
        if (currentValue > 0) {
            const cost = this.getDecrementRefund(character, skillName);
            this.characterManager.decrementSkill(skillName);
            
            this.uiManager.showNotification(
                `${skillName} decreased to ${currentValue > 2 ? `d${currentValue - 2}` : 'untrained'} (+${cost} point${cost > 1 ? 's' : ''})`, 
                'info', 
                2000
            );
        } else {
            this.uiManager.showNotification('Skill is already untrained!', 'warning');
        }
    }

    getIncrementCost(character, skillName) {
        const currentValue = character.skills[skillName] || 0;
        const linkedAttribute = this.calculationsManager.getSkillLinkedAttribute(skillName, character.customSkills);
        const attributeValue = character.attributes[linkedAttribute];
        
        return this.calculationsManager.getSkillCost(currentValue, currentValue + 2, attributeValue);
    }

    getLastIncrementCost(character, skillName) {
        const currentValue = character.skills[skillName] || 0;
        const linkedAttribute = this.calculationsManager.getSkillLinkedAttribute(skillName, character.customSkills);
        const attributeValue = character.attributes[linkedAttribute];
        
        return this.calculationsManager.getSkillCost(currentValue - 2, currentValue, attributeValue);
    }

    getDecrementRefund(character, skillName) {
        const currentValue = character.skills[skillName] || 0;
        const linkedAttribute = this.calculationsManager.getSkillLinkedAttribute(skillName, character.customSkills);
        const attributeValue = character.attributes[linkedAttribute];
        
        return this.calculationsManager.getSkillCost(currentValue - 2, currentValue, attributeValue);
    }

    addCustomSkill() {
        const nameInput = document.getElementById('customSkillName');
        const attrSelect = document.getElementById('customSkillAttr');
        
        const skillName = nameInput.value.trim();
        const linkedAttribute = attrSelect.value;
        
        if (!skillName) {
            this.uiManager.showNotification('Please enter a skill name!', 'warning');
            return;
        }
        
        // Check if skill already exists
        if (this.allSkills.has(skillName)) {
            this.uiManager.showNotification('A skill with that name already exists!', 'warning');
            return;
        }
        
        // Add the custom skill
        this.characterManager.addCustomSkill(skillName, linkedAttribute);
        
        // Clear inputs
        nameInput.value = '';
        attrSelect.value = 'agility';
        
        // Refresh the UI
        this.updateAllSkillsList();
        this.createSkillsGrid();
        this.updateDisplay();
        
        this.uiManager.showNotification(`Added custom skill: ${skillName}`, 'success');
    }

    removeCustomSkill(skillName) {
        const character = this.characterManager.getCharacter();
        const currentValue = character.skills[skillName] || 0;
        
        let confirmMessage = `Remove custom skill "${skillName}"?`;
        if (currentValue > 0) {
            const refund = this.calculationsManager.calculateSkillPointsUsed({
                ...character,
                skills: { [skillName]: currentValue }
            });
            confirmMessage += `\n\nThis will refund ${refund} skill point${refund > 1 ? 's' : ''}.`;
        }
        
        if (confirm(confirmMessage)) {
            this.characterManager.removeCustomSkill(skillName);
            
            // Refresh the UI
            this.updateAllSkillsList();
            this.createSkillsGrid();
            this.updateDisplay();
            
            this.uiManager.showNotification(`Removed custom skill: ${skillName}`, 'info');
        }
    }

    updateDisplay() {
        const character = this.characterManager.getCharacter();
        const remaining = this.calculationsManager.calculateSkillPointsRemaining(character);
        const bonusPoints = this.calculationsManager.getBonusSkillPoints(character);
        
        // Update each skill control
        this.skillControls.forEach((control, skillName) => {
            const currentValue = character.skills[skillName] || 0;
            const canIncrement = this.calculationsManager.canAffordSkillIncrease(character, skillName);
            const canDecrement = currentValue > 0;
            const isExpensive = this.calculationsManager.isSkillExpensive(character, skillName);
            
            control.updateValue(currentValue);
            control.setEnabled(canIncrement && currentValue < 12, canDecrement);
            control.setExpensive(isExpensive);
            
            // Add cost indicator
            if (currentValue < 12) {
                const cost = this.getIncrementCost(character, skillName);
                const costText = cost > 1 ? ` (${cost} pts)` : ' (1 pt)';
                
                // Update button title with cost information
                control.incrementBtn.title = `Increase ${skillName}${costText}`;
            } else {
                control.incrementBtn.title = `${skillName} is at maximum`;
            }
            
            if (currentValue > 0) {
                const refund = this.getDecrementRefund(character, skillName);
                control.decrementBtn.title = `Decrease ${skillName} (+${refund} pt${refund > 1 ? 's' : ''})`;
            } else {
                control.decrementBtn.title = `${skillName} is already untrained`;
            }
        });
        
        // Update points display
        const pointsElement = document.getElementById('skillPoints');
        if (pointsElement) {
            pointsElement.textContent = `Skill Points Remaining: ${remaining}`;
            
            // Color code based on remaining points
            pointsElement.className = 'points-remaining';
            if (remaining < 0) {
                this.uiManager.addClass(pointsElement, 'over-limit');
            } else if (remaining === 0) {
                this.uiManager.addClass(pointsElement, 'at-limit');
            }
        }
        
        // Update info panel
        this.updateInfoPanel(bonusPoints);
    }

    updateInfoPanel(bonusPoints = null) {
        const character = this.characterManager.getCharacter();
        const used = this.calculationsManager.calculateSkillPointsUsed(character);
        const remaining = this.calculationsManager.calculateSkillPointsRemaining(character);
        const base = this.dataManager.getGameRules().skillPoints;
        
        if (bonusPoints === null) {
            bonusPoints = this.calculationsManager.getBonusSkillPoints(character);
        }
        
        const total = base + bonusPoints;
        
        const infoElement = document.getElementById('skillsInfo');
        if (infoElement) {
            let infoText = `You have ${base} Skill points`;
            
            if (bonusPoints > 0) {
                infoText += ` + ${bonusPoints} bonus points from Hindrances`;
            }
            
            infoText += `. Skills cost 1 point per step up to their linked Attribute, then 2 points per step beyond that.`;
            
            if (used > 0) {
                infoText += `\n\nSpent: ${used}/${total} points`;
                
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
    randomizeSkills() {
        const character = this.characterManager.getCharacter();
        const totalPoints = this.dataManager.getGameRules().skillPoints + 
                           this.calculationsManager.getBonusSkillPoints(character);
        
        // Reset all skills
        Object.keys(character.skills).forEach(skillName => {
            this.characterManager.setSkill(skillName, 0);
        });
        
        let pointsToSpend = totalPoints;
        const skillNames = Array.from(this.allSkills.keys());
        const coreSkills = this.dataManager.getCoreSkills();
        
        // Ensure core skills get at least some investment
        coreSkills.forEach(skillName => {
            if (pointsToSpend >= 1 && Math.random() > 0.3) {
                this.characterManager.setSkill(skillName, 4); // d4
                pointsToSpend -= 1;
            }
        });
        
        // Randomly distribute remaining points
        while (pointsToSpend > 0) {
            const randomSkill = skillNames[Math.floor(Math.random() * skillNames.length)];
            const currentValue = character.skills[randomSkill] || 0;
            
            if (currentValue < 12) {
                const cost = this.getIncrementCost(character, randomSkill);
                
                if (pointsToSpend >= cost) {
                    this.characterManager.incrementSkill(randomSkill);
                    pointsToSpend -= cost;
                } else {
                    // Try to find a skill we can afford
                    const affordableSkill = skillNames.find(skill => {
                        const skillValue = character.skills[skill] || 0;
                        const skillCost = this.getIncrementCost(character, skill);
                        return skillValue < 12 && pointsToSpend >= skillCost;
                    });
                    
                    if (affordableSkill) {
                        const cost = this.getIncrementCost(character, affordableSkill);
                        this.characterManager.incrementSkill(affordableSkill);
                        pointsToSpend -= cost;
                    } else {
                        break; // Can't afford anything
                    }
                }
            }
        }
        
        this.uiManager.showNotification('Skills randomized!', 'success');
    }

    // Analysis and export methods
    getSkillsAnalysis(character) {
        const analysis = {
            trained: [],      // Skills with d4+
            expert: [],       // Skills with d8+
            master: [],       // Skills with d12
            core: [],         // Core skills status
            expensive: []     // Skills that cost 2 points to increase
        };
        
        const coreSkills = this.dataManager.getCoreSkills();
        
        Object.entries(character.skills).forEach(([skillName, value]) => {
            if (value > 0) {
                const skillInfo = {
                    name: skillName,
                    value,
                    display: `d${value}`,
                    isCore: coreSkills.includes(skillName),
                    isExpensive: this.calculationsManager.isSkillExpensive(character, skillName)
                };
                
                analysis.trained.push(skillInfo);
                
                if (value >= 8) analysis.expert.push(skillInfo);
                if (value >= 12) analysis.master.push(skillInfo);
                if (skillInfo.isExpensive) analysis.expensive.push(skillInfo);
            }
        });
        
        // Check core skills status
        coreSkills.forEach(skillName => {
            const value = character.skills[skillName] || 0;
            analysis.core.push({
                name: skillName,
                value,
                display: value > 0 ? `d${value}` : 'Untrained',
                isTrained: value > 0
            });
        });
        
        return analysis;
    }

    getSkillsForExport(character) {
        const skills = {};
        const coreSkills = this.dataManager.getCoreSkills();
        
        // Include all trained skills
        Object.entries(character.skills).forEach(([skillName, value]) => {
            if (value > 0) {
                const skillData = this.allSkills.get(skillName);
                skills[skillName] = {
                    name: skillName,
                    value,
                    display: `d${value}`,
                    attribute: skillData ? skillData.attribute : 'unknown',
                    isCore: coreSkills.includes(skillName),
                    isCustom: skillData ? skillData.isCustom : false
                };
            }
        });
        
        return skills;
    }

    // Validation support
    validateSkills() {
        const character = this.characterManager.getCharacter();
        const errors = [];
        const warnings = [];
        
        // Check point limits
        const remaining = this.calculationsManager.calculateSkillPointsRemaining(character);
        if (remaining < 0) {
            errors.push(`Over skill point limit by ${Math.abs(remaining)} points`);
        }
        
        // Check for unspent points (allow some flexibility)
        if (remaining > 2) {
            warnings.push(`${remaining} unspent skill points`);
        }
        
        // Check individual skill limits
        Object.entries(character.skills).forEach(([skillName, value]) => {
            if (value < 0) {
                errors.push(`${skillName} has invalid value: ${value}`);
            }
            if (value > 12) {
                errors.push(`${skillName} above maximum (d12): d${value}`);
            }
            
            // Check if skill exists
            if (!this.allSkills.has(skillName)) {
                warnings.push(`Unknown skill: ${skillName}`);
            }
        });
        
        // Check for missing core skills (warning only)
        const coreSkills = this.dataManager.getCoreSkills();
        const untrainedCore = coreSkills.filter(skill => 
            !character.skills[skill] || character.skills[skill] === 0
        );
        
        if (untrainedCore.length > 0) {
            warnings.push(`Untrained core skills: ${untrainedCore.join(', ')}`);
        }
        
        return { errors, warnings };
    }

    // Utility methods
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Cleanup
    destroy() {
        this.skillControls.clear();
        this.allSkills.clear();
    }
}