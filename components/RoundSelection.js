export default function RoundSelection({ rounds, onSelect }) {
    return (
        <div className="round-selection">
            <h2>Select Number of Rounds</h2>
            <div className="round-buttons">
                {[...Array(7)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => onSelect(index + 1)}
                        className={`round-button ${rounds === index + 1 ? 'selected' : ''}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            <style jsx>{`
        .round-selection {
          text-align: center;
          margin-bottom: 20px;
        }
        .round-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .round-button {
          padding: 10px 20px;
          background-color: #333;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s;
        }
        .round-button:hover {
          background-color: #555;
        }
        .round-button.selected {
          background-color: #555;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
}
