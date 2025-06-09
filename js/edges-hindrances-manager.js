// edges-hindrances-manager.js
// Clean rebuild - no conflicts, modern UX

export default class EdgesHindrancesManager {
    constructor() {
        console.log('=== Clean EdgesHindrancesManager starting ===');
        
        // Our state
        this.hindrancePoints = 0;
        this.edgePoints = 0;
        this.maxHindrancePoints = 4;
        this.selectedHindrances = new Map();
        this.selectedEdges = new Map();
        
        // Initialize immediately
        this.init();
    }

    async init() {
        console.log('Initializing clean EdgesHindrancesManager...');
        
        // Wait for DOM to be ready, then take control
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.takeControl());
        } else {
            this.takeControl();
        }
    }

    takeControl() {
        console.log('Taking control of edges/hindrances UI...');
        
        // Step 1: Completely replace the existing UI
        this.replaceUI();
        
        // Step 2: Set up our event listeners
        this.setupEventListeners();
        
        // Step 3: Load data and populate
        this.loadAndPopulate();
        
        console.log('Clean EdgesHindrancesManager ready!');
    }

    replaceUI() {
        // Replace hindrances section
        const hindrancesSection = document.querySelector('#hindrancesList').closest('.section');
        if (hindrancesSection) {
            hindrancesSection.innerHTML = `
                <h2>
                    Hindrances
                    <button class="section-title-button" onclick="window.edgesHindrancesManager.randomizeHindrances()">🎲 Randomize</button>
                    <button class="section-title-button" onclick="window.edgesHindrancesManager.clearHindrances()">🗑️ Clear</button>
                </h2>
                
                <div class="info-note">
                    Take up to 4 points of Hindrances for extra skill points and Edges.
                </div>
                
                <div class="hindrance-info-bar">
                    Hindrance Points: <span id="hindrance-points">0</span> of 4
                </div>

                <div class="content-area">
                    <div class="column">
                        <div class="column-header">Available Hindrances</div>
                        <div class="hindrances-list" id="available-hindrances">
                            <div class="loading">Loading hindrances...</div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="column-header">Selected Hindrances</div>
                        <div class="selected-hindrances-list" id="selected-hindrances">
                            <!-- Selected items appear here -->
                        </div>
                    </div>
                </div>
            `;
        }

        // Replace edges section
        const edgesSection = document.querySelector('#edgesList').closest('.section');
        if (edgesSection) {
            edgesSection.innerHTML = `
                <h2>
                    Edges
                    <button class="section-title-button" onclick="window.edgesHindrancesManager.randomizeEdges()">🎲 Randomize</button>
                    <button class="section-title-button" onclick="window.edgesHindrancesManager.clearEdges()">🗑️ Clear</button>
                </h2>
                
                <div class="info-note">
                    Choose Edges based on your character's rank and prerequisites.
                </div>
                
                <div class="edge-info-bar">
                    Available Edge Points: <span id="edge-points">0</span>
                </div>

                <div class="content-area">
                    <div class="column">
                        <div class="column-header">Available Edges</div>
                        <div class="edges-list" id="available-edges">
                            <div class="loading">Loading edges...</div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="column-header">Selected Edges</div>
                        <div class="selected-edges-list" id="selected-edges">
                            <!-- Selected items appear here -->
                        </div>
                    </div>
                </div>
            `;
        }

        console.log('UI replaced with clean version');
    }

    setupEventListeners() {
        // Single click handler for everything
        document.addEventListener('click', (e) => {
            // Handle clickable items
            if (e.target.closest('.clickable-item')) {
                const item = e.target.closest('.clickable-item');
                this.handleItemClick(item);
                return;
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

    async loadAndPopulate() {
        // Load hindrances data (we'll create mock data since we don't have access to the original)
        await this.populateHindrances();
        await this.populateEdges();
    }

    async populateHindrances() {
        const container = document.getElementById('available-hindrances');
        
        // Mock hindrances data - replace with actual data loading
        const hindrances = {
            'Arrogant': { points: 2, type: 'Major', description: 'Must humiliate opponent, challenge the most powerful foe' },
            'Bad Eyes': { points: 1, type: 'Minor', description: 'The character is physically unattractive and subtracts 1 from Persuasion rolls' },
            'Bad Luck': { points: 2, type: 'Major', description: 'The character gets one less Benny per session' },
            'Vengeful': { points: 1, type: 'Minor', description: 'The adventurer seeks payback for slights against her (minor)' },
            'Vow': { points: 1, type: 'Minor', description: 'The individual has sworn an oath of some sort' },
            'Wanted': { points: 1, type: 'Minor', description: 'The character is a minor criminal' },
            'Bloodthirsty': { points: 2, type: 'Major', description: 'Never takes prisoners unless under the direct supervision of a superior' }
        };

        let html = '';
        Object.entries(hindrances).forEach(([name, data]) => {
            html += this.createClickableItem(name, data, 'hindrance');
        });
        
        container.innerHTML = html;
        console.log('Populated hindrances');
    }

    async populateEdges() {
        const container = document.getElementById('available-edges');
        
        // Mock edges data - replace with actual data loading
        const edges = {
            'Alertness': { points: 2, description: '+2 to Notice rolls', requirements: 'Novice' },
            'Ambidextrous': { points: 2, description: 'Ignore -2 penalty for using off-hand', requirements: 'Novice, Agility d8+' },
            'Block': { points: 2, description: '+1 Parry, ignore 1 point of Gang Up bonus', requirements: 'Seasoned, Fighting d8+' },
            'Brawler': { points: 2, description: 'Toughness +1, add d4 to damage from fists', requirements: 'Novice, Strength d8+, Vigor d8+' },
            'Combat Reflexes': { points: 2, description: '+2 Spirit to recover from being Shaken', requirements: 'Seasoned' }
        };

        let html = '';
        Object.entries(edges).forEach(([name, data]) => {
            html += this.createClickableItem(name, data, 'edge');
        });
        
        container.innerHTML = html;
        console.log('Populated edges');
    }

    createClickableItem(name, data, type) {
        const points = data.points || (type === 'edge' ? 2 : 1);
        const typeText = data.type ? `${data.type.toUpperCase()} • ${points} point${points !== 1 ? 's' : ''}` : '';
        const requirements = data.requirements ? `Requirements: ${data.requirements}` : '';
        
        return `
            <div class="clickable-item" data-id="${name}" data-points="${points}" data-type="${type}">
                <div class="item-content">
                    <div class="item-title">${name}</div>
                    <div class="item-description">${data.description}</div>
                    ${typeText ? `<div class="item-meta">${typeText}</div>` : ''}
                    ${requirements ? `<div class="item-requirements">${requirements}</div>` : ''}
                </div>
            </div>
        `;
    }

    createSelectedItem(name, data, type) {
        const points = data.points || (type === 'edge' ? 2 : 1);
        const typeText = data.type ? `${data.type.toUpperCase()} • ${points} point${points !== 1 ? 's' : ''}` : '';
        const requirements = data.requirements ? `Requirements: ${data.requirements}` : '';
        
        return `
            <div class="selected-item" data-id="${name}" data-points="${points}" data-type="${type}">
                <div class="item-content">
                    <div class="item-title">${name}</div>
                    <div class="item-description">${data.description}</div>
                    ${typeText ? `<div class="item-meta">${typeText}</div>` : ''}
                    ${requirements ? `<div class="item-requirements">${requirements}</div>` : ''}
                    <button class="remove-btn" data-item-id="${name}" data-type="${type}" data-points="${points}">
                        Remove
                    </button>
                </div>
            </div>
        `;
    }

    handleItemClick(item) {
        const id = item.dataset.id;
        const type = item.dataset.type;
        const points = parseInt(item.dataset.points);
        
        if (type === 'hindrance') {
            if (this.selectedHindrances.has(id)) {
                this.deselectHindrance(id);
            } else {
                this.selectHindrance(id, item, points);
            }
        } else if (type === 'edge') {
            if (this.selectedEdges.has(id)) {
                this.deselectEdge(id);
            } else {
                this.selectEdge(id, item, points);
            }
        }
    }

    selectHindrance(id, item, points) {
        // Check if we can add this hindrance
        if (this.hindrancePoints + points > this.maxHindrancePoints) {
            alert(`Cannot add hindrance. Would exceed maximum of ${this.maxHindrancePoints} points.`);
            return;
        }

        // Add to our tracking
        this.selectedHindrances.set(id, {
            element: item,
            points: points,
            data: this.getItemData(item)
        });

        // Update points
        this.hindrancePoints += points;
        this.edgePoints += points;

        // Update visuals
        item.classList.add('selected');
        this.addToSelectedPanel(id, item, 'hindrance');
        this.updateDisplays();
        
        console.log(`Selected hindrance: ${id} (${points} pts)`);
    }

    selectEdge(id, item, points) {
        // Check if we have enough edge points
        if (this.edgePoints < points) {
            alert(`Cannot add edge. Requires ${points} edge points but you only have ${this.edgePoints}.`);
            return;
        }

        // Add to our tracking
        this.selectedEdges.set(id, {
            element: item,
            points: points,
            data: this.getItemData(item)
        });

        // Update points
        this.edgePoints -= points;

        // Update visuals
        item.classList.add('selected');
        item.style.display = 'none';
        this.addToSelectedPanel(id, item, 'edge');
        this.updateDisplays();
        
        console.log(`Selected edge: ${id} (${points} pts)`);
    }

    deselectHindrance(id) {
        const hindrance = this.selectedHindrances.get(id);
        if (!hindrance) return;

        // Update points
        this.hindrancePoints -= hindrance.points;
        this.edgePoints -= hindrance.points;

        // Remove from tracking
        this.selectedHindrances.delete(id);

        // Update visuals
        hindrance.element.classList.remove('selected');
        this.removeFromSelectedPanel(id, 'hindrance');
        this.updateDisplays();
        
        console.log(`Deselected hindrance: ${id}`);
    }

    deselectEdge(id) {
        const edge = this.selectedEdges.get(id);
        if (!edge) return;

        // Update points
        this.edgePoints += edge.points;

        // Remove from tracking
        this.selectedEdges.delete(id);

        // Update visuals
        edge.element.classList.remove('selected');
        edge.element.style.display = 'block';
        this.removeFromSelectedPanel(id, 'edge');
        this.updateDisplays();
        
        console.log(`Deselected edge: ${id}`);
    }

    addToSelectedPanel(id, item, type) {
        const container = document.getElementById(type === 'hindrance' ? 'selected-hindrances' : 'selected-edges');
        const data = this.getItemData(item);
        
        const selectedHtml = this.createSelectedItem(id, data, type);
        container.insertAdjacentHTML('beforeend', selectedHtml);
    }

    removeFromSelectedPanel(id, type) {
        const container = document.getElementById(type === 'hindrance' ? 'selected-hindrances' : 'selected-edges');
        const item = container.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.remove();
        }
    }

    handleRemoveClick(button) {
        const id = button.dataset.itemId;
        const type = button.dataset.type;
        
        if (type === 'hindrance') {
            this.deselectHindrance(id);
        } else if (type === 'edge') {
            this.deselectEdge(id);
        }
    }

    getItemData(item) {
        return {
            points: parseInt(item.dataset.points),
            description: item.querySelector('.item-description')?.textContent || '',
            type: item.querySelector('.item-meta')?.textContent.includes('MAJOR') ? 'Major' : 'Minor',
            requirements: item.querySelector('.item-requirements')?.textContent.replace('Requirements: ', '') || ''
        };
    }

    updateDisplays() {
        // Update point displays
        const hindrancePointsSpan = document.getElementById('hindrance-points');
        const edgePointsSpan = document.getElementById('edge-points');
        
        if (hindrancePointsSpan) {
            hindrancePointsSpan.textContent = this.hindrancePoints;
        }
        
        if (edgePointsSpan) {
            edgePointsSpan.textContent = this.edgePoints;
        }

        // Update old compatibility displays if they exist
        const hindranceInfo = document.getElementById('hindranceInfo');
        const edgeInfo = document.getElementById('edgeInfo');
        
        if (hindranceInfo) {
            hindranceInfo.textContent = `Hindrance Points: ${this.hindrancePoints} of 4`;
        }
        
        if (edgeInfo) {
            edgeInfo.textContent = `Available Edge Points: ${this.edgePoints}`;
        }
    }

    // Public methods for buttons
    clearHindrances() {
        const ids = Array.from(this.selectedHindrances.keys());
        ids.forEach(id => this.deselectHindrance(id));
    }

    clearEdges() {
        const ids = Array.from(this.selectedEdges.keys());
        ids.forEach(id => this.deselectEdge(id));
    }

    randomizeHindrances() {
        // Clear existing
        this.clearHindrances();
        
        // Select random hindrances up to 4 points
        const available = document.querySelectorAll('#available-hindrances .clickable-item');
        const items = Array.from(available);
        
        let pointsUsed = 0;
        const maxAttempts = 10;
        let attempts = 0;
        
        while (pointsUsed < this.maxHindrancePoints && attempts < maxAttempts) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            const points = parseInt(randomItem.dataset.points);
            
            if (pointsUsed + points <= this.maxHindrancePoints) {
                this.handleItemClick(randomItem);
                pointsUsed = this.hindrancePoints;
            }
            attempts++;
        }
    }

    randomizeEdges() {
        // Clear existing
        this.clearEdges();
        
        // Select random edges based on available points
        const available = document.querySelectorAll('#available-edges .clickable-item:not(.selected)');
        const items = Array.from(available);
        
        while (this.edgePoints >= 2 && items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length);
            const randomItem = items[randomIndex];
            const points = parseInt(randomItem.dataset.points || '2');
            
            if (this.edgePoints >= points) {
                this.handleItemClick(randomItem);
                items.splice(randomIndex, 1); // Remove from available
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
