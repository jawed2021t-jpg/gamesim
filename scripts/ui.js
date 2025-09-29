// UI Functions
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked menu item
    event.target.classList.add('active');

    // Load tab-specific content
    switch(tabName) {
        case 'squad':
            loadSquadView();
            break;
        case 'tactics':
            loadFormationView();
            break;
        case 'transfers':
            loadTransferMarket();
            break;
        case 'league':
            updateLeagueTable();
            break;
        case 'scouting':
            loadScoutingReports();
            break;
    }
}

function loadSquadView() {
    const squadList = document.getElementById('squadList');
    squadList.innerHTML = '';

    // Sort squad by position
    const sortedSquad = [...gameState.squad].sort((a, b) => {
        const positionOrder = ['GK', 'DEF', 'MID', 'ATT'];
        const posA = positionOrder.findIndex(p => ['CB', 'LB', 'RB'].includes(a.position) ? p === 'DEF' : ['CDM', 'CM', 'CAM'].includes(a.position) ? p === 'MID' : ['LW', 'RW', 'ST'].includes(a.position) ? p === 'ATT' : a.position === 'GK' ? p === 'GK' : -1);
        const posB = positionOrder.findIndex(p => ['CB', 'LB', 'RB'].includes(b.position) ? p === 'DEF' : ['CDM', 'CM', 'CAM'].includes(b.position) ? p === 'MID' : ['LW', 'RW', 'ST'].includes(b.position) ? p === 'ATT' : b.position === 'GK' ? p === 'GK' : -1);
        return posA - posB;
    });

    sortedSquad.forEach(player => {
        const playerCard = createPlayerCard(player);
        squadList.appendChild(playerCard);
    });
}

function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    if (player.injuries.length > 0) {
        card.style.backgroundColor = '#fff2f2';
        card.style.borderLeft = '3px solid #dc3545';
    }

    const injuryIcon = player.injuries.length > 0 ? ' <span style="color: #dc3545;">✚</span>' : '';

    card.innerHTML = `
        <div class="player-info">
            <div class="player-number">${player.number || '?'}</div>
            <div class="player-details">
                <h4>${player.name}${injuryIcon}</h4>
                <p>${player.position} | ${player.age} years | ${player.nationality}</p>
            </div>
        </div>
        <div class="player-stats">
            <div class="stat">
                <div class="stat-val">${player.overall}</div>
                <div class="stat-lbl">OVR</div>
            </div>
            <div class="stat">
                <div class="stat-val">${player.potential}</div>
                <div class="stat-lbl">POT</div>
            </div>
            <div class="stat">
                <div class="stat-val">£${(player.value/1000000).toFixed(1)}M</div>
                <div class="stat-lbl">VALUE</div>
            </div>
            <div class="stat">
                <div class="stat-val">${Math.round(player.morale)}%</div>
                <div class="stat-lbl">MORALE</div>
            </div>
        </div>
    `;
    card.onclick = () => showPlayerDetails(player);
    return card;
}

