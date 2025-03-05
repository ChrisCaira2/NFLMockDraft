export default function TeamSelection({ team, onSelect, isSelected }) {
    return (
        <button
            onClick={() => onSelect(team)}
            className={`team-button ${isSelected ? 'selected' : ''}`}
        >
            <img src={`/logos/${team.abr.toLowerCase()}.png`} alt={`${team.name} logo`} className="team-logo" />
            {team.city} {team.name}
            <style jsx>{`
                .team-button {
                    margin: 10px;
                    padding: 15px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: background-color 0.3s;
                    display: flex;
                    align-items: center;
                    width: 250px; /* Set a fixed width to fit the largest team name */
                }
                .team-button:hover {
                    background-color: #555;
                }
                .team-logo {
                    width: 30px;
                    height: 30px;
                    margin-right: 10px;
                }
                .team-button.selected {
                    background-color: #555;
                    cursor: not-allowed;
                }
            `}</style>
        </button>
    );
}
