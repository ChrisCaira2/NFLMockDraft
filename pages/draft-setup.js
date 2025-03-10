import { useState, useEffect } from 'react';
import Link from 'next/link';
import TeamSelection from '../components/TeamSelection';
import RoundSelection from '../components/RoundSelection';
import TradePicks from '../components/TradePicks';

export default function DraftSetup() {
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [rounds, setRounds] = useState(1);
    const [teamPicks, setTeamPicks] = useState({});

    useEffect(() => {
        async function fetchTeams() {
            const response = await fetch('/data/teams.json');
            const data = await response.json();
            setTeams(data);
        }
        fetchTeams();
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

    const handleTrade = (team1, team1Picks, team2, team2Picks) => {
        setTeamPicks(prevPicks => {
            const newPicks = { ...prevPicks };
            newPicks[team1] = newPicks[team1].filter(pick => !team1Picks.includes(pick)).concat(team2Picks);
            newPicks[team2] = newPicks[team2].filter(pick => !team2Picks.includes(pick)).concat(team1Picks);
            return newPicks;
        });
    };

    return (
        <div className="container">
            <h1>Select Teams to Draft For!</h1>
            <h2>Teams Not Selected Will Be Autodrafted.</h2>
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
            {/* <TradePicks teams={teams} teamPicks={teamPicks} onTrade={handleTrade} /> */}
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
