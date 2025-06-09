// SWADE Character Creator v2 - Hindrances Manager Module

export class HindrancesManager {
    constructor(dataManager, characterManager, calculationsManager, uiManager) {
        this.dataManager = dataManager;
        this.characterManager = characterManager;
        this.calculationsManager = calculationsManager;
        this.uiManager = uiManager;
        this.skillsManager = null; // Will be set by main app
        this.edgesManager = null; // Will be set by main app
        
        this.hindranceControls = new Map();
    }

    setSkillsManager(skillsManager) {
        this.skillsManager = skillsManager;
    }

    setEdgesManager(edgesManager) {
        this.edgesManager = edgesManager;
    }

    async initializeUI() {
        this.createHindrancesList();
        this.updateDisplay();
    }

    createHindrancesList() {
        const container = document.getElementById('hindrancesList');
        this.uiManager.clearElement(container);
        this.hindranceControls.clear();
        
        const hindrances = this.dataManager.getHindrances();
        const character = this.characterManager.getCharacter();
        
        // Group hindrances by type
        const groupedHindrances = {
            major: {},
            minor: {}
        };
        
        Object.entries(hindrances).forEach(([name, data]) => {
            groupedHindrances[data.type][name] = data;
        });
        
        // Create sections for each type
        Object.entries(groupedHindrances).forEach(([type, hindranceGroup]) => {
            if (Object.keys(hindranceGroup).length === 0) return;
            
            const sectionHeader = this.uiManager.createElement('h4', 'hindrance-section-header', 
                `${type.charAt(0).toUpperCase() + type.slice(1)} Hindrances (${type === 'minor' ? '1' : '2'} point${type === 'major' ? 's' : ''})`);
            container.appendChild(sectionHeader);
            
            // Sort alphabetically
            const sortedHindrances = Object.entries(hindranceGroup)
                .sort(([a], [b]) => a.localeCompare(b));
            
            sortedHindrances.forEach(([name, data]) => {
                const isSelected = character.hindrances.some(h => h.name === name);
                const isAvailable = this.isHindranceAvailable(character, name, data);
                
                const meta = `${data.type.toUpperCase()} • ${data.points} point${data.points > 1 ? 's' : ''}`;
                
                const control = this.uiManager.createCheckboxItem(
                    name,
                    data.description,
                    meta,
                    isSelected,
                    isAvailable,
                    (checked) => this.onHindranceChange(name, data, checked)
                );
                
                this.hindranceControls.set(name, control);
                container.appendChild(control.container);
            });
        });
    }

    onHindranceChange(name, data, isChecked) {
        const character = this.characterManager.getCharacter();
        
        if (isChecked) {
            // Check if we can take this hindrance
            if (!this.canTakeHindrance(character, data)) {
                const control = this.hindranceControls.get(name);
                if (control) {
                    control.setSelected(false);
                }
                
                const points = this.calculationsManager.getHindrancePoints(character);
                const rules = this.dataManager.getGameRules();
                
                if (points.total >= rules.hindrancePointsMax) {
                    this.uiManager.showNotification('Cannot take more hindrances! Maximum 4 points.', 'warning');
                } else if (data.type === 'minor' && points.minor >= rules.hindrancePointsMinorMax) {
                    this.uiManager.showNotification('Cannot take more minor hindrances! Maximum 2 points.', 'warning');
                }
                return;
            }
            
            this.characterManager.addHindrance(name, data.type, data.points);
            this.uiManager.showNotification(`Added hindrance: ${name}`, 'success', 2000);
        } else {
            this.characterManager.removeHindrance(name);
            this.uiManager.showNotification(`Removed hindrance: ${name}`, 'info', 2000);
        }
        
        // Update displays
        this.updateAvailability();
        this.updateSelectedSummary();
        
        // Notify other managers
        if (this.skillsManager) this.skillsManager.updateDisplay();
        if (this.edgesManager) this.edgesManager.updateDisplay();
    }

    isHindranceAvailable(character, name, data) {
        // Check if already selected
        if (character.hindrances.some(h => h.name === name)) {
            return true; // Already selected, so available for deselection
        }
        
        return this.canTakeHindrance(character, data);
    }

    canTakeHindrance(character, data) {
        const points = this.calculationsManager.getHindrancePoints(character);
        const rules = this.dataManager.getGameRules();
        
        // Check total points limit
        if (points.total + data.points > rules.hindrancePointsMax) {
            return false;
        }
        
        // Check minor hindrance limit
        if (data.type === 'minor' && points.minor + data.points > rules.hindrancePointsMinorMax) {
            return false;
        }
        
        // Check for incompatible hindrances
        const incompatibilities = this.getIncompatibleHindrances(data.name || data.type);
        const hasIncompatible = character.hindrances.some(h => 
            incompatibilities.includes(h.name)
        );
        
        if (hasIncompatible) {
            return false;
        }
        
        return true;
    }

