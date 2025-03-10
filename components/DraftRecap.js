import React, { useState, useEffect } from 'react';

const DraftRecap = ({ teams, draftedPlayers, draftOrder, onClose }) => {
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [team, setTeam] = useState(null);

    useEffect(() => {
        if (teams && teams.length > 0) {
            const sortedTeams = teams.sort((a, b) => {
                const aFirstPick = draftOrder["1st Round"].find(pick => pick.team === a.abr);
                const bFirstPick = draftOrder["1st Round"].find(pick => pick.team === b.abr);
                return (aFirstPick?.pick || Infinity) - (bFirstPick?.pick || Infinity);
            });
            setTeam(sortedTeams[currentTeamIndex]);
        }
    }, [teams, currentTeamIndex, draftOrder]);

    const getDraftedPlayersList = () => {
        const playersList = [];
        let totalPickCounter = 0;

        Object.keys(draftedPlayers).forEach(round => {
            if (draftOrder[round]) {
                Object.keys(draftedPlayers[round]).forEach(pick => {
                    const player = draftedPlayers[round][pick];
                    if (player) {
                        totalPickCounter++;
                        playersList.push({
                            round,
                            pick: totalPickCounter,
                            player
                        });
                    }
                });
            }
        });
        return playersList;
    };

    const draftedPlayersList = getDraftedPlayersList().filter(p => {
        const draftOrderRound = draftOrder[p.round];
        if (draftOrderRound) {
            const draftOrderPick = draftOrderRound.find(d => d.pick === p.pick);
            return draftOrderPick && draftOrderPick.team === team?.abr;
        }
        return false;
    });

    const handleNextTeam = () => {
        setCurrentTeamIndex((prevIndex) => (prevIndex + 1) % teams.length);
    };

    const handlePrevTeam = () => {
        setCurrentTeamIndex((prevIndex) => (prevIndex - 1 + teams.length) % teams.length);
    };

    if (!team) {
        return null;
    }

    return (
        <div className="draft-recap-modal" onClick={onClose}>
            <div className="draft-recap-content" onClick={(e) => e.stopPropagation()}>
                <img src={`/logos/${team.abr.toLowerCase()}.png`} alt={`${team.name} logo`} className="team-logo" />
                <h2>{team.name} Draft Recap</h2>
                <ul>
                    {draftedPlayersList.map(({ round, pick, player }, index) => (
                        <li key={index}>
                            {round.split(' ')[0]} ({pick}) <strong>{player.name}</strong> - {player.school} - {player.position}
                        </li>
                    ))}
                </ul>
                <div className="navigation-buttons">
                    <button onClick={handlePrevTeam}>&lt; Prev</button>
                    <button onClick={handleNextTeam}>Next &gt;</button>
                </div>
                <button onClick={onClose}>Close</button>
            </div>
            <style jsx>{`
                .draft-recap-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .draft-recap-content {
                    background-color: #1a1a1a;
                    padding: 20px;
                    border-radius: 5px;
                    width: 80%;
                    max-width: 600px;
                    color: #fff;
                }
                .team-logo {
                    width: 50px;
                    height: 50px;
                    display: block;
                    margin: 0 auto;
                }
                h2 {
                    text-align: center;
                    margin-top: 10px;
                }
                ul {
                    list-style: none;
                    padding: 0;
                    text-align: center; /* Center the picks */
                }
                li {
                    margin: 10px 0;
                    font-size: 1.2rem; /* Increase font size */
                }
                .navigation-buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }
                .navigation-buttons button {
                    padding: 10px 20px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .navigation-buttons button:hover {
                    background-color: #555;
                }
                button {
                    display: block;
                    margin: 20px auto 0;
                    padding: 10px 20px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #555;
                }
            `}</style>
        </div>
    );
};

export default DraftRecap;
