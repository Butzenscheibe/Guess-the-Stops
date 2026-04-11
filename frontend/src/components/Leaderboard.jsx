import React, { useEffect, useState } from 'react';

function Leaderboard({ t }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const response = await fetch('/get-top?amount=10');
      const data = await response.json();
      if (mounted) {
        setEntries(data.result || []);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="game-container" id="highscores">
      <h1>{t('leaderboard.title')}</h1>
      <ul id="leaderboard" className="stop-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              className="nav-button nav-button--list"
              type="button"
              onClick={() => (window.location.hash = `#/shared?id=${entry.id}`)}
            >
              {entry.name} - {t('leaderboard.points', { score: entry.score })}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
