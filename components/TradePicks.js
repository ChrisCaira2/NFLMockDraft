import { useState, useEffect } from 'react';

export default function TradePicks({ teams, teamPicks, onTrade, selectedTeam1, currentPickIndex, userSelectedTeams, onClose }) {
    const [selectedTeam2, setSelectedTeam2] = useState(null);
    const [team1, setTeam1] = useState(selectedTeam1);
    const [team1Picks, setTeam1Picks] = useState([]);
    const [team2Picks, setTeam2Picks] = useState([]);
    const [selectedTeam1Picks, setSelectedTeam1Picks] = useState([]);
    const [selectedTeam2Picks, setSelectedTeam2Picks] = useState([]);
    const [tradeValueChart, setTradeValueChart] = useState({});
    const [suggestionText, setSuggestionText] = useState('');
    const [team1Value, setTeam1Value] = useState(0);
    const [team2Value, setTeam2Value] = useState(0);

    useEffect(() => {
        async function fetchTradeValueChart() {
            const response = await fetch('/data/tradeValueChart.json');
            const data = await response.json();
            setTradeValueChart(data);
        }
        fetchTradeValueChart();
    }, []);

    useEffect(() => {
        // Determine the closest pick among user-selected teams
        const closestTeam = userSelectedTeams.reduce((closest, team) => {
            const teamPick = teamPicks[team.abr]?.find(pick => pick > currentPickIndex);
            if (teamPick !== undefined && (closest === null || teamPick < closest.pick)) {
                return { team: team.abr, pick: teamPick };
            }
            return closest;
        }, null);

        if (closestTeam) {
            setTeam1(closestTeam.team);
        }
    }, [userSelectedTeams, teamPicks, currentPickIndex]);

    useEffect(() => {
        setTeam1Picks((teamPicks[team1] || []).filter(pick => pick > currentPickIndex).sort((a, b) => a - b));
        setSelectedTeam1Picks([]);
    }, [team1, teamPicks, currentPickIndex]);

    const handleTeam1Change = (event) => {
        const team = event.target.value;
        setTeam1(team);
        setTeam1Picks((teamPicks[team] || []).filter(pick => pick > currentPickIndex).sort((a, b) => a - b));
        setSelectedTeam1Picks([]);
    };

    const handleTeam2Change = (event) => {
        const team = event.target.value;
        setSelectedTeam2(team);
        setTeam2Picks((teamPicks[team] || []).filter(pick => pick > currentPickIndex).sort((a, b) => a - b));
        setSelectedTeam2Picks([]);
    };

    const handlePickChange = (team, pick) => {
        if (team === team1) {
            setSelectedTeam1Picks(prevPicks => {
                const isSelected = !prevPicks.includes(pick);
                const newPicks = isSelected ? [...prevPicks, pick] : prevPicks.filter(p => p !== pick);
                const sortedPicks = newPicks.sort((a, b) => a - b);
                setTeam1Value(calculateTradeValue(sortedPicks));
                return sortedPicks;
            });
        } else if (team === selectedTeam2) {
            setSelectedTeam2Picks(prevPicks => {
                const isSelected = !prevPicks.includes(pick);
                const newPicks = isSelected ? [...prevPicks, pick] : prevPicks.filter(p => p !== pick);
                const sortedPicks = newPicks.sort((a, b) => a - b);
                setTeam2Value(calculateTradeValue(sortedPicks));
                return sortedPicks;
            });
        }
    };

    const calculateTradeValue = (picks) => {
        return picks.reduce((total, pick) => total + (tradeValueChart[pick] || 0), 0);
    };

    const suggestFairTrade = (team1Value, team2Value) => {
        const valueDifference = Math.abs(team1Value - team2Value);
        const team1NeedsMore = team1Value < team2Value;
        const teamToAddPicks = team1NeedsMore ? team1 : selectedTeam2;
        const teamToReceivePicks = team1NeedsMore ? selectedTeam2 : team1;
        const availablePicks = team1NeedsMore ? team1Picks : team2Picks;

        let suggestedPicks = [];
        let accumulatedValue = 0;

        const round = Math.floor(currentPickIndex / 32) + 1;
        const minDifference = round === 1 ? 300 : 100;
        const maxDifference = round === 1 ? 600 : 300;

        for (const pick of availablePicks) {
            if (team1NeedsMore ? !selectedTeam1Picks.includes(pick) : !selectedTeam2Picks.includes(pick)) {
                const pickValue = tradeValueChart[pick] || 0;
                if (accumulatedValue + pickValue >= valueDifference - minDifference && accumulatedValue + pickValue <= valueDifference + maxDifference) {
                    suggestedPicks.push(pick);
                    break;
                }
                suggestedPicks.push(pick);
                accumulatedValue += pickValue;
            }
        }

        return {
            teamToAddPicks,
            teamToReceivePicks,
            suggestedPicks
        };
    };

    const handleSuggestTrade = () => {
        const { teamToAddPicks, teamToReceivePicks, suggestedPicks } = suggestFairTrade(team1Value, team2Value);
        setSuggestionText(`Suggested trade: ${teamToAddPicks} adds picks ${suggestedPicks.join(', ')} to ${teamToReceivePicks}`);
    };

    const handleTrade = () => {
        const round = Math.floor(currentPickIndex / 32) + 1;
        const minDifference = round === 1 ? 300 : 100;
        const maxDifference = round === 1 ? 600 : 300;
        const valueDifference = Math.abs(team1Value - team2Value);

        if (valueDifference < minDifference || valueDifference > maxDifference) {
            handleSuggestTrade();
            return;
        }

        onTrade(team1, selectedTeam1Picks, selectedTeam2, selectedTeam2Picks);
        setSuggestionText('');
        if (onClose) {
            onClose(); // Close the trade pop-up after a successful trade
        }
    };

    const getTeamByAbbr = (abbr) => {
        return teams.find(team => team.abr === abbr);
    };

    return (
        <div className="trade-picks">
            <h2>Trade Picks</h2>
            <div className="team-selection">
                <div className="team-info">
                    {team1 && (
                        <>
                            <img src={`/logos/${team1.toLowerCase()}.png`} alt={`${getTeamByAbbr(team1).name} logo`} className="team-logo" />
                            <select value={team1} onChange={userSelectedTeams.length > 1 ? handleTeam1Change : null}>
                                <option value="" disabled>Select Team 1</option>
                                {userSelectedTeams.map(team => (
                                    <option key={team.abr} value={team.abr}>{team.city} {team.name}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
                <div className="team-info">
                    <>
                        <img src={selectedTeam2 ? `/logos/${selectedTeam2.toLowerCase()}.png` : ''} alt={selectedTeam2 ? `${getTeamByAbbr(selectedTeam2).name} logo` : ''} className="team-logo" />
                        <select onChange={handleTeam2Change} value={selectedTeam2 || ''}>
                            <option value="" disabled>Select Team 2</option>
                            {teams.map(team => (
                                <option key={team.abr} value={team.abr}>{team.city} {team.name}</option>
                            ))}
                        </select>
                    </>
                </div>
            </div>
            <div className="picks-selection">
                <div>
                    <h3>{team1}</h3>
                    {team1Picks.map(pick => (
                        <div key={pick} className={`pick-box ${selectedTeam1Picks.includes(pick) ? 'selected' : ''}`} onClick={() => handlePickChange(team1, pick)}>
                            <input
                                type="checkbox"
                                value={pick}
                                onChange={() => handlePickChange(team1, pick)}
                                checked={selectedTeam1Picks.includes(pick)}
                                style={{ display: 'none' }} // Hide the checkbox
                            />
                            {pick}
                        </div>
                    ))}
                    <p>Trade Value: {team1Value}</p>
                </div>
                <div>
                    <h3>{selectedTeam2}</h3>
                    {team2Picks.map(pick => (
                        <div key={pick} className={`pick-box ${selectedTeam2Picks.includes(pick) ? 'selected' : ''}`} onClick={() => handlePickChange(selectedTeam2, pick)}>
                            <input
                                type="checkbox"
                                value={pick}
                                onChange={() => handlePickChange(selectedTeam2, pick)}
                                checked={selectedTeam2Picks.includes(pick)}
                                style={{ display: 'none' }} // Hide the checkbox
                            />
                            {pick}
                        </div>
                    ))}
                    <p>Trade Value: {team2Value}</p>
                </div>
            </div>
            {suggestionText && <p className="suggestion-text">{suggestionText}</p>}
            <button onClick={handleTrade}>Execute Trade</button>
            <style jsx>{`
                .trade-picks {
                    margin: 20px;
                    padding: 20px;
                    background-color: #333;
                    color: #fff;
                    border-radius: 5px;
                }
                .team-selection {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .team-info {
                    display: flex;
                    align-items: center;
                }
                .team-logo {
                    width: 30px;
                    height: 30px;
                    margin-right: 10px;
                }
                .picks-selection {
                    display: flex;
                    justify-content: space-between;
                }
                .pick-box {
                    padding: 10px;
                    background-color: #444;
                    color: #fff;
                    border-radius: 5px;
                    margin: 5px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    min-width: 50px; /* Ensure the pick boxes don't change size when clicked */
                    text-align: center;
                }
                .pick-box.selected {
                    background-color: #655;
                }
                select {
                    padding: 10px;
                    background-color: #444;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                }
                button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color:rgb(59, 67, 76);
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                button:hover {
                    background-color:rgb(134, 151, 168);
                }
                .suggestion-text {
                    color: #ffcc00;
                    text-align: center;
                    margin-top: 10px;
                }
            `}</style>
        </div>
    );
}
