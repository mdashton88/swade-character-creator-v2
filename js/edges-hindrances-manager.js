// edges-hindrances-manager.js
// Complete working version for enhanced edges and hindrances functionality

export default class EdgesHindrancesManager {
    constructor() {
        console.log('=== EdgesHindrancesManager constructor called ===');
        this.hindrancePoints = 0;
        this.edgePoints = 0;
        this.maxHindrancePoints = 4;
        this.selectedHindrances = new Set();
        this.selectedEdges = new Set();
        this.edgesData = null;
        
        console.log('Constructor finished, calling init...');
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
            const data = await response.json();
            this.edgesData = data;
            console.log('Edges data loaded:', data);
        } catch (error) {
            console.error('Failed to load edges data:', error);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners for EdgesHindrancesManager');
        
        // Wait for other managers to finish, then attach our listeners
        setTimeout(() => {
            this.attachDirectListeners();
        }, 2000);

        // Setup remove button event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleRemoveClick(e.target);
            }
        });
    }

    attachDirectListeners() {
        console.log('Attaching direct listeners to checkboxes...');
        
        // Find all hindrance checkboxes and attach listeners directly
        const hindranceCheckboxes = document.querySelectorAll('#hindrancesList input[type="checkbox"]');
        console.log('Found hindrance checkboxes:', hindranceCheckboxes.length);
        
        hindranceCheckboxes.forEach((checkbox, index) => {
            console.log(`Attaching listener to hindrance checkbox ${index}`);
            
            // Remove any existing listeners first
            checkbox.removeEventListener('change', this.handleHindranceChangeWrapper);
            
            // Create a bound wrapper function
            this.handleHindranceChangeWrapper = (e) => {
                console.log('=== DIRECT HINDRANCE CHECKBOX EVENT ===');
                e.stopPropagation();
                
                const item = e.target.closest('.checkbox-item');
                if (item) {
                    console.log('Calling handleHindranceChange');
                    this.handleHindranceChange(e.target, item);
                }
            };
            
            checkbox.addEventListener('change', this.handleHindranceChangeWrapper);
        });
        
        // Do the same for edges
        const edgeCheckboxes = document.querySelectorAll('#edgesList input[type="checkbox"]');
        console.log('Found edge checkboxes:', edgeCheckboxes.length);
        
        edgeCheckboxes.forEach((checkbox, index) => {
            console.log(`Attaching listener to edge checkbox ${index}`);
            
            checkbox.removeEventListener('change', this.handleEdgeChangeWrapper);
            
            this.handleEdgeChangeWrapper = (e) => {
                console.log('=== DIRECT EDGE CHECKBOX EVENT ===');
                e.stopPropagation();
                
                const item = e.target.closest('.checkbox-item');
                if (item) {
                    this.handleEdgeChange(e.target, item);
                }
            };
            
            checkbox.addEventListener('change', this.handleEdgeChangeWrapper);
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
        console.log('=== handleEdgeChange called ===');
        
        if (checkbox.checked) {
            this.selectEdge(item);
        } else {
            const edgeId = item.dataset.id || this.getItemId(item);
            const selectedItem = document.querySelector(`#selected-edges [data-id="${edgeId}"]`);
            if (selectedItem) {
                const cost = parseInt(selectedItem.dataset.points || '2');
                this.removeEdge(edgeId, cost);
            }
        }
    }

    selectHindrance(item) {
        console.log('=== selectHindrance called ===');
        console.log('Item received:', item);
        
        const hindranceId = item.dataset.id || this.getItemId(item);
        const points = parseInt(item.dataset.points) || this.getHindrancePoints(item);
        
        console.log('Processing hindrance:', hindranceId, 'Points:', points);

        // Check if we can add this hindrance
        if (this.hindrancePoints + points > this.maxHindrancePoints) {
            alert(`Cannot add hindrance. Would exceed maximum of ${this.maxHindrancePoints} points.`);
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
            return;
        }

        // Update points and tracking
        this.hindrancePoints += points;
        this.edgePoints += points;
        this.selectedHindrances.add(hindranceId);

        console.log('Updated points - Hindrance:', this.hindrancePoints, 'Edge:', this.edgePoints);

        // Move to selected panel
        this.moveHindranceToSelected(item, hindranceId, points);

        // Hide from available panel
        item.style.display = 'none';

        // Update displays
        this.updateDisplays();
    }

    selectEdge(item) {
        const edgeId = item.dataset.id || this.getItemId(item);
        const cost = parseInt(item.dataset.points || '2');

        // Check if we have enough edge points
        if (this.edgePoints < cost) {
            alert(`Cannot add edge. Requires ${cost} edge points but you only have ${this.edgePoints}.`);
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
            return;
        }

        // Update points and tracking
        this.edgePoints -= cost;
        this.selectedEdges.add(edgeId);

        // Move to selected panel
        this.moveEdgeToSelected(item, edgeId, cost);

        // Hide from available panel
        item.style.display = 'none';

        // Update displays
        this.updateDisplays();
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
        console.log('Creating selected item:', itemId, points, type);
        
        // Get item details from source
        const title = sourceItem.querySelector('.checkbox-title')?.textContent || itemId;
        const description = sourceItem.querySelector('.checkbox-description')?.textContent || '';
        const requirements = sourceItem.querySelector('.requirements')?.textContent || '';
        const itemType = sourceItem.querySelector('.type')?.textContent || '';

        // Create the selected item with identical formatting
        const selectedDiv = document.createElement('div');
        selectedDiv.className = 'checkbox-item selected-item';
        selectedDiv.dataset.id = itemId;
        selectedDiv.dataset.points = points;
        selectedDiv.dataset.type = type;

        selectedDiv.innerHTML = `
            <div class="checkbox-content">
                <div class="checkbox-title">${title}</div>
                ${description ? `<div class="checkbox-description">${description}</div>` : ''}
                ${requirements ? `<div class="requirements">${requirements}</div>` : ''}
                ${itemType ? `<div class="type">${itemType}</div>` : ''}
                <button class="remove-btn" data-item-id="${itemId}" data-type="${type}" data-points="${points}">
                    Remove
                </button>
            </div>
        `;

        console.log('Created selected item HTML:', selectedDiv.outerHTML);
        return selectedDiv;
    }

    removeHindrance(hindranceId, points) {
        console.log(`Removing hindrance: ${hindranceId}, points: ${points}`);
        console.log(`Before removal - Hindrance points: ${this.hindrancePoints}, Edge points: ${this.edgePoints}`);
        
        // Update points
        this.hindrancePoints -= points;
        this.edgePoints -= points;
        this.selectedHindrances.delete(hindranceId);

        console.log(`After removal - Hindrance points: ${this.hindrancePoints}, Edge points: ${this.edgePoints}`);

        // Remove from selected panel
        const selectedItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
        if (selectedItem) {
            selectedItem.remove();
            console.log('Removed from selected panel');
        }

        // Show in available panel
        const availableItem = document.querySelector(`#hindrancesList [data-id="${hindranceId}"]`);
        if (availableItem) {
            availableItem.style.display = 'block';
            const checkbox = availableItem.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
                console.log('Unchecked checkbox in available panel');
            }
        }

        // Force update displays
        console.log('Calling updateDisplays()');
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
            if (checkbox) {
                checkbox.checked = false;
            }
        }

        // Update displays
        this.updateDisplays();
    }

    handleRemoveClick(button) {
        console.log('Remove button clicked:', button);
        
        const itemId = button.dataset.itemId;
        const type = button.dataset.type;
        const points = parseInt(button.dataset.points);

        if (type === 'hindrance') {
            this.removeHindrance(itemId, points);
        } else if (type === 'edge') {
            this.removeEdge(itemId, points);
        }
    }

    updateDisplays() {
        console.log('updateDisplays called - Hindrance points:', this.hindrancePoints, 'Edge points:', this.edgePoints);
        
        // Update the point displays
        const hindrancePointsSpan = document.getElementById('hindrance-points');
        const edgePointsSpan = document.getElementById('edge-points');
        
        console.log('hindrance-points element:', hindrancePointsSpan);
        console.log('edge-points element:', edgePointsSpan);
        
        if (hindrancePointsSpan) {
            hindrancePointsSpan.textContent = this.hindrancePoints;
            console.log('Updated hindrance points display to:', this.hindrancePoints);
        } else {
            console.log('ERROR: hindrance-points element not found!');
        }
        
        if (edgePointsSpan) {
            edgePointsSpan.textContent = this.edgePoints;
            console.log('Updated edge points display to:', this.edgePoints);
        } else {
            console.log('ERROR: edge-points element not found!');
        }

        // Also update old format displays if they exist (for compatibility)
        this.updateCompatibilityDisplays();
    }

    updateCompatibilityDisplays() {
        // Update old-style displays that might still exist
        const hindranceInfo = document.getElementById('hindranceInfo');
        const edgeInfo = document.getElementById('edgeInfo');
        
        if (hindranceInfo) {
            hindranceInfo.textContent = `Hindrance Points: ${this.hindrancePoints} of 4`;
        }
        
        if (edgeInfo) {
            edgeInfo.textContent = `Available Edge Points: ${this.edgePoints}`;
        }
    }

    getItemId(item) {
        // Helper to extract ID from item
        const titleElement = item.querySelector('.checkbox-title');
        return titleElement ? titleElement.textContent.trim() : 'unknown';
    }

    getHindrancePoints(item) {
        // Helper to determine hindrance points based on section
        const section = item.closest('.hindrance-section-header');
        if (section && section.textContent.includes('Major')) {
            return 2;
        }
        return 1; // Minor hindrance
    }

    enhanceExistingEdges() {
        // Add any enhancements to existing edges/hindrances if needed
        console.log('Enhancing existing edges/hindrances...');
        
        // Mark items as enhanced to avoid duplicate processing
        const items = document.querySelectorAll('#hindrancesList .checkbox-item, #edgesList .checkbox-item');
        items.forEach(item => {
            if (!item.dataset.enhanced) {
                item.dataset.enhanced = 'true';
            }
        });
    }

    // Utility methods for external integration
    clearHindrances() {
        this.selectedHindrances.forEach(hindranceId => {
            const selectedItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
            if (selectedItem) {
                const points = parseInt(selectedItem.dataset.points);
                this.removeHindrance(hindranceId, points);
            }
        });
    }

    clearEdges() {
        this.selectedEdges.forEach(edgeId => {
            const selectedItem = document.querySelector(`#selected-edges [data-id="${edgeId}"]`);
            if (selectedItem) {
                const cost = parseInt(selectedItem.dataset.points || '2');
                this.removeEdge(edgeId, cost);
            }
        });
    }

    getSelectedHindrances() {
        return Array.from(this.selectedHindrances);
    }

    getSelectedEdges() {
        return Array.from(this.selectedEdges);
    }

    getHindrancePointsUsed() {
        return this.hindrancePoints;
    }

    getEdgePointsAvailable() {
        return this.edgePoints;
    }
}

// Make clear functions globally available for HTML onclick handlers
window.clearHindrances = function() {
    if (window.edgesHindrancesManager) {
        window.edgesHindrancesManager.clearHindrances();
    }
};

window.clearEdges = function() {
    if (window.edgesHindrancesManager) {
        window.edgesHindrancesManager.clearEdges();
    }
};
