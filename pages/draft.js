import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PlayerPool from '../components/PlayerPool';
import AutoDrafter from '../components/AutoDrafter';
import TradePicks from '../components/TradePicks';
import DraftRecap from '../components/DraftRecap';

export default function Draft() {
    const [draftOrder, setDraftOrder] = useState({});
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [rounds, setRounds] = useState(1);
    const [draftedPlayers, setDraftedPlayers] = useState({});
    const [currentPickIndex, setCurrentPickIndex] = useState(0);
    const [players, setPlayers] = useState([]);
    const [teamNeeds, setTeamNeeds] = useState([]);
    const [isManualMode, setIsManualMode] = useState(false);
    const [isAutoDrafting, setIsAutoDrafting] = useState(false);
    const [showTradePicks, setShowTradePicks] = useState(false);
    const [teamPicks, setTeamPicks] = useState({});
    const [showDraftRecap, setShowDraftRecap] = useState(false);
    const [showRecapButton, setShowRecapButton] = useState(false);
    const [roundLengths, setRoundLengths] = useState({
        "1st Round": 32,
        "2nd Round": 32,
        "3rd Round": 37,
        "4th Round": 38,
        "5th Round": 39,
        "6th Round": 40,
        "7th Round": 39
    });
    const [totalPicks, setTotalPicks] = useState(32); // Default to 1 round
    const router = useRouter();

    useEffect(() => {
        async function fetchDraftOrder() {
            const response = await fetch('/data/combinedDraftOrder.json');
            const data = await response.json();
            setDraftOrder(data);
        }
        fetchDraftOrder();
    }, []);

    useEffect(() => {
        async function fetchTeams() {
            const response = await fetch('/data/teams.json');
            const data = await response.json();
            setTeams(data);
        }
        fetchTeams();
    }, []);

    useEffect(() => {
        async function fetchPlayers() {
            const response = await fetch('/data/players.json');
            const data = await response.json();
            setPlayers(data);
        }
        fetchPlayers();
    }, []);

    useEffect(() => {
        async function fetchTeamNeeds() {
            const response = await fetch('/data/teamNeeds.json');
            const data = await response.json();
            setTeamNeeds(data);
        }
        fetchTeamNeeds();
    }, []);

    useEffect(() => {
        async function fetchTeamPicks() {
            const response = await fetch('/data/teamPicks.json');
            const data = await response.json();
            const picks = data.reduce((acc, team) => {
                acc[team.team] = team.picks;
                return acc;
            }, {});
            setTeamPicks(picks);
        }
        fetchTeamPicks();
    }, []);

    useEffect(() => {
        if (router.query.selectedTeams) {
            setSelectedTeams(JSON.parse(router.query.selectedTeams));
        }
        if (router.query.rounds) {
            const selectedRounds = parseInt(router.query.rounds, 10);
            setRounds(selectedRounds);
            const totalPicksMap = {
                1: 32,
                2: 64,
                3: 101,
                4: 139,
                5: 178,
                6: 218,
                7: 257
            };
            setTotalPicks(totalPicksMap[selectedRounds]);
        }
    }, [router.query.selectedTeams, router.query.rounds]);

    const getRoundsToShow = () => {
        const roundsToShow = [];
        for (let i = 1; i <= rounds; i++) {
            roundsToShow.push(`${i}${getOrdinalSuffix(i)} Round`);
        }
        return roundsToShow;
    };

    const getOrdinalSuffix = (i) => {
        const j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) {
            return 'st';
        }
        if (j === 2 && k !== 12) {
            return 'nd';
        }
        if (j === 3 && k !== 13) {
            return 'rd';
        }
        return 'th';
    };

    const getTeamByAbbr = (abbr) => {
        return teams.find(team => team.abr === abbr);
    };

    const handleDraftPlayer = (player) => {
        let cumulativePicks = 0;
        let currentRound = null;
        let currentPickPosition = null;

        for (const round of getRoundsToShow()) {
            const roundLength = roundLengths[round];
            if (currentPickIndex < cumulativePicks + roundLength) {
                currentRound = round;
                currentPickPosition = currentPickIndex - cumulativePicks;
                break;
            }
            cumulativePicks += roundLength;
        }

        setDraftedPlayers(prevDraftedPlayers => ({
            ...prevDraftedPlayers,
            [currentRound]: {
                ...prevDraftedPlayers[currentRound],
                [currentPickPosition]: player
            }
        }));
        setPlayers(players.filter(p => p !== player));
        setCurrentPickIndex(prevIndex => prevIndex + 1);
        setIsManualMode(false); // Switch back to auto mode after manual pick

        // Move the current team pointer forward
        let nextPickIndex = currentPickIndex + 1;
        let nextRound = null;
        let nextCumulativePicks = 0;

        for (const round of getRoundsToShow()) {
            const roundLength = roundLengths[round];
            if (nextPickIndex < nextCumulativePicks + roundLength) {
                nextRound = round;
                break;
            }
            nextCumulativePicks += roundLength;
        }

        const nextTeam = draftOrder[nextRound]?.[nextPickIndex - nextCumulativePicks]?.team;
        if (nextTeam && selectedTeams.some(team => team.abr === nextTeam)) {
            setIsManualMode(true);
        } else {
            setIsManualMode(false);
        }
    };

    useEffect(() => {
        let cumulativePicks = 0;
        let currentRound = null;

        for (const round of getRoundsToShow()) {
            const roundLength = roundLengths[round];
            if (currentPickIndex < cumulativePicks + roundLength) {
                currentRound = round;
                break;
            }
            cumulativePicks += roundLength;
        }

        const currentTeam = draftOrder[currentRound]?.[currentPickIndex - cumulativePicks]?.team;
        if (currentTeam && selectedTeams.some(team => team.abr === currentTeam)) {
            setIsManualMode(true);
        } else {
            setIsManualMode(false);
        }

        if (currentPickIndex >= totalPicks) {
            setShowDraftRecap(true);
        }
    }, [currentPickIndex, rounds, selectedTeams, totalPicks]);

    const toggleAutoDraft = () => {
        setIsAutoDrafting(!isAutoDrafting);
    };

    const handleBack = () => {
        router.push('/draft-setup');
    };

    const handleTrade = (team1, team1Picks, team2, team2Picks) => {
        console.log(`Trading picks from ${team1}:`, team1Picks);
        console.log(`Trading picks from ${team2}:`, team2Picks);

        setTeamPicks(prevPicks => {
            const newPicks = { ...prevPicks };
            newPicks[team1] = prevPicks[team1].filter(pick => !team1Picks.includes(pick)).concat(team2Picks);
            newPicks[team2] = prevPicks[team2].filter(pick => !team2Picks.includes(pick)).concat(team1Picks);
            console.log(`Updated picks for ${team1}:`, newPicks[team1]);
            console.log(`Updated picks for ${team2}:`, newPicks[team2]);

            // Update draft order with new picks
            const newDraftOrder = { ...draftOrder };
            const allPicks = [...team1Picks, ...team2Picks];
            allPicks.forEach(pick => {
                const round = Math.floor((pick - 1) / 32) + 1;
                const roundName = `${round}${getOrdinalSuffix(round)} Round`;
                const pickIndex = (pick - 1) % 32;
                if (team1Picks.includes(pick)) {
                    newDraftOrder[roundName][pickIndex].team = team2;
                } else {
                    newDraftOrder[roundName][pickIndex].team = team1;
                }
            });

            setDraftOrder(newDraftOrder);
            setShowTradePicks(false); // Close the trade pop-up after a successful trade

            // Restart auto drafter if the new team is not user-controlled
            let cumulativePicks = 0;
            let currentRound = null;

            for (const round of getRoundsToShow()) {
                const roundLength = roundLengths[round];
                if (currentPickIndex < cumulativePicks + roundLength) {
                    currentRound = round;
                    break;
                }
                cumulativePicks += roundLength;
            }

            const currentTeam = newDraftOrder[currentRound]?.[currentPickIndex - cumulativePicks]?.team;
            setCurrentPickIndex(currentPickIndex); // Ensure currentPickIndex is updated
            if (!selectedTeams.some(team => team.abr === currentTeam)) {
                setIsManualMode(false);
                setIsAutoDrafting(true);
            }

            return newPicks;
        });
    };

    const handleShowTradePicks = () => {
        setShowTradePicks(false);
        if (isAutoDrafting) {
            setIsAutoDrafting(false); // Pause auto draft when trade picks module is opened
        }
    };

    const handleCloseTradePicks = () => {
        setShowTradePicks(false);
    };

    const handleCloseDraftRecap = () => {
        setShowDraftRecap(false);
        setShowRecapButton(true);
    };

    const handleOpenDraftRecap = () => {
        setShowDraftRecap(true);
    };

    const getDraftOrderForGrid = (picks = teamPicks) => {
        const newDraftOrder = {};
        Object.keys(picks).forEach(team => {
            picks[team].forEach(pick => {
                let cumulativePicks = 0;
                let round = null;
                for (const [roundName, length] of Object.entries(roundLengths)) {
                    if (pick <= cumulativePicks + length) {
                        round = roundName;
                        break;
                    }
                    cumulativePicks += length;
                }
                const pickIndex = pick - cumulativePicks - 1;
                if (!newDraftOrder[round]) {
                    newDraftOrder[round] = [];
                }
                newDraftOrder[round][pickIndex] = { team, pick };
            });
        });
        return newDraftOrder;
    };

    let cumulativePicks = 0;
    let currentRound = null;

    for (const round of getRoundsToShow()) {
        const roundLength = roundLengths[round];
        if (currentPickIndex < cumulativePicks + roundLength) {
            currentRound = round;
            break;
        }
        cumulativePicks += roundLength;
    }

    const currentTeam = draftOrder[currentRound]?.[currentPickIndex - cumulativePicks]?.team;

    useEffect(() => {
        let cumulativePicks = 0;
        let currentRound = null;

        for (const round of getRoundsToShow()) {
            const roundLength = roundLengths[round];
            if (currentPickIndex < cumulativePicks + roundLength) {
                currentRound = round;
                break;
            }
            cumulativePicks += roundLength;
        }

        const currentTeam = draftOrder[currentRound]?.[currentPickIndex - cumulativePicks]?.team;
        if (currentTeam && selectedTeams.some(team => team.abr === currentTeam)) {
            setIsManualMode(true);
        } else {
            setIsManualMode(false);
        }
    }, [currentPickIndex, draftOrder, selectedTeams]);

    useEffect(() => {
        let cumulativePicks = 0;
        let currentRound = null;

        for (const round of getRoundsToShow()) {
            const roundLength = roundLengths[round];
            if (currentPickIndex < cumulativePicks + roundLength) {
                currentRound = round;
                break;
            }
            cumulativePicks += roundLength;
        }

        const currentTeam = draftOrder[currentRound]?.[currentPickIndex - cumulativePicks]?.team;
        if (currentTeam && selectedTeams.some(team => team.abr === currentTeam)) {
            setIsManualMode(true);
        } else {
            setIsManualMode(false);
        }
    }, [currentPickIndex, teamPicks, selectedTeams]);

    useEffect(() => {
        let cumulativePicks = 0;
        let currentRound = null;

        for (const round of getRoundsToShow()) {
            const roundLength = roundLengths[round];
            if (currentPickIndex < cumulativePicks + roundLength) {
                currentRound = round;
                break;
            }
            cumulativePicks += roundLength;
        }

        const currentTeam = draftOrder[currentRound]?.[currentPickIndex - cumulativePicks]?.team;
        if (currentTeam && selectedTeams.some(team => team.abr === currentTeam)) {
            setIsManualMode(true);
        } else {
            setIsManualMode(false);
        }

        if (currentPickIndex >= totalPicks) {
            setShowDraftRecap(true);
        }
    }, [currentPickIndex, rounds, selectedTeams, totalPicks]);

    return (
        <div className="container">
            <h1>Mock Draft</h1>
            <div className="controls">
                <button onClick={handleBack} className="back-button">Back</button>
                <button onClick={toggleAutoDraft}>
                    {isAutoDrafting ? 'Pause Auto Draft' : 'Start Auto Draft'}
                </button>
                {showRecapButton && (
                    <button onClick={handleOpenDraftRecap} className="recap-button">Show Recap</button>
                )}
                {/* <button onClick={handleShowTradePicks} className="trade-button">Trade Picks</button> */}
            </div>
            <div className="draft-board-container">
                {Object.keys(draftOrder).length > 0 ? (
                    getRoundsToShow().map((round, roundIndex) => (
                        <div key={round} className={`draft-board ${roundIndex < 2 ? 'wide' : ''}`}>
                            <h2>{round}</h2>
                            <div className="grid">
                                {draftOrder[round]?.map(({ team, pick }, index) => {
                                    const teamData = getTeamByAbbr(team);
                                    const draftPickNumber = pick;
                                    const draftedPlayer = draftedPlayers[round]?.[index];
                                    return teamData ? (
                                        <div
                                            key={index}
                                            className={`grid-item ${selectedTeams.some(t => t.abr === team) ? 'selected' : ''}`}
                                            style={{ gridRow: (index % 8) + 1, gridColumn: Math.floor(index / 8) + 1 }}
                                        >
                                            <img src={`/logos/${team.toLowerCase()}.png`} alt={`${teamData.name} logo`} className="team-logo" />
                                            <span className="team-info">{draftPickNumber}. {teamData.name}</span>
                                            {draftedPlayer && (
                                                <div className="drafted-player">
                                                    <span>{draftedPlayer.name} - </span>
                                                    <span>{draftedPlayer.school}  -  </span>
                                                    <span>{draftedPlayer.position}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Loading draft order...</p>
                )}
            </div>
            <PlayerPool onDraftPlayer={handleDraftPlayer} currentPickIndex={currentPickIndex} players={players} isOpenInitially={isManualMode} selectedTeams={selectedTeams} draftOrder={draftOrder} />
            {draftOrder[getRoundsToShow()[0]] && (
                <AutoDrafter
                    draftOrder={draftOrder}
                    selectedTeams={selectedTeams}
                    players={players}
                    setPlayers={setPlayers}
                    teamNeeds={teamNeeds}
                    onDraftPlayer={handleDraftPlayer}
                    currentPickIndex={currentPickIndex}
                    setCurrentPickIndex={setCurrentPickIndex}
                    isManualMode={isManualMode}
                    setIsManualMode={setIsManualMode}
                    isAutoDrafting={isAutoDrafting}
                    rounds={rounds}
                />
            )}
            {showTradePicks && (
                <div className="trade-picks-modal" onClick={handleCloseTradePicks}>
                    <div className="trade-picks-content" onClick={(e) => e.stopPropagation()}>
                        <TradePicks teams={teams} teamPicks={teamPicks} onTrade={handleTrade} selectedTeam1={currentTeam} currentPickIndex={currentPickIndex} userSelectedTeams={selectedTeams} onClose={handleCloseTradePicks} />
                    </div>
                </div>
            )}
            {showDraftRecap && (
                <DraftRecap
                    teams={selectedTeams}
                    draftedPlayers={draftedPlayers}
                    draftOrder={draftOrder}
                    onClose={handleCloseDraftRecap}
                />
            )}
            <style jsx>{`
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-color: #1a1a1a;
                    color: #fff;
                    font-family: Arial, sans-serif;
                    padding: 0 20px;
                }
                .draft-board-container {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: 1700px;
                    overflow-y: auto;
                    scrollbar-width: none; /* Firefox */
                }
                .draft-board-container::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, and Opera */
                }
                .draft-board {
                    width: 100%;
                    margin-bottom: 40px;
                }
                .draft-board.wide .grid-item {
                    min-width: 350px; /* Increase the width for 1st and 2nd round */
                }
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                }
                h2 {
                    font-size: 1.5rem;
                    margin-top: 20px;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    grid-template-rows: repeat(6, 1fr);
                    gap: 20px; /* Increase the gap between grid items */
                }
                .grid-item {
                    padding: 20px;
                    background-color: #333;
                    border-radius: 5px;
                    text-align: left;
                    font-size: 1.2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    min-width: 250px; /* Set a minimum width to fit the largest team name */
                }
                .grid-item.selected {
                    background-color: #555;
                }
                .team-logo {
                    width: 30px;
                    height: 30px;
                    margin-right: 10px;
                }
                .team-info {
                    display: flex;
                    align-items: center;
                }
                .drafted-player {
                    margin-top: 10px;
                    background-color: #444;
                    padding: 10px;
                    border-radius: 5px;
                    width: 100%;
                    text-align: center;
                }
                .controls {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    display: flex;
                    justify-content: center;
                    width: auto;
                }
                .controls button {
                    margin: 0 10px;
                    padding: 15px 30px; /* Increase padding for bigger buttons */
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem; /* Increase font size */
                    transition: background-color 0.3s;
                }
                .controls button:disabled {
                    background-color: #555;
                    cursor: not-allowed;
                }
                .controls button:hover:not(:disabled) {
                    background-color: #555;
                }
                .recap-button {
                    top: 20px;
                    right: 20px;
                    padding: 10px 30px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .recap-button:hover {
                    background-color: #555;
                }
                .trade-picks-modal {
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
                .trade-picks-content {
                    background-color: #1a1a1a;
                    padding: 20px;
                    border-radius: 5px;
                    width: 80%;
                    max-width: 600px;
                }
            `}</style>
        </div>
    );
}
