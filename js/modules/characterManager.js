// SWADE Character Creator v2 - Character Manager Module

export class CharacterManager {
    constructor() {
        this.character = this.createDefaultCharacter();
        this.changeListeners = [];
        this.history = [];
        this.maxHistorySize = 50;
    }

    createDefaultCharacter() {
        return {
            // Basic Information
            name: '',
            concept: '',
            ancestry: 'Human',
            
            // Attributes (starting at d4 = 4)
            attributes: {
                agility: 4,
                smarts: 4,
                spirit: 4,
                strength: 4,
                vigor: 4
            },
            
            // Skills (die values, 0 means untrained)
            skills: {},
            customSkills: {}, // Custom skills with their linked attributes
            
            // Hindrances
            hindrances: [], // Array of {name, type, points}
            
            // Edges
            edges: [], // Array of edge names
            
            // Equipment and Background
            equipment: '',
            background: '',
            specialAbilities: '',
            notes: '',
            
            // Metadata
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '2.0'
        };
    }

    // Character access methods
    getCharacter() {
        return { ...this.character }; // Return a copy to prevent direct mutation
    }

    setCharacter(character) {
        this.saveToHistory();
        this.character = { ...character };
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    updateCharacter(property, value) {
        this.saveToHistory();
        
        if (property.includes('.')) {
            // Handle nested properties like 'attributes.agility'
            const parts = property.split('.');
            let current = this.character;
            
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            
            current[parts[parts.length - 1]] = value;
        } else {
            this.character[property] = value;
        }
        
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    // Attribute methods
    getAttribute(attributeName) {
        return this.character.attributes[attributeName] || 4;
    }

    setAttribute(attributeName, value) {
        this.updateCharacter(`attributes.${attributeName}`, Math.max(4, Math.min(12, value)));
    }

    incrementAttribute(attributeName) {
        const current = this.getAttribute(attributeName);
        if (current < 12) {
            this.setAttribute(attributeName, current + 2);
        }
    }

    decrementAttribute(attributeName) {
        const current = this.getAttribute(attributeName);
        if (current > 4) {
            this.setAttribute(attributeName, current - 2);
        }
    }

    // Skill methods
    getSkill(skillName) {
        return this.character.skills[skillName] || 0;
    }

    setSkill(skillName, value) {
        this.saveToHistory();
        
        if (value <= 0) {
            delete this.character.skills[skillName];
        } else {
            this.character.skills[skillName] = Math.max(0, Math.min(12, value));
        }
        
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    incrementSkill(skillName) {
        const current = this.getSkill(skillName);
        if (current < 12) {
            this.setSkill(skillName, current + 2);
        }
    }

    decrementSkill(skillName) {
        const current = this.getSkill(skillName);
        if (current > 0) {
            this.setSkill(skillName, Math.max(0, current - 2));
        }
    }

    // Custom skill methods
    addCustomSkill(skillName, linkedAttribute) {
        this.saveToHistory();
        
        this.character.customSkills[skillName] = {
            attribute: linkedAttribute,
            addedDate: new Date().toISOString()
        };
        
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    removeCustomSkill(skillName) {
        this.saveToHistory();
        
        delete this.character.customSkills[skillName];
        delete this.character.skills[skillName]; // Also remove any points invested
        
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    getCustomSkills() {
        return { ...this.character.customSkills };
    }

    // Hindrance methods
    addHindrance(name, type, points) {
        this.saveToHistory();
        
        // Remove if already exists
        this.character.hindrances = this.character.hindrances.filter(h => h.name !== name);
        
        // Add new hindrance
        this.character.hindrances.push({ name, type, points });
        
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    removeHindrance(name) {
        this.saveToHistory();
        
        this.character.hindrances = this.character.hindrances.filter(h => h.name !== name);
        
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    hasHindrance(name) {
        return this.character.hindrances.some(h => h.name === name);
    }

    getHindrances() {
        return [...this.character.hindrances];
    }

    // Edge methods
    addEdge(edgeName) {
        this.saveToHistory();
        
        if (!this.character.edges.includes(edgeName)) {
            this.character.edges.push(edgeName);
            this.character.lastModified = new Date().toISOString();
            this.notifyCharacterChanged();
        }
    }

    removeEdge(edgeName) {
        this.saveToHistory();
        
        this.character.edges = this.character.edges.filter(e => e !== edgeName);
        
        this.character.lastModified = new Date().toISOString();
        this.notifyCharacterChanged();
    }

    hasEdge(edgeName) {
        return this.character.edges.includes(edgeName);
    }

    getEdges() {
        return [...this.character.edges];
    }

    // Utility methods
    initializeCharacter() {
        this.character = this.createDefaultCharacter();
        this.clearHistory();
        this.notifyCharacterChanged();
    }

    resetCharacter() {
        this.saveToHistory();
        this.character = this.createDefaultCharacter();
        this.notifyCharacterChanged();
    }

    // Export/Import methods
    exportToJSON() {
        return JSON.stringify(this.character, null, 2);
    }

    importFromJSON(jsonString) {
        try {
            const importedCharacter = JSON.parse(jsonString);
            
            // Validate the imported character structure
            if (this.validateCharacterStructure(importedCharacter)) {
                this.setCharacter(importedCharacter);
                return true;
            } else {
                throw new Error('Invalid character structure');
            }
        } catch (error) {
            console.error('Failed to import character:', error);
            return false;
        }
    }

    validateCharacterStructure(character) {
        // Basic structure validation
        const requiredFields = ['name', 'concept', 'ancestry', 'attributes', 'skills', 'hindrances', 'edges'];
        
        for (const field of requiredFields) {
            if (!(field in character)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validate attributes
        const requiredAttributes = ['agility', 'smarts', 'spirit', 'strength', 'vigor'];
        for (const attr of requiredAttributes) {
            if (!(attr in character.attributes) || typeof character.attributes[attr] !== 'number') {
                console.error(`Invalid attribute: ${attr}`);
                return false;
            }
        }

        // Validate arrays
        if (!Array.isArray(character.hindrances) || !Array.isArray(character.edges)) {
            console.error('Hindrances and edges must be arrays');
            return false;
        }

        return true;
    }

    // History management for undo functionality
    saveToHistory() {
        this.history.push(JSON.stringify(this.character));
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length > 0) {
            const previousState = this.history.pop();
            this.character = JSON.parse(previousState);
            this.notifyCharacterChanged();
            return true;
        }
        return false;
    }

    canUndo() {
        return this.history.length > 0;
    }

    clearHistory() {
        this.history = [];
    }

    // Event system for character changes
    onCharacterChange(callback) {
        if (typeof callback === 'function') {
            this.changeListeners.push(callback);
        }
    }

    offCharacterChange(callback) {
        this.changeListeners = this.changeListeners.filter(listener => listener !== callback);
    }

    notifyCharacterChanged() {
        this.changeListeners.forEach(callback => {
            try {
                callback(this.character);
            } catch (error) {
                console.error('Error in character change listener:', error);
            }
        });
    }

    // Character analysis methods
    getCharacterSummary() {
        const character = this.character;
        
        return {
            name: character.name || 'Unnamed Character',
            concept: character.concept || 'No concept',
            ancestry: character.ancestry,
            totalAttributePoints: this.getTotalAttributePointsSpent(),
            totalSkillPoints: this.getTotalSkillPointsSpent(),
            hindrancePoints: this.getTotalHindrancePoints(),
            edgeCount: character.edges.length,
            isComplete: this.isCharacterComplete()
        };
    }

    getTotalAttributePointsSpent() {
        const attributes = this.character.attributes;
        let total = 0;
        
        Object.values(attributes).forEach(value => {
            // Each step above d4 costs 1 point
            total += Math.max(0, (value - 4) / 2);
        });
        
        return total;
    }

    getTotalSkillPointsSpent() {
        // This will be calculated by the CalculationsManager
        // but we can provide a basic implementation here
        let total = 0;
        
        Object.entries(this.character.skills).forEach(([skillName, value]) => {
            if (value > 0) {
                // Basic calculation - will be refined by CalculationsManager
                total += value / 2;
            }
        });
        
        return total;
    }

    getTotalHindrancePoints() {
        return this.character.hindrances.reduce((total, hindrance) => total + hindrance.points, 0);
    }

    isCharacterComplete() {
        // Basic completeness check
        const summary = this.getCharacterSummary();
        
        return (
            summary.name.length > 0 &&
            summary.concept.length > 0 &&
            summary.totalAttributePoints <= 5 &&
            summary.hindrancePoints <= 4
        );
    }

    // Debug methods
    debugCharacter() {
        console.log('Current Character State:', this.character);
        console.log('Character Summary:', this.getCharacterSummary());
        console.log('History Length:', this.history.length);
        console.log('Change Listeners:', this.changeListeners.length);
    }
}
