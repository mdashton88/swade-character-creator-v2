// SWADE Character Creator v2 - Main Application Entry Point

import { DataManager } from './modules/dataManager.js';
import { CharacterManager } from './modules/characterManager.js';
import { UIManager } from './modules/uiManager.js';
import { AttributesManager } from './modules/attributesManager.js';
import { SkillsManager } from './modules/skillsManager.js';
import { HindrancesManager } from './modules/hindrancesManager.js';
import { EdgesManager } from './modules/edgesManager.js';
import { CalculationsManager } from './modules/calculationsManager.js';
import { ExportManager } from './modules/exportManager.js';
import { RandomizerManager } from './modules/randomizerManager.js';
import EdgesHindrancesManager from './edges-hindrances-manager.js';

class SWADECharacterCreator {
    constructor() {
        this.dataManager = null;
        this.characterManager = null;
        this.uiManager = null;
        this.attributesManager = null;
        this.skillsManager = null;
        this.hindrancesManager = null;
        this.edgesManager = null;
        this.calculationsManager = null;
        this.exportManager = null;
        this.randomizerManager = null;
        
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Show loading indicator
            this.showLoading();

            // Initialize data manager and load all game data
            this.dataManager = new DataManager();
            await this.dataManager.loadAllData();

            // Initialize core managers
            this.characterManager = new CharacterManager();
            this.calculationsManager = new CalculationsManager(this.dataManager);
            
            // Initialize UI manager
            this.uiManager = new UIManager();
            
            // Initialize component managers
            this.attributesManager = new AttributesManager(
                this.characterManager, 
                this.calculationsManager, 
                this.uiManager
            );
            
            this.skillsManager = new SkillsManager(
                this.dataManager,
                this.characterManager, 
                this.calculationsManager, 
                this.uiManager
            );
            
            this.hindrancesManager = new HindrancesManager(
                this.dataManager,
                this.characterManager, 
                this.calculationsManager, 
                this.uiManager
            );
            
            this.edgesManager = new EdgesManager(
                this.dataManager,
                this.characterManager, 
                this.calculationsManager, 
                this.uiManager
            );
            
// Initialize the enhanced edges/hindrances manager after core managers are ready
console.log('About to create EdgesHindrancesManager...');
console.log('EdgesHindrancesManager class:', EdgesHindrancesManager);
try {
    window.edgesHindrancesManager = new EdgesHindrancesManager();
    console.log('EdgesHindrancesManager created successfully:', window.edgesHindrancesManager);
} catch (error) {
    console.error('Error creating EdgesHindrancesManager:', error);
}
            
            this.exportManager = new ExportManager(
                this.dataManager,
                this.characterManager
            );
            
           this.randomizerManager = new RandomizerManager(
                this.dataManager,
                this.characterManager, 
                this.attributesManager,
                this.skillsManager,
                this.hindrancesManager,
                this.edgesManager,
                this.calculationsManager
            );

            // Set up cross-manager references
            this.setupManagerReferences();

            // Initialize the UI
            await this.initializeUI();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize character with defaults
            this.characterManager.initializeCharacter();

            // Hide loading indicator
            this.hideLoading();

            this.isInitialized = true;
            console.log('SWADE Character Creator v2 initialized successfully');

        } catch (error) {
            console.error('Failed to initialize SWADE Character Creator:', error);
            this.showError('Failed to load character creator. Please refresh the page.');
        }
    }

    setupManagerReferences() {
        // Allow managers to reference each other as needed
        this.attributesManager.setSkillsManager(this.skillsManager);
        this.skillsManager.setAttributesManager(this.attributesManager);
        this.hindrancesManager.setSkillsManager(this.skillsManager);
        this.hindrancesManager.setEdgesManager(this.edgesManager);
        this.edgesManager.setHindrancesManager(this.hindrancesManager);
        
        // Set up character change listeners
        this.characterManager.onCharacterChange(() => {
            this.updateAllDisplays();
        });
    }

  async initializeUI() {
   // DEBUG: Check what methods are available
    console.log('DataManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.dataManager)));
    
    // DEBUG: Try different ways to get ancestry data
    console.log('getAncestries():', this.dataManager.getAncestries ? this.dataManager.getAncestries() : 'Method not found');
    console.log('Full config:', this.dataManager.getConfig ? this.dataManager.getConfig() : 'getConfig not found');
    
    // Populate ancestries dropdown
    let ancestries;
    
    // Try multiple methods to get ancestry data
    if (this.dataManager.getAncestries) {
        ancestries = this.dataManager.getAncestries();
    } else if (this.dataManager.getConfig) {
        const config = this.dataManager.getConfig();
        ancestries = config.ancestries || config.ancestry || {};
    } else {
        console.error('Cannot find ancestry data');
        ancestries = {};
    }
    
    console.log('Final ancestries data:', ancestries);
    
    const ancestrySelect = document.getElementById('characterAncestry');
    
    // Add blank default option
    const blankOption = document.createElement('option');
    blankOption.value = '';
    blankOption.textContent = '-- Select Ancestry --';
    ancestrySelect.appendChild(blankOption);
    
    // Add ancestries if we have any
    if (ancestries && typeof ancestries === 'object') {
        Object.keys(ancestries).forEach(ancestry => {
            const option = document.createElement('option');
            option.value = ancestry;
            option.textContent = ancestry;
            ancestrySelect.appendChild(option);
            console.log('Added ancestry:', ancestry);
        });
    } else {
        console.error('No valid ancestry data found');
    }
        // Initialize all UI components
        await this.attributesManager.initializeUI();
        await this.skillsManager.initializeUI();
        await this.hindrancesManager.initializeUI();
        await this.edgesManager.initializeUI();
        
        // Initialize other UI elements
        this.updateStartingFunds();
        this.initializeAncestryInfoBox();
        }

    setupEventListeners() {
        // Basic character info
        document.getElementById('characterName').addEventListener('input', (e) => {
            this.characterManager.updateCharacter('name', e.target.value);
        });

        document.getElementById('characterConcept').addEventListener('input', (e) => {
            this.characterManager.updateCharacter('concept', e.target.value);
        });

       document.getElementById('characterAncestry').addEventListener('change', (e) => {
            this.characterManager.updateCharacter('ancestry', e.target.value);
            this.updateAncestryInfoBox(e.target.value);
            this.updateAllDisplays();
        });

        // Text areas
        document.getElementById('equipment').addEventListener('input', (e) => {
            this.characterManager.updateCharacter('equipment', e.target.value);
        });

        document.getElementById('background').addEventListener('input', (e) => {
            this.characterManager.updateCharacter('background', e.target.value);
        });

        document.getElementById('specialAbilities').addEventListener('input', (e) => {
            this.characterManager.updateCharacter('specialAbilities', e.target.value);
        });

        document.getElementById('notes').addEventListener('input', (e) => {
            this.characterManager.updateCharacter('notes', e.target.value);
        });

        // Action buttons
        document.getElementById('randomizeAll').addEventListener('click', () => {
            this.randomizerManager.randomizeAll();
        });

       document.getElementById('resetCharacter').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the character? This will clear all current data.')) {
        this.characterManager.resetCharacter();
        this.updateAllDisplays();
        
        // ADD THIS: Reset ancestry dropdown to blank
        document.getElementById('characterAncestry').value = '';
        this.updateAncestryInfoBox('');
    }
});

        document.getElementById('randomizeAttributes').addEventListener('click', () => {
            this.randomizerManager.randomizeAttributes();
        });

        document.getElementById('randomizeSkills').addEventListener('click', () => {
            this.randomizerManager.randomizeSkills();
        });

        document.getElementById('randomizeHindrances').addEventListener('click', () => {
            this.randomizerManager.randomizeHindrances();
        });

        document.getElementById('randomizeEdges').addEventListener('click', () => {
            this.randomizerManager.randomizeEdges();
        });

        // Custom skill
        document.getElementById('addCustomSkill').addEventListener('click', () => {
            this.skillsManager.addCustomSkill();
        });

        // Export buttons
        document.getElementById('exportText').addEventListener('click', () => {
            this.exportManager.exportAsText();
        });

        document.getElementById('exportJSON').addEventListener('click', () => {
            this.exportManager.exportAsJSON();
        });

        document.getElementById('printCharacter').addEventListener('click', () => {
            this.exportManager.printCharacter();
        });

        document.getElementById('loadCharacter').addEventListener('click', () => {
            document.getElementById('loadCharacterFile').click();
        });

        document.getElementById('loadCharacterFile').addEventListener('change', (e) => {
            this.exportManager.loadCharacterFromFile(e.target.files[0])
                .then(() => {
                    this.updateAllDisplays();
                    e.target.value = ''; // Reset file input
                })
                .catch(error => {
                    console.error('Failed to load character:', error);
                    alert('Failed to load character file. Please check the file format.');
                });
        });
    }

    updateAllDisplays() {
        if (!this.isInitialized) return;

        // Update all manager displays
        this.attributesManager.updateDisplay();
        this.skillsManager.updateDisplay();
        this.hindrancesManager.updateDisplay();
        this.edgesManager.updateDisplay();
        
        // Update derived stats
        this.updateDerivedStats();
        this.updateStartingFunds();
        
        // Update points displays
        this.updatePointsDisplays();
    }

    updateDerivedStats() {
        const character = this.characterManager.getCharacter();
        const derivedStats = this.calculationsManager.calculateDerivedStats(character);
        
        const statsContainer = document.getElementById('derivedStats');
        statsContainer.innerHTML = `
            <h4>Derived Statistics</h4>
            <div class="stat-item">
                <span>Pace:</span>
                <span>${derivedStats.pace}</span>
            </div>
            <div class="stat-item">
                <span>Parry:</span>
                <span>${derivedStats.parry}</span>
            </div>
            <div class="stat-item">
                <span>Toughness:</span>
                <span>${derivedStats.toughness}</span>
            </div>
        `;
    }

    updateStartingFunds() {
        const character = this.characterManager.getCharacter();
        const funds = this.calculationsManager.calculateStartingFunds(character);
        document.getElementById('startingFunds').value = `$${funds}`;
    }

    updatePointsDisplays() {
        const character = this.characterManager.getCharacter();
        
        // Update attribute points
        const attributePoints = this.calculationsManager.calculateAttributePointsRemaining(character);
        document.getElementById('attributePoints').textContent = `Attribute Points Remaining: ${attributePoints}`;
        
        // Update skill points
        const skillPoints = this.calculationsManager.calculateSkillPointsRemaining(character);
        const bonusPoints = this.calculationsManager.getBonusSkillPoints(character);
        document.getElementById('skillPoints').textContent = `Skill Points Remaining: ${skillPoints}`;
        
        const skillsInfo = document.getElementById('skillsInfo');
        skillsInfo.textContent = `You have ${this.dataManager.getConfig().gameRules.skillPoints} Skill points + ${bonusPoints} shared points from Hindrances. Skills cost 1 point per step up to their linked Attribute, then 2 points per step beyond that.`;
        
        // Update hindrance info
        const hindrancePoints = this.calculationsManager.getHindrancePoints(character);
        const hindranceBonuses = this.calculationsManager.getHindranceBonuses(character);
        document.getElementById('hindranceInfo').textContent = 
            `Hindrance Points: ${hindrancePoints.total}/${this.dataManager.getConfig().gameRules.hindrancePointsMax} | Bonus: +${hindranceBonuses.skillPoints} skill points, +${hindranceBonuses.edges} Edges`;
        
        // Update edge info
        const edgeInfo = this.calculationsManager.getAvailableEdges(character);
        document.getElementById('edgeInfo').textContent = 
            `Available Edges: ${edgeInfo.base} (base) + ${edgeInfo.fromHindrances} (from Hindrances) = ${edgeInfo.total} total`;
    }

    showLoading() {
        // Create and show loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: white;
                font-size: 1.2rem;
            ">
                <div style="text-align: center;">
                    <div style="margin-bottom: 20px;">⚡ Loading SWADE Character Creator...</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Please wait while we load the game data</div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

  showError(message) {
        // Remove loading overlay if present
        this.hideLoading();
        
        // Show error message
        const errorOverlay = document.createElement('div');
        errorOverlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: white;
                font-size: 1.2rem;
            ">
                <div style="text-align: center; background: #8b0000; padding: 30px; border-radius: 8px;">
                    <div style="margin-bottom: 20px;">❌ Error</div>
                    <div style="font-size: 1rem; margin-bottom: 20px;">${message}</div>
                    <button onclick="location.reload()" style="
                        background: white;
                        color: #8b0000;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                    ">Refresh Page</button>
                </div>
            </div>
        `;
        document.body.appendChild(errorOverlay);
    }

    updateAncestryInfoBox(ancestryName) {
        const infoBox = document.getElementById('ancestryInfoBox');
        const abilitiesContainer = document.getElementById('ancestryInfoAbilities');
        
        // Hide info box if no ancestry selected
        if (!ancestryName || ancestryName === '') {
            infoBox.style.display = 'none';
            return;
        }
        
        // Get ancestry data
        const ancestries = this.dataManager.getConfig().ancestries;
        const ancestryData = ancestries[ancestryName];
        
        if (!ancestryData) {
            infoBox.style.display = 'none';
            return;
        }
        
        // Clear previous abilities
        abilitiesContainer.innerHTML = '';
        
        // Add abilities using new subtle styling
        if (ancestryData.abilities && ancestryData.abilities.length > 0) {
            ancestryData.abilities.forEach(ability => {
                const abilityElement = document.createElement('div');
                abilityElement.className = 'ancestry-info';
                
                abilityElement.innerHTML = `
                    <strong>${ability.name.toUpperCase()}:</strong> ${ability.description}
                `;
                
                abilitiesContainer.appendChild(abilityElement);
            });
        }
        
        // Show the info box
        infoBox.style.display = 'block';
    }

    initializeAncestryInfoBox() {
        const currentAncestry = this.characterManager.getCharacter().ancestry;
        
        if (currentAncestry) {
            this.updateAncestryInfoBox(currentAncestry);
        }
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new SWADECharacterCreator();
    await app.initialize();
    
    // Make app globally available for debugging
    window.swadeApp = app;
});

// Export for module use
export { SWADECharacterCreator };
