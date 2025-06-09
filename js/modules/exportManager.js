// SWADE Character Creator v2 - Export Manager Module

export class ExportManager {
    constructor(dataManager, characterManager) {
        this.dataManager = dataManager;
        this.characterManager = characterManager;
    }

    // Export as formatted text
    exportAsText() {
        const character = this.characterManager.getCharacter();
        const textData = this.generateCharacterText(character);
        
        this.downloadFile(
            textData,
            `${character.name || 'Character'}_SWADE.txt`,
            'text/plain'
        );
    }

    // Export as JSON
    exportAsJSON() {
        const character = this.characterManager.getCharacter();
        const jsonData = this.characterManager.exportToJSON();
        
        this.downloadFile(
            jsonData,
            `${character.name || 'Character'}_SWADE.json`,
            'application/json'
        );
    }

    // Print character sheet
    printCharacter() {
        const character = this.characterManager.getCharacter();
        const textData = this.generateCharacterText(character);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generatePrintHTML(textData, character));
        printWindow.document.close();
        printWindow.focus();
        
        // Wait a moment for content to load, then print
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    // Load character from file
    async loadCharacterFromFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    
                    // Try to parse as JSON
                    const characterData = JSON.parse(content);
                    
                    // Import the character
                    const success = this.characterManager.importFromJSON(JSON.stringify(characterData));
                    
