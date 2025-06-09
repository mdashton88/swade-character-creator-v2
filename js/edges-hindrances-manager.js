// edges-hindrances-manager.js
// New module for enhanced edges and hindrances functionality

export class EdgesHindrancesManager {
    constructor() {
    console.log('=== EdgesHindrancesManager constructor called ===');
    this.hindrancePoints = 0;
    this.edgePoints = 0;
    this.maxHindrancePoints = 4;
    this.selectedHindrances = new Set();
    this.selectedEdges = new Set();
    this.edgesData = null;
    
    console.log('Constructor finished, calling init...');
    // Initialize
    this.init();
}

async init() {
    console.log('=== EdgesHindrancesManager init called ===');
    await this.loadEdgesData();
    console.log('Data loaded, calling updateDisplays...');
    this.updateDisplays();
    console.log('Displays updated, calling setupEventListeners...');
    this.setupEventListeners();
    console.log('Event listeners set up');
    
    // Enhance existing edges if they're already populated
    setTimeout(() => {
        console.log('Enhancing existing edges...');
        this.enhanceExistingEdges();
    }, 1000);
}

    async loadEdgesData() {
        try {
            const response = await fetch('./data/edges.json');
            this.edgesData = await response.json();
            console.log('Edges data loaded:', this.edgesData);
        } catch (error) {
            console.error('Error loading edges data:', error);
        }
    }

    updateDisplays() {
        // Update the point displays
        const hindrancePointsSpan = document.getElementById('hindrance-points');
        const edgePointsSpan = document.getElementById('edge-points');
        
        if (hindrancePointsSpan) {
            hindrancePointsSpan.textContent = this.hindrancePoints;
        }
        if (edgePointsSpan) {
            edgePointsSpan.textContent = this.edgePoints;
        }

        // Also update old format displays if they exist (for compatibility)
        this.updateCompatibilityDisplays();
    }

