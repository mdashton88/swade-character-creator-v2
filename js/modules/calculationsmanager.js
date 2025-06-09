// SWADE Character Creator v2 - Calculations Manager Module

export class CalculationsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    // Attribute calculations
    calculateAttributePointsUsed(character) {
        const attributes = character.attributes;
        let total = 0;
        
        Object.values(attributes).forEach(value => {
            // Each step above d4 costs 1 point
            total += Math.max(0, (value - 4) / 2);
        });
        
        return total;
    }

    calculateAttributePointsRemaining(character) {
        const rules = this.dataManager.getGameRules();
        const used = this.calculateAttributePointsUsed(character);
        return Math.max(0, rules.attributePoints - used);
    }

    getAttributeCost(currentValue, targetValue) {
        if (targetValue <= currentValue) return 0;
        
        let cost = 0;
        for (let value = currentValue; value < targetValue; value += 2) {
            cost += 1; // Each step costs 1 point
        }
        return cost;
    }

    canAffordAttributeIncrease(character, attributeName) {
        const remaining = this.calculateAttributePointsRemaining(character);
        const current = character.attributes[attributeName];
        const cost = this.getAttributeCost(current, current + 2);
        
        return remaining >= cost && current < 12;
    }

    // Skill calculations
    calculateSkillPointsUsed(character) {
        const skills = { ...character.skills };
        const customSkills = character.customSkills || {};
        let total = 0;
        
        Object.entries(skills).forEach(([skillName, value]) => {
            if (value > 0) {
                const linkedAttribute = this.getSkillLinkedAttribute(skillName, customSkills);
                const attributeValue = character.attributes[linkedAttribute] || 4;
                const cost = this.getSkillCost(0, value, attributeValue);
                total += cost;
            }
        });
        
        return total;
    }

    calculateSkillPointsRemaining(character) {
        const rules = this.dataManager.getGameRules();
        const bonusPoints = this.getBonusSkillPoints(character);
        const used = this.calculateSkillPointsUsed(character);
        const total = rules.skillPoints + bonusPoints;
        
        return Math.max(0, total - used);
    }

    getSkillLinkedAttribute(skillName, customSkills = {}) {
        // Check if it's a custom skill first
        if (customSkills[skillName]) {
            return customSkills[skillName].attribute;
        }
        
        // Check standard skills
        const skill = this.dataManager.getSkillByName(skillName);
        return skill ? skill.attribute : 'smarts'; // Default to smarts if not found
    }

    getSkillCost(currentValue, targetValue, linkedAttributeValue) {
        if (targetValue <= currentValue) return 0;
        
        let cost = 0;
        
        for (let value = currentValue; value < targetValue; value += 2) {
            if (value < linkedAttributeValue) {
                cost += 1; // Below attribute: 1 point per step
            } else {
                cost += 2; // Above attribute: 2 points per step
            }
        }
        
        return cost;
    }

    canAffordSkillIncrease(character, skillName) {
        const remaining = this.calculateSkillPointsRemaining(character);
        const current = character.skills[skillName] || 0;
        const linkedAttribute = this.getSkillLinkedAttribute(skillName, character.customSkills);
        const attributeValue = character.attributes[linkedAttribute];
        const cost = this.getSkillCost(current, current + 2, attributeValue);
        
        return remaining >= cost && current < 12;
    }

    isSkillExpensive(character, skillName) {
        const current = character.skills[skillName] || 0;
        const linkedAttribute = this.getSkillLinkedAttribute(skillName, character.customSkills);
        const attributeValue = character.attributes[linkedAttribute];
        
        // Skill is expensive if next increase costs 2 points
        return current >= attributeValue;
    }

    // Hindrance calculations
    getHindrancePoints(character) {
        const hindrances = character.hindrances || [];
        let minor = 0;
        let major = 0;
        let total = 0;
        
        hindrances.forEach(hindrance => {
            total += hindrance.points;
            if (hindrance.type === 'minor') {
                minor += hindrance.points;
            } else if (hindrance.type === 'major') {
                major += hindrance.points;
            }
        });
        
        return { minor, major, total };
    }

    getHindranceBonuses(character) {
        const points = this.getHindrancePoints(character);
        const rules = this.dataManager.getGameRules();
        
        // Calculate bonuses based on hindrance points
        let skillPoints = 0;
        let edges = 0;
        let remainingPoints = points.total;
        
        // First 2 points go to an Edge
        if (remainingPoints >= 2) {
            edges += 1;
            remainingPoints -= 2;
        }
        
        // Next 2 points go to skill points
        if (remainingPoints >= 2) {
            skillPoints += 2;
            remainingPoints -= 2;
        }
        
        return { skillPoints, edges };
    }

    getBonusSkillPoints(character) {
        const bonuses = this.getHindranceBonuses(character);
        let total = bonuses.skillPoints;
        
        // Add ancestry bonuses
        const ancestry = this.dataManager.getAncestryByName(character.ancestry);
        if (ancestry && ancestry.bonuses && ancestry.bonuses.skillPoints) {
            total += ancestry.bonuses.skillPoints;
        }
        
        return total;
    }

    canTakeMoreHindrances(character) {
        const points = this.getHindrancePoints(character);
        const rules = this.dataManager.getGameRules();
        
        return points.total < rules.hindrancePointsMax;
    }

    canTakeMinorHindrance(character) {
        const points = this.getHindrancePoints(character);
        const rules = this.dataManager.getGameRules();
        
        return (points.total < rules.hindrancePointsMax) && 
               (points.minor < rules.hindrancePointsMinorMax);
    }

    // Edge calculations
    getAvailableEdges(character) {
        let base = 0;
        let fromHindrances = 0;
        
        // Base edges from ancestry
        const ancestry = this.dataManager.getAncestryByName(character.ancestry);
        if (ancestry && ancestry.bonuses && ancestry.bonuses.edges) {
            base += ancestry.bonuses.edges;
        }
        
        // Edges from hindrances
        const hindranceBonuses = this.getHindranceBonuses(character);
        fromHindrances = hindranceBonuses.edges;
        
        const total = base + fromHindrances;
        const used = character.edges.length;
        const remaining = Math.max(0, total - used);
        
        return { base, fromHindrances, total, used, remaining };
    }

    canTakeMoreEdges(character) {
        const edgeInfo = this.getAvailableEdges(character);
        return edgeInfo.remaining > 0;
    }

    // Edge requirements validation
    validateEdgeRequirements(character, edgeName) {
        const edge = this.dataManager.getEdgeByName(edgeName);
        if (!edge) return { valid: false, reason: 'Edge not found' };
        
        const requirements = edge.requirements.toLowerCase();
        
        // Check rank requirements
        if (requirements.includes('seasoned')) {
            return { valid: false, reason: 'Requires Seasoned rank (character creation is Novice)' };
        }
        if (requirements.includes('veteran')) {
            return { valid: false, reason: 'Requires Veteran rank (character creation is Novice)' };
        }
        if (requirements.includes('heroic')) {
            return { valid: false, reason: 'Requires Heroic rank (character creation is Novice)' };
        }
        
        // Check attribute requirements
        const attributeMatches = requirements.match(/([a-z]+)\s+d(\d+)\+/g);
        if (attributeMatches) {
            for (const match of attributeMatches) {
                const [, attr, die] = match.match(/([a-z]+)\s+d(\d+)\+/);
                const requiredValue = parseInt(die);
                const characterValue = character.attributes[attr];
                
                if (!characterValue || characterValue < requiredValue) {
                    return { 
                        valid: false, 
                        reason: `Requires ${attr.charAt(0).toUpperCase() + attr.slice(1)} d${die}+` 
                    };
                }
            }
        }
        
        // Check skill requirements
        const skillMatches = requirements.match(/([a-z\s]+)\s+d(\d+)\+/gi);
        if (skillMatches) {
            for (const match of skillMatches) {
                const parts = match.trim().split(/\s+d/);
                if (parts.length === 2) {
                    const skillName = parts[0].trim();
                    const requiredValue = parseInt(parts[1]);
                    const characterSkill = character.skills[skillName] || 0;
                    
                    if (characterSkill < requiredValue) {
                        return { 
                            valid: false, 
                            reason: `Requires ${skillName} d${requiredValue}+` 
                        };
                    }
                }
            }
        }
        
        // Check prerequisite edges
        if (requirements.includes('luck') && !character.edges.includes('Luck')) {
            return { valid: false, reason: 'Requires Luck Edge' };
        }
        
        if (requirements.includes('arcane background') && 
            !character.edges.some(edge => edge.startsWith('Arcane Background'))) {
            return { valid: false, reason: 'Requires an Arcane Background Edge' };
        }
        
        return { valid: true, reason: '' };
    }

    // Derived statistics
    calculateDerivedStats(character) {
        const config = this.dataManager.getDerivedStatsConfig();
        
        // Base pace
        let pace = config.pace.base;
        
        // Apply ancestry modifiers
        const ancestry = this.dataManager.getAncestryByName(character.ancestry);
        if (ancestry && ancestry.traits) {
            if (ancestry.traits.includes('Slow')) {
                pace -= 1;
            }
        }
        
        // Apply hindrance modifiers
        character.hindrances.forEach(hindrance => {
            if (hindrance.name.includes('Slow (Minor)')) pace -= 1;
            if (hindrance.name.includes('Slow (Major)')) pace -= 2;
        });
        
        // Apply edge modifiers
        if (character.edges.includes('Fleet-Footed')) {
            pace += 2;
        }
        
        // Parry calculation
        const fightingSkill = character.skills['Fighting'] || 0;
        let parry = Math.floor(config.parry.formula.replace('Fighting', fightingSkill).replace('2 + (', '2 + ').replace(' / 2)', ' / 2'));
        parry = Math.max(parry, config.parry.minimum);
        
        // Apply parry modifiers
        if (character.edges.includes('Block')) parry += 1;
        if (character.edges.includes('Improved Block')) parry += 2;
        
        // Toughness calculation
        const vigorValue = character.attributes.vigor;
        let toughness = 2 + Math.floor(vigorValue / 2);
        
        // Apply toughness modifiers
        if (character.edges.includes('Brawny')) toughness += 1;
        if (character.hindrances.some(h => h.name === 'Small')) toughness -= 1;
        
        // Apply ancestry size modifiers
        if (ancestry && ancestry.traits) {
            if (ancestry.traits.includes('Small')) toughness -= 1;
            if (ancestry.traits.includes('Armor +2')) toughness += 2;
        }
        
        return {
            pace: Math.max(1, pace),
            parry: Math.max(2, parry),
            toughness: Math.max(1, toughness)
        };
    }

    // Starting funds calculation
    calculateStartingFunds(character) {
        const config = this.dataManager.getStartingFundsConfig();
        let funds = config.base;
        
        // Apply hindrance modifiers
        if (character.hindrances.some(h => h.name === 'Poverty')) {
            funds = config.poverty;
        }
        
        // Apply edge modifiers
        if (character.edges.includes('Rich')) {
            funds = config.rich;
        }
        if (character.edges.includes('Filthy Rich')) {
            funds = config.filthyRich;
        }
        
        return funds;
    }

    // Character validation
    validateCharacter(character) {
        const errors = [];
        const warnings = [];
        
        // Check attribute points
        const attributePoints = this.calculateAttributePointsRemaining(character);
        if (attributePoints < 0) {
            errors.push(`Over attribute point limit by ${Math.abs(attributePoints)} points`);
        }
        
        // Check skill points
        const skillPoints = this.calculateSkillPointsRemaining(character);
        if (skillPoints < 0) {
            errors.push(`Over skill point limit by ${Math.abs(skillPoints)} points`);
        }
        
        // Check hindrance limits
        const hindrancePoints = this.getHindrancePoints(character);
        const rules = this.dataManager.getGameRules();
        
        if (hindrancePoints.total > rules.hindrancePointsMax) {
            errors.push(`Too many hindrance points: ${hindrancePoints.total}/${rules.hindrancePointsMax}`);
        }
        
        if (hindrancePoints.minor > rules.hindrancePointsMinorMax) {
            errors.push(`Too many minor hindrance points: ${hindrancePoints.minor}/${rules.hindrancePointsMinorMax}`);
        }
        
        // Check edge limits
        const edgeInfo = this.getAvailableEdges(character);
        if (edgeInfo.remaining < 0) {
            errors.push(`Too many edges selected: ${edgeInfo.used}/${edgeInfo.total}`);
        }
        
        // Validate edge requirements
        character.edges.forEach(edgeName => {
            const validation = this.validateEdgeRequirements(character, edgeName);
            if (!validation.valid) {
                errors.push(`${edgeName}: ${validation.reason}`);
            }
        });
        
        // Warnings for unspent points
        if (attributePoints > 0) {
            warnings.push(`${attributePoints} unspent attribute points`);
        }
        
        if (skillPoints > 2) { // Allow some flexibility
            warnings.push(`${skillPoints} unspent skill points`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    // Utility methods
    getDieTypeDisplay(value) {
        return `d${value}`;
    }

    getNextDieType(currentValue) {
        const dieTypes = this.dataManager.getGameRules().dieTypes;
        const currentIndex = dieTypes.indexOf(currentValue);
        
        if (currentIndex !== -1 && currentIndex < dieTypes.length - 1) {
            return dieTypes[currentIndex + 1];
        }
        
        return currentValue; // Already at maximum
    }

    getPreviousDieType(currentValue) {
        const dieTypes = this.dataManager.getGameRules().dieTypes;
        const currentIndex = dieTypes.indexOf(currentValue);
        
        if (currentIndex > 0) {
            return dieTypes[currentIndex - 1];
        }
        
        return currentValue; // Already at minimum
    }
}