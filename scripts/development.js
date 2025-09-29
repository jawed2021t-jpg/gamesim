// PROTOTYPE: Dynamic Player Growth System from Guide.txt
class PlayerDevelopment {
    constructor(player) {
        this.player = player;
    }

    getAgeFactor(age) {
        if (age <= 21) return 1.5; // rapid growth
        if (age <= 24) return 1.2; // good growth
        if (age <= 27) return 0.8; // peak years
        if (age <= 30) return 0.3; // maintaining
        return -0.5; // decline
    }

    weeklyDevelopment() {
        const ageFactor = this.getAgeFactor(this.player.age);
        const potentialGap = this.player.potential - this.player.overall;

        // Base growth is higher for younger players with a large gap to potential
        let baseGrowth = (potentialGap * ageFactor * 0.01) / 4; // Divided by 4 for weekly gain

        if (baseGrowth <= 0 && ageFactor < 0) {
            // Decline for older players
            baseGrowth = ageFactor * 0.01;
        } else if (baseGrowth < 0) {
            baseGrowth = 0;
        }

        // Modifiers
        const playingTimeBonus = (this.player.minutesPlayed / 90) * 0.001; // Small weekly bonus
        const trainingBonus = gameState.currentClub.facilities.training * 0.0002;
        const moraleBonus = (this.player.morale - 50) / 1000; // -0.05 to +0.05

        let totalGrowth = baseGrowth + (baseGrowth * (playingTimeBonus + trainingBonus + moraleBonus));

        // Distribute growth
        this.applyAttributeGrowth(totalGrowth);

        // Reset minutes for the next week
        this.player.minutesPlayed = 0;
    }

    applyAttributeGrowth(growth) {
        if (growth === 0) return;

        const positionWeights = {
            'ST': { shooting: 0.3, pace: 0.2, physical: 0.2, dribbling: 0.3 },
            'CM': { passing: 0.3, vision: 0.3, stamina: 0.2, technique: 0.2 },
            'CB': { defending: 0.4, physical: 0.3, heading: 0.2, positioning: 0.1 },
            'GK': { handling: 0.5, reflexes: 0.5, positioning: 0.2 }, // Placeholder attributes
            'LB': { defending: 0.3, pace: 0.3, crossing: 0.2, stamina: 0.2 },
            'RB': { defending: 0.3, pace: 0.3, crossing: 0.2, stamina: 0.2 },
            'CDM': { defending: 0.3, passing: 0.3, workRate: 0.2, strength: 0.2 },
            'CAM': { passing: 0.3, vision: 0.3, dribbling: 0.3, flair: 0.1 },
            'LW': { pace: 0.3, dribbling: 0.3, shooting: 0.2, crossing: 0.2 },
            'RW': { pace: 0.3, dribbling: 0.3, shooting: 0.2, crossing: 0.2 },
        };

        const weights = positionWeights[this.player.position] || positionWeights['CM']; // Default to CM

        let totalWeight = 0;
        for (const attr in weights) {
            totalWeight += weights[attr];
        }

        let overallChange = 0;

        for (const attr in weights) {
            const attributeCategory = this.findAttributeCategory(attr);
            if(attributeCategory) {
                const increase = growth * (weights[attr] / totalWeight);
                this.player[attributeCategory][attr] = Math.min(99, this.player[attributeCategory][attr] + increase);
                overallChange += increase;
            }
        }

        // Recalculate overall
        this.recalculateOverall();
    }

    findAttributeCategory(attr) {
        if (this.player.technical.hasOwnProperty(attr)) return 'technical';
        if (this.player.mental.hasOwnProperty(attr)) return 'mental';
        if (this.player.physical.hasOwnProperty(attr)) return 'physical';
        return null;
    }

    recalculateOverall() {
        let totalRating = 0;
        let attributeCount = 0;
        const categories = ['technical', 'mental', 'physical'];

        for (const category of categories) {
            for (const attr in this.player[category]) {
                totalRating += this.player[category][attr];
                attributeCount++;
            }
        }
        this.player.overall = Math.floor(totalRating / attributeCount);
    }
}