import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PlayerPool from '../components/PlayerPool';
import AutoDrafter from '../components/AutoDrafter';

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
    const router = useRouter();

    useEffect(() => {
        async function fetchDraftOrder() {
            const response = await fetch('/data/draftOrder.json');
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
        if (router.query.selectedTeams) {
            setSelectedTeams(JSON.parse(router.query.selectedTeams));
        }
        if (router.query.rounds) {
            setRounds(parseInt(router.query.rounds, 10));
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
        const currentRound = getRoundsToShow()[Math.floor(currentPickIndex / 32)];
        const currentPickPosition = currentPickIndex % 32;
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
    };

    useEffect(() => {
        if (selectedTeams.some(team => draftOrder[getRoundsToShow()[Math.floor(currentPickIndex / 32)]]?.[currentPickIndex % 32] === team.abr)) {
            setIsManualMode(true);
        }
    }, [currentPickIndex, draftOrder, selectedTeams]);

    const toggleAutoDraft = () => {
        setIsAutoDrafting(!isAutoDrafting);
    };

    const handleBack = () => {
        router.push('/draft-setup');
    };

    return (
        <div className="container">
            <h1>Mock Draft</h1>
            <div className="controls">
                <button onClick={handleBack} className="back-button">Back</button>
                <button onClick={toggleAutoDraft}>
                    {isAutoDrafting ? 'Pause Auto Draft' : 'Start Auto Draft'}
                </button>
            </div>
            <div className="draft-board-container">
                {Object.keys(draftOrder).length > 0 ? (
                    getRoundsToShow().map((round, roundIndex) => (
                        <div key={round} className="draft-board">
                            <h2>{round}</h2>
                            <div className="grid">
                                {draftOrder[round]?.map((teamAbbr, index) => {
                                    const team = getTeamByAbbr(teamAbbr);
                                    const draftPickNumber = roundIndex * 32 + index + 1;
                                    const draftedPlayer = draftedPlayers[round]?.[index];
                                    return team ? (
                                        <div
                                            key={index}
                                            className={`grid-item ${selectedTeams.some(t => t.abr === teamAbbr) ? 'selected' : ''}`}
                                            style={{ gridRow: (index % 8) + 1, gridColumn: Math.floor(index / 8) + 1 }}
                                        >
                                            <img src={`/logos/${team.abr.toLowerCase()}.png`} alt={`${team.name} logo`} className="team-logo" />
                                            <span className="team-info">{draftPickNumber}. {team.name}</span>
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
            <PlayerPool onDraftPlayer={handleDraftPlayer} currentPickIndex={currentPickIndex} players={players} isOpenInitially={isManualMode} />
            {draftOrder[getRoundsToShow()[0]] && (
                <AutoDrafter
                    draftOrder={draftOrder[getRoundsToShow()[Math.floor(currentPickIndex / 32)]]}
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
                    max-width: 1400px;
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
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    grid-template-rows: repeat(10, 1fr);
                    gap: 10px;
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
                    padding: 10px 20px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .controls button:disabled {
                    background-color: #555;
                    cursor: not-allowed;
                }
                .controls button:hover:not(:disabled) {
                    background-color: #555;
                }
            `}</style>
        </div>
    );
}