    updateCompatibilityDisplays() {
        // Update old-style info displays for compatibility with existing code
        const hindranceInfo = document.getElementById('hindranceInfo');
        const edgeInfo = document.getElementById('edgeInfo');
        
        if (hindranceInfo && !hindranceInfo.querySelector('span')) {
            // If it's the old format, don't interfere
            return;
        }
    }

setupEventListeners() {
    console.log('Setting up event listeners for EdgesHindrancesManager');
    
    // Listen for changes on existing edge/hindrance checkboxes
    document.addEventListener('change', (e) => {
        console.log('=== CHANGE EVENT DETECTED ===');
        console.log('Event target:', e.target);
        console.log('Target type:', e.target.type);
        console.log('Target tagName:', e.target.tagName);
        
        if (e.target.type === 'checkbox') {
            console.log('Checkbox change confirmed');
            
            const item = e.target.closest('.checkbox-item');
            console.log('Closest checkbox-item found:', item);
            
            if (item) {
                const hindrancesList = item.closest('#hindrancesList');
                const edgesList = item.closest('#edgesList');
                
                console.log('In hindrancesList:', hindrancesList);
                console.log('In edgesList:', edgesList);
                
                if (hindrancesList) {
                    console.log('Calling handleHindranceChange');
                    this.handleHindranceChange(e.target, item);
                } else if (edgesList) {
                    console.log('Calling handleEdgeChange');
                    this.handleEdgeChange(e.target, item);
                } else {
                    console.log('Item not in expected container');
                }
            } else {
                console.log('No checkbox-item parent found');
            }
        } else {
            console.log('Not a checkbox, ignoring');
        }
    });

    // Setup remove button event delegation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.preventDefault();
            e.stopPropagation();
            this.handleRemoveClick(e.target);
        }
    });
}

    handleHindranceChange(checkbox, item) {
    console.log('=== handleHindranceChange called ===');
    console.log('Checkbox checked:', checkbox.checked);
    console.log('Item:', item);
    
    if (checkbox.checked) {
        console.log('Calling selectHindrance...');
        this.selectHindrance(item);
    } else {
        console.log('Handling deselection...');
        // Handle deselection by finding and removing the selected item
        const hindranceId = item.dataset.id || this.getItemId(item);
        console.log('Unchecking hindrance:', hindranceId);
        
        const selectedItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
        if (selectedItem) {
            const points = parseInt(selectedItem.dataset.points);
            console.log('Found selected item, removing with points:', points);
            this.removeHindrance(hindranceId, points);
        } else {
            console.log('No selected item found for:', hindranceId);
        }
    }
}

    handleEdgeChange(checkbox, item) {
        if (checkbox.checked) {
            this.selectEdge(item);
        } else {
            this.deselectEdge(item);
        }
    }

    selectHindrance(item) {
    console.log('=== selectHindrance called ===');
    console.log('Item received:', item);
    
    const hindranceId = item.dataset.id || this.getItemId(item);
        const points = parseInt(item.dataset.points) || this.getHindrancePoints(item);
        
        if (this.hindrancePoints + points <= this.maxHindrancePoints && !this.selectedHindrances.has(hindranceId)) {
            this.hindrancePoints += points;
            this.edgePoints += points;
            this.selectedHindrances.add(hindranceId);
            
            // Move to selected panel
            this.moveHindranceToSelected(item, hindranceId, points);
            
            // Hide from available
            item.style.display = 'none';
            
            this.updateDisplays();
        } else {
            // Can't select - uncheck the box
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
            
            if (this.hindrancePoints + points > this.maxHindrancePoints) {
                alert(`Cannot add hindrance. You can only take up to ${this.maxHindrancePoints} hindrance points.`);
            }
        }
    }

    selectEdge(item) {
        const edgeId = item.dataset.id || this.getItemId(item);
        const cost = parseInt(item.dataset.cost) || 2; // Standard edge cost
        
        if (this.edgePoints >= cost && !this.selectedEdges.has(edgeId)) {
            this.edgePoints -= cost;
            this.selectedEdges.add(edgeId);
            
            // Move to selected panel
            this.moveEdgeToSelected(item, edgeId, cost);
            
            // Hide from available
            item.style.display = 'none';
            
            this.updateDisplays();
        } else {
            // Can't select - uncheck the box
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
            
            if (this.edgePoints < cost) {
                alert(`Cannot add edge. You need ${cost} points but only have ${this.edgePoints}.`);
            }
        }
    }

  moveHindranceToSelected(sourceItem, hindranceId, points) {
    console.log('moveHindranceToSelected called:', hindranceId, points);
    
    const targetContainer = document.getElementById('selected-hindrances');
    console.log('Target container found:', targetContainer);
    
    if (!targetContainer) {
        console.error('ERROR: selected-hindrances container not found!');
        return;
    }

    const selectedItem = this.createSelectedItem(sourceItem, hindranceId, points, 'hindrance');
    console.log('Created selected item:', selectedItem);
    
    targetContainer.appendChild(selectedItem);
    console.log('Appended item to container');
    
    // Double-check it was added
    console.log('Container now has children:', targetContainer.children.length);
}

    moveEdgeToSelected(sourceItem, edgeId, cost) {
        const targetContainer = document.getElementById('selected-edges');
        if (!targetContainer) return;

        const selectedItem = this.createSelectedItem(sourceItem, edgeId, cost, 'edge');
        targetContainer.appendChild(selectedItem);
    }

    createSelectedItem(sourceItem, itemId, points, type) {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.dataset.id = itemId;
        selectedItem.dataset.type = type;
        selectedItem.dataset.points = points;

        // Copy content with identical formatting
        const title = sourceItem.querySelector('.checkbox-title')?.textContent || 'Unknown';
        const description = sourceItem.querySelector('.checkbox-description')?.textContent || '';
        const meta = sourceItem.querySelector('.checkbox-meta')?.textContent || `${points} points`;

        selectedItem.innerHTML = `
            <div class="checkbox-content">
                <div class="checkbox-title">${title}</div>
                <div class="checkbox-description">${description}</div>
                <div class="checkbox-meta">${meta}</div>
                <button class="remove-btn" data-item-id="${itemId}" data-type="${type}" data-points="${points}">
                    Remove
                </button>
            </div>
        `;

        return selectedItem;
    }

    handleRemoveClick(removeBtn) {
        const itemId = removeBtn.dataset.itemId;
        const type = removeBtn.dataset.type;
        const points = parseInt(removeBtn.dataset.points);

        if (type === 'hindrance') {
            this.removeHindrance(itemId, points);
        } else if (type === 'edge') {
            this.removeEdge(itemId, points);
        }
    }

    removeHindrance(hindranceId, points) {
        // Update points
        this.hindrancePoints -= points;
        this.edgePoints -= points;
        this.selectedHindrances.delete(hindranceId);

        // Remove from selected panel
        const selectedItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
        if (selectedItem) {
            selectedItem.remove();
        }

        // Show in available panel
        const availableItem = document.querySelector(`#hindrancesList [data-id="${hindranceId}"]`);
        if (availableItem) {
            availableItem.style.display = 'block';
            const checkbox = availableItem.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        }

        this.updateDisplays();
    }

    removeEdge(edgeId, cost) {
        // Update points
        this.edgePoints += cost;
        this.selectedEdges.delete(edgeId);

        // Remove from selected panel
        const selectedItem = document.querySelector(`#selected-edges [data-id="${edgeId}"]`);
        if (selectedItem) {
            selectedItem.remove();
        }

        // Show in available panel
        const availableItem = document.querySelector(`#edgesList [data-id="${edgeId}"]`);
        if (availableItem) {
            availableItem.style.display = 'block';
            const checkbox = availableItem.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        }

        this.updateDisplays();
    }

    // Helper methods
    getItemId(item) {
        // Try to extract ID from various sources
        const title = item.querySelector('.checkbox-title')?.textContent;
        return title || `item-${Date.now()}`;
    }

    getHindrancePoints(item) {
        // Try to extract points from meta text
        const meta = item.querySelector('.checkbox-meta')?.textContent;
        if (meta && meta.includes('Major')) return 2;
        if (meta && meta.includes('Minor')) return 1;
        return 1; // Default
    }

    enhanceExistingEdges() {
        // If edges are already populated by existing code, enhance them
        const edgeItems = document.querySelectorAll('#edgesList .checkbox-item');
        edgeItems.forEach(item => {
            if (!item.dataset.enhanced) {
                // Add any missing data attributes
                if (!item.dataset.id) {
                    item.dataset.id = this.getItemId(item);
                }
                if (!item.dataset.cost) {
                    item.dataset.cost = '2'; // Standard edge cost
                }
                item.dataset.enhanced = 'true';
            }
        });

        // Do the same for hindrances
        const hindranceItems = document.querySelectorAll('#hindrancesList .checkbox-item');
        hindranceItems.forEach(item => {
            if (!item.dataset.enhanced) {
                if (!item.dataset.id) {
                    item.dataset.id = this.getItemId(item);
                }
                if (!item.dataset.points) {
                    item.dataset.points = this.getHindrancePoints(item);
                }
                item.dataset.enhanced = 'true';
            }
        });
    }

    // Public methods for integration with existing code
    clearAllHindrances() {
        // Clear selected hindrances
        const selectedContainer = document.getElementById('selected-hindrances');
        if (selectedContainer) {
            selectedContainer.innerHTML = '';
        }

        // Reset points
        const oldHindrancePoints = this.hindrancePoints;
        this.hindrancePoints = 0;
        this.edgePoints -= oldHindrancePoints;
        this.selectedHindrances.clear();

        // Show all available hindrances
        const availableItems = document.querySelectorAll('#hindrancesList .checkbox-item');
        availableItems.forEach(item => {
            item.style.display = 'block';
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        });

        this.updateDisplays();
    }

    clearAllEdges() {
        // Calculate points to return
        let pointsToReturn = 0;
        this.selectedEdges.forEach(edgeId => {
            const selectedItem = document.querySelector(`#selected-edges [data-id="${edgeId}"]`);
            if (selectedItem) {
                pointsToReturn += parseInt(selectedItem.dataset.points || '2');
            }
        });

        // Clear selected edges
        const selectedContainer = document.getElementById('selected-edges');
        if (selectedContainer) {
            selectedContainer.innerHTML = '';
        }

        // Reset data
        this.edgePoints += pointsToReturn;
        this.selectedEdges.clear();

        // Show all available edges
        const availableItems = document.querySelectorAll('#edgesList .checkbox-item');
        availableItems.forEach(item => {
            item.style.display = 'block';
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        });

        this.updateDisplays();
    }

    // Get current state for saving/loading
    getState() {
        return {
            hindrancePoints: this.hindrancePoints,
            edgePoints: this.edgePoints,
            selectedHindrances: Array.from(this.selectedHindrances),
            selectedEdges: Array.from(this.selectedEdges)
        };
    }

    setState(state) {
        this.hindrancePoints = state.hindrancePoints || 0;
        this.edgePoints = state.edgePoints || 0;
        this.selectedHindrances = new Set(state.selectedHindrances || []);
        this.selectedEdges = new Set(state.selectedEdges || []);
        this.updateDisplays();
    }
}

// Global functions for button clicks
window.clearHindrances = function() {
    if (window.edgesHindrancesManager) {
        window.edgesHindrancesManager.clearAllHindrances();
    }
};

window.clearEdges = function() {
    if (window.edgesHindrancesManager) {
        window.edgesHindrancesManager.clearAllEdges();
    }
};

export default EdgesHindrancesManager;