                    if (success) {
                        resolve(characterData);
                    } else {
                        reject(new Error('Invalid character data format'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse character file: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    // Generate formatted character text
    generateCharacterText(character) {
        const lines = [];
        const separator = '═'.repeat(67);
        
        // Header
        lines.push(separator);
        lines.push('                        SAVAGE WORLDS CHARACTER SHEET');
        lines.push(separator);
        lines.push('');
        
        // Basic Information
        lines.push(`CHARACTER NAME: ${character.name || '[Unnamed]'}`);
        lines.push(`CONCEPT: ${character.concept || '[No concept]'}`);
        lines.push(`ANCESTRY: ${character.ancestry}`);
        lines.push('');
        
        // Attributes
        lines.push(separator);
        lines.push('                             ATTRIBUTES');
        lines.push(separator);
        lines.push('');
        
        Object.entries(character.attributes).forEach(([attr, value]) => {
            const name = attr.charAt(0).toUpperCase() + attr.slice(1);
            lines.push(`${name.padEnd(15)} d${value}`);
        });
        lines.push('');
        
        // Derived Stats
        lines.push(separator);
        lines.push('                            DERIVED STATS');
        lines.push(separator);
        lines.push('');
        
        const derivedStats = this.calculateDerivedStatsForExport(character);
        lines.push(`Pace ............ ${derivedStats.pace}`);
        lines.push(`Parry ........... ${derivedStats.parry}`);
        lines.push(`Toughness ....... ${derivedStats.toughness}`);
        lines.push('');
        
        // Skills
        lines.push(separator);
        lines.push('                               SKILLS');
        lines.push(separator);
        lines.push('');
        
        const coreSkills = this.dataManager.getCoreSkills();
        const skillEntries = Object.entries(character.skills)
            .filter(([_, value]) => value > 0)
            .sort(([a], [b]) => a.localeCompare(b));
        
        if (skillEntries.length > 0) {
            skillEntries.forEach(([skill, value]) => {
                const core = coreSkills.includes(skill) ? ' (Core)' : '';
                lines.push(`${(skill + core).padEnd(25)} d${value}`);
            });
        } else {
            lines.push('[No skills trained]');
        }
        lines.push('');
        
        // Hindrances & Edges
        lines.push(separator);
        lines.push('                            HINDRANCES & EDGES');
        lines.push(separator);
        lines.push('');
        
        lines.push('HINDRANCES:');
        if (character.hindrances.length > 0) {
            character.hindrances.forEach(h => {
                lines.push(`${h.name} (${h.type.toUpperCase()}, ${h.points} pt${h.points > 1 ? 's' : ''})`);
            });
        } else {
            lines.push('[None selected]');
        }
        lines.push('');
        
        lines.push('EDGES:');
        if (character.edges.length > 0) {
            character.edges.forEach(edge => {
                lines.push(edge);
            });
        } else {
            lines.push('[None selected]');
        }
        lines.push('');
        
        // Equipment
        lines.push(separator);
        lines.push('                               EQUIPMENT');
        lines.push(separator);
        lines.push('');
        
        const startingFunds = this.calculateStartingFundsForExport(character);
        lines.push(`STARTING FUNDS: $${startingFunds}`);
        lines.push('');
        lines.push('EQUIPMENT:');
        lines.push(character.equipment || '[No equipment listed]');
        lines.push('');
        
        // Special Abilities
        lines.push(separator);
        lines.push('                           SPECIAL ABILITIES');
        lines.push(separator);
        lines.push('');
        
        lines.push('SPECIAL ABILITIES & POWERS:');
        lines.push(character.specialAbilities || '[No special abilities listed]');
        lines.push('');
        
        // Background
        lines.push(separator);
        lines.push('                               BACKGROUND');
        lines.push(separator);
        lines.push('');
        
        lines.push('CHARACTER BACKGROUND:');
        lines.push(character.background || '[No background provided]');
        lines.push('');
        
        lines.push('NOTES:');
        lines.push(character.notes || '[No notes provided]');
        lines.push('');
        
        // Footer
        lines.push(separator);
        lines.push('');
        lines.push('Generated by SWADE Character Creator v2');
        lines.push('Savage Worlds Adventure Edition');
        lines.push(`Created: ${new Date().toLocaleString()}`);
        lines.push('');
        lines.push(separator);
        
        return lines.join('\n');
    }

    // Generate HTML for printing
    generatePrintHTML(textData, character) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>${character.name || 'Character'} - SWADE Character Sheet</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 20px;
            color: #000;
            background: #fff;
        }
        
        .character-sheet {
            white-space: pre-wrap;
            max-width: 800px;
            margin: 0 auto;
        }
        
        @media print {
            body {
                margin: 0;
                font-size: 10px;
            }
            
            .character-sheet {
                max-width: none;
                margin: 0;
            }
            
            .no-print {
                display: none;
            }
        }
        
        .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        
        .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="print-header no-print">
        <h1>SWADE Character Sheet</h1>
        <p>Generated by SWADE Character Creator v2</p>
    </div>
    
    <div class="character-sheet">${textData}</div>
    
    <div class="print-footer no-print">
        <p>Printed from SWADE Character Creator v2 on ${new Date().toLocaleString()}</p>
    </div>
    
    <script>
        // Auto-close window after printing (optional)
        window.addEventListener('afterprint', function() {
            setTimeout(function() {
                window.close();
            }, 1000);
        });
    </script>
</body>
</html>
        `;
    }

    // Export to different formats
    exportAsCSV() {
        const character = this.characterManager.getCharacter();
        const csvData = this.generateCharacterCSV(character);
        
        this.downloadFile(
            csvData,
            `${character.name || 'Character'}_SWADE.csv`,
            'text/csv'
        );
    }

    generateCharacterCSV(character) {
        const rows = [];
        
        // Header
        rows.push(['Property', 'Value', 'Category']);
        
        // Basic info
        rows.push(['Name', character.name || '', 'Basic']);
        rows.push(['Concept', character.concept || '', 'Basic']);
        rows.push(['Ancestry', character.ancestry, 'Basic']);
        
        // Attributes
        Object.entries(character.attributes).forEach(([attr, value]) => {
            rows.push([attr.charAt(0).toUpperCase() + attr.slice(1), `d${value}`, 'Attributes']);
        });
        
        // Skills
        Object.entries(character.skills).forEach(([skill, value]) => {
            if (value > 0) {
                rows.push([skill, `d${value}`, 'Skills']);
            }
        });
        
        // Hindrances
        character.hindrances.forEach(h => {
            rows.push([h.name, `${h.type} (${h.points} pts)`, 'Hindrances']);
        });
        
        // Edges
        character.edges.forEach(edge => {
            rows.push([edge, 'Selected', 'Edges']);
        });
        
        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    // Export as XML
    exportAsXML() {
        const character = this.characterManager.getCharacter();
        const xmlData = this.generateCharacterXML(character);
        
        this.downloadFile(
            xmlData,
            `${character.name || 'Character'}_SWADE.xml`,
            'application/xml'
        );
    }

    generateCharacterXML(character) {
        const lines = [];
        lines.push('<?xml version="1.0" encoding="UTF-8"?>');
        lines.push('<character>');
        lines.push('  <metadata>');
        lines.push(`    <creator>SWADE Character Creator v2</creator>`);
        lines.push(`    <created>${new Date().toISOString()}</created>`);
        lines.push('  </metadata>');
        
        lines.push('  <basic>');
        lines.push(`    <name>${this.escapeXML(character.name || '')}</name>`);
        lines.push(`    <concept>${this.escapeXML(character.concept || '')}</concept>`);
        lines.push(`    <ancestry>${this.escapeXML(character.ancestry)}</ancestry>`);
        lines.push('  </basic>');
        
        lines.push('  <attributes>');
        Object.entries(character.attributes).forEach(([attr, value]) => {
            lines.push(`    <${attr}>${value}</${attr}>`);
        });
        lines.push('  </attributes>');
        
        lines.push('  <skills>');
        Object.entries(character.skills).forEach(([skill, value]) => {
            if (value > 0) {
                lines.push(`    <skill name="${this.escapeXML(skill)}" value="${value}" />`);
            }
        });
        lines.push('  </skills>');
        
        lines.push('  <hindrances>');
        character.hindrances.forEach(h => {
            lines.push(`    <hindrance name="${this.escapeXML(h.name)}" type="${h.type}" points="${h.points}" />`);
        });
        lines.push('  </hindrances>');
        
        lines.push('  <edges>');
        character.edges.forEach(edge => {
            lines.push(`    <edge name="${this.escapeXML(edge)}" />`);
        });
        lines.push('  </edges>');
        
        lines.push('  <details>');
        lines.push(`    <equipment>${this.escapeXML(character.equipment || '')}</equipment>`);
        lines.push(`    <background>${this.escapeXML(character.background || '')}</background>`);
        lines.push(`    <specialAbilities>${this.escapeXML(character.specialAbilities || '')}</specialAbilities>`);
        lines.push(`    <notes>${this.escapeXML(character.notes || '')}</notes>`);
        lines.push('  </details>');
        
        lines.push('</character>');
        
        return lines.join('\n');
    }

    // Utility methods
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    escapeXML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    // Calculate derived stats for export (simplified version)
    calculateDerivedStatsForExport(character) {
        let pace = 6;
        let parry = 2;
        let toughness = 2;
        
        // Basic calculations
        const fightingSkill = character.skills['Fighting'] || 0;
        if (fightingSkill > 0) {
            parry = 2 + Math.floor(fightingSkill / 2);
        }
        
        const vigorValue = character.attributes.vigor;
        toughness = 2 + Math.floor(vigorValue / 2);
        
        // Apply some basic modifiers
        if (character.edges.includes('Fleet-Footed')) pace += 2;
        if (character.hindrances.some(h => h.name.includes('Slow'))) pace -= 1;
        if (character.edges.includes('Block')) parry += 1;
        if (character.hindrances.some(h => h.name === 'Small')) toughness -= 1;
        
        return {
            pace: Math.max(1, pace),
            parry: Math.max(2, parry),
            toughness: Math.max(1, toughness)
        };
    }

    calculateStartingFundsForExport(character) {
        let funds = 500; // Base
        
        if (character.hindrances.some(h => h.name === 'Poverty')) {
            funds = 250;
        } else if (character.edges.includes('Rich')) {
            funds = 1500;
        } else if (character.edges.includes('Filthy Rich')) {
            funds = 2500;
        }
        
        return funds;
    }

    // Bulk export methods
    exportCharacterSummary() {
        const character = this.characterManager.getCharacter();
        
        const summary = {
            name: character.name || 'Unnamed Character',
            concept: character.concept || 'No concept',
            ancestry: character.ancestry,
            
            attributes: Object.entries(character.attributes).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value: `d${value}`
            })),
            
            skills: Object.entries(character.skills)
                .filter(([_, value]) => value > 0)
                .map(([name, value]) => ({
                    name,
                    value: `d${value}`,
                    isCore: this.dataManager.getCoreSkills().includes(name)
                })),
            
            hindrances: character.hindrances.map(h => ({
                name: h.name,
                type: h.type,
                points: h.points
            })),
            
            edges: character.edges.map(edge => ({
                name: edge
            })),
            
            derivedStats: this.calculateDerivedStatsForExport(character),
            
            pointsAnalysis: {
                attributePoints: this.calculateAttributePointsUsed(character),
                skillPoints: this.calculateSkillPointsUsed(character),
                hindrancePoints: character.hindrances.reduce((sum, h) => sum + h.points, 0)
            }
        };
        
        const jsonData = JSON.stringify(summary, null, 2);
        
        this.downloadFile(
            jsonData,
            `${character.name || 'Character'}_Summary.json`,
            'application/json'
        );
    }

    // Quick calculations for export
    calculateAttributePointsUsed(character) {
        return Object.values(character.attributes).reduce((sum, value) => {
            return sum + Math.max(0, (value - 4) / 2);
        }, 0);
    }

    calculateSkillPointsUsed(character) {
        // Simplified calculation
        return Object.values(character.skills).reduce((sum, value) => {
            return sum + (value / 2);
        }, 0);
    }

    // Import validation
    validateImportedCharacter(characterData) {
        const required = ['name', 'concept', 'ancestry', 'attributes', 'skills', 'hindrances', 'edges'];
        
        for (const field of required) {
            if (!(field in characterData)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Validate structure
        if (typeof characterData.attributes !== 'object') {
            throw new Error('Invalid attributes structure');
        }
        
        if (!Array.isArray(characterData.hindrances)) {
            throw new Error('Hindrances must be an array');
        }
        
        if (!Array.isArray(characterData.edges)) {
            throw new Error('Edges must be an array');
        }
        
        return true;
    }

    // Backup and restore
    createBackup() {
        const character = this.characterManager.getCharacter();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `Character_Backup_${timestamp}.json`;
        
        this.exportAsJSON();
        
        return filename;
    }

    // Multiple character export
    exportMultipleCharacters(characters) {
        const exportData = {
            metadata: {
                exported: new Date().toISOString(),
                version: '2.0',
                count: characters.length
            },
            characters: characters
        };
        
        const jsonData = JSON.stringify(exportData, null, 2);
        
        this.downloadFile(
            jsonData,
            `SWADE_Characters_Export.json`,
            'application/json'
        );
    }
}
