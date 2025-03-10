const fs = require('fs');
const path = require('path');

// Load the draft order JSON
const draftOrderPath = path.join(__dirname, '../public/data/draftOrder.json');
const draftOrder = JSON.parse(fs.readFileSync(draftOrderPath, 'utf8'));

// Initialize an empty object to store the team picks
const teamPicks = {};

// Process the draft order
Object.keys(draftOrder).forEach(round => {
    draftOrder[round].forEach((team, index) => {
        const pickNumber = (parseInt(round) - 1) * 32 + (index + 1);
        if (!teamPicks[team]) {
            teamPicks[team] = [];
        }
        teamPicks[team].push(pickNumber);
    });
});

// Convert the team picks object to an array of objects
const teamPicksArray = Object.keys(teamPicks).map(team => ({
    team: team,
    picks: teamPicks[team]
}));

// Write the team picks to a new JSON file
const teamPicksPath = path.join(__dirname, '../public/data/teamPicks.json');
fs.writeFileSync(teamPicksPath, JSON.stringify(teamPicksArray, null, 2));

console.log('Team picks JSON generated successfully.');
