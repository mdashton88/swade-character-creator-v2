// SWADE Character Creator v2 - Randomizer Manager Module (Corrected)

export class RandomizerManager {
    constructor(dataManager, characterManager, attributesManager, skillsManager, hindrancesManager, edgesManager, calculationsManager) {
        this.dataManager = dataManager;
        this.characterManager = characterManager;
        this.attributesManager = attributesManager;
        this.skillsManager = skillsManager;
        this.hindrancesManager = hindrancesManager;
        this.edgesManager = edgesManager;
        this.calculationsManager = calculationsManager; // Added missing dependency
        
        this.randomizationSettings = {
            ensureCoreSkills: true,
            balancedAttributes: true,
            thematicConsistency: true,
            preferBackgroundEdges: true,
            avoidConflicts: true
        };
    }

    // Complete character randomization
    randomizeAll() {
        // Reset character first
        this.characterManager.resetCharacter();
        
        // Randomize in order of dependencies
        this.randomizeBasicInfo();
        this.randomizeAttributes();
        this.randomizeHindrances();
        this.randomizeEdges();
        this.randomizeSkills();
        this.randomizeDetails();
        
        console.log('Complete character randomization completed');
    }

    // Smart character generation with themes
    generateSmartCharacter(theme = 'balanced') {
        this.characterManager.resetCharacter();
        
        switch (theme) {
            case 'warrior':
                this.generateWarriorCharacter();
                break;
            case 'scholar':
                this.generateScholarCharacter();
                break;
            case 'leader':
                this.generateLeaderCharacter();
                break;
            case 'rogue':
                this.generateRogueCharacter();
                break;
            case 'mystic':
                this.generateMysticCharacter();
                break;
            case 'aquatic':
                this.generateAquaticCharacter();
                break;
            case 'aerial':
                this.generateAerialCharacter();
                break;
            default:
                this.generateBalancedCharacter();
        }
    }

    // Basic information randomization
    randomizeBasicInfo() {
        const names = this.getRandomNames();
        const concepts = this.getRandomConcepts();
        const ancestries = Object.keys(this.dataManager.getAncestries());
        
        this.characterManager.updateCharacter('name', this.randomChoice(names));
        this.characterManager.updateCharacter('concept', this.randomChoice(concepts));
        this.characterManager.updateCharacter('ancestry', this.randomChoice(ancestries));
    }

    // Attribute randomization with different strategies
    randomizeAttributes(strategy = 'balanced') {
        const character = this.characterManager.getCharacter();
        const totalPoints = 5;
        
        // Reset all attributes to d4
        Object.keys(character.attributes).forEach(attr => {
            this.characterManager.setAttribute(attr, 4);
        });
        
        let pointsToSpend = totalPoints;
        const attributes = Object.keys(character.attributes);
        
        switch (strategy) {
            case 'focused':
                this.randomizeAttributesFocused(pointsToSpend, attributes);
                break;
            case 'spread':
                this.randomizeAttributesSpread(pointsToSpend, attributes);
                break;
            case 'concept':
                this.randomizeAttributesByConcept(pointsToSpend, attributes);
                break;
            default:
                this.randomizeAttributesBalanced(pointsToSpend, attributes);
        }
        
        this.attributesManager.updateDisplay();
    }

    randomizeAttributesBalanced(pointsToSpend, attributes) {
        while (pointsToSpend > 0) {
            const attr = this.randomChoice(attributes);
            const currentValue = this.characterManager.getAttribute(attr);
            
            if (currentValue < 12) {
                this.characterManager.incrementAttribute(attr);
                pointsToSpend--;
            } else {
                // All attributes maxed, shouldn't happen with 5 points
                break;
            }
        }
    }

