// Game State
const gameState = {
    currentClub: {
        name: "Manchester City",
        budget: 150000000,
        wageBudget: 5200000,
        reputation: 95,
        facilities: {
            training: 9,
            youth: 8,
            stadium: 9
        }
    },
    currentDate: new Date(2025, 7, 1),
    currentSeason: "2025/26",
    squad: [],
    formation: "4-3-3",
    tactics: {
        defLine: 5,
        pressing: 7,
        passing: 6,
        tempo: 8
    },
    training: {
        fitness: 5,
        tactical: 7,
        technical: 6,
        setPieces: 5
    },
    leagueTable: [],
    competitions: {
        premierLeague: { position: 1, played: 0, won: 0, drawn: 0, lost: 0 },
        championsLeague: { stage: "Group Stage" },
        faCup: { round: "Third Round" }
    },
    transferMarket: [],
    scoutReports: [],
    matchEngine: {
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        events: []
    },
    news: [],
    boardConfidence: 85,
    fanMood: 80,
    rivalries: {
        "Manchester United": 100,
        "Liverpool": 85,
        "Arsenal": 70
    }
};

// Player Generation
const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const nationalities = ['England', 'Spain', 'Germany', 'France', 'Italy', 'Brazil', 'Argentina', 'Portugal', 'Netherlands', 'Belgium'];

// More detailed player generation based on Guide.txt
function generatePlayer(overridePosition = null, overrideRating = null) {
    const position = overridePosition || positions[Math.floor(Math.random() * positions.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    const age = Math.floor(Math.random() * 15) + 18;
    const baseRating = overrideRating || Math.floor(Math.random() * 30) + 50; // Adjusted for more variance

    const player = {
        id: Date.now() + Math.random(),
        name: `${firstName} ${lastName}`,
        age: age,
        nationality: nationality,
        position: position,
        alternativePositions: [],

        technical: {},
        mental: {},
        physical: {},
        hidden: {},
        statistics: {
            appearances: 0, goals: 0, assists: 0, cleanSheets: 0,
            yellowCards: 0, redCards: 0, averageRating: 0,
            passCompletion: 0, tacklesWon: 0, aerialWon: 0
        },

        value: 0,
        wage: 0,
        contract: Math.floor(Math.random() * 4) + 1,
        morale: 75,
        fitness: 100,
        form: 7,
        injuries: [],
        minutesPlayed: 0,
    };

    // Populate attributes randomly based on a scale of 1-99
    const attributeKeys = {
        technical: ['ballControl', 'crossing', 'dribbling', 'finishing', 'firstTouch', 'freeKicks', 'heading', 'longShots', 'passing', 'penalties', 'tackling', 'technique'],
        mental: ['aggression', 'anticipation', 'bravery', 'composure', 'concentration', 'decisions', 'determination', 'flair', 'leadership', 'positioning', 'teamwork', 'vision', 'workRate'],
        physical: ['acceleration', 'agility', 'balance', 'jumping', 'naturalFitness', 'pace', 'stamina', 'strength'],
        hidden: ['consistency', 'dirtyness', 'importantMatches', 'injuryProneness', 'versatility', 'adaptability', 'ambition', 'loyalty', 'pressure', 'professionalism']
    };

    let totalRating = 0;
    let attributeCount = 0;

    for (const category in attributeKeys) {
        for (const attr of attributeKeys[category]) {
            const randomAttr = Math.floor(Math.random() * 50) + 20; // 20-70 range
            player[category][attr] = randomAttr;
            if (category !== 'hidden') {
                totalRating += randomAttr;
                attributeCount++;
            }
        }
    }

    player.overall = Math.floor(totalRating / attributeCount);
    player.potential = Math.min(99, player.overall + Math.floor(Math.random() * 25));
    player.value = calculatePlayerValue(player.overall, player.age);
    player.wage = calculatePlayerWage(player.overall);

    player.attributes = { ...player.technical, ...player.mental, ...player.physical };
    return player;
}


function calculatePlayerValue(rating, age) {
    let baseValue = Math.pow(rating, 2.5) * 100;
    if (age < 22) baseValue *= 1.8;
    else if (age < 25) baseValue *= 1.5;
    else if (age > 30) baseValue *= 0.7;
    else if (age > 33) baseValue *= 0.4;
    return Math.floor(baseValue);
}

function calculatePlayerWage(rating) {
    return Math.floor(Math.pow(rating, 2) * 2);
}

// Initialize Squad
function initializeSquad() {
    gameState.squad = [];
    for (let i = 0; i < 25; i++) {
        gameState.squad.push(generatePlayer());
    }
    gameState.squad.forEach((player, index) => {
        player.number = index + 1;
    });
}

// Initialize League Table
function initializeLeagueTable() {
    const teams = [
        'Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Manchester United',
        'Tottenham', 'Newcastle', 'Brighton', 'Aston Villa', 'West Ham',
        'Fulham', 'Brentford', 'Crystal Palace', 'Wolverhampton', 'Everton',
        'Leicester', 'Nottingham Forest', 'Bournemouth', 'Luton Town', 'Burnley'
    ];

    gameState.leagueTable = teams.map(team => ({
        name: team,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
    }));
}

// Initialize Transfer Market
function initializeTransferMarket() {
    gameState.transferMarket = [];
    for (let i = 0; i < 100; i++) {
        const player = generatePlayer();
        player.club = "Free Agent";
        gameState.transferMarket.push(player);
    }
}

// Initialize Game
function initializeGame() {
    initializeSquad();
    initializeLeagueTable();
    initializeTransferMarket();
    updateHeaderStats();
    updateLeagueTable();

    const resultsDiv = document.getElementById('recentResults');
    resultsDiv.innerHTML = '<div class="event">A new season begins!</div>';

    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
    }, 1500);
}

