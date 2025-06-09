// edges-hindrances-manager.js
// Safe version that enhances existing system without breaking it

export default class EdgesHindrancesManager {
    constructor() {
        console.log('=== Safe EdgesHindrancesManager starting ===');
        
        // Our state
        this.hindrancePoints = 0;
        this.edgePoints = 0;
        this.maxHindrancePoints = 4;
        this.selectedHindrances = new Map();
        this.selectedEdges = new Map();
        
        // Initialize safely
        this.init();
    }

    async init() {
        console.log('Initializing safe EdgesHindrancesManager...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.enhance());
        } else {
            // Wait a bit for existing managers to load
            setTimeout(() => this.enhance(), 2000);
        }
    }

    enhance() {
        console.log('Enhancing existing edges/hindrances UI...');
        
        try {
            // Step 1: Hide checkboxes with CSS
            this.hideCheckboxes();
            
            // Step 2: Enhance existing items to be clickable
            this.makeItemsClickable();
            
            // Step 3: Set up event listeners
            this.setupEventListeners();
            
            // Step 4: Update info bars
            this.updateInfoBars();
            
            console.log('Safe enhancement complete!');
        } catch (error) {
            console.error('Enhancement failed:', error);
        }
    }

    hideCheckboxes() {
        // Add CSS to hide checkboxes immediately
        const style = document.createElement('style');
        style.id = 'hide-checkboxes-style';
        style.textContent = `
            #hindrancesList input[type="checkbox"],
            #edgesList input[type="checkbox"] {
                display: none !important;
            }
            
            #hindrancesList .checkbox-item,
            #edgesList .checkbox-item {
                cursor: pointer !important;
                user-select: none !important;
                transition: all 0.2s ease !important;
            }
            
            #hindrancesList .checkbox-item:hover,
            #edgesList .checkbox-item:hover {
                background: #f0f0f0 !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 4px rgba(139, 0, 0, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('Checkboxes hidden with CSS');
    }

    makeItemsClickable() {
        // Add clickable styling to all items
        const items = document.querySelectorAll('#hindrancesList .checkbox-item, #edgesList .checkbox-item');
        items.forEach(item => {
            item.style.cursor = 'pointer';
            item.style.userSelect = 'none';
            
            // Add data attributes if missing
            if (!item.dataset.id) {
                const title = item.querySelector('.checkbox-title');
                if (title) {
                    item.dataset.id = title.textContent.trim();
                }
            }
            
            // Set points if missing
            if (!item.dataset.points) {
                const meta = item.querySelector('.checkbox-meta');
                if (meta && meta.textContent.includes('MAJOR')) {
                    item.dataset.points = '2';
                } else {
                    item.dataset.points = '1';
                }
            }
        });
        
        console.log('Made', items.length, 'items clickable');
    }

    setupEventListeners() {
        // Single event listener for all clicks
        document.addEventListener('click', (e) => {
            // Handle hindrance/edge item clicks
            const item = e.target.closest('.checkbox-item');
            if (item) {
                const hindrancesList = item.closest('#hindrancesList');
                const edgesList = item.closest('#edgesList');
                
                if (hindrancesList) {
                    this.handleHindranceClick(item);
                    return;
                }
                
                if (edgesList) {
                    this.handleEdgeClick(item);
                    return;
                }
            }
            
            // Handle remove buttons
            if (e.target.classList.contains('remove-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleRemoveClick(e.target);
                return;
            }
        });
        
        console.log('Event listeners set up');
    }

    updateInfoBars() {
        // Update info bar format to "X of Y" style
        const hindranceInfo = document.getElementById('hindranceInfo');
        if (hindranceInfo) {
            hindranceInfo.innerHTML = 'Hindrance Points: <span id="hindrance-points">0</span> of 4';
        }
        
        const edgeInfo = document.getElementById('edgeInfo');
        if (edgeInfo) {
            edgeInfo.innerHTML = 'Available Edge Points: <span id="edge-points">0</span>';
        }
        
        console.log('Info bars updated');
    }

    handleHindranceClick(item) {
        const id = item.dataset.id;
        const points = parseInt(item.dataset.points || '1');
        
        console.log('Hindrance clicked:', id, points);
        
        if (this.selectedHindrances.has(id)) {
            // Deselect
            this.deselectHindrance(id, item);
        } else {
            // Select
            this.selectHindrance(id, item, points);
        }
    }

    handleEdgeClick(item) {
        const id = item.dataset.id;
        const points = parseInt(item.dataset.points || '2');
        
        console.log('Edge clicked:', id, points);
        
        if (this.selectedEdges.has(id)) {
            // Deselect
            this.deselectEdge(id, item);
        } else {
            // Select
            this.selectEdge(id, item, points);
        }
    }

    selectHindrance(id, item, points) {
        // Check if we can add this hindrance
        if (this.hindrancePoints + points > this.maxHindrancePoints) {
            alert(`Cannot add hindrance. Would exceed maximum of ${this.maxHindrancePoints} points.`);
            return;
        }

        // Add to tracking
        this.selectedHindrances.set(id, { item, points });
        
        // Update points
        this.hindrancePoints += points;
        this.edgePoints += points;

        // Visual feedback
        item.classList.add('selected');
        item.style.backgroundColor = '#e8f4fd';
        item.style.border = '2px solid #8b0000';

        // Add to selected panel
        this.addToSelectedPanel(id, item, points, 'hindrance');
        
        this.updateDisplays();
        console.log(`Selected hindrance: ${id} (${points} pts)`);
    }

    selectEdge(id, item, points) {
        // Check if we have enough edge points
        if (this.edgePoints < points) {
            alert(`Cannot add edge. Requires ${points} edge points but you only have ${this.edgePoints}.`);
            return;
        }

        // Add to tracking
        this.selectedEdges.set(id, { item, points });
        
        // Update points
        this.edgePoints -= points;

        // Visual feedback
        item.classList.add('selected');
        item.style.backgroundColor = '#e8f4fd';
        item.style.border = '2px solid #8b0000';
        item.style.display = 'none'; // Hide from available list

        // Add to selected panel
        this.addToSelectedPanel(id, item, points, 'edge');
        
        this.updateDisplays();
        console.log(`Selected edge: ${id} (${points} pts)`);
    }

    deselectHindrance(id, item) {
        const data = this.selectedHindrances.get(id);
        if (!data) return;

        // Remove from tracking
        this.selectedHindrances.delete(id);
        
        // Update points
        this.hindrancePoints -= data.points;
        this.edgePoints -= data.points;

        // Visual feedback
        item.classList.remove('selected');
        item.style.backgroundColor = '';
        item.style.border = '';

        // Remove from selected panel
        this.removeFromSelectedPanel(id, 'hindrance');
        
        this.updateDisplays();
        console.log(`Deselected hindrance: ${id}`);
    }

    deselectEdge(id, item) {
        const data = this.selectedEdges.get(id);
        if (!data) return;

        // Remove from tracking
        this.selectedEdges.delete(id);
        
        // Update points
        this.edgePoints += data.points;

        // Visual feedback
        item.classList.remove('selected');
        item.style.backgroundColor = '';
        item.style.border = '';
        item.style.display = 'block'; // Show in available list

        // Remove from selected panel
        this.removeFromSelectedPanel(id, 'edge');
        
        this.updateDisplays();
        console.log(`Deselected edge: ${id}`);
    }

    addToSelectedPanel(id, sourceItem, points, type) {
        // Find or create selected panel
        let selectedPanel = document.getElementById(type === 'hindrance' ? 'selected-hindrances' : 'selected-edges');
        
        if (!selectedPanel) {
            // Create selected panel if it doesn't exist
            const infoPanel = document.getElementById(type === 'hindrance' ? 'hindrancesInfoPanel' : 'edgesInfoPanel');
            if (infoPanel) {
                selectedPanel = document.createElement('div');
                selectedPanel.id = type === 'hindrance' ? 'selected-hindrances' : 'selected-edges';
                selectedPanel.style.marginTop = '10px';
                selectedPanel.style.padding = '10px';
                selectedPanel.style.backgroundColor = '#f8f9fa';
                selectedPanel.style.borderRadius = '4px';
                selectedPanel.style.border = '1px solid #dee2e6';
                
                const header = document.createElement('h5');
                header.textContent = type === 'hindrance' ? 'Selected Hindrances:' : 'Selected Edges:';
                header.style.marginBottom = '10px';
                header.style.color = '#8b0000';
                
                selectedPanel.appendChild(header);
                infoPanel.appendChild(selectedPanel);
            }
        }

        if (selectedPanel) {
            // Create selected item
            const selectedItem = this.createSelectedItem(id, sourceItem, points, type);
            selectedPanel.appendChild(selectedItem);
        }
    }

    createSelectedItem(id, sourceItem, points, type) {
        const div = document.createElement('div');
        div.className = 'selected-item';
        div.dataset.id = id;
        div.dataset.points = points;
        div.dataset.type = type;
        
        // Get info from source item
        const title = sourceItem.querySelector('.checkbox-title')?.textContent || id;
        const description = sourceItem.querySelector('.checkbox-description')?.textContent || '';
        const meta = sourceItem.querySelector('.checkbox-meta')?.textContent || '';
        
        div.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="font-weight: bold; font-size: 14px; color: #333;">${title}</div>
                ${description ? `<div style="font-size: 12px; color: #666; line-height: 1.4;">${description}</div>` : ''}
                ${meta ? `<div style="font-size: 11px; color: #8b0000; font-weight: bold;">${meta}</div>` : ''}
                <button class="remove-btn" data-item-id="${id}" data-type="${type}" data-points="${points}" 
                        style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; 
                               cursor: pointer; font-size: 11px; margin-top: 8px; align-self: flex-start;">
                    Remove
                </button>
            </div>
        `;
        
        return div;
    }

