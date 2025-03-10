import { useEffect } from 'react';

export default function AutoDrafter({ draftOrder, selectedTeams, players, setPlayers, teamNeeds, onDraftPlayer, currentPickIndex, setCurrentPickIndex, isManualMode, setIsManualMode, isAutoDrafting, rounds }) {
    useEffect(() => {
        const autoDraft = async () => {
            const roundsToShow = Object.keys(draftOrder).slice(0, rounds);
            const totalPicks = roundsToShow.reduce((acc, round) => acc + draftOrder[round].length, 0);

            if (currentPickIndex >= totalPicks) {
                return;
            }

            const roundLengths = {
                "1st Round": 32,
                "2nd Round": 32,
                "3rd Round": 37,
                "4th Round": 38,
                "5th Round": 41,
                "6th Round": 40,
                "7th Round": 39
            };

            let cumulativePicks = 0;
            let currentRound = null;
            let currentPickPosition = null;

            for (const round of roundsToShow) {
                const roundLength = roundLengths[round];
                if (currentPickIndex < cumulativePicks + roundLength) {
                    currentRound = round;
                    currentPickPosition = currentPickIndex - cumulativePicks;
                    break;
                }
                cumulativePicks += roundLength;
            }

            if (!currentRound || currentPickPosition === null) {
                return;
            }

            const currentTeam = draftOrder[currentRound][currentPickPosition]?.team;

            if (selectedTeams.some(team => team.abr === currentTeam)) {
                // Switch to manual mode for user-selected team
                setIsManualMode(true);
                return;
            }

            console.log(`Current team: ${currentTeam}`);
            console.log(`Team needs:`, teamNeeds);

            // Find the best player based on team needs and overall ranking
            const teamNeed = teamNeeds.find(team => team.team === currentTeam);
            console.log(`Team need for ${currentTeam}:`, teamNeed);
            let bestPlayer = null;

            if (teamNeed && teamNeed.needs.length > 0) {
                const topOverallPlayer = players[0];
                if (currentPickIndex < 10) {
                    // For top 10 picks, select the highest-ranked player out of all needs
                    let highestRankedPlayer = null;
                    for (const position of teamNeed.needs) {
                        const playersAtPosition = players.filter(player => player.position === position);
                        if (playersAtPosition.length > 0) {
                            const topPlayerAtPosition = playersAtPosition[0];
                            if (!highestRankedPlayer || players.indexOf(topPlayerAtPosition) < players.indexOf(highestRankedPlayer)) {
                                highestRankedPlayer = topPlayerAtPosition;
                            }
                        }
                    }
                    bestPlayer = highestRankedPlayer;
                } else {
                    // For picks after top 10, use the previous logic with a 5-spot range
                    for (const position of teamNeed.needs) {
                        const playersAtPosition = players.filter(player => player.position === position);
                        if (playersAtPosition.length > 0) {
                            const topPlayerAtPosition = playersAtPosition[0];
                            const topPlayerIndex = players.indexOf(topOverallPlayer);
                            const topPlayerAtPositionIndex = players.indexOf(topPlayerAtPosition);
                            if (topPlayerAtPositionIndex <= topPlayerIndex + 5) {
                                bestPlayer = topPlayerAtPosition;
                                console.log(`Selected player for ${position}:`, bestPlayer);
                                break;
                            }
                        }
                    }
                }
            }

            // If no player found based on needs, select the best available player
            if (!bestPlayer) {
                bestPlayer = players[0];
                console.log(`No player found based on needs, selecting best available player:`, bestPlayer);
            }

            // Add randomness based on the round
            const randomFactor = Math.random();
            if (currentPickIndex < 10 && randomFactor < 0.1) { // 10% randomness for top 10 picks
                const randomIndex = Math.min(players.indexOf(bestPlayer) + Math.floor(Math.random() * 3) + 1, players.length - 1);
                bestPlayer = players[randomIndex];
                console.log(`Randomly selected player (top 10):`, bestPlayer);
            } else if (currentPickIndex >= 32 && currentPickIndex < 96 && randomFactor < 0.4) { // 40% randomness for rounds 2-3
                const randomIndex = Math.min(players.indexOf(bestPlayer) + Math.floor(Math.random() * 5) + 1, players.length - 1);
                bestPlayer = players[randomIndex];
                console.log(`Randomly selected player (rounds 2-3):`, bestPlayer);
            } else if (currentPickIndex >= 96 && randomFactor < 0.5) { // 50% randomness for rounds 4-7
                const randomIndex = Math.min(players.indexOf(bestPlayer) + Math.floor(Math.random() * 10) + 1, players.length - 1);
                bestPlayer = players[randomIndex];
                console.log(`Randomly selected player (rounds 4-7):`, bestPlayer);
            }

            // Draft the best player
            onDraftPlayer(bestPlayer);

            // Remove the drafted player from the pool
            setPlayers(players.filter(p => p !== bestPlayer));

            // Move the drafted position to the end of the priority list
            if (teamNeed) {
                teamNeed.needs = teamNeed.needs.filter(pos => pos !== bestPlayer.position);
                teamNeed.needs.push(bestPlayer.position);
            }

            // Wait for 1 second before the next pick
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Move to the next pick
            setCurrentPickIndex(currentPickIndex + 1);
        };

        if (!isManualMode && isAutoDrafting) {
            const interval = setInterval(() => {
                if (draftOrder) {
                    const roundsToShow = Object.keys(draftOrder).slice(0, rounds);
                    const totalPicks = roundsToShow.reduce((acc, round) => acc + draftOrder[round].length, 0);
                    const roundLengths = {
                        "1st Round": 32,
                        "2nd Round": 32,
                        "3rd Round": 37,
                        "4th Round": 38,
                        "5th Round": 41,
                        "6th Round": 40,
                        "7th Round": 39
                    };
                    let cumulativePicks = 0;
                    let currentRound = null;
                    let currentPickPosition = null;

                    for (const round of roundsToShow) {
                        const roundLength = roundLengths[round];
                        if (currentPickIndex < cumulativePicks + roundLength) {
                            currentRound = round;
                            currentPickPosition = currentPickIndex - cumulativePicks;
                            break;
                        }
                        cumulativePicks += roundLength;
                    }

                    if (currentPickIndex < totalPicks && !selectedTeams.some(team => team.abr === draftOrder[currentRound]?.[currentPickPosition]?.team)) {
                        autoDraft();
                    } else {
                        clearInterval(interval);
                    }
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentPickIndex, draftOrder, selectedTeams, players, teamNeeds, onDraftPlayer, setCurrentPickIndex, setPlayers, isManualMode, setIsManualMode, isAutoDrafting, rounds]);

    return null;
}
