import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const SortTheStationsPage = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState(null);
  const [stations, setStations] = useState([]);
  const [trainName, setTrainName] = useState('');
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    const startGame = async () => {
      try {
        // Start game
        const gameResponse = await apiService.stsStartGame('de');
        if (gameResponse.gameId) {
          setGameId(gameResponse.gameId);

          // Get shuffled stops
          const stopsResponse = await apiService.stsGetShuffledStops(gameResponse.gameId);
          if (stopsResponse.result) {
            setStations(stopsResponse.result);
          }

          // Get train name
          const trainResponse = await apiService.stsGetTrainName(gameResponse.gameId);
          if (trainResponse.result) {
            setTrainName(trainResponse.result);
          }
        }
      } catch (error) {
        console.error('Error starting Sort the Stations game:', error);
        alert('Error starting game');
      } finally {
        setLoading(false);
      }
    };

    startGame();
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    // Don't allow moving the first or last station
    if (draggedIndex === 0 || draggedIndex === stations.length - 1 ||
        dropIndex === 0 || dropIndex === stations.length - 1) {
      return;
    }

    const newStations = [...stations];
    const draggedStation = newStations[draggedIndex];
    newStations.splice(draggedIndex, 1);
    newStations.splice(dropIndex, 0, draggedStation);
    setStations(newStations);
  };

  const handleSubmit = async () => {
    if (!gameId) return;

    try {
      const response = await apiService.stsCheckSolution(gameId, stations);
      if (response.result) {
        alert('Correct! Well done! 🎉');
      } else {
        alert('Incorrect! Try again.');
      }
    } catch (error) {
      console.error('Error checking solution:', error);
      alert('Error checking solution');
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="game-container sts-container">
        <div className="sts-title">
          <h2>Sort the Stations</h2>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="game-container sts-container">
      <div className="sts-title">
        <h2>Sort the Stations</h2>
        {trainName && <h3>{trainName}</h3>}
      </div>
      <div className="sts-desc">
        <p>Drag and drop the stations in the correct order</p>
      </div>
      <div>
        <div id="stations" className="stations">
          {stations.map((station, index) => {
            const isFirst = index === 0;
            const isLast = index === stations.length - 1;
            const isMovable = !isFirst && !isLast;

            return (
              <div
                key={index}
                className={`stop ${isMovable ? 'stop-style stop-movable larger' : ''}`}
                draggable={isMovable}
                onDragStart={(e) => isMovable && handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {station}
              </div>
            );
          })}
        </div>
        <div className="button-grid">
          <button id="submit" className="submit" onClick={handleSubmit}>
            Submit Order
          </button>
          <button onClick={handleBackHome}>Back to Main Game</button>
        </div>
      </div>
    </div>
  );
};

export default SortTheStationsPage;