    removeFromSelectedPanel(id, type) {
        const selectedPanel = document.getElementById(type === 'hindrance' ? 'selected-hindrances' : 'selected-edges');
        if (selectedPanel) {
            const item = selectedPanel.querySelector(`[data-id="${id}"]`);
            if (item) {
                item.remove();
            }
        }
    }

    handleRemoveClick(button) {
        const id = button.dataset.itemId;
        const type = button.dataset.type;
        
        console.log('Remove clicked:', id, type);
        
        if (type === 'hindrance') {
            const data = this.selectedHindrances.get(id);
            if (data) {
                this.deselectHindrance(id, data.item);
            }
        } else if (type === 'edge') {
            const data = this.selectedEdges.get(id);
            if (data) {
                this.deselectEdge(id, data.item);
            }
        }
    }

    updateDisplays() {
        // Update new format displays
        const hindrancePointsSpan = document.getElementById('hindrance-points');
        const edgePointsSpan = document.getElementById('edge-points');
        
        if (hindrancePointsSpan) {
            hindrancePointsSpan.textContent = this.hindrancePoints;
        }
        
        if (edgePointsSpan) {
            edgePointsSpan.textContent = this.edgePoints;
        }

        // Update old format displays for compatibility
        const hindranceInfo = document.getElementById('hindranceInfo');
        const edgeInfo = document.getElementById('edgeInfo');
        
        if (hindranceInfo && !hindranceInfo.innerHTML.includes('of 4')) {
            hindranceInfo.textContent = `Hindrance Points: ${this.hindrancePoints} of 4`;
        }
        
        if (edgeInfo && !edgeInfo.innerHTML.includes('edge-points')) {
            edgeInfo.textContent = `Available Edge Points: ${this.edgePoints}`;
        }
    }

