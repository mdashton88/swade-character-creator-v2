// edges-hindrances-manager.js
// Independent version that maintains its own state

export default class EdgesHindrancesManager {
    constructor() {
        console.log('=== EdgesHindrancesManager constructor called ===');
        this.hindrancePoints = 0;
        this.edgePoints = 0;
        this.maxHindrancePoints = 4;
        this.selectedHindrances = new Map(); // Store full item data
        this.selectedEdges = new Map(); // Store full item data
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
        
        // Initial sync with existing system
        setTimeout(() => {
            console.log('Doing initial sync...');
            this.doInitialSync();
        }, 2000);
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
        
        // Make entire hindrance/edge containers clickable
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.checkbox-item');
            if (item) {
                const hindrancesList = item.closest('#hindrancesList');
                const edgesList = item.closest('#edgesList');
                
                if (hindrancesList) {
                    this.toggleHindrance(item);
                } else if (edgesList) {
                    this.toggleEdge(item);
                }
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
        
        // Hide all checkboxes since we don't need them anymore
        setTimeout(() => {
            this.hideCheckboxes();
        }, 1000);
    }

    hideCheckboxes() {
        // Hide checkboxes in both hindrances and edges lists
        const checkboxes = document.querySelectorAll('#hindrancesList input[type="checkbox"], #edgesList input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'none';
        });
        console.log('Hidden', checkboxes.length, 'checkboxes');
    }

    toggleHindrance(item) {
        console.log('=== toggleHindrance called ===');
        
        const hindranceId = item.dataset.id || this.getItemId(item);
        const isSelected = this.selectedHindrances.has(hindranceId);
        
        if (isSelected) {
            // Remove it
            console.log('Removing hindrance:', hindranceId);
            this.removeHindranceFromOurList(hindranceId);
            this.removeSelectedStyling(item);
        } else {
            // Add it
            console.log('Adding hindrance:', hindranceId);
            this.addHindranceToOurList(item, hindranceId);
        }
    }

    toggleEdge(item) {
        console.log('=== toggleEdge called ===');
        
        const edgeId = item.dataset.id || this.getItemId(item);
        const isSelected = this.selectedEdges.has(edgeId);
        
        if (isSelected) {
            // Remove it
            this.removeEdgeFromOurList(edgeId);
            this.removeSelectedStyling(item);
            item.style.display = 'block'; // Show it again
        } else {
            // Add it
            this.addEdgeToOurList(item, edgeId);
        }
    }

    addSelectedStyling(item) {
        // Add visual styling to show item is selected
        item.classList.add('selected');
        item.style.backgroundColor = '#e8f4fd';
        item.style.border = '2px solid #8b0000';
        item.style.cursor = 'pointer';
    }

    removeSelectedStyling(item) {
        // Remove visual styling
        item.classList.remove('selected');
        item.style.backgroundColor = '';
        item.style.border = '';
        item.style.cursor = 'pointer';
    }

    doInitialSync() {
        // Since we're hiding checkboxes, we start with a clean state
        // The user will click to select items as needed
        console.log('Starting with clean state - no checkboxes to sync');
        
        // Add clickable styling to all items
        this.addClickableStyling();
    }

