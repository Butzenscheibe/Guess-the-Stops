import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const GuessTheStops = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('setup-country');
  const [country, setCountry] = useState('ch');
  const [difficulty, setDifficulty] = useState('easy');
  const [gameId, setGameId] = useState(null);
  const [trainName, setTrainName] = useState('Loading...');
  const [userInput, setUserInput] = useState('');
  const [guessedStations, setGuessedStations] = useState([]);
  const [hintAmount, setHintAmount] = useState(0);
  const [message, setMessage] = useState('Waiting...');
  const [timer, setTimer] = useState('Time: 00:00:00');
  const [score, setScore] = useState('Score: --');
  const [playerName, setPlayerName] = useState('');
  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const gameStartTimeRef = useRef(null);

  const stopFrontendTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const updateTime = useCallback(async () => {
    if (!gameId) return;
    try {
      const response = await apiService.getTime(gameId);
      if (response.result) {
        const time = response.result;
        let totalSeconds = Math.floor(time / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        
        setTimer(`Time: ${hours}:${minutes}:${seconds}`);
      }
    } catch (error) {
      console.error('Error updating time:', error);
    }
  }, [gameId]);

  const updateScore = useCallback(async () => {
    if (!gameId) return;
    try {
      const response = await apiService.getScore(gameId);
      if (response.result) {
        const score = response.result.score;
        const unDeducedScore = response.result.unDeducedScore;
        setScore(`Score: ${score} Points (${unDeducedScore} Points without deductions)`);
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  }, [gameId]);

  const archiveTrain = useCallback(async () => {
    if (!gameId) return;
    try {
      await apiService.archiveTrain(gameId);
    } catch (error) {
      console.error('Error archiving train:', error);
    }
  }, [gameId]);

  const afterGame = useCallback(() => {
    stopFrontendTimer();
    archiveTrain();
    setGameState('finished');
  }, [stopFrontendTimer, archiveTrain]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameId && gameState === 'playing') {
        apiService.deleteGame(gameId).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameId, gameState]);

  useEffect(() => {
    const handleBlur = async () => {
      if (gameId && gameState === 'playing') {
        try {
          const response = await apiService.cancelGame(gameId);
          if (response.result) {
            await updateScore();
            setMessage('Game cancelled - window lost focus');
            setGuessedStations(response.result);
            await updateTime();
            afterGame();
          }
        } catch (error) {
          console.error('Error canceling on blur:', error);
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [gameId, gameState, updateScore, updateTime, afterGame]);

  const startFrontendTimer = () => {
    gameStartTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - gameStartTimeRef.current;
      const totalSeconds = Math.floor(elapsed / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimer(`Time: ${timeStr}`);
    }, 1000);
  };

  const handleCountryContinue = () => {
    setGameState('setup-difficulty');
  };

  const handleStartGame = async () => {
    setGameState('loading');
    
    try {
      const response = await apiService.startGame(country, difficulty);
      if (response.gameId) {
        const newGameId = response.gameId;
        setGameId(newGameId);
        
        const trainResponse = await apiService.getTrainName(newGameId);
        setTrainName(trainResponse.result || 'Unknown Train');
        
        const stopsResponse = await apiService.getGuessedStops(newGameId);
        setGuessedStations(stopsResponse.result || []);
        
        // Start timer only after successful game creation
        startFrontendTimer();
        setGameState('playing');
        setHintAmount(0);
        setMessage('Waiting...');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (error) {
      setMessage('Error starting game. Please try again.');
      console.error('Error starting game:', error);
      setGameState('setup-difficulty');
    }
  };

  const submit = async () => {
    const stationName = userInput.trim();
    setUserInput('');
    
    if (!stationName || !gameId) return;

    try {
      const checkResponse = await apiService.checkStation(gameId, stationName);
      if (checkResponse.result) {
        setMessage('Correct!');
      } else {
        setMessage('Incorrect!');
      }
      
      const stopsResponse = await apiService.getGuessedStops(gameId);
      setGuessedStations(stopsResponse.result || []);
      
      const winResponse = await apiService.checkWin(gameId);
      if (winResponse.result) {
        await updateScore();
        setMessage('Won!');
        afterGame();
        await updateTime();
      }
    } catch (error) {
      setMessage('Error checking station.');
      console.error('Error in submit:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const handleHint = async () => {
    if (!gameId) return;
    try {
      const response = await apiService.getHint(gameId, hintAmount);
      if (response.result) {
        setGuessedStations(response.result);
        setHintAmount(hintAmount + 1);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
    }
  };

  const handleCancel = async () => {
    if (!gameId) return;
    try {
      const response = await apiService.cancelGame(gameId);
      if (response.result) {
        await updateScore();
        setMessage('Game cancelled');
        setGuessedStations(response.result);
        await updateTime();
        afterGame();
      }
    } catch (error) {
      console.error('Error canceling game:', error);
    }
  };

  const handleRestart = () => {
    // Reset all state to initial values
    setGameState('setup-country');
    setGameId(null);
    setCountry('ch');
    setDifficulty('easy');
    setTrainName('Loading...');
    setUserInput('');
    setGuessedStations([]);
    setHintAmount(0);
    setMessage('Waiting...');
    setTimer('Time: 00:00:00');
    setScore('Score: --');
    setPlayerName('');
  };

  const handleShare = () => {
    if (!gameId) return;
    const url = `${window.location.origin}/shared-result?id=${gameId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };

  const handleShowSaveForm = () => {
    setGameState('save-name');
  };

  const handleSaveGame = async () => {
    if (!gameId || !playerName.trim()) {
      alert('Please enter your name!');
      return;
    }
    try {
      await apiService.saveGame(gameId, playerName.trim());
      setGameState('finished');
      window.dispatchEvent(new Event('leaderboardUpdate'));
    } catch (error) {
      alert('Error saving game.');
      console.error('Error saving game:', error);
    }
  };

  const handleGoToSortStations = () => {
    navigate('/sort-the-stations');
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
          <button id="country-button" onClick={handleCountryContinue}>Continue</button>
          <button id="sts-btn" onClick={handleGoToSortStations}>Sort the Stations</button>
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
          <button id="difficulty-button" onClick={handleStartGame}>Start Game</button>
        </div>
      )}

      {gameState === 'loading' && (
        <div>
          <p>Starting game...</p>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div id="game-output">
            <h2 id="train-name">{trainName}</h2>
            <div className="stats-grid">
              <p id="score">{score}</p>
              <p id="time">{timer}</p>
            </div>
            <p id="result">{message}</p>
          </div>

          <div id="game-input">
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
                <button type="button" onClick={handleHint} id="hint">Hint (-20%)</button>
                <button type="button" onClick={handleCancel} id="cancel-button">Cancel</button>
              </div>
            </form>

            <ul id="stop-list" className="stop-list">
              {guessedStations.map((station, index) => (
                <li key={index}>{station}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {gameState === 'save-name' && (
        <div id="save-input">
          <h2>Save Your Result</h2>
          <label htmlFor="save-name">Your Name</label>
          <input
            type="text"
            id="save-name"
            placeholder="Enter your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveGame();
              }
            }}
          />
          <button onClick={handleSaveGame} id="save-button">Save Score</button>
        </div>
      )}

      {gameState === 'finished' && (
        <>
          <div id="game-output">
            <h2 id="train-name">{trainName}</h2>
            <div className="stats-grid">
              <p id="score">{score}</p>
              <p id="time">{timer}</p>
            </div>
            <p id="result">{message}</p>

            <ul id="stop-list" className="stop-list">
              {guessedStations.map((station, index) => (
                <li key={index}>{station}</li>
              ))}
            </ul>
          </div>

          <div id="game-input">
            <div className="button-grid">
              <button onClick={handleRestart} id="restart-button">Restart</button>
              <button onClick={handleShare} id="share">Share</button>
              <button onClick={handleShowSaveForm} id="save">Save Result</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GuessTheStops;
