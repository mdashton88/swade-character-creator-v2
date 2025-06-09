// SWADE Character Creator v2 - Data Manager Module

export class DataManager {
    constructor() {
        this.data = {
            skills: null,
            hindrances: null,
            edges: null,
            config: null
        };
        this.isLoaded = false;
    }

    async loadAllData() {
        try {
            // Load all data files concurrently for faster loading
            const [skillsData, hindrancesData, edgesData, configData] = await Promise.all([
                this.loadJSON('./data/skills.json'),
                this.loadJSON('./data/hindrances.json'),
                this.loadJSON('./data/edges.json'),
                this.loadJSON('./data/config.json')
            ]);

            this.data.skills = skillsData;
            this.data.hindrances = hindrancesData;
            this.data.edges = edgesData;
            this.data.config = configData;

            this.isLoaded = true;
            console.log('All game data loaded successfully');
            
        } catch (error) {
            console.error('Failed to load game data:', error);
            throw new Error('Could not load game data files');
        }
    }

    async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    // Skills data accessors
    getSkills() {
        this.ensureDataLoaded();
        return this.data.skills.skills;
    }

    getCoreSkills() {
        this.ensureDataLoaded();
        return this.data.skills.coreSkills;
    }

    getSkillByName(name) {
        const skills = this.getSkills();
        return skills[name] || null;
    }

    getSkillAttribute(skillName) {
        const skill = this.getSkillByName(skillName);
        return skill ? skill.attribute : null;
    }

    // Hindrances data accessors
    getHindrances() {
        this.ensureDataLoaded();
        return this.data.hindrances.hindrances;
    }

    getHindranceByName(name) {
        const hindrances = this.getHindrances();
        return hindrances[name] || null;
    }

    getHindrancesByType(type) {
        const hindrances = this.getHindrances();
        return Object.entries(hindrances)
            .filter(([_, hindrance]) => hindrance.type === type)
            .reduce((acc, [name, hindrance]) => {
                acc[name] = hindrance;
                return acc;
            }, {});
    }

    // Edges data accessors
    getEdges() {
        this.ensureDataLoaded();
        return this.data.edges.edges;
    }

    getEdgeCategories() {
        this.ensureDataLoaded();
        return this.data.edges.edgeCategories;
    }

    getEdgeByName(name) {
        const edges = this.getEdges();
        return edges[name] || null;
    }

    getEdgesByType(type) {
        const edges = this.getEdges();
        return Object.entries(edges)
            .filter(([_, edge]) => edge.type === type)
            .reduce((acc, [name, edge]) => {
                acc[name] = edge;
                return acc;
            }, {});
    }

    // Configuration accessors
    getConfig() {
        this.ensureDataLoaded();
        return this.data.config;
    }

    getGameRules() {
        return this.getConfig().gameRules;
    }

    getAncestries() {
        return this.getConfig().ancestries;
    }

    getAncestryByName(name) {
        const ancestries = this.getAncestries();
        return ancestries[name] || null;
    }

    getCosts() {
        return this.getConfig().costs;
    }

    getDerivedStatsConfig() {
        return this.getConfig().derivedStats;
    }

    getStartingFundsConfig() {
        return this.getConfig().startingFunds;
    }

    // Utility methods
    ensureDataLoaded() {
        if (!this.isLoaded) {
            throw new Error('Data not loaded. Call loadAllData() first.');
        }
    }

    // Validation methods
    isValidSkill(skillName) {
        return this.getSkillByName(skillName) !== null;
    }

    isValidHindrance(hindranceName) {
        return this.getHindranceByName(hindranceName) !== null;
    }

    isValidEdge(edgeName) {
        return this.getEdgeByName(edgeName) !== null;
    }

    isValidAncestry(ancestryName) {
        return this.getAncestryByName(ancestryName) !== null;
    }

    // Search and filter methods
    searchSkills(query) {
        const skills = this.getSkills();
        const searchTerm = query.toLowerCase();
        
        return Object.entries(skills)
            .filter(([name, skill]) => 
                name.toLowerCase().includes(searchTerm) ||
                skill.description.toLowerCase().includes(searchTerm)
            )
            .reduce((acc, [name, skill]) => {
                acc[name] = skill;
                return acc;
            }, {});
    }

    searchHindrances(query) {
        const hindrances = this.getHindrances();
        const searchTerm = query.toLowerCase();
        
        return Object.entries(hindrances)
            .filter(([name, hindrance]) => 
                name.toLowerCase().includes(searchTerm) ||
                hindrance.description.toLowerCase().includes(searchTerm)
            )
            .reduce((acc, [name, hindrance]) => {
                acc[name] = hindrance;
                return acc;
            }, {});
    }

    searchEdges(query) {
        const edges = this.getEdges();
        const searchTerm = query.toLowerCase();
        
        return Object.entries(edges)
            .filter(([name, edge]) => 
                name.toLowerCase().includes(searchTerm) ||
                edge.description.toLowerCase().includes(searchTerm) ||
                edge.requirements.toLowerCase().includes(searchTerm)
            )
            .reduce((acc, [name, edge]) => {
                acc[name] = edge;
                return acc;
            }, {});
    }

    // Data export for debugging
    exportAllData() {
        this.ensureDataLoaded();
        return JSON.stringify(this.data, null, 2);
    }

    // Get random entries for randomization
    getRandomSkill() {
        const skills = Object.keys(this.getSkills());
        return skills[Math.floor(Math.random() * skills.length)];
    }

    getRandomHindrance(type = null) {
        let hindrances;
        if (type) {
            hindrances = Object.keys(this.getHindrancesByType(type));
        } else {
            hindrances = Object.keys(this.getHindrances());
        }
        return hindrances[Math.floor(Math.random() * hindrances.length)];
    }

    getRandomEdge(type = null) {
        let edges;
        if (type) {
            edges = Object.keys(this.getEdgesByType(type));
        } else {
            edges = Object.keys(this.getEdges());
        }
        return edges[Math.floor(Math.random() * edges.length)];
    }

    getRandomAncestry() {
        const ancestries = Object.keys(this.getAncestries());
        return ancestries[Math.floor(Math.random() * ancestries.length)];
    }
}