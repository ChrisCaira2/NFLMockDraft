const fs = require('fs');
const path = require('path');

// Paths to the files
const playersJsonPath = path.join(__dirname, '../public/data/players.json');
const playersTxtPath = path.join(__dirname, '../public/data/players.txt');

// Read the existing players.json file
const playersJson = JSON.parse(fs.readFileSync(playersJsonPath, 'utf8'));

// Read the players.txt file
const playersTxt = fs.readFileSync(playersTxtPath, 'utf8');

// Get the last rank from the existing players
const lastRank = playersJson.reduce((max, player) => Math.max(max, player.rank), 0);

// Parse the players.txt file
const newPlayers = playersTxt.split('\n').map((line, index) => {
    const [, name, school, classYear, position, , height, weight] = line.split('\t').map(item => item.trim());
    return {
        name,
        school,
        class: classYear,
        position,
        rank: lastRank + index + 1,
        height,
        weight: parseInt(weight, 10)
    };
});

// Append new players to the existing list
const updatedPlayers = [...playersJson, ...newPlayers];

// Write the updated list back to the players.json file
fs.writeFileSync(playersJsonPath, JSON.stringify(updatedPlayers, null, 2));

console.log('Players added successfully.');
