// PROTOTYPE: Advanced Match Simulation Engine from Guide.txt
class MatchEngine {
    constructor(homeTeam, awayTeam, homePlayers, awayPlayers, tactics) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.homePlayers = homePlayers;
        this.awayPlayers = awayPlayers;
        this.tactics = tactics; // Will be used in future steps
        this.homeScore = 0;
        this.awayScore = 0;
        this.events = [];
    }

    // Helper to get players by position category
    getPlayersByPositionCategory(players, category) {
        const positionMap = {
            'GK': ['GK'],
            'DEF': ['CB', 'LB', 'RB'],
            'MID': ['CDM', 'CM', 'CAM'],
            'ATT': ['LW', 'RW', 'ST']
        };
        return players.filter(p => positionMap[category].includes(p.position));
    }

    calculateTeamStrength(players) {
        const strength = {
            attack: 0,
            midfield: 0,
            defense: 0,
            overall: 0
        };

        if (players.length === 0) return strength;

        const attackers = this.getPlayersByPositionCategory(players, 'ATT');
        const midfielders = this.getPlayersByPositionCategory(players, 'MID');
        const defenders = this.getPlayersByPositionCategory(players, 'DEF');
        const goalkeepers = this.getPlayersByPositionCategory(players, 'GK');

        if (attackers.length > 0) {
            strength.attack = attackers.reduce((sum, p) => sum + p.attributes.shooting, 0) / attackers.length;
        }
        if (midfielders.length > 0) {
            strength.midfield = midfielders.reduce((sum, p) => sum + p.attributes.passing, 0) / midfielders.length;
        }
        if (defenders.length > 0) {
            strength.defense = defenders.reduce((sum, p) => sum + p.attributes.defending, 0) / defenders.length;
        }
        if (goalkeepers.length > 0) {
            // Goalkeeper contributes to defense
            strength.defense = (strength.defense * defenders.length + goalkeepers[0].overall) / (defenders.length + 1)
        }

        strength.overall = players.reduce((sum, p) => sum + p.overall, 0) / players.length;
        return strength;
    }

    simulate() {
        const homeStrength = this.calculateTeamStrength(this.homePlayers);
        const awayStrength = this.calculateTeamStrength(this.awayPlayers);

        // Add home advantage
        homeStrength.overall *= 1.05;
        homeStrength.attack *= 1.08; // More significant advantage in attack

        const totalAttack = homeStrength.attack + awayStrength.attack;

        for (let minute = 1; minute <= 90; minute++) {
            // Chance of an event happening
            if (Math.random() < 0.2) {
                const attackPower = Math.random() * totalAttack;

                if (attackPower < homeStrength.attack) {
                    // Home team attacks
                    // Goal chance depends on attack vs defense
                    const goalChance = (homeStrength.attack / (homeStrength.attack + awayStrength.defense*1.5));
                    if (Math.random() < goalChance / 10) { // Divided by 10 to reduce goal fest
                        this.homeScore++;
                        const scorer = this.getPlayersByPositionCategory(this.homePlayers, 'ATT')[0] || this.homePlayers[0];
                        this.events.push({ minute, type: 'goal', team: this.homeTeam, text: `⚽ GOAL! ${scorer.name} scores for ${this.homeTeam}!` });
                    } else {
                         this.events.push({ minute, type: 'chance', team: this.homeTeam, text: `A close chance for ${this.homeTeam}!` });
                    }
                } else {
                    // Away team attacks
                     const goalChance = (awayStrength.attack / (awayStrength.attack + homeStrength.defense*1.5));
                     if (Math.random() < goalChance / 10) {
                        this.awayScore++;
                        const scorer = this.getPlayersByPositionCategory(this.awayPlayers, 'ATT')[0] || this.awayPlayers[0];
                        this.events.push({ minute, type: 'goal', team: this.awayTeam, text: `⚽ GOAL! ${scorer.name} scores for ${this.awayTeam}!` });
                    }
                }
            }

            // Random cards
            if (Math.random() < 0.01) {
                 const team = Math.random() < 0.5 ? this.homeTeam : this.awayTeam;
                 this.events.push({ minute, type: 'yellow', team, text: `🟨 Yellow card for ${team}.` });
            }
        }
        return {
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            events: this.events
        };
    }
}