    randomizeAttributesFocused(pointsToSpend, attributes) {
        // Pick 1-2 primary attributes and focus on them
        const primaryCount = Math.random() < 0.3 ? 1 : 2;
        const primaryAttributes = this.shuffleArray([...attributes]).slice(0, primaryCount);
        
        // Spend most points on primary attributes
        const primaryPoints = Math.floor(pointsToSpend * 0.8);
        let remainingPrimary = primaryPoints;
        
        primaryAttributes.forEach(attr => {
            const pointsToSpendOnThis = Math.min(remainingPrimary, 4); // Max d12
            const actualSpent = Math.min(pointsToSpendOnThis, Math.floor(remainingPrimary / primaryAttributes.length) + 1);
            
            for (let i = 0; i < actualSpent && remainingPrimary > 0; i++) {
                this.characterManager.incrementAttribute(attr);
                remainingPrimary--;
                pointsToSpend--;
            }
        });
        
        // Distribute remaining points randomly
        while (pointsToSpend > 0) {
            const attr = this.randomChoice(attributes);
            const currentValue = this.characterManager.getAttribute(attr);
            
            if (currentValue < 12) {
                this.characterManager.incrementAttribute(attr);
                pointsToSpend--;
            } else {
                break;
            }
        }
    }

    randomizeAttributesSpread(pointsToSpend, attributes) {
        // Try to put at least one point in each attribute
        const shuffled = this.shuffleArray([...attributes]);
        
        shuffled.forEach(attr => {
            if (pointsToSpend > 0) {
                this.characterManager.incrementAttribute(attr);
                pointsToSpend--;
            }
        });
        
        // Distribute remaining points
        while (pointsToSpend > 0) {
            const attr = this.randomChoice(attributes);
            const currentValue = this.characterManager.getAttribute(attr);
            
            if (currentValue < 10) { // Limit to d10 for spread strategy
                this.characterManager.incrementAttribute(attr);
                pointsToSpend--;
            } else {
                break;
            }
        }
    }

    randomizeAttributesByConcept(pointsToSpend, attributes) {
        const character = this.characterManager.getCharacter();
        const concept = character.concept.toLowerCase();
        
        let priorities = [];
        
        // Determine attribute priorities based on concept
        if (concept.includes('warrior') || concept.includes('fighter') || concept.includes('soldier')) {
            priorities = ['strength', 'vigor', 'agility', 'spirit', 'smarts'];
        } else if (concept.includes('scholar') || concept.includes('wizard') || concept.includes('scientist')) {
            priorities = ['smarts', 'spirit', 'vigor', 'agility', 'strength'];
        } else if (concept.includes('leader') || concept.includes('noble') || concept.includes('diplomat')) {
            priorities = ['spirit', 'smarts', 'vigor', 'agility', 'strength'];
        } else if (concept.includes('rogue') || concept.includes('thief') || concept.includes('scout')) {
            priorities = ['agility', 'smarts', 'spirit', 'vigor', 'strength'];
        } else {
            // Default balanced approach
            priorities = this.shuffleArray([...attributes]);
        }
        
        // Distribute points with priority weighting
        for (let i = 0; i < priorities.length && pointsToSpend > 0; i++) {
            const attr = priorities[i];
            const weight = (priorities.length - i) / priorities.length;
            const pointsForThisAttr = Math.floor(pointsToSpend * weight) + (Math.random() < 0.5 ? 1 : 0);
            
            for (let j = 0; j < pointsForThisAttr && pointsToSpend > 0; j++) {
                const currentValue = this.characterManager.getAttribute(attr);
                if (currentValue < 12) {
                    this.characterManager.incrementAttribute(attr);
                    pointsToSpend--;
                }
            }
        }
    }

    // Skill randomization
    randomizeSkills() {
        this.skillsManager.randomizeSkills();
    }

    // Hindrance randomization
    randomizeHindrances() {
        this.hindrancesManager.randomizeHindrances();
    }

    // Edge randomization
    randomizeEdges() {
        this.edgesManager.randomizeEdges();
    }

    // Detail randomization
    randomizeDetails() {
        const character = this.characterManager.getCharacter();
        
        // Generate random equipment based on concept/edges
        const equipment = this.generateRandomEquipment(character);
        this.characterManager.updateCharacter('equipment', equipment);
        
        // Generate random background
        const background = this.generateRandomBackground(character);
        this.characterManager.updateCharacter('background', background);
        
        // Generate random notes
        const notes = this.generateRandomNotes(character);
        this.characterManager.updateCharacter('notes', notes);
    }

