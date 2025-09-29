// PROTOTYPE: Realistic Injury System from Guide.txt
class InjurySystem {
    calculateInjuryRisk(player, matchIntensity = 1) {
        const baseRisk = 0.005; // Lowered base risk for weekly check
        const fitnessRisk = (100 - player.fitness) / 100 * 0.01;
        const ageRisk = player.age > 30 ? (player.age - 30) * 0.001 : 0;
        const proneness = (player.hidden.injuryProneness || 50) / 100;
        const injuryPronenessRisk = proneness * 0.01;

        const totalRisk = baseRisk + fitnessRisk + ageRisk + injuryPronenessRisk;

        if (Math.random() < totalRisk) {
            this.generateInjury(player);
        }
    }

    generateInjury(player) {
        const severity = Math.random();
        let duration, type, description;

        if (severity < 0.5) { // 50%
            duration = Math.floor(Math.random() * 7) + 1; // 1-7 days
            type = "Knock";
            description = "Minor Knock";
        } else if (severity < 0.8) { // 30%
            duration = Math.floor(Math.random() * 14) + 7; // 1-2 weeks
            type = "Minor Injury";
            description = "Sprained Ankle";
        } else if (severity < 0.95) { // 15%
            duration = Math.floor(Math.random() * 30) + 21; // 3-6 weeks
            type = "Moderate Injury";
            description = "Hamstring Strain";
        } else { // 5%
            duration = Math.floor(Math.random() * 60) + 60; // 2-4 months
            type = "Severe Injury";
            description = "Torn Ligament";
        }

        player.injuries.push({ type, description, duration, remaining: duration });
        player.fitness = Math.max(0, player.fitness - 20); // Drop fitness on injury
        addNewsItem(`🏥 INJURY: ${player.name} has suffered a ${description} and will be out for ~${Math.ceil(duration/7)} weeks.`);
    }

    processWeeklyRecovery(player) {
        if(player.injuries.length > 0) {
            const injury = player.injuries[0]; // Process one injury at a time
            injury.remaining -= 7;
            if(injury.remaining <= 0) {
                player.injuries.shift(); // Remove injury
                addNewsItem(`✅ RECOVERY: ${player.name} has recovered from injury.`);
            }
        }
    }
}


// PROTOTYPE: Complex Morale System from Guide.txt
class MoraleSystem {
    updatePlayerMorale(player, teamPerformance) {
        let moraleDelta = 0;

        // Playing Time (simplified)
        if (player.minutesPlayed > 60) moraleDelta += 2;
        else if (player.minutesPlayed < 15) moraleDelta -= 2;

        // Team Performance (win: 1, draw: 0, loss: -1)
        if (teamPerformance === 1) moraleDelta += 3;
        else if (teamPerformance === -1) moraleDelta -= 3;

        // Random personal event
        if (Math.random() < 0.05) {
            const randomChange = Math.random() < 0.5 ? 5 : -5;
            moraleDelta += randomChange;
            addNewsItem(`📰 Personal event affects ${player.name}'s morale.`);
        }

        // Apply with dampening
        player.morale += moraleDelta;
        player.morale = Math.max(0, Math.min(100, player.morale));
    }
}