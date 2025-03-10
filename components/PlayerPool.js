import { useState, useEffect } from 'react';

export default function PlayerPool({ onDraftPlayer, currentPickIndex, players, isOpenInitially, selectedTeams, draftOrder }) {
    const [isOpen, setIsOpen] = useState(isOpenInitially);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        setIsOpen(isOpenInitially);
    }, [isOpenInitially]);

    const togglePlayerPool = () => {
        setIsOpen(!isOpen);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleDraftPlayer = (player) => {
        onDraftPlayer(player);
        setIsOpen(false);
    };

    const filteredPlayers = filter
        ? players.filter(player => player.position.toLowerCase().includes(filter.toLowerCase()))
        : players;

    // Sort players by rank
    const sortedPlayers = filteredPlayers.sort((a, b) => a.rank - b.rank);

    const roundLengths = {
        "1st Round": 32,
        "2nd Round": 32,
        "3rd Round": 37,
        "4th Round": 38,
        "5th Round": 39,
        "6th Round": 40,
        "7th Round": 39
    };

    let cumulativePicks = 0;
    let currentRound = null;

    for (const round of Object.keys(draftOrder)) {
        const roundLength = roundLengths[round];
        if (currentPickIndex < cumulativePicks + roundLength) {
            currentRound = round;
            break;
        }
        cumulativePicks += roundLength;
    }

    const currentTeam = draftOrder[currentRound]?.[currentPickIndex - cumulativePicks]?.team;

    // Determine if it is the user's turn
    const isUserTurn = selectedTeams.some(team => team.abr === currentTeam);
    console.log(`Current team: ${currentTeam}`);
    console.log(`Is user turn: ${isUserTurn}`);

    return (
        <div className={`player-pool ${isOpen ? 'open' : 'closed'}`}>
            <div className="resize-tab" onClick={togglePlayerPool}>
                <div className="arrow">{isOpen ? '▼' : '▲'}</div>
            </div>
            {isOpen && (
                <>
                    <h2>Available Players</h2>
                    <div className="filter">
                        <label htmlFor="position-filter">Filter by Position: </label>
                        <select
                            id="position-filter"
                            value={filter}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Positions</option>
                            <option value="QB">QB</option>
                            <option value="RB">RB</option>
                            <option value="WR">WR</option>
                            <option value="TE">TE</option>
                            <option value="OT">OT</option>
                            <option value="IOL">IOL</option>
                            <option value="EDGE">EDGE</option>
                            <option value="DL">DL</option>
                            <option value="LB">LB</option>
                            <option value="S">S</option>
                            <option value="CB">CB</option>
                            <option value="ATH">ATH</option>
                        </select>
                    </div>
                    <div className="players">
                        <div className="player-header">
                            <span>Name</span>
                            <span>Position</span>
                            <span>School</span>
                            <span>Height</span>
                            <span>Weight</span>
                            <span>Action</span>
                        </div>
                        {sortedPlayers.map((player, index) => (
                            <div key={index} className="player-item">
                                <span>{player.name}</span>
                                <span>{player.position}</span>
                                <span>{player.school}</span>
                                <span>{player.height}</span>
                                <span>{player.weight}</span>
                                <button
                                    className="draft-button"
                                    onClick={() => isUserTurn && handleDraftPlayer(player)}
                                    disabled={!isUserTurn}
                                >
                                    Draft
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
            <style jsx>{`
                .player-pool {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: #222;
                    border-top: 2px solid #444;
                    overflow-y: auto;
                    scrollbar-width: none; /* Firefox */
                    transition: height 0.3s ease;
                }
                .player-pool.closed {
                    height: 40px;
                    cursor: pointer;
                }
                .player-pool.open {
                    height: 35%;
                    cursor: pointer;
                }
                .player-pool::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, and Opera */
                }
                .resize-tab {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 30px;
                    background-color: #444;
                    text-align: center;
                    line-height: 20px;
                    font-size: 16px;
                    color: #fff;
                    z-index: 1;
                }
                .arrow {
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 30px;
                    background-color: #000;
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    font-size: 16px;
                    color: #fff;
                    padding-bottom: 5px;
                }
                .filter {
                    padding: 10px;
                    background-color: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .filter select {
                    margin-left: 10px;
                    padding: 5px;
                    border-radius: 5px;
                    border: none;
                    font-size: 1rem;
                }
                .players {
                    padding: 10px;
                }
                .player-header, .player-item {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    padding: 10px;
                    background-color: #333;
                    border-radius: 5px;
                    text-align: left;
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                }
                .player-header {
                    font-weight: bold;
                    background-color: #444;
                }
                .player-item:hover {
                    background-color: #555;
                }
                .draft-button {
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    padding: 5px 10px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .draft-button:disabled {
                    background-color: #555;
                    cursor: not-allowed;
                }
                .draft-button:hover:not(:disabled) {
                    background-color: #0056b3;
                }
            `}</style>
        </div>
    );
}