    // Themed character generators (CORRECTED - removed Celestials/Guardians, fixed ancestry names)
    generateWarriorCharacter() {
        // Set appropriate ancestry (corrected names)
        const warriorAncestries = ['Humans', 'Dwarves', 'Saurians'];
        this.characterManager.updateCharacter('ancestry', this.randomChoice(warriorAncestries));
        
        // Set concept
        const warriorConcepts = ['Warrior', 'Soldier', 'Guardian', 'Mercenary', 'Gladiator'];
        this.characterManager.updateCharacter('concept', this.randomChoice(warriorConcepts));
        
        // Focus on combat attributes
        this.randomizeAttributesWithPriorities(['strength', 'vigor', 'agility', 'spirit', 'smarts']);
        
        // Prefer combat-related hindrances/edges
        this.randomizeThematicHindrances(['combat', 'physical']);
        this.randomizeThematicEdges(['combat', 'background']);
        this.randomizeThematicSkills(['Fighting', 'Athletics', 'Intimidation', 'Shooting']);
    }

    generateScholarCharacter() {
        // Scholar-type ancestries
        const scholarAncestries = ['Humans', 'Androids', 'Elves', 'Half-Elves', 'Aquarians'];
        this.characterManager.updateCharacter('ancestry', this.randomChoice(scholarAncestries));
        
        const scholarConcepts = ['Scholar', 'Researcher', 'Wizard', 'Inventor', 'Sage'];
        this.characterManager.updateCharacter('concept', this.randomChoice(scholarConcepts));
        
        this.randomizeAttributesWithPriorities(['smarts', 'spirit', 'vigor', 'agility', 'strength']);
        this.randomizeThematicHindrances(['social', 'mental']);
        this.randomizeThematicEdges(['power', 'professional', 'background']);
        this.randomizeThematicSkills(['Academics', 'Research', 'Science', 'Spellcasting']);
    }

    generateLeaderCharacter() {
        // Leader-type ancestries
        const leaderAncestries = ['Humans', 'Dwarves', 'Half-Elves'];
        this.characterManager.updateCharacter('ancestry', this.randomChoice(leaderAncestries));
        
        const leaderConcepts = ['Leader', 'Noble', 'Officer', 'Diplomat', 'Captain'];
        this.characterManager.updateCharacter('concept', this.randomChoice(leaderConcepts));
        
        this.randomizeAttributesWithPriorities(['spirit', 'smarts', 'vigor', 'agility', 'strength']);
        this.randomizeThematicHindrances(['social']);
        this.randomizeThematicEdges(['leadership', 'social', 'background']);
        this.randomizeThematicSkills(['Persuasion', 'Battle', 'Intimidation', 'Performance']);
    }

    generateRogueCharacter() {
        // Rogue-type ancestries
        const rogueAncestries = ['Humans', 'Elves', 'Half-Elves', 'Half-Folk', 'Rakashans', 'Avions'];
        this.characterManager.updateCharacter('ancestry', this.randomChoice(rogueAncestries));
        
        const rogueConcepts = ['Rogue', 'Thief', 'Scout', 'Spy', 'Assassin'];
        this.characterManager.updateCharacter('concept', this.randomChoice(rogueConcepts));
        
        this.randomizeAttributesWithPriorities(['agility', 'smarts', 'spirit', 'vigor', 'strength']);
        this.randomizeThematicHindrances(['social', 'mental']);
        this.randomizeThematicEdges(['professional', 'combat']);
        this.randomizeThematicSkills(['Stealth', 'Thievery', 'Athletics', 'Notice']);
    }

    generateMysticCharacter() {
        // Mystic-type ancestries
        const mysticAncestries = ['Humans', 'Elves', 'Half-Elves', 'Saurians'];
        this.characterManager.updateCharacter('ancestry', this.randomChoice(mysticAncestries));
        
        const mysticConcepts = ['Mystic', 'Shaman', 'Priest', 'Oracle', 'Witch'];
        this.characterManager.updateCharacter('concept', this.randomChoice(mysticConcepts));
        
        this.randomizeAttributesWithPriorities(['spirit', 'smarts', 'vigor', 'agility', 'strength']);
        this.randomizeThematicHindrances(['mental', 'social']);
        this.randomizeThematicEdges(['power', 'weird']);
        this.randomizeThematicSkills(['Faith', 'Focus', 'Healing', 'Occult']);
    }

