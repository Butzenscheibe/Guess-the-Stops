import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const SharedResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const gameId = searchParams.get('id');

    if (!gameId) {
      setError('No game ID provided');
      setLoading(false);
      return;
    }

    const loadGameData = async () => {
      try {
        const response = await apiService.getGameData(gameId);
        if (response.result) {
          setGameData(response.result);
        } else {
          setError('Game not found');
        }
      } catch (err) {
        console.error('Error loading game data:', err);
        setError('Error loading game data');
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [location]);

  const handleBackHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="game-container">
        <h1>Guess the Stations</h1>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-container">
        <h1>Guess the Stations</h1>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBackHome}>Back to Home</button>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="game-container">
        <h1>Guess the Stations</h1>
        <h2>Game not found</h2>
        <button onClick={handleBackHome}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="game-container" id="game-container">
      <h1>Guess the Stations</h1>
      <h2>Game Result</h2>
      <div className="stats-grid">
        <p id="score">Score: {gameData.score}%</p>
        <p id="name">Player: {gameData.name || 'Anonymous'}</p>
      </div>
      <div id="stop-div">
        {gameData.guesses && gameData.guesses.length > 0 && (
          <div id="guesses">
            <h3>Guessed Stations</h3>
            <ul id="stop-list" className="stop-list">
              {gameData.guesses.map((station, index) => (
                <li key={index}>{station}</li>
              ))}
            </ul>
          </div>
        )}
        {gameData.correct && gameData.correct.length > 0 && (
          <div id="correct">
            <h3>All Correct Answers</h3>
            <ul id="correct-list" className="stop-list">
              {gameData.correct.map((station, index) => (
                <li key={index}>{station}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button onClick={handleBackHome}>Back to Home</button>
    </div>
  );
};

export default SharedResultPage;