    getIncompatibleHindrances(hindranceName) {
        // Define hindrance incompatibilities
        const incompatibilities = {
            'Luck': ['Bad Luck'],
            'Bad Luck': ['Luck', 'Great Luck'],
            'Great Luck': ['Bad Luck'],
            'Rich': ['Poverty'],
            'Filthy Rich': ['Poverty'],
            'Poverty': ['Rich', 'Filthy Rich'],
            'Young': ['Elderly'],
            'Elderly': ['Young'],
            'Slow (Minor)': ['Slow (Major)', 'Fleet-Footed'],
            'Slow (Major)': ['Slow (Minor)', 'Fleet-Footed'],
            'Quick': ['Hesitant'],
            'Hesitant': ['Quick'],
            // Add more incompatibilities as needed
        };
        
        return incompatibilities[hindranceName] || [];
    }

    updateDisplay() {
        this.updateAvailability();
        this.updateSelectedSummary();
        this.updatePointsDisplay();
    }

    updateAvailability() {
        const character = this.characterManager.getCharacter();
        
        this.hindranceControls.forEach((control, name) => {
            const hindranceData = this.dataManager.getHindranceByName(name);
            const isSelected = character.hindrances.some(h => h.name === name);
            const isAvailable = this.isHindranceAvailable(character, name, hindranceData);
            
            control.setSelected(isSelected);
            control.setAvailable(isAvailable);
        });
    }

    updateSelectedSummary() {
        const character = this.characterManager.getCharacter();
        const selectedContainer = document.getElementById('selectedHindrances');
        
        if (character.hindrances.length === 0) {
            selectedContainer.innerHTML = '[None selected]';
            return;
        }
        
        // Group by type for display
        const byType = {
            major: character.hindrances.filter(h => h.type === 'major'),
            minor: character.hindrances.filter(h => h.type === 'minor')
        };
        
        let html = '';
        
        Object.entries(byType).forEach(([type, hindrances]) => {
            if (hindrances.length > 0) {
                html += `<div class="selected-group">`;
                html += `<strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong><br>`;
                
                hindrances.forEach(hindrance => {
                    const data = this.dataManager.getHindranceByName(hindrance.name);
                    html += `<div class="selected-item">`;
                    html += `<span class="selected-name">${hindrance.name}</span>`;
                    html += `<span class="selected-meta">(${hindrance.points} pt${hindrance.points > 1 ? 's' : ''})</span>`;
                    if (data) {
                        html += `<div class="selected-description">${data.description}</div>`;
                    }
                    html += `</div>`;
                });
                
                html += `</div>`;
            }
        });
        
        selectedContainer.innerHTML = html;
    }

    updatePointsDisplay() {
        const character = this.characterManager.getCharacter();
        const points = this.calculationsManager.getHindrancePoints(character);
        const bonuses = this.calculationsManager.getHindranceBonuses(character);
        const rules = this.dataManager.getGameRules();
        
        const infoElement = document.getElementById('hindranceInfo');
        if (infoElement) {
            let text = `Hindrance Points: ${points.total}/${rules.hindrancePointsMax}`;
            text += ` | Bonus: +${bonuses.skillPoints} skill points, +${bonuses.edges} Edges`;
            
            infoElement.textContent = text;
            
            // Color code based on points
            infoElement.className = 'points-info';
            if (points.total > rules.hindrancePointsMax) {
                this.uiManager.addClass(infoElement, 'over-limit');
            } else if (points.total === rules.hindrancePointsMax) {
                this.uiManager.addClass(infoElement, 'at-limit');
            }
        }
    }

    // Randomization support
    randomizeHindrances() {
        const character = this.characterManager.getCharacter();
        const rules = this.dataManager.getGameRules();
        
        // Clear existing hindrances
        [...character.hindrances].forEach(h => {
            this.characterManager.removeHindrance(h.name);
        });
        
        const hindrances = this.dataManager.getHindrances();
        const hindranceList = Object.entries(hindrances);
        
        let pointsToSpend = Math.floor(Math.random() * (rules.hindrancePointsMax + 1)); // 0-4 points
        let attempts = 0;
        const maxAttempts = 50;
        
        while (pointsToSpend > 0 && attempts < maxAttempts) {
            attempts++;
            
            // Randomly select a hindrance
            const [name, data] = hindranceList[Math.floor(Math.random() * hindranceList.length)];
            
            // Check if we can take it
            if (this.canTakeHindrance(character, data) && 
                !character.hindrances.some(h => h.name === name)) {
                
                this.characterManager.addHindrance(name, data.type, data.points);
                pointsToSpend -= data.points;
            }
        }
        
        this.uiManager.showNotification('Hindrances randomized!', 'success');
    }