// Initialize on load
window.onload = () => {
    initializeGame();
    setInterval(() => {}, 30000); // Placeholder for auto-save
    setInterval(advanceDate, 10000); // Speed up for testing
};

function simulateWeek() {
    const teams = [...gameState.leagueTable];
    const fixtures = [];

    // Simple fixture generation for one week
    for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
    }

    for (let i = 0; i < teams.length; i += 2) {
        if (teams[i+1]) {
            fixtures.push([teams[i], teams[i+1]]);
        }
    }

    const weeklyResults = [];

    fixtures.forEach(([homeTeamData, awayTeamData]) => {
        const homeSquad = (homeTeamData.name === gameState.currentClub.name) ? gameState.squad : generateOpponentSquad(homeTeamData.name);
        const awaySquad = (awayTeamData.name === gameState.currentClub.name) ? gameState.squad : generateOpponentSquad(awayTeamData.name);

        const engine = new MatchEngine(homeTeamData.name, awayTeamData.name, homeSquad, awaySquad, {});
        const result = engine.simulate();

        updateLeagueAfterMatch(homeTeamData.name, awayTeamData.name, result.homeScore, result.awayScore);
        weeklyResults.push({homeTeam: homeTeamData.name, awayTeam: awayTeamData.name, homeScore: result.homeScore, awayScore: result.awayScore});
    });

    updateLeagueTable();
    displayWeeklyResults(weeklyResults);

    const playerMatch = weeklyResults.find(r => r.homeTeam === gameState.currentClub.name || r.awayTeam === gameState.currentClub.name);
    let teamPerformance = 0;
    if (playerMatch) {
        const isHome = playerMatch.homeTeam === gameState.currentClub.name;
        if ((isHome && playerMatch.homeScore > playerMatch.awayScore) || (!isHome && playerMatch.awayScore > playerMatch.homeScore)) {
            teamPerformance = 1; // Win
        } else if (playerMatch.homeScore === playerMatch.awayScore) {
            teamPerformance = 0; // Draw
        } else {
            teamPerformance = -1; // Loss
        }
    }
    return teamPerformance;
}

function advanceDate() {
    gameState.currentDate.setDate(gameState.currentDate.getDate() + 7);
    document.getElementById('currentDate').textContent = gameState.currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const teamPerformance = simulateWeek();

    const injurySystem = new InjurySystem();
    const moraleSystem = new MoraleSystem();

    gameState.squad.forEach(player => {
        const dev = new PlayerDevelopment(player);
        dev.weeklyDevelopment();
        injurySystem.processWeeklyRecovery(player);
        if (player.injuries.length === 0) {
             injurySystem.calculateInjuryRisk(player);
        }
        moraleSystem.updatePlayerMorale(player, teamPerformance);
    });

    if(document.getElementById('squad') && document.getElementById('squad').classList.contains('active')) {
        loadSquadView();
    }
    if(document.getElementById('league') && document.getElementById('league').classList.contains('active')) {
        updateLeagueTable();
    }

    if (Math.random() < 0.3) {
        generateRandomEvent();
    }
}

function generateRandomEvent() {
    const events = [
        () => {
            const player = gameState.squad[Math.floor(Math.random() * gameState.squad.length)];
            player.morale = Math.min(100, player.morale + 10);
            addNewsItem(`📈 ${player.name} in excellent form!`);
        },
        () => {
            gameState.currentClub.budget += 5000000;
            addNewsItem(`💰 Sponsor bonus received: £5M`);
            updateHeaderStats();
        },
        () => {
            gameState.boardConfidence = Math.min(100, gameState.boardConfidence + 5);
            addNewsItem(`👔 Board pleased with recent performances`);
        }
    ];

    events[Math.floor(Math.random() * events.length)]();
}

function generateOpponentSquad(teamName) {
    const squad = [];
    const avgRating = 70;
    for (let i = 0; i < 22; i++) {
        const player = generatePlayer(null, avgRating + (Math.random() * 10 - 5));
        player.club = teamName;
        squad.push(player);
    }
    return squad;
}