    addClickableStyling() {
        // Make all hindrance and edge items look clickable
        const items = document.querySelectorAll('#hindrancesList .checkbox-item, #edgesList .checkbox-item');
        items.forEach(item => {
            item.style.cursor = 'pointer';
            item.style.transition = 'all 0.2s ease';
            item.style.border = '1px solid #dddddd';
            item.style.borderRadius = '4px';
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('selected')) {
                    item.style.backgroundColor = '#f0f0f0';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('selected')) {
                    item.style.backgroundColor = '';
                }
            });
        });
        
        console.log('Added clickable styling to', items.length, 'items');
    }



    addHindranceToOurList(item, hindranceId) {
        const points = parseInt(item.dataset.points) || this.getHindrancePoints(item);
        
        // Check if we can add this hindrance
        if (this.hindrancePoints + points > this.maxHindrancePoints) {
            alert(`Cannot add hindrance. Would exceed maximum of ${this.maxHindrancePoints} points.`);
            return;
        }

        // Store the item data
        this.selectedHindrances.set(hindranceId, {
            item: item,
            points: points,
            id: hindranceId
        });

        // Update points
        this.hindrancePoints += points;
        this.edgePoints += points;

        console.log('Added hindrance - Points:', this.hindrancePoints, 'Edge points:', this.edgePoints);

        // Add visual styling to show it's selected
        this.addSelectedStyling(item);

        // Add to our selected panel
        this.addToSelectedPanel(item, hindranceId, points, 'hindrance');
        this.updateDisplays();
    }

    addEdgeToOurList(item, edgeId) {
        const cost = parseInt(item.dataset.points || '2');

        // Check if we have enough edge points
        if (this.edgePoints < cost) {
            alert(`Cannot add edge. Requires ${cost} edge points but you only have ${this.edgePoints}.`);
            return;
        }

        // Store the item data
        this.selectedEdges.set(edgeId, {
            item: item,
            points: cost,
            id: edgeId
        });

        // Update points
        this.edgePoints -= cost;

        // Add visual styling
        this.addSelectedStyling(item);

        // Add to our selected panel
        this.addToSelectedPanel(item, edgeId, cost, 'edge');

        // Hide from available panel for edges
        item.style.display = 'none';

        this.updateDisplays();
    }

    removeHindranceFromOurList(hindranceId) {
        const hindranceData = this.selectedHindrances.get(hindranceId);
        if (!hindranceData) return;

        // Update points
        this.hindrancePoints -= hindranceData.points;
        this.edgePoints -= hindranceData.points;

        // Remove from our tracking
        this.selectedHindrances.delete(hindranceId);

        console.log('Removed hindrance - Points:', this.hindrancePoints, 'Edge points:', this.edgePoints);

        // Remove from our selected panel
        const selectedItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
        if (selectedItem) {
            selectedItem.remove();
        }

        this.updateDisplays();
    }

    removeEdgeFromOurList(edgeId) {
        const edgeData = this.selectedEdges.get(edgeId);
        if (!edgeData) return;

        // Update points
        this.edgePoints += edgeData.points;

        // Remove from our tracking
        this.selectedEdges.delete(edgeId);

        // Remove from our selected panel
        const selectedItem = document.querySelector(`#selected-edges [data-id="${edgeId}"]`);
        if (selectedItem) {
            selectedItem.remove();
        }

        // Show the original item again
        if (edgeData.item) {
            edgeData.item.style.display = 'block';
        }

        this.updateDisplays();
    }

    addToSelectedPanel(sourceItem, itemId, points, type) {
        const targetContainer = document.getElementById(type === 'hindrance' ? 'selected-hindrances' : 'selected-edges');
        if (!targetContainer) {
            console.error(`ERROR: ${type} container not found!`);
            return;
        }

        // Check if already exists
        const existingItem = document.querySelector(`#${targetContainer.id} [data-id="${itemId}"]`);
        if (existingItem) {
            console.log('Item already in selected panel, skipping');
            return;
        }

        const selectedItem = this.createSelectedItem(sourceItem, itemId, points, type);
        targetContainer.appendChild(selectedItem);
        
        console.log(`Added ${type} to selected panel:`, itemId);
    }

    createSelectedItem(sourceItem, itemId, points, type) {
        console.log('Creating selected item:', itemId, points, type);
        
        // Get item details from source
        const title = sourceItem.querySelector('.checkbox-title')?.textContent || itemId;
        const description = sourceItem.querySelector('.checkbox-description')?.textContent || '';
        const requirements = sourceItem.querySelector('.requirements')?.textContent || '';
        const itemType = sourceItem.querySelector('.type')?.textContent || '';
        const meta = sourceItem.querySelector('.checkbox-meta')?.textContent || '';

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
                ${meta ? `<div class="checkbox-meta">${meta}</div>` : ''}
                <button class="remove-btn" data-item-id="${itemId}" data-type="${type}" data-points="${points}">
                    Remove
                </button>
            </div>
        `;

        return selectedDiv;
    }

    handleRemoveClick(button) {
        console.log('Remove button clicked:', button);
        
        const itemId = button.dataset.itemId;
        const type = button.dataset.type;

        if (type === 'hindrance') {
            // First uncheck the checkbox in the main list
            const availableItem = document.querySelector(`#hindrancesList [data-id="${itemId}"]`);
            if (availableItem) {
                const checkbox = availableItem.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                    checkbox.click(); // This will trigger our processHindranceClick
                }
            }
            
            // Also remove directly in case the click doesn't work
            this.removeHindranceFromOurList(itemId);
        } else if (type === 'edge') {
            // For edges, uncheck the checkbox
            const availableItem = document.querySelector(`#edgesList [data-id="${itemId}"]`);
            if (availableItem) {
                const checkbox = availableItem.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                    checkbox.click();
                }
            }
            
            // Also remove directly
            this.removeEdgeFromOurList(itemId);
        }
    }

    updateDisplays() {
        console.log('updateDisplays called - Hindrance points:', this.hindrancePoints, 'Edge points:', this.edgePoints);
        
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
        // Helper to determine hindrance points based on meta info or section
        const meta = item.querySelector('.checkbox-meta');
        if (meta && meta.textContent.includes('MAJOR')) {
            return 2;
        }
        return 1; // Minor hindrance
    }

    // Utility methods for external integration
    clearHindrances() {
        // Clear all hindrances by unchecking them
        const hindranceIds = Array.from(this.selectedHindrances.keys());
        hindranceIds.forEach(hindranceId => {
            const availableItem = document.querySelector(`#hindrancesList [data-id="${hindranceId}"]`);
            if (availableItem) {
                const checkbox = availableItem.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                    checkbox.click();
                }
            }
        });
    }

    clearEdges() {
        // Clear all edges
        const edgeIds = Array.from(this.selectedEdges.keys());
        edgeIds.forEach(edgeId => {
            this.removeEdgeFromOurList(edgeId);
        });
    }

    getSelectedHindrances() {
        return Array.from(this.selectedHindrances.keys());
    }

    getSelectedEdges() {
        return Array.from(this.selectedEdges.keys());
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