    // NEW: Aquatic-themed character generator
    generateAquaticCharacter() {
        // Aquatic-themed ancestries
        const aquaticAncestries = ['Aquarians', 'Humans', 'Saurians'];
        this.characterManager.updateCharacter('ancestry', this.randomChoice(aquaticAncestries));
        
        const aquaticConcepts = ['Sea Captain', 'Pearl Diver', 'Marine Explorer', 'Tide Caller', 'Deep Hunter'];
        this.characterManager.updateCharacter('concept', this.randomChoice(aquaticConcepts));
        
        this.randomizeAttributesWithPriorities(['vigor', 'strength', 'spirit', 'agility', 'smarts']);
        this.randomizeThematicHindrances(['physical', 'environmental']);
        this.randomizeThematicEdges(['professional', 'background']);
        this.randomizeThematicSkills(['Athletics', 'Survival', 'Notice', 'Boating']);
    }

    // NEW: Aerial-themed character generator
    generateAerialCharacter() {
        // Aerial-themed ancestries  
        const aerialAncestries = ['Avions', 'Humans', 'Elves'];
        this.characterManager.updateCharacter('ancestry', this.randomChoice(aerialAncestries));
        
        const aerialConcepts = ['Sky Rider', 'Wind Walker', 'Storm Caller', 'Cloud Dancer', 'Aerial Scout'];
        this.characterManager.updateCharacter('concept', this.randomChoice(aerialConcepts));
        
        this.randomizeAttributesWithPriorities(['agility', 'spirit', 'vigor', 'smarts', 'strength']);
        this.randomizeThematicHindrances(['physical', 'environmental']);
        this.randomizeThematicEdges(['professional', 'background']);
        this.randomizeThematicSkills(['Athletics', 'Notice', 'Survival', 'Piloting']);
    }

    generateBalancedCharacter() {
        // Standard randomization
        this.randomizeBasicInfo();
        this.randomizeAttributes('balanced');
        this.randomizeHindrances();
        this.randomizeEdges();
        this.randomizeSkills();
    }

    // Helper methods for themed generation
    randomizeAttributesWithPriorities(priorities) {
        const character = this.characterManager.getCharacter();
        let pointsToSpend = 5;
        
        // Reset attributes
        Object.keys(character.attributes).forEach(attr => {
            this.characterManager.setAttribute(attr, 4);
        });
        
        // Distribute points based on priorities
        for (let i = 0; i < priorities.length && pointsToSpend > 0; i++) {
            const attr = priorities[i];
            const weight = (priorities.length - i) / priorities.length;
            const basePoints = Math.floor(pointsToSpend * weight);
            const bonus = Math.random() < (weight * 0.5) ? 1 : 0;
            const pointsForThisAttr = Math.min(basePoints + bonus, pointsToSpend, 4);
            
            for (let j = 0; j < pointsForThisAttr; j++) {
                this.characterManager.incrementAttribute(attr);
                pointsToSpend--;
            }
        }
        
        this.attributesManager.updateDisplay();
    }

