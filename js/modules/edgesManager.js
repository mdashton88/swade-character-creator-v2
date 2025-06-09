// SWADE Character Creator v2 - Edges Manager Module

export class EdgesManager {
    constructor(dataManager, characterManager, calculationsManager, uiManager) {
        this.dataManager = dataManager;
        this.characterManager = characterManager;
        this.calculationsManager = calculationsManager;
        this.uiManager = uiManager;
        this.hindrancesManager = null; // Will be set by main app
        
        this.edgeControls = new Map();
        this.currentFilter = 'all';
    }

    setHindrancesManager(hindrancesManager) {
        this.hindrancesManager = hindrancesManager;
    }

    async initializeUI() {
        this.createEdgesList();
        this.createFilterControls();
        this.updateDisplay();
    }

    createFilterControls() {
        const container = document.getElementById('edgesList');
        const filterContainer = this.uiManager.createElement('div', 'edge-filters');
        
        const categories = this.dataManager.getEdgeCategories();
        const allOption = { all: 'All Edges' };
        const filterOptions = { ...allOption, ...categories };
        
        const filterSelect = this.uiManager.createSelect(
            Object.entries(filterOptions).map(([value, text]) => ({ value, text })),
            'edge-filter-select',
            'all'
        );
        
        filterSelect.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.createEdgesList();
            this.updateDisplay();
        });
        
        const filterLabel = this.uiManager.createElement('label', 'filter-label', 'Filter by category:');
        filterLabel.appendChild(filterSelect);
        
        filterContainer.appendChild(filterLabel);
        container.insertBefore(filterContainer, container.firstChild);
    }

    createEdgesList() {
        const container = document.getElementById('edgesList');
        
        // Remove existing list but keep filter controls
        const existingList = container.querySelector('.edges-list-content');
        if (existingList) {
            existingList.remove();
        }
        
        const listContainer = this.uiManager.createElement('div', 'edges-list-content');
        this.edgeControls.clear();
        
        const edges = this.dataManager.getEdges();
        const character = this.characterManager.getCharacter();
        
        // Filter edges by category
        const filteredEdges = this.currentFilter === 'all' 
            ? edges 
            : this.dataManager.getEdgesByType(this.currentFilter);
        
        // Group edges by type for better organization
        const groupedEdges = {};
        const categories = this.dataManager.getEdgeCategories();
        
        Object.entries(filteredEdges).forEach(([name, data]) => {
            const category = data.type;
            if (!groupedEdges[category]) {
                groupedEdges[category] = {};
            }
            groupedEdges[category][name] = data;
        });
        
        // Create sections for each category
        Object.entries(groupedEdges).forEach(([category, categoryEdges]) => {
            if (Object.keys(categoryEdges).length === 0) return;
            
            const categoryName = categories[category] || category;
            const sectionHeader = this.uiManager.createElement('h4', 'edge-section-header', categoryName);
            listContainer.appendChild(sectionHeader);
            
            // Sort alphabetically
            const sortedEdges = Object.entries(categoryEdges)
                .sort(([a], [b]) => a.localeCompare(b));
            
            sortedEdges.forEach(([name, data]) => {
                const isSelected = character.edges.includes(name);
                const validation = this.calculationsManager.validateEdgeRequirements(character, name);
                const canTake = this.canTakeEdge(character, name);
                const isAvailable = isSelected || (validation.valid && canTake);
                
                let meta = `${data.type.toUpperCase()}`;
                if (data.requirements) {
                    meta += ` • ${data.requirements}`;
                }
                
                // Add validation info if not valid
                if (!validation.valid && !isSelected) {
                    meta += ` • ❌ ${validation.reason}`;
                }
                
                const control = this.uiManager.createCheckboxItem(
                    name,
                    data.description,
                    meta,
                    isSelected,
                    isAvailable,
                    (checked) => this.onEdgeChange(name, data, checked)
                );
                
                // Add special styling for unavailable edges
                if (!isAvailable) {
                    this.uiManager.addClass(control.container, 'requirements-not-met');
                }
                
                this.edgeControls.set(name, control);
                listContainer.appendChild(control.container);
            });
        });
        
        container.appendChild(listContainer);
    }

    onEdgeChange(name, data, isChecked) {
        const character = this.characterManager.getCharacter();
        
        if (isChecked) {
            // Check if we can take this edge
            if (!this.canTakeEdge(character, name)) {
                const control = this.edgeControls.get(name);
                if (control) {
                    control.setSelected(false);
                }
                
                const available = this.calculationsManager.getAvailableEdges(character);
                this.uiManager.showNotification(
                    `Cannot take more edges! You have ${available.remaining} edge${available.remaining !== 1 ? 's' : ''} remaining.`, 
                    'warning'
                );
                return;
            }
            
            // Check requirements
            const validation = this.calculationsManager.validateEdgeRequirements(character, name);
            if (!validation.valid) {
                const control = this.edgeControls.get(name);
                if (control) {
                    control.setSelected(false);
                }
                
                this.uiManager.showNotification(`Cannot take ${name}: ${validation.reason}`, 'warning');
                return;
            }
            
            this.characterManager.addEdge(name);
            this.uiManager.showNotification(`Added edge: ${name}`, 'success', 2000);
        } else {
            this.characterManager.removeEdge(name);
            this.uiManager.showNotification(`Removed edge: ${name}`, 'info', 2000);
        }
        
        // Update displays
        this.updateAvailability();
        this.updateSelectedSummary();
        this.updatePointsDisplay();
    }

    canTakeEdge(character, edgeName) {
        // Check if already selected
        if (character.edges.includes(edgeName)) {
            return true; // Already selected, so available for deselection
        }
        
        // Check edge limits
        const available = this.calculationsManager.getAvailableEdges(character);
        if (available.remaining <= 0) {
            return false;
        }
        
        // Check for prerequisite edges
        const conflicts = this.getConflictingEdges(edgeName);
        const hasConflict = character.edges.some(edge => conflicts.includes(edge));
        
        if (hasConflict) {
            return false;
        }
        
        return true;
    }

    getConflictingEdges(edgeName) {
        // Define edge conflicts (edges that can't be taken together)
        const conflicts = {
            'Luck': ['Bad Luck'],
            'Bad Luck': ['Luck', 'Great Luck'],
            'Great Luck': ['Bad Luck'],
            'Quick': ['Hesitant'],
            'Hesitant': ['Quick'],
            'Pacifist (Minor)': ['Bloodthirsty', 'Assassin'],
            'Pacifist (Major)': ['Bloodthirsty', 'Assassin', 'Pacifist (Minor)'],
            'Bloodthirsty': ['Pacifist (Minor)', 'Pacifist (Major)'],
            // Add more conflicts as needed
        };
        
        return conflicts[edgeName] || [];
    }

    updateDisplay() {
        this.updateAvailability();
        this.updateSelectedSummary();
        this.updatePointsDisplay();
    }

    updateAvailability() {
        const character = this.characterManager.getCharacter();
        
        this.edgeControls.forEach((control, name) => {
            const isSelected = character.edges.includes(name);
            const validation = this.calculationsManager.validateEdgeRequirements(character, name);
            const canTake = this.canTakeEdge(character, name);
            const isAvailable = isSelected || (validation.valid && canTake);
            
            control.setSelected(isSelected);
            control.setAvailable(isAvailable);
            
            // Update styling based on requirements
            if (!validation.valid && !isSelected) {
                this.uiManager.addClass(control.container, 'requirements-not-met');
            } else {
                this.uiManager.removeClass(control.container, 'requirements-not-met');
            }
        });
    }

    updateSelectedSummary() {
        const character = this.characterManager.getCharacter();
        const selectedContainer = document.getElementById('selectedEdges');
        
        if (character.edges.length === 0) {
            selectedContainer.innerHTML = '[None selected]';
            return;
        }
        
        // Group by category
        const categories = this.dataManager.getEdgeCategories();
        const byCategory = {};
        
        character.edges.forEach(edgeName => {
            const edgeData = this.dataManager.getEdgeByName(edgeName);
            const category = edgeData ? edgeData.type : 'unknown';
            const categoryName = categories[category] || category;
            
            if (!byCategory[categoryName]) {
                byCategory[categoryName] = [];
            }
            
            byCategory[categoryName].push({
                name: edgeName,
                data: edgeData
            });
        });
        
        let html = '';
        
        Object.entries(byCategory).forEach(([categoryName, edges]) => {
            html += `<div class="selected-group">`;
            html += `<strong>${categoryName}:</strong><br>`;
            
            edges.forEach(edge => {
                html += `<div class="selected-item">`;
                html += `<span class="selected-name">${edge.name}</span>`;
                if (edge.data) {
                    html += `<div class="selected-description">${edge.data.description}</div>`;
                    if (edge.data.requirements) {
                        html += `<div class="selected-requirements">Requirements: ${edge.data.requirements}</div>`;
                    }
                }
                html += `</div>`;
            });
            
            html += `</div>`;
        });
        
        selectedContainer.innerHTML = html;
    }

    updatePointsDisplay() {
        const character = this.characterManager.getCharacter();
        const available = this.calculationsManager.getAvailableEdges(character);
        
        const infoElement = document.getElementById('edgeInfo');
        if (infoElement) {
            let text = `Available Edges: ${available.base} (base)`;
            
            if (available.fromHindrances > 0) {
                text += ` + ${available.fromHindrances} (from Hindrances)`;
            }
            
            text += ` = ${available.total} total`;
            
            if (available.used > 0) {
                text += ` | Used: ${available.used}`;
                
                if (available.remaining > 0) {
                    text += ` | Remaining: ${available.remaining}`;
                } else if (available.remaining < 0) {
                    text += ` | ⚠️ Over limit by ${Math.abs(available.remaining)}!`;
                }
            }
            
            infoElement.textContent = text;
            
            // Color code based on usage
            infoElement.className = 'points-info';
            if (available.remaining < 0) {
                this.uiManager.addClass(infoElement, 'over-limit');
            } else if (available.remaining === 0) {
                this.uiManager.addClass(infoElement, 'at-limit');
            }
        }
    }

    // Randomization support
    randomizeEdges() {
        const character = this.characterManager.getCharacter();
        const available = this.calculationsManager.getAvailableEdges(character);
        
        // Clear existing edges
        [...character.edges].forEach(edge => {
            this.characterManager.removeEdge(edge);
        });
        
        const edges = this.dataManager.getEdges();
        const edgeList = Object.entries(edges);
        
        let edgesToTake = available.total;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (edgesToTake > 0 && attempts < maxAttempts) {
            attempts++;
            
            // Randomly select an edge
            const [name, data] = edgeList[Math.floor(Math.random() * edgeList.length)];
            
            // Check if we can take it
            const validation = this.calculationsManager.validateEdgeRequirements(character, name);
            if (validation.valid && 
                this.canTakeEdge(character, name) && 
                !character.edges.includes(name)) {
                
                this.characterManager.addEdge(name);
                edgesToTake--;
            }
        }
        
        this.uiManager.showNotification('Edges randomized!', 'success');
    }

    // Smart randomization based on character build
    smartRandomizeEdges() {
        const character = this.characterManager.getCharacter();
        const available = this.calculationsManager.getAvailableEdges(character);
        
        // Clear existing edges
        [...character.edges].forEach(edge => {
            this.characterManager.removeEdge(edge);
        });
        
        // Analyze character for smart suggestions
        const suggestions = this.getSmartEdgeSuggestions(character);
        
        let edgesToTake = available.total;
        let suggestionIndex = 0;
        
        // First, try suggested edges
        while (edgesToTake > 0 && suggestionIndex < suggestions.length) {
            const suggestion = suggestions[suggestionIndex];
            const validation = this.calculationsManager.validateEdgeRequirements(character, suggestion.name);
            
            if (validation.valid && this.canTakeEdge(character, suggestion.name)) {
                this.characterManager.addEdge(suggestion.name);
                edgesToTake--;
            }
            
            suggestionIndex++;
        }
        
        // Fill remaining slots randomly
        if (edgesToTake > 0) {
            const edges = this.dataManager.getEdges();
            const edgeList = Object.entries(edges);
            let attempts = 0;
            const maxAttempts = 50;
            
            while (edgesToTake > 0 && attempts < maxAttempts) {
                attempts++;
                
                const [name, data] = edgeList[Math.floor(Math.random() * edgeList.length)];
                const validation = this.calculationsManager.validateEdgeRequirements(character, name);
                
                if (validation.valid && 
                    this.canTakeEdge(character, name) && 
                    !character.edges.includes(name)) {
                    
                    this.characterManager.addEdge(name);
                    edgesToTake--;
                }
            }
        }
        
        this.uiManager.showNotification('Edges smartly randomized based on character build!', 'success');
    }

    getSmartEdgeSuggestions(character) {
        const suggestions = [];
        const edges = this.dataManager.getEdges();
        
        // Analyze attributes for suggestions
        const highAttributes = [];
        Object.entries(character.attributes).forEach(([attr, value]) => {
            if (value >= 8) {
                highAttributes.push(attr);
            }
        });
        
        // Analyze skills for suggestions
        const highSkills = [];
        Object.entries(character.skills).forEach(([skill, value]) => {
            if (value >= 6) {
                highSkills.push(skill);
            }
        });
        
        // Suggest edges based on high attributes
        Object.entries(edges).forEach(([name, data]) => {
            const requirements = data.requirements.toLowerCase();
            let score = 0;
            
            // Check if requirements match high attributes
            highAttributes.forEach(attr => {
                if (requirements.includes(attr)) {
                    score += 2;
                }
            });
            
            // Check if requirements match high skills
            highSkills.forEach(skill => {
                if (requirements.includes(skill.toLowerCase())) {
                    score += 3;
                }
            });
            
            // Bonus for background edges (easier to qualify for)
            if (data.type === 'background') {
                score += 1;
            }
            
            if (score > 0) {
                suggestions.push({ name, score, data });
            }
        });
        
        // Sort by score (highest first)
        return suggestions.sort((a, b) => b.score - a.score);
    }

    // Analysis methods
    getEdgesAnalysis(character) {
        const analysis = {
            total: character.edges.length,
            available: this.calculationsManager.getAvailableEdges(character),
            byCategory: {},
            requirements: {
                met: 0,
                unmet: 0
            }
        };
        
        const categories = this.dataManager.getEdgeCategories();
        
        character.edges.forEach(edgeName => {
            const edgeData = this.dataManager.getEdgeByName(edgeName);
            if (edgeData) {
                const category = categories[edgeData.type] || edgeData.type;
                if (!analysis.byCategory[category]) {
                    analysis.byCategory[category] = [];
                }
                
                const validation = this.calculationsManager.validateEdgeRequirements(character, edgeName);
                
                analysis.byCategory[category].push({
                    name: edgeName,
                    data: edgeData,
                    valid: validation.valid,
                    reason: validation.reason
                });
                
                if (validation.valid) {
                    analysis.requirements.met++;
                } else {
                    analysis.requirements.unmet++;
                }
            }
        });
        
        return analysis;
    }

    getEdgesForExport(character) {
        return character.edges.map(edgeName => {
            const data = this.dataManager.getEdgeByName(edgeName);
            return {
                name: edgeName,
                type: data ? data.type : 'unknown',
                requirements: data ? data.requirements : 'Unknown',
                description: data ? data.description : 'Unknown edge'
            };
        });
    }

    // Validation support
    validateEdges() {
        const character = this.characterManager.getCharacter();
        const errors = [];
        const warnings = [];
        
        const available = this.calculationsManager.getAvailableEdges(character);
        
        // Check edge limits
        if (available.remaining < 0) {
            errors.push(`Too many edges selected: ${available.used}/${available.total}`);
        }
        
        // Check individual edge requirements
        character.edges.forEach(edgeName => {
            const validation = this.calculationsManager.validateEdgeRequirements(character, edgeName);
            if (!validation.valid) {
                errors.push(`${edgeName}: ${validation.reason}`);
            }
            
            // Check if edge exists
            if (!this.dataManager.getEdgeByName(edgeName)) {
                warnings.push(`Unknown edge: ${edgeName}`);
            }
        });
        
        // Check for conflicts
        character.edges.forEach(edgeName => {
            const conflicts = this.getConflictingEdges(edgeName);
            const hasConflict = character.edges.some(edge => 
                edge !== edgeName && conflicts.includes(edge)
            );
            
            if (hasConflict) {
                errors.push(`${edgeName} conflicts with other selected edges`);
            }
        });
        
        return { errors, warnings };
    }

    // Filter and search functionality
    searchEdges(query) {
        const searchResults = this.dataManager.searchEdges(query);
        this.displaySearchResults(searchResults);
    }

    displaySearchResults(results) {
        // Implementation for search results display
        // Could be added to enhance the UI further
    }

    // Utility methods
    getEdgesByRequirement(requirement) {
        const edges = this.dataManager.getEdges();
        const matching = {};
        
        Object.entries(edges).forEach(([name, data]) => {
            if (data.requirements.toLowerCase().includes(requirement.toLowerCase())) {
                matching[name] = data;
            }
        });
        
        return matching;
    }

    getAvailableEdgesForCharacter(character) {
        const edges = this.dataManager.getEdges();
        const available = {};
        
        Object.entries(edges).forEach(([name, data]) => {
            const validation = this.calculationsManager.validateEdgeRequirements(character, name);
            if (validation.valid && this.canTakeEdge(character, name)) {
                available[name] = data;
            }
        });
        
        return available;
    }

    // Cleanup
    destroy() {
        this.edgeControls.clear();
    }
}
