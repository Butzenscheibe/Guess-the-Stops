import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function SharedResultPage({ t }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const gameId = params.get('id');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!gameId) {
      setError(t('shared.missingId'));
      return;
    }
    fetch('/game-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.result) {
          setError(t('shared.notFound'));
          return;
        }
        setData(response.result);
      })
      .catch(() => setError(t('shared.loadFailed')));
  }, [gameId, t]);

  if (error) {
    return (
      <div className="content-wrapper">
        <div className="game-container">
          <p className="empty-state">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="content-wrapper">
        <div className="game-container">
          <p className="empty-state">{t('game.loading')}</p>
        </div>
      </div>
    );
  }

  const game = data.game;
  const score = game?.score ?? 0;
  const undeduced = game?.unDeducedScore ?? score;
  const totalGuesses = data.guesses?.filter(Boolean).length ?? 0;
  const correctGuesses = data.correctGuesses?.length ?? 0;
  const country = t(`country.${game?.country || 'unknown'}`);
  const difficulty = t(`difficulty.${game?.difficulty || 'unknown'}`);

  return (
    <div className="content-wrapper">
      <div className="game-container shared-result" id="game-container">
        <div className="shared-header">
          <div>
            <h1>{t('shared.title')}</h1>
            <h2>{t('shared.subtitle')}</h2>
          </div>
        </div>

        <div className="shared-metrics">
          <div className="metric-card">
            <span id="label-train">{t('shared.train')}</span>
            <strong id="train-name">{game?.train?.trainName || t('shared.unknownTrain')}</strong>
          </div>
          <div className="metric-card">
            <span id="label-country">{t('shared.country')}</span>
            <strong id="country">{country}</strong>
          </div>
          <div className="metric-card">
            <span id="label-difficulty">{t('shared.difficulty')}</span>
            <strong id="difficulty">{difficulty}</strong>
          </div>
          <div className="metric-card">
            <span id="label-score">{t('shared.score')}</span>
            <strong id="score">{t('shared.scoreDetail', { score, undeduced })}</strong>
          </div>
          <div className="metric-card">
            <span id="label-time">{t('shared.time')}</span>
            <strong id="time">{formatDuration(game?.time)}</strong>
          </div>
          <div className="metric-card">
            <span id="label-accuracy">{t('shared.accuracy')}</span>
            <strong id="accuracy">{`${correctGuesses}/${totalGuesses}`}</strong>
          </div>
        </div>

        <div className="shared-lists">
          <div>
            <h3>{t('shared.guesses')}</h3>
            <ul id="stop-list" className="stop-list">
              {data.guesses?.filter(Boolean).map((guess, index) => (
                <li key={`${guess}-${index}`} className={game?.train?.stops?.includes(guess) ? 'correct' : ''}>
                  {guess}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t('shared.correct')}</h3>
            <ul id="correct-list" className="stop-list">
              {data.correctGuesses?.map((guess, index) => (
                <li key={`${guess}-${index}`} className="correct">{guess}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t('shared.stops')}</h3>
            <ul id="all-stops-list" className="stop-list">
              {game?.train?.stops?.map((stop, index) => (
                <li key={`${stop}-${index}`}>{stop}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default SharedResultPage;
