// edges-hindrances-manager.js
// Compatible version that works alongside existing managers

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
        
        // Start monitoring the existing system
        setTimeout(() => {
            console.log('Starting to monitor existing system...');
            this.startMonitoring();
        }, 3000);
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
        
        // Still try direct listeners for edges (which work)
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
        console.log('Attaching direct listeners to edge checkboxes...');
        
        // Only attach to edges since hindrances are handled by monitoring
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

    startMonitoring() {
        console.log('Starting monitoring system for hindrances...');
        
        // Monitor changes to the existing system every 500ms
        this.monitoringInterval = setInterval(() => {
            this.syncWithExistingSystem();
        }, 500);
        
        // Also do an initial sync
        this.syncWithExistingSystem();
    }

    syncWithExistingSystem() {
        // Check all hindrance items for changes
        const hindranceItems = document.querySelectorAll('#hindrancesList .checkbox-item');
        
        hindranceItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const hindranceId = item.dataset.id || this.getItemId(item);
            const isChecked = checkbox && checkbox.checked;
            const isInOurSet = this.selectedHindrances.has(hindranceId);
            
            if (isChecked && !isInOurSet) {
                // Item was selected by existing system but not in our tracking
                console.log('Detected new hindrance selection:', hindranceId);
                this.syncHindranceSelection(item, hindranceId, true);
            } else if (!isChecked && isInOurSet) {
                // Item was deselected by existing system
                console.log('Detected hindrance deselection:', hindranceId);
                this.syncHindranceSelection(item, hindranceId, false);
            }
        });
    }

    syncHindranceSelection(item, hindranceId, isSelected) {
        if (isSelected) {
            // Add to our tracking and selected panel
            const points = parseInt(item.dataset.points) || this.getHindrancePoints(item);
            
            this.hindrancePoints += points;
            this.edgePoints += points;
            this.selectedHindrances.add(hindranceId);
            
            console.log('Synced hindrance selection - Points:', this.hindrancePoints, 'Edge points:', this.edgePoints);
            
            // Add to selected panel
            this.moveHindranceToSelected(item, hindranceId, points);
        } else {
            // Remove from our tracking and selected panel
            const selectedItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
            if (selectedItem) {
                const points = parseInt(selectedItem.dataset.points);
                
                this.hindrancePoints -= points;
                this.edgePoints -= points;
                this.selectedHindrances.delete(hindranceId);
                
                console.log('Synced hindrance deselection - Points:', this.hindrancePoints, 'Edge points:', this.edgePoints);
                
                // Remove from selected panel
                selectedItem.remove();
            }
        }
        
        this.updateDisplays();
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

        // Check if already exists in selected panel
        const existingItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
        if (existingItem) {
            console.log('Item already in selected panel, skipping');
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

        console.log('Created selected item HTML:', selectedDiv.outerHTML);
        return selectedDiv;
    }

    removeHindrance(hindranceId, points) {
        console.log(`Removing hindrance: ${hindranceId}, points: ${points}`);
        
        // Update points
        this.hindrancePoints -= points;
        this.edgePoints -= points;
        this.selectedHindrances.delete(hindranceId);

        // Remove from selected panel
        const selectedItem = document.querySelector(`#selected-hindrances [data-id="${hindranceId}"]`);
        if (selectedItem) {
            selectedItem.remove();
        }

        // Uncheck in available panel (let existing system handle the rest)
        const availableItem = document.querySelector(`#hindrancesList [data-id="${hindranceId}"]`);
        if (availableItem) {
            const checkbox = availableItem.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                checkbox.click(); // Trigger the existing system's handling
            }
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
        // Clear using the existing system by clicking checkboxes
        const selectedHindrances = Array.from(this.selectedHindrances);
        selectedHindrances.forEach(hindranceId => {
            const availableItem = document.querySelector(`#hindrancesList [data-id="${hindranceId}"]`);
            if (availableItem) {
                const checkbox = availableItem.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                    checkbox.click(); // Let existing system handle it
                }
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

    // Cleanup method
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
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
