import { useState, useEffect } from 'react';
import Link from 'next/link';
import TeamSelection from '../components/TeamSelection';
import RoundSelection from '../components/RoundSelection';

export default function DraftSetup() {
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [rounds, setRounds] = useState(1);

    useEffect(() => {
        async function fetchTeams() {
            const response = await fetch('/data/teams.json');
            const data = await response.json();
            setTeams(data);
        }
        fetchTeams();
    }, []);

    const handleTeamSelection = (team) => {
        setSelectedTeams((prevTeams) =>
            prevTeams.includes(team)
                ? prevTeams.filter((t) => t !== team)
                : [...prevTeams, team]
        );
    };

    const handleRoundSelection = (rounds) => {
        setRounds(rounds);
    };

    const handleSelectAll = () => {
        if (selectedTeams.length === teams.length) {
            setSelectedTeams([]);
        } else {
            setSelectedTeams(teams);
        }
    };

    return (
        <div className="container">
            <h1>Select Teams</h1>
            <button className="select-all-button" onClick={handleSelectAll}>
                {selectedTeams.length === teams.length ? 'Unselect All' : 'Select All'}
            </button>
            <div className="teams">
                {teams.map((team) => (
                    <TeamSelection
                        key={team.abr}
                        team={team}
                        onSelect={handleTeamSelection}
                        isSelected={selectedTeams.includes(team)}
                    />
                ))}
            </div>
            <RoundSelection rounds={rounds} onSelect={handleRoundSelection} />
            <Link href={{ pathname: '/draft', query: { rounds, selectedTeams: JSON.stringify(selectedTeams) } }} passHref>
                <div className="button">Start Draft</div>
            </Link>
            <style jsx>{`
                .select-all-button {
                    margin: 10px;
                    padding: 10px 20px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.3s;
                }
                .select-all-button:hover {
                    background-color: #555;
                }
            `}</style>
        </div>
    );
}