    // Public methods for buttons
    clearHindrances() {
        const ids = Array.from(this.selectedHindrances.keys());
        ids.forEach(id => {
            const data = this.selectedHindrances.get(id);
            if (data) {
                this.deselectHindrance(id, data.item);
            }
        });
    }

    clearEdges() {
        const ids = Array.from(this.selectedEdges.keys());
        ids.forEach(id => {
            const data = this.selectedEdges.get(id);
            if (data) {
                this.deselectEdge(id, data.item);
            }
        });
    }

    randomizeHindrances() {
        // Clear existing
        this.clearHindrances();
        
        // Get available hindrances
        const available = Array.from(document.querySelectorAll('#hindrancesList .checkbox-item'));
        
        let attempts = 0;
        while (this.hindrancePoints < this.maxHindrancePoints && attempts < 20) {
            const randomItem = available[Math.floor(Math.random() * available.length)];
            const points = parseInt(randomItem.dataset.points || '1');
            
            if (this.hindrancePoints + points <= this.maxHindrancePoints) {
                this.handleHindranceClick(randomItem);
            }
            attempts++;
        }
    }

    randomizeEdges() {
        // Clear existing
        this.clearEdges();
        
        // Select random edges
        const available = Array.from(document.querySelectorAll('#edgesList .checkbox-item')).filter(item => 
            !item.classList.contains('selected')
        );
        
        while (this.edgePoints >= 2 && available.length > 0) {
            const randomIndex = Math.floor(Math.random() * available.length);
            const randomItem = available[randomIndex];
            const points = parseInt(randomItem.dataset.points || '2');
            
            if (this.edgePoints >= points) {
                this.handleEdgeClick(randomItem);
                available.splice(randomIndex, 1);
            } else {
                break;
            }
        }
    }

    // Utility methods
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

// Global functions for button clicks
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