function showPlayerDetails(player) {
    const modal = document.getElementById('playerModal');
    const modalContent = document.getElementById('playerModalContent');

    document.getElementById('modalPlayerName').textContent = `${player.name} (${player.overall})`;

    let injuryInfo = '';
    if (player.injuries.length > 0) {
        const injury = player.injuries[0];
        injuryInfo = `
            <p style="color: #dc3545; font-weight: bold; background: #fff2f2; padding: 5px; border-radius: 5px;">
                <strong>Status:</strong> Injured (${injury.description}) - Out for ~${Math.ceil(injury.remaining/7)} week(s).
            </p>
        `;
    }

    // Function to generate attribute bars for a category
    const generateAttributeSection = (title, attributes) => {
        let html = `<h4 style="margin-top: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${title}</h4>`;
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px;">';
        for (const attr in attributes) {
            const value = Math.round(attributes[attr]);
            // Simple camelCase to Title Case conversion
            const label = attr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            html += `
                <div class="attribute-bar">
                    <span class="attribute-label">${label}</span>
                    <div class="attribute-value">
                        <div class="attribute-fill" style="width: ${value}%; background-color: ${value > 80 ? '#28a745' : value > 65 ? '#ffc107' : '#dc3545'};"></div>
                    </div>
                    <span class="attribute-number">${value}</span>
                </div>
            `;
        }
        html += '</div>';
        return html;
    };

    modalContent.innerHTML = `
        <div class="scout-report">
            <h3>Player Information</h3>
            ${injuryInfo}
            <p>
                <strong>Position:</strong> ${player.position} |
                <strong>Age:</strong> ${player.age} |
                <strong>Nationality:</strong> ${player.nationality}
            </p>
            <p>
                <strong>Value:</strong> £${(player.value/1000000).toFixed(1)}M |
                <strong>Wage:</strong> £${player.wage.toLocaleString()}/week |
                <strong>Contract:</strong> ${player.contract} years
            </p>
            <p>
                <strong>Overall:</strong> ${player.overall} |
                <strong>Potential:</strong> ${player.potential} |
                <strong>Morale:</strong> ${Math.round(player.morale)}%
            </p>

            ${generateAttributeSection('Technical', player.technical)}
            ${generateAttributeSection('Mental', player.mental)}
            ${generateAttributeSection('Physical', player.physical)}

            <h3 style="margin-top: 20px;">Season Statistics</h3>
            <p>
                <strong>Appearances:</strong> ${player.statistics.appearances} |
                <strong>Goals:</strong> ${player.statistics.goals} |
                <strong>Assists:</strong> ${player.statistics.assists}
            </p>
        </div>

        <button class="button" onclick="offerNewContract(${player.id})">Offer New Contract</button>
        <button class="button secondary" onclick="transferList(${player.id})">Transfer List</button>
    `;

    modal.classList.add('active');
}


function loadFormationView() {
    const display = document.getElementById('formationDisplay');
    display.innerHTML = '';

    const formations = {
        '4-3-3': [
            { pos: 'GK', x: 50, y: 90 }, { pos: 'LB', x: 20, y: 70 }, { pos: 'CB', x: 35, y: 75 },
            { pos: 'CB', x: 65, y: 75 }, { pos: 'RB', x: 80, y: 70 }, { pos: 'CDM', x: 50, y: 55 },
            { pos: 'CM', x: 30, y: 45 }, { pos: 'CM', x: 70, y: 45 }, { pos: 'LW', x: 20, y: 25 },
            { pos: 'ST', x: 50, y: 15 }, { pos: 'RW', x: 80, y: 25 }
        ],
        '4-4-2': [
            { pos: 'GK', x: 50, y: 90 }, { pos: 'LB', x: 20, y: 70 }, { pos: 'CB', x: 35, y: 75 },
            { pos: 'CB', x: 65, y: 75 }, { pos: 'RB', x: 80, y: 70 }, { pos: 'LM', x: 20, y: 45 },
            { pos: 'CM', x: 35, y: 50 }, { pos: 'CM', x: 65, y: 50 }, { pos: 'RM', x: 80, y: 45 },
            { pos: 'ST', x: 35, y: 20 }, { pos: 'ST', x: 65, y: 20 }
        ],
        '3-5-2': [
            { pos: 'GK', x: 50, y: 90 }, { pos: 'CB', x: 30, y: 75 }, { pos: 'CB', x: 50, y: 78 },
            { pos: 'CB', x: 70, y: 75 }, { pos: 'LWB', x: 15, y: 50 }, { pos: 'RWB', x: 85, y: 50 },
            { pos: 'CDM', x: 50, y: 55 }, { pos: 'CM', x: 35, y: 40 }, { pos: 'CM', x: 65, y: 40 },
            { pos: 'ST', x: 35, y: 20 }, { pos: 'ST', x: 65, y: 20 }
        ]
    };

    const currentFormation = formations[gameState.formation];
    currentFormation.forEach((position) => {
        const posDiv = document.createElement('div');
        posDiv.className = 'formation-position';
        posDiv.style.left = `${position.x}%`;
        posDiv.style.top = `${position.y}%`;
        posDiv.style.transform = 'translate(-50%, -50%)';
        posDiv.textContent = position.pos;
        display.appendChild(posDiv);
    });
}

