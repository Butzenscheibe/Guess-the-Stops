import React, { useEffect, useState } from 'react';
import { getSessions, getCurrentSessionId, setCurrentSessionId, getSessionDisplayNameById } from '../sessionManager';
import { initCustomSelects, updateCustomSelect } from '../helpers/customSelect';

function SessionHistoryPage({ t }) {
  const [sessions, setSessions] = useState(getSessions());
  const [selected, setSelected] = useState(getCurrentSessionId() || '');
  const [games, setGames] = useState([]);
  const [info, setInfo] = useState(t('history.pick'));

  useEffect(() => {
    if (!selected && sessions.length > 0) {
      const last = sessions[sessions.length - 1];
      setSelected(last.id);
      setCurrentSessionId(last.id);
      return;
    }
    if (!selected) {
      setGames([]);
      setInfo(t('history.pick'));
      return;
    }
    setInfo(`${getSessionDisplayNameById(selected)}`);
    fetch(`/sessions/games?sessionId=${encodeURIComponent(selected)}`)
      .then((res) => res.json())
      .then((data) => setGames(data.games || []))
      .catch(() => setGames([]));
  }, [selected, t, sessions]);

  useEffect(() => {
    initCustomSelects();
    updateCustomSelect(document.getElementById('session-history-select'));
  }, [selected, sessions, t]);

  return (
    <div className="session-history-wrapper">
      <div className="game-container">
        <div className="page-header">
          <h1>{t('history.title')}</h1>
        </div>
        <div className="session-history-actions">
          <div className="session-select-row">
            <label htmlFor="session-history-select">{t('history.select')}</label>
            <select
              id="session-history-select"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setCurrentSessionId(e.target.value);
              }}
            >
              <option value="">{sessions.length ? t('history.selectPlaceholder') : t('history.none')}</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name || session.id.substring(0, 8)}
                </option>
              ))}
            </select>
            <p className="session-info" id="session-history-info">{info}</p>
          </div>
        </div>
      </div>
      <div className="game-container">
        <h2>{t('history.pastGames')}</h2>
        {games.length === 0 ? (
          <p className="empty-state" id="session-empty-state">{t('history.noneForSession')}</p>
        ) : (
          <ul className="session-games-list" id="session-games-list">
            {games.map((game) => {
              const gameId = game.gameId || game.game?.gameId;
              const trainName = game.game?.train?.trainName || t('history.unknownTrain');
              const score = game.game?.score ?? 0;
              const difficulty = t(`difficulty.${game.game?.difficulty || 'unknown'}`);
              const country = t(`country.${game.game?.country || 'unknown'}`);
              const duration = formatDuration(game.game?.time);
              const guesses = game.guesses?.length ?? 0;
              const correctGuesses = game.correctGuesses?.length ?? 0;

              return (
                <li className="game-card" key={gameId}>
                  <h3>{trainName}</h3>
                  <div className="game-meta">
                    <div><strong>{t('history.meta.score')}:</strong> {score}</div>
                    <div><strong>{t('history.meta.difficulty')}:</strong> {difficulty}</div>
                    <div><strong>{t('history.meta.country')}:</strong> {country}</div>
                    <div><strong>{t('history.meta.duration')}:</strong> {duration}</div>
                    <div><strong>{t('history.meta.guesses')}:</strong> {guesses}</div>
                    <div><strong>{t('history.meta.correct')}:</strong> {correctGuesses}</div>
                  </div>
                  <button
                    className="nav-button nav-button--list"
                    type="button"
                    onClick={() => (window.location.hash = `#/shared?id=${gameId}`)}
                  >
                    {t('history.viewResult')}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
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

export default SessionHistoryPage;