// Match Simulation
function simulateMatch() {
    const homeTeam = gameState.currentClub;
    // Find a different team for the opponent
    let awayTeamData = gameState.leagueTable[Math.floor(Math.random() * gameState.leagueTable.length)];
    while(awayTeamData.name === homeTeam.name) {
        awayTeamData = gameState.leagueTable[Math.floor(Math.random() * gameState.leagueTable.length)];
    }
    const awayTeam = { name: awayTeamData.name };

    document.getElementById('homeTeamName').textContent = homeTeam.name;
    document.getElementById('awayTeamName').textContent = awayTeam.name;
    document.getElementById('matchStatus').textContent = 'In Progress';

    // Reset UI
    gameState.matchEngine.homeScore = 0;
    gameState.matchEngine.awayScore = 0;
    gameState.matchEngine.minute = 0;
    updateMatchScore();
    document.getElementById('matchEvents').innerHTML = '';

    const opponentSquad = generateOpponentSquad(awayTeam.name);

    const engine = new MatchEngine(homeTeam.name, awayTeam.name, gameState.squad, opponentSquad, gameState.tactics);
    const result = engine.simulate();

    let currentMinute = 0;
    const matchInterval = setInterval(() => {
        currentMinute++;
        document.getElementById('matchTime').textContent = currentMinute + "'";

        const minuteEvents = result.events.filter(e => e.minute === currentMinute);
        if (minuteEvents.length > 0) {
            minuteEvents.forEach(event => {
                if (event.type === 'goal') {
                    if(event.team === homeTeam.name) gameState.matchEngine.homeScore++;
                    else gameState.matchEngine.awayScore++;
                    updateMatchScore();
                }
                addMatchEvent(event.text, event.type);
            });
        }

        if (currentMinute >= 90) {
            clearInterval(matchInterval);
            endMatch(homeTeam.name, awayTeam.name, result.homeScore, result.awayScore);
        }
    }, 50);
}

function quickSim() {
    const homeTeam = gameState.currentClub;
    let awayTeamData = gameState.leagueTable[Math.floor(Math.random() * gameState.leagueTable.length)];
    while(awayTeamData.name === homeTeam.name) {
        awayTeamData = gameState.leagueTable[Math.floor(Math.random() * gameState.leagueTable.length)];
    }
    const awayTeam = { name: awayTeamData.name };

    const opponentSquad = generateOpponentSquad(awayTeam.name);
    const engine = new MatchEngine(homeTeam.name, awayTeam.name, gameState.squad, opponentSquad, gameState.tactics);
    const result = engine.simulate();

    gameState.matchEngine.homeScore = result.homeScore;
    gameState.matchEngine.awayScore = result.awayScore;

    document.getElementById('homeTeamName').textContent = homeTeam.name;
    document.getElementById('awayTeamName').textContent = awayTeam.name;
    document.getElementById('homeScore').textContent = result.homeScore;
    document.getElementById('awayScore').textContent = result.awayScore;
    document.getElementById('matchStatus').textContent = 'Full Time';
    document.getElementById('matchTime').textContent = "90'";
    document.getElementById('matchEvents').innerHTML = '';

    addMatchEvent(`Match Result: ${homeTeam.name} ${result.homeScore} - ${result.awayScore} ${awayTeam.name}`, 'goal');

    endMatch(homeTeam.name, awayTeam.name, result.homeScore, result.awayScore);
}


function endMatch(homeTeamName, awayTeamName, homeScore, awayScore) {
    document.getElementById('matchStatus').textContent = 'Full Time';

    updateLeagueAfterMatch(homeTeamName, awayTeamName, homeScore, awayScore);
    updateSeasonRecord();

    // Update player stats (placeholder)
    gameState.squad.forEach(player => {
        if (Math.random() < 0.1) player.goals++;
        if (Math.random() < 0.15) player.assists++;
    });
}

function updateLeagueAfterMatch(homeTeam, awayTeam, homeGoals, awayGoals) {
    const homeTeamData = gameState.leagueTable.find(t => t.name === homeTeam);
    const awayTeamData = gameState.leagueTable.find(t => t.name === awayTeam);

    if (homeTeamData && awayTeamData) {
        homeTeamData.played++;
        awayTeamData.played++;
        homeTeamData.goalsFor += homeGoals;
        homeTeamData.goalsAgainst += awayGoals;
        awayTeamData.goalsFor += awayGoals;
        awayTeamData.goalsAgainst += homeGoals;

        if (homeGoals > awayGoals) {
            homeTeamData.won++;
            homeTeamData.points += 3;
            awayTeamData.lost++;
        } else if (awayGoals > homeGoals) {
            awayTeamData.won++;
            awayTeamData.points += 3;
            homeTeamData.lost++;
        } else {
            homeTeamData.drawn++;
            awayTeamData.drawn++;
            homeTeamData.points++;
            awayTeamData.points++;
        }

        homeTeamData.goalDifference = homeTeamData.goalsFor - homeTeamData.goalsAgainst;
        awayTeamData.goalDifference = awayTeamData.goalsFor - awayTeamData.goalsAgainst;
    }

    updateLeagueTable();
}

function updateSeasonRecord() {
    const team = gameState.leagueTable.find(t => t.name === gameState.currentClub.name);
    if (team) {
        document.getElementById('seasonRecord').textContent = `W${team.won} D${team.drawn} L${team.lost}`;
        const position = gameState.leagueTable.findIndex(t => t.name === gameState.currentClub.name) + 1;
        document.getElementById('leaguePosition').textContent = `Position: ${position}${getPositionSuffix(position)}`;
    }
}