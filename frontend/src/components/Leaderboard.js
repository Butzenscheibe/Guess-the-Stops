import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  const loadLeaderboard = async () => {
    try {
      const response = await apiService.getTop(10);
      if (response.result) {
        setLeaderboard(response.result);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  useEffect(() => {
    // Load initially
    loadLeaderboard();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 10000);

    // Listen for manual updates
    const handleUpdate = () => {
      loadLeaderboard();
    };
    window.addEventListener('leaderboardUpdate', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('leaderboardUpdate', handleUpdate);
    };
  }, []);

  const handleResultClick = (id) => {
    navigate(`/shared-result?id=${id}`);
  };

  return (
    <div className="game-container" id="highscores">
      <h1>Leaderboard</h1>
      <ul id="leaderboard" className="stop-list">
        {leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => (
            <li key={index}>
              <a
                href={`/shared-result?id=${entry.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleResultClick(entry.id);
                }}
              >
                {entry.name} - {entry.score} Points
              </a>
            </li>
          ))
        ) : (
          <li>No entries yet</li>
        )}
      </ul>
    </div>
  );
};

export default Leaderboard;