    randomizeThematicHindrances(themes) {
        const character = this.characterManager.getCharacter();
        const hindrances = this.dataManager.getHindrances();
        const thematicHindrances = [];
        
        // Filter hindrances by theme
        Object.entries(hindrances).forEach(([name, data]) => {
            const description = data.description.toLowerCase();
            const matchesTheme = themes.some(theme => {
                switch (theme) {
                    case 'combat':
                        return description.includes('combat') || description.includes('fighting') || description.includes('attack');
                    case 'social':
                        return description.includes('social') || description.includes('persuasion') || description.includes('charisma');
                    case 'mental':
                        return description.includes('mental') || description.includes('smarts') || description.includes('knowledge');
                    case 'physical':
                        return description.includes('physical') || description.includes('vigor') || description.includes('strength');
                    case 'environmental':
                        return description.includes('environmental') || description.includes('weather') || description.includes('climate');
                    default:
                        return true;
                }
            });
            
            if (matchesTheme) {
                thematicHindrances.push({ name, data });
            }
        });
        
        // Select random thematic hindrances
        let pointsToSpend = Math.floor(Math.random() * 5); // 0-4 points
        let attempts = 0;
        
        while (pointsToSpend > 0 && attempts < 20) {
            attempts++;
            const hindrance = this.randomChoice(thematicHindrances);
            
            if (this.hindrancesManager.canTakeHindrance(character, hindrance.data) &&
                !character.hindrances.some(h => h.name === hindrance.name)) {
                
                this.characterManager.addHindrance(hindrance.name, hindrance.data.type, hindrance.data.points);
                pointsToSpend -= hindrance.data.points;
            }
        }
        
        this.hindrancesManager.updateDisplay();
    }

    randomizeThematicEdges(themes) {
        const character = this.characterManager.getCharacter();
        const edges = this.dataManager.getEdges();
        const thematicEdges = [];
        
        // Filter edges by theme
        Object.entries(edges).forEach(([name, data]) => {
            if (themes.includes(data.type)) {
                thematicEdges.push({ name, data });
            }
        });
        
        // Select random thematic edges
        const available = this.calculationsManager.getAvailableEdges(character);
        let edgesToTake = available.total;
        let attempts = 0;
        
        while (edgesToTake > 0 && attempts < 30) {
            attempts++;
            const edge = this.randomChoice(thematicEdges);
            
            const validation = this.calculationsManager.validateEdgeRequirements(character, edge.name);
            if (validation.valid && 
                this.edgesManager.canTakeEdge(character, edge.name) &&
                !character.edges.includes(edge.name)) {
                
                this.characterManager.addEdge(edge.name);
                edgesToTake--;
            }
        }
        
        this.edgesManager.updateDisplay();
    }

    randomizeThematicSkills(prioritySkills) {
        const character = this.characterManager.getCharacter();
        const allSkills = this.dataManager.getSkills();
        const rules = this.dataManager.getGameRules();
        
        // Reset skills
        Object.keys(character.skills).forEach(skill => {
            this.characterManager.setSkill(skill, 0);
        });
        
        let pointsToSpend = rules.skillPoints + this.calculationsManager.getBonusSkillPoints(character);
        
        // Invest in priority skills first
        prioritySkills.forEach(skillName => {
            if (pointsToSpend >= 2 && allSkills[skillName]) {
                this.characterManager.setSkill(skillName, 6); // d6
                pointsToSpend -= 1;
            }
        });
        
        // Ensure core skills have some investment
        const coreSkills = this.dataManager.getCoreSkills();
        coreSkills.forEach(skillName => {
            if (pointsToSpend >= 1 && (character.skills[skillName] || 0) === 0 && Math.random() < 0.7) {
                this.characterManager.setSkill(skillName, 4); // d4
                pointsToSpend -= 1;
            }
        });
        
        // Distribute remaining points randomly
        const skillNames = Object.keys(allSkills);
        while (pointsToSpend > 0) {
            const skillName = this.randomChoice(skillNames);
            const currentValue = character.skills[skillName] || 0;
            
            if (currentValue < 12) {
                const cost = this.calculationsManager.getSkillCost(
                    currentValue, 
                    currentValue + 2,
                    character.attributes[this.dataManager.getSkillAttribute(skillName)]
                );
                
                if (pointsToSpend >= cost) {
                    this.characterManager.incrementSkill(skillName);
                    pointsToSpend -= cost;
                } else {
                    break;
                }
            }
        }
        
        this.skillsManager.updateDisplay();
    }

