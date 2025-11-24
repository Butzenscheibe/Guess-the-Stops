import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

const GuessTheStops = () => {
  const [gameState, setGameState] = useState('setup-country'); // 'setup-country', 'setup-difficulty', 'playing', 'finished'
  const [country, setCountry] = useState('ch');
  const [difficulty, setDifficulty] = useState('easy');
  const [gameId, setGameId] = useState(null);
  const [trainName, setTrainName] = useState('');
  const [userInput, setUserInput] = useState('');
  const [guessedStations, setGuessedStations] = useState([]);
  const [hintAmount, setHintAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState('00:00');
  const [score, setScore] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const gameStartTimeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    gameStartTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleCountryContinue = () => {
    setGameState('setup-difficulty');
  };

  const handleStartGame = async () => {
    try {
      const response = await apiService.startGame(country, difficulty);
      if (response.gameId) {
        setGameId(response.gameId);
        const trainResponse = await apiService.getTrainName(response.gameId);
        setTrainName(trainResponse.result || 'Unknown Train');
        setGameState('playing');
        setGuessedStations([]);
        setHintAmount(0);
        setMessage('');
        startTimer();
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (error) {
      setMessage('Error starting game. Please try again.');
      console.error('Error starting game:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !gameId) return;

    try {
      const response = await apiService.checkStation(gameId, userInput.trim());
      if (response.result) {
        setMessage('Correct! ✓');
        const stopsResponse = await apiService.getGuessedStops(gameId);
        setGuessedStations(stopsResponse.result || []);
        setUserInput('');
        
        // Check if won
        const winResponse = await apiService.checkWin(gameId);
        if (winResponse.result) {
          handleWin();
        }
      } else {
        setMessage('Incorrect station name. Try again!');
      }
    } catch (error) {
      setMessage('Error checking station. Please try again.');
      console.error('Error checking station:', error);
    }
  };

  const handleHint = async () => {
    if (!gameId) return;
    try {
      const newHintAmount = hintAmount + 1;
      const response = await apiService.getHint(gameId, newHintAmount);
      if (response.result) {
        setHintAmount(newHintAmount);
        setMessage(`Hint: ${response.result}`);
        const stopsResponse = await apiService.getGuessedStops(gameId);
        setGuessedStations(stopsResponse.result || []);
      }
    } catch (error) {
      setMessage('Error getting hint. Please try again.');
      console.error('Error getting hint:', error);
    }
  };

  const handleCancel = async () => {
    if (!gameId) return;
    try {
      const response = await apiService.cancelGame(gameId);
      if (response.result) {
        stopTimer();
        setSolutions(response.result);
        const scoreResponse = await apiService.getScore(gameId);
        setScore(scoreResponse.result);
        setGameState('finished');
      }
    } catch (error) {
      setMessage('Error canceling game. Please try again.');
      console.error('Error canceling game:', error);
    }
  };

  const handleWin = async () => {
    stopTimer();
    try {
      const scoreResponse = await apiService.getScore(gameId);
      setScore(scoreResponse.result);
      const timeResponse = await apiService.getTime(gameId);
      if (timeResponse.result) {
        const elapsed = timeResponse.result;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
      setGameState('finished');
      setMessage('Congratulations! You won! 🎉');
    } catch (error) {
      console.error('Error handling win:', error);
    }
  };

  const handleNewGame = () => {
    setGameState('setup-country');
    setGameId(null);
    setTrainName('');
    setUserInput('');
    setGuessedStations([]);
    setHintAmount(0);
    setMessage('');
    setTimer('00:00');
    setScore(null);
    setSolutions([]);
    setCountry('ch');
    setDifficulty('easy');
  };

  const handleSaveGame = async () => {
    if (!gameId) return;
    const name = prompt('Enter your name:');
    if (name) {
      try {
        await apiService.saveGame(gameId, name);
        setMessage('Game saved successfully!');
      } catch (error) {
        setMessage('Error saving game.');
        console.error('Error saving game:', error);
      }
    }
  };

  return (
    <div className="game-container">
      <h1>Guess the Stations</h1>

      {gameState === 'setup-country' && (
        <div id="game-setup-1">
          <label htmlFor="country-select">Select Country</label>
          <select 
            id="country-select" 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="ch">Switzerland</option>
            <option value="de">Germany</option>
          </select>
          <button onClick={handleCountryContinue}>Continue</button>
        </div>
      )}

      {gameState === 'setup-difficulty' && (
        <div id="game-setup-2">
          <label htmlFor="difficulty-select">Select Difficulty</label>
          <select 
            id="difficulty-select" 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div id="game-input">
          <div className="train-info">
            <h2>{trainName}</h2>
            <div className="timer">{timer}</div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="user-input" id="user-input-label">Enter Station Name</label>
            <input
              ref={inputRef}
              type="text"
              id="user-input"
              placeholder="Type station name..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <div className="button-grid">
              <button type="submit" id="submit-button">Submit</button>
              <button type="button" onClick={handleHint}>Hint (-20%)</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>

          {message && <div className="message">{message}</div>}

          {guessedStations.length > 0 && (
            <div id="guessed-stations">
              <h3>Guessed Stations ({guessedStations.length})</h3>
              <ul>
                {guessedStations.map((station, index) => (
                  <li key={index}>{station}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {gameState === 'finished' && (
        <div id="result-screen">
          <h2>Game Over!</h2>
          {score !== null && (
            <div className="score-display">
              <h3>Your Score: {score}%</h3>
              <p>Time: {timer}</p>
            </div>
          )}

          {guessedStations.length > 0 && (
            <div className="guessed-list">
              <h3>Stations You Found ({guessedStations.length})</h3>
              <ul>
                {guessedStations.map((station, index) => (
                  <li key={index}>{station}</li>
                ))}
              </ul>
            </div>
          )}

          {solutions.length > 0 && (
            <div className="missed-list">
              <h3>Stations You Missed</h3>
              <ul>
                {solutions.map((station, index) => (
                  <li key={index}>{station}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="button-grid">
            <button onClick={handleNewGame}>New Game</button>
            <button onClick={handleSaveGame}>Save Score</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuessTheStops;