function loadTransferMarket() {
    const marketDiv = document.getElementById('transferMarket');
    marketDiv.innerHTML = '';

    gameState.transferMarket.slice(0, 20).forEach(player => {
        const card = createPlayerCard(player);
        marketDiv.appendChild(card);
    });
}

function updateLeagueTable() {
    const tbody = document.getElementById('leagueTableBody');
    tbody.innerHTML = '';

    gameState.leagueTable.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalDifference - a.goalDifference;
    });

    gameState.leagueTable.forEach((team, index) => {
        const row = document.createElement('tr');
        if (team.name === gameState.currentClub.name) row.className = 'highlight-row';
        row.innerHTML = `
            <td>${index + 1}</td> <td>${team.name}</td> <td>${team.played}</td>
            <td>${team.won}</td> <td>${team.drawn}</td> <td>${team.lost}</td>
            <td>${team.goalsFor}</td> <td>${team.goalsAgainst}</td>
            <td>${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}</td>
            <td><strong>${team.points}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

function addMatchEvent(text, type) {
    const eventsDiv = document.getElementById('matchEvents');
    const event = document.createElement('div');
    event.className = `event ${type}`;
    event.textContent = text;
    eventsDiv.insertBefore(event, eventsDiv.firstChild);
}

function updateMatchScore() {
    document.getElementById('homeScore').textContent = gameState.matchEngine.homeScore;
    document.getElementById('awayScore').textContent = gameState.matchEngine.awayScore;
}

function getPositionSuffix(position) {
    if (position === 1) return 'st';
    if (position === 2) return 'nd';
    if (position === 3) return 'rd';
    return 'th';
}

function updateTactic(tacticName) {
    const slider = document.getElementById(tacticName);
    const value = slider.value;
    document.getElementById(tacticName + 'Value').textContent = value;
    gameState.tactics[tacticName] = parseInt(value);
}

function saveFormation() {
    alert('Formation and tactics saved successfully!');
    addNewsItem('📋 Manager updates tactical approach');
}

function loadPresetFormation(formation) {
    gameState.formation = formation;
    loadFormationView();
}

function negotiateTransfer(playerId) {
    // This will be expanded in a future module
    alert("Transfer system coming soon!");
}

function addNewsItem(text) {
    const ticker = document.getElementById('newsTicker');
    const newsItem = document.createElement('span');
    newsItem.className = 'news-item';
    newsItem.textContent = text;
    ticker.appendChild(newsItem);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function updateHeaderStats() {
    document.getElementById('clubBudget').textContent = `£${(gameState.currentClub.budget/1000000).toFixed(0)}M`;
    document.getElementById('wageBudget').textContent = `£${(gameState.currentClub.wageBudget/1000000).toFixed(2)}M`;
    document.getElementById('squadSize').textContent = gameState.squad.length;
}

function showPositionFilter(position) {
    const squadList = document.getElementById('squadList');
    squadList.innerHTML = '';

    let filteredSquad = gameState.squad;
    if (position !== 'ALL') {
        const posMap = {'DEF': ['CB', 'LB', 'RB'], 'MID': ['CDM', 'CM', 'CAM'], 'ATT': ['LW', 'RW', 'ST']};
        const positionsToFilter = posMap[position] || [position];
        filteredSquad = gameState.squad.filter(p => positionsToFilter.includes(p.position));
    }

    filteredSquad.forEach(player => {
        const playerCard = createPlayerCard(player);
        squadList.appendChild(playerCard);
    });
}