    // Equipment and background generators
    generateRandomEquipment(character) {
        const equipmentOptions = [
            'Backpack, Bedroll, Blanket',
            'Rope (10"), Torch x3',
            'Rations (3 days), Waterskin',
            'Basic tools for trade',
            'Personal weapon',
            'Leather armor or thick clothes',
            'Purse with starting funds'
        ];
        
        // Add concept-specific equipment
        const concept = character.concept.toLowerCase();
        if (concept.includes('warrior') || concept.includes('soldier')) {
            equipmentOptions.push('Sword', 'Shield', 'Chain mail', 'Helmet');
        } else if (concept.includes('scholar') || concept.includes('wizard')) {
            equipmentOptions.push('Spellbook', 'Component pouch', 'Robes', 'Staff');
        } else if (concept.includes('rogue') || concept.includes('thief')) {
            equipmentOptions.push('Thieves\' tools', 'Dark cloak', 'Daggers x2', 'Grappling hook');
        }
        
        const selectedItems = this.shuffleArray(equipmentOptions).slice(0, 4 + Math.floor(Math.random() * 3));
        return selectedItems.join(', ');
    }

    generateRandomBackground(character) {
        const backgrounds = [
            `${character.name} grew up in a small village, learning the value of hard work and community.`,
            `Born into a family of ${character.concept.toLowerCase()}s, ${character.name} was trained from an early age.`,
            `${character.name} discovered their calling after a life-changing encounter with adventure.`,
            `Raised in the big city, ${character.name} learned to navigate complex social situations.`,
            `${character.name} comes from a long line of heroes and feels the weight of that legacy.`,
            `After losing everything in a tragic event, ${character.name} seeks to rebuild and find purpose.`,
            `${character.name} was mentored by a wise teacher who shaped their worldview.`,
            `Born during a time of conflict, ${character.name} learned survival skills early.`
        ];
        
        return this.randomChoice(backgrounds);
    }

    generateRandomNotes(character) {
        const notes = [
            'Character has a distinctive scar from an early adventure.',
            'Speaks with a slight accent from their homeland.',
            'Has a habit of collecting small trinkets from travels.',
            'Known for their distinctive laugh.',
            'Always carries a memento from family.',
            'Has an unusual pet or animal companion.',
            'Prefers to sleep under the stars when possible.',
            'Has a secret they haven\'t shared with anyone.'
        ];
        
        return this.randomChoice(notes);
    }

    // Data for randomization
    getRandomNames() {
        return [
            'Aelwin', 'Bjorn', 'Caelynn', 'Darius', 'Erin', 'Finn', 'Gwendolyn', 'Henrik',
            'Isla', 'Joren', 'Kira', 'Liam', 'Maya', 'Nolan', 'Olivia', 'Pierce',
            'Quinn', 'Rhea', 'Stefan', 'Tara', 'Ulric', 'Vera', 'Willem', 'Xara',
            'Yuki', 'Zara', 'Aldric', 'Brenna', 'Caspian', 'Delia', 'Evander', 'Freya'
        ];
    }

    getRandomConcepts() {
        return [
            'Warrior', 'Scholar', 'Rogue', 'Leader', 'Mystic', 'Healer', 'Explorer',
            'Merchant', 'Craftsman', 'Guardian', 'Hunter', 'Diplomat', 'Inventor',
            'Performer', 'Soldier', 'Wizard', 'Priest', 'Noble', 'Assassin', 'Ranger',
            'Paladin', 'Bard', 'Druid', 'Monk', 'Barbarian', 'Sorcerer', 'Warlock'
        ];
    }

    // Utility methods
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Configuration methods
    setRandomizationSettings(settings) {
        this.randomizationSettings = { ...this.randomizationSettings, ...settings };
    }

    getRandomizationSettings() {
        return { ...this.randomizationSettings };
    }

    // Seed-based randomization for reproducible results
    setSeed(seed) {
        this.seed = seed;
        this.rng = this.createSeededRNG(seed);
    }

    createSeededRNG(seed) {
        let current = seed;
        return () => {
            current = (current * 16807) % 2147483647;
            return (current - 1) / 2147483646;
        };
    }

    seededChoice(array) {
        if (this.rng) {
            return array[Math.floor(this.rng() * array.length)];
        }
        return this.randomChoice(array);
    }
}