    // Analysis methods
    getHindrancesAnalysis(character) {
        const analysis = {
            total: character.hindrances.length,
            points: this.calculationsManager.getHindrancePoints(character),
            bonuses: this.calculationsManager.getHindranceBonuses(character),
            byType: {
                major: character.hindrances.filter(h => h.type === 'major'),
                minor: character.hindrances.filter(h => h.type === 'minor')
            },
            categories: {}
        };
        
        // Categorize hindrances
        character.hindrances.forEach(hindrance => {
            const data = this.dataManager.getHindranceByName(hindrance.name);
            if (data) {
                // Simple categorization based on description keywords
                let category = 'Other';
                const desc = data.description.toLowerCase();
                
                if (desc.includes('social') || desc.includes('persuasion') || desc.includes('charisma')) {
                    category = 'Social';
                } else if (desc.includes('combat') || desc.includes('attack') || desc.includes('damage')) {
                    category = 'Combat';
                } else if (desc.includes('mental') || desc.includes('smarts') || desc.includes('knowledge')) {
                    category = 'Mental';
                } else if (desc.includes('physical') || desc.includes('vigor') || desc.includes('strength')) {
                    category = 'Physical';
                }
                
                if (!analysis.categories[category]) {
                    analysis.categories[category] = [];
                }
                analysis.categories[category].push(hindrance);
            }
        });
        
        return analysis;
    }

    getHindrancesForExport(character) {
        return character.hindrances.map(hindrance => {
            const data = this.dataManager.getHindranceByName(hindrance.name);
            return {
                name: hindrance.name,
                type: hindrance.type,
                points: hindrance.points,
                description: data ? data.description : 'Unknown hindrance'
            };
        });
    }

    // Validation support
    validateHindrances() {
        const character = this.characterManager.getCharacter();
        const errors = [];
        const warnings = [];
        
        const points = this.calculationsManager.getHindrancePoints(character);
        const rules = this.dataManager.getGameRules();
        
        // Check point limits
        if (points.total > rules.hindrancePointsMax) {
            errors.push(`Too many hindrance points: ${points.total}/${rules.hindrancePointsMax}`);
        }
        
        if (points.minor > rules.hindrancePointsMinorMax) {
            errors.push(`Too many minor hindrance points: ${points.minor}/${rules.hindrancePointsMinorMax}`);
        }
        
        // Check for incompatible hindrances
        character.hindrances.forEach(hindrance => {
            const incompatible = this.getIncompatibleHindrances(hindrance.name);
            const conflicts = character.hindrances.filter(h => 
                h.name !== hindrance.name && incompatible.includes(h.name)
            );
            
            if (conflicts.length > 0) {
                errors.push(`${hindrance.name} conflicts with: ${conflicts.map(c => c.name).join(', ')}`);
            }
        });
        
        // Check if hindrances exist in data
        character.hindrances.forEach(hindrance => {
            if (!this.dataManager.getHindranceByName(hindrance.name)) {
                warnings.push(`Unknown hindrance: ${hindrance.name}`);
            }
        });
        
        return { errors, warnings };
    }

    // Suggestion methods
    getSuggestedHindrances(character) {
        const suggestions = [];
        const hindrances = this.dataManager.getHindrances();
        
        // Suggest based on current character build
        const analysis = this.getHindrancesAnalysis(character);
        const points = analysis.points;
        const rules = this.dataManager.getGameRules();
        const remainingPoints = rules.hindrancePointsMax - points.total;
        
        if (remainingPoints > 0) {
            // Suggest hindrances that fit the remaining points
            Object.entries(hindrances).forEach(([name, data]) => {
                if (data.points <= remainingPoints && 
                    this.canTakeHindrance(character, data) &&
                    !character.hindrances.some(h => h.name === name)) {
                    
                    suggestions.push({
                        name,
                        data,
                        reason: `Fits remaining ${remainingPoints} point${remainingPoints > 1 ? 's' : ''}`
                    });
                }
            });
        }
        
        return suggestions.slice(0, 5); // Limit to top 5 suggestions
    }

    // Utility methods
    getHindrancePointsDisplay(character) {
        const points = this.calculationsManager.getHindrancePoints(character);
        const rules = this.dataManager.getGameRules();
        
        return {
            current: points.total,
            maximum: rules.hindrancePointsMax,
            remaining: rules.hindrancePointsMax - points.total,
            percentage: (points.total / rules.hindrancePointsMax) * 100
        };
    }

    // Cleanup
    destroy() {
        this.hindranceControls.clear();
    }
}