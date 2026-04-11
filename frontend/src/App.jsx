
import React, { useMemo, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { getLocale, setLocale, t as translate } from './i18n';
import Header from './components/Header';
import GamePage from './components/GamePage';
import SessionHistoryPage from './components/SessionHistoryPage';
import SharedResultPage from './components/SharedResultPage';
import Feedback from './components/Feedback';
import UpdateModal from './components/UpdateModal';

function useLocale() {
  const [locale, setLocaleState] = useState(getLocale());

  const t = useMemo(() => {
    return (key, params) => translate(locale, key, params);
  }, [locale]);

  const updateLocale = (next) => {
    const normalized = setLocale(next);
    setLocaleState(normalized);
  };

  return { locale, t, updateLocale };
}

function Header({ locale, onLocaleChange, t }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="brand">{t('game.title')}</div>
        <div className="nav-group">
          <button
            className={`nav-button ${location.pathname === '/' ? 'nav-button--primary' : ''}`}
            type="button"
            onClick={() => navigate('/')}
          >
            {t('nav.home')}
          </button>
          <button
            className={`nav-button ${location.pathname === '/sessions' ? 'nav-button--primary' : ''}`}
            type="button"
            onClick={() => navigate('/sessions')}
          >
            {t('nav.sessions')}
          </button>
        </div>
        <div className="app-header-actions">
          <div className="language-select-wrapper">
            <select value={locale} onChange={(e) => onLocaleChange(e.target.value)}>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      setDarkMode(true);
    }
  }, []);

  const toggle = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setDarkMode(isDark);
  };

  return (
    <button className="dark-mode-toggle" onClick={toggle} aria-label="Toggle dark mode">
      <svg className={`sun-icon ${darkMode ? 'hidden' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
      </svg>
      <svg className={`moon-icon ${darkMode ? '' : 'hidden'}`} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
}

function SessionWidget({ t, onOpen }) {
  const current = getCurrentSessionId();
  return (
    <div className="session-widget">
      <div className="session-widget-info">
        <span className="session-widget-label">{t('session.current')}</span>
        <span className="session-widget-value">{current ? getSessionDisplayNameById(current) : t('session.none')}</span>
      </div>
      <button className="session-button" type="button" onClick={onOpen}>
        {t('session.manage')}
      </button>
    </div>
  );
}

function SessionModal({ t, open, onClose, onSessionCreated }) {
  const [nameInput, setNameInput] = useState('');
  const [sessionId, setSessionId] = useState(getCurrentSessionId() || '');
  const sessions = getSessions();

  useEffect(() => {
    setSessionId(getCurrentSessionId() || '');
  }, [open]);

  const generateName = (length = 2) => {
    let name = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * SESSION_WORDS.length);
      name += SESSION_WORDS[randomIndex];
      if (i < length - 1) {
        name += '-';
      }
    }
    return name;
  };

  const create = async () => {
    let sessionName = nameInput.trim() || generateName(2);
    while (sessionNameExists(sessionName)) {
      sessionName = generateName(2);
    }
    try {
      await createSession(sessionName);
      setNameInput('');
      onSessionCreated(sessionName);
    } catch (error) {
      console.error(error);
      alert(t('session.createFailed'));
    }
  };

  const onSelect = (value) => {
    setSessionId(value);
    setCurrentSessionId(value);
  };

  if (!open) return null;

  return (
    <div className="modal show" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{t('session.title')}</h2>
        </div>
        <div className="modal-body">
          <div className="session-controls">
            <div className="form-group">
              <label htmlFor="session-name-input">{t('session.nameLabel')}</label>
              <input
                id="session-name-input"
                type="text"
                placeholder={t('session.namePlaceholder')}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <button className="session-button" type="button" onClick={create}>
              {t('session.create')}
            </button>
          </div>
          <div className="session-select-row">
            <label htmlFor="session-select">{t('session.activeLabel')}</label>
            <select id="session-select" value={sessionId} onChange={(e) => onSelect(e.target.value)}>
              <option value="">{t('session.none')}</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name || session.id.substring(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <div className="session-modal-actions">
            <button className="nav-button nav-button--primary" type="button" onClick={() => (window.location.hash = '#/sessions')}>
              {t('session.past')}
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn" type="button" onClick={onClose}>
            {t('session.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

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

function Feedback({ t }) {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedFeedback = feedback.trim();
    if (!trimmedName || !trimmedFeedback) {
      setStatus({ type: 'error', message: '✗ Please fill in all fields.' });
      return;
    }
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('https://feedback.diebutzenscheibe.dev/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, feedback: trimmedFeedback, subject: 'GTS' })
      });
      if (response.ok) {
        setStatus({ type: 'success', message: '✓ Thank you! Your feedback has been submitted successfully.' });
        setName('');
        setFeedback('');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      setStatus({ type: 'error', message: '✗ Failed to submit feedback. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-section">
      <h2>{t('feedback.title')}</h2>
      <p className="feedback-description">{t('feedback.desc')}</p>
      <form className="feedback-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="feedback-name">{t('feedback.name')}</label>
          <input
            id="feedback-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('feedback.namePlaceholder')}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="feedback-text">{t('feedback.text')}</label>
          <textarea
            id="feedback-text"
            rows="6"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('feedback.textPlaceholder')}
            required
          ></textarea>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Sending...' : t('feedback.submit')}
        </button>
      </form>
      {status.message && (
        <div className={`feedback-status ${status.type}`}>{status.message}</div>
      )}
    </div>
  );
}

function UpdateModal({ t }) {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const modalShown = localStorage.getItem('update-modal-shown');
    if (!modalShown) {
      setTimeout(() => setOpen(true), 500);
    }
  }, []);

  const close = () => {
    if (dontShow) {
      localStorage.setItem('update-modal-shown', 'true');
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="modal show" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{t('update.title')}</h2>
        </div>
        <div className="modal-body">
          <ul className="update-list">
            <li>{t('update.training')}</li>
            <li>{t('update.newCountry')}</li>
            <li>{t('update.updated')}</li>
          </ul>
          <div className="modal-checkbox">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />
            <label htmlFor="dont-show-again">{t('update.dontShow')}</label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn" type="button" onClick={close}>
            {t('update.gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
}

function GamePage({ t }) {
  const [gameId, setGameId] = useState(null);
  const [country, setCountry] = useState('ch');
  const [difficulty, setDifficulty] = useState('easy');
  const [trainingCountry, setTrainingCountry] = useState('');
  const [trainingRegion, setTrainingRegion] = useState('');
  const [trainingMode, setTrainingMode] = useState('');
  const [trainingCountries, setTrainingCountries] = useState([]);
  const [trainingRegions, setTrainingRegions] = useState([]);
  const [trainingModes, setTrainingModes] = useState([]);
  const [step, setStep] = useState('setup1');
  const [resultText, setResultText] = useState(t('game.waiting'));
  const [scoreText, setScoreText] = useState(t('game.scoreDetail', { score: '--', undeduced: '--' }));
  const [timeText, setTimeText] = useState(t('game.timeLabel', { time: '--:--:--' }));
  const [trainName, setTrainName] = useState('');
  const [guessedStops, setGuessedStops] = useState([]);
  const [hintAmount, setHintAmount] = useState(0);
  const [frontendTimer, setFrontendTimer] = useState(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    if (step === 'training-setup') {
      loadTrainingCountries();
    }
  }, [step]);

  useEffect(() => {
    return () => {
      if (frontendTimer) {
        clearInterval(frontendTimer);
      }
    };
  }, [frontendTimer]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameId) {
        fetch('/delete-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId })
        });
      }
    };
    const handleBlur = () => {
      if (gameId) {
        fetch('/cancel-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.result) {
              setResultText(t('game.resultCancelled'));
              setGuessedStops(data.result);
              afterGame();
            }
          });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameId, t]);

  const startTimer = () => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const totalSeconds = Math.floor(elapsed / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimeText(t('game.timeLabel', { time: timeStr }));
    }, 1000);
    setFrontendTimer(timer);
  };

  const stopTimer = () => {
    if (frontendTimer) {
      clearInterval(frontendTimer);
      setFrontendTimer(null);
    }
  };

  const loadTrainingCountries = async () => {
    try {
      const response = await fetch('/training/countries');
      const data = await response.json();
      setTrainingCountries(data.countries || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTrainingRegions = async (code) => {
    try {
      const response = await fetch(`/training/${encodeURIComponent(code)}/regions`);
      const data = await response.json();
      setTrainingRegions(data.regions || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTrainingModes = async (code, region) => {
    try {
      const response = await fetch(`/training/${encodeURIComponent(code)}/${encodeURIComponent(region)}/modes`);
      const data = await response.json();
      setTrainingModes(data.modes || []);
    } catch (error) {
      console.error(error);
    }
  };

  const startGame = async (payload) => {
    startTimer();
    const response = await fetch('/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!data.gameId) throw new Error('Failed to start game');
    setGameId(data.gameId);
    await fetchTrainName(data.gameId);
    await fetchGuessedStops(data.gameId);
  };

  const fetchTrainName = async (id) => {
    const response = await fetch('/get-train-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: id })
    });
    const data = await response.json();
    setTrainName(data.result || '');
  };

  const fetchGuessedStops = async (id) => {
    const response = await fetch('/get-guessed-stops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: id })
    });
    const data = await response.json();
    setGuessedStops(data.result || []);
  };

  const submit = async (value) => {
    if (!gameId) return;
    const checkResponse = await fetch('/check-station', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, station: value })
    });
    const checkData = await checkResponse.json();
    setResultText(checkData.result ? t('game.resultCorrect') : t('game.resultWrong'));

    await fetchGuessedStops(gameId);

    const winResponse = await fetch('/check-win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    const winData = await winResponse.json();
    if (winData.result) {
      await updateScore();
      setResultText(t('game.resultWon'));
      afterGame();
      await updateTime();
    }
  };

  const updateScore = async () => {
    const response = await fetch('/get-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    const data = await response.json();
    const score = data.result?.score ?? 0;
    const undeduced = data.result?.unDeducedScore ?? 0;
    setScoreText(t('game.scoreDetail', { score, undeduced }));
  };

  const updateTime = async () => {
    const response = await fetch('/get-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    const data = await response.json();
    if (!data.result) return;
    const totalSeconds = Math.floor(data.result / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    setTimeText(t('game.timeLabel', { time: timeStr }));
  };

  const afterGame = () => {
    stopTimer();
    setShowSave(true);
    fetch('/archive-train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
  };

  const handleHint = async () => {
    const response = await fetch('/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, hintAmount })
    });
    const data = await response.json();
    setGuessedStops(data.result || []);
    setHintAmount((prev) => prev + 1);
  };

  const handleCancel = async () => {
    const response = await fetch('/cancel-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    const data = await response.json();
    if (data.result) {
      await updateScore();
      setResultText(t('game.resultCancelled'));
      setGuessedStops(data.result);
      await updateTime();
      afterGame();
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) {
      alert(t('game.alertNameRequired'));
      return;
    }
    await fetch('/save-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, name: saveName })
    });
    setShowSave(false);
  };

  const startClassicGame = async () => {
    setStep('playing');
    setShowSave(false);
    setResultText(t('game.waiting'));
    await startGame({
      country,
      difficulty,
      sessionId: getCurrentSessionId()
    });
  };

  const startTrainingGame = async () => {
    if (!trainingCountry || !trainingRegion || !trainingMode) return;
    const regionPath = `${trainingCountry}_${trainingRegion}_${trainingMode}`;
    setStep('playing');
    setShowSave(false);
    setResultText(t('game.waiting'));
    try {
      await startGame({
        country: regionPath,
        difficulty: 'training',
        sessionId: getCurrentSessionId()
      });
    } catch (error) {
      alert(t('game.alertTrainingStartFailed'));
      setStep('training-mode');
    }
  };

  const share = () => {
    if (!gameId) return;
    const url = `${window.location.origin}/#/shared?id=${gameId}`;
    navigator.clipboard.writeText(url);
    alert(t('game.linkCopied'));
  };

  return (
    <>
      <div className="content-wrapper">
        <div className="game-container">
          <div className="page-header">
            <h1>{t('game.title')}</h1>
          </div>

          <div className="game-stack">
            <SessionWidget t={t} onOpen={() => setSessionModalOpen(true)} />

            {step === 'setup1' && (
              <div id="game-setup-1">
                <label htmlFor="country-select">{t('game.selectCountry')}</label>
                <select
                  id="country-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="ch">{t('country.ch')}</option>
                  <option value="de">{t('country.de')}</option>
                  <option value="nsw">{t('country.nsw')}</option>
                  <option value="at">{t('country.at')}</option>
                </select>
                <button id="country-button" type="button" onClick={() => setStep('setup2')}>
                  {t('game.continue')}
                </button>
                <button id="training-button" type="button" onClick={() => setStep('training-setup')}>
                  {t('game.training')}
                </button>
              </div>
            )}

            {step === 'setup2' && (
              <div id="game-setup-2">
                <label htmlFor="difficulty-select">{t('game.selectDifficulty')}</label>
                <select
                  id="difficulty-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">{t('difficulty.easy')}</option>
                  <option value="medium">{t('difficulty.medium')}</option>
                  <option value="hard">{t('difficulty.hard')}</option>
                </select>
                <button id="difficulty-button" type="button" onClick={startClassicGame}>
                  {t('game.startGame')}
                </button>
              </div>
            )}

            {step === 'training-setup' && (
              <div id="training-setup">
                <label htmlFor="training-country-select">{t('game.selectTrainingCountry')}</label>
                <select
                  id="training-country-select"
                  value={trainingCountry}
                  onChange={(e) => {
                    setTrainingCountry(e.target.value);
                    loadTrainingRegions(e.target.value);
                    setStep('training-region');
                  }}
                >
                  <option value="">{t('game.loading')}</option>
                  {trainingCountries.map((code) => (
                    <option key={code} value={code}>
                      {t(`country.${code}`)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step === 'training-region' && (
              <div id="training-region-setup">
                <label htmlFor="training-region-select">{t('game.selectTrainingRegion')}</label>
                <select
                  id="training-region-select"
                  value={trainingRegion}
                  onChange={(e) => {
                    setTrainingRegion(e.target.value);
                    loadTrainingModes(trainingCountry, e.target.value);
                    setStep('training-mode');
                  }}
                >
                  <option value="">{t('game.loading')}</option>
                  {trainingRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step === 'training-mode' && (
              <div id="training-mode-setup">
                <label htmlFor="training-mode-select">{t('game.selectTrainingMode')}</label>
                <select
                  id="training-mode-select"
                  value={trainingMode}
                  onChange={(e) => setTrainingMode(e.target.value)}
                >
                  <option value="">{t('game.loading')}</option>
                  {trainingModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                <button id="training-mode-button" type="button" onClick={startTrainingGame}>
                  {t('game.startTraining')}
                </button>
              </div>
            )}

            {step === 'playing' && (
              <>
                <div id="game-input">
                  <label htmlFor="user-input">{t('game.enterStation')}</label>
                  <input
                    id="user-input"
                    type="text"
                    placeholder={t('game.stationPlaceholder')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        submit(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="button-grid">
                    <button id="submit-button" type="button" onClick={() => {
                      const input = document.getElementById('user-input');
                      if (!input) return;
                      submit(input.value);
                      input.value = '';
                    }}>{t('game.submit')}</button>
                    <button id="hint" type="button" onClick={handleHint}>{t('game.hint')}</button>
                    <button id="cancel-button" type="button" onClick={handleCancel}>{t('game.cancel')}</button>
                    <button id="restart-button" type="button" onClick={() => window.location.reload()}>{t('game.restart')}</button>
                    <button id="share" type="button" onClick={share}>{t('game.share')}</button>
                    <button id="save" type="button" onClick={() => setShowSave(true)}>{t('game.saveResult')}</button>
                  </div>
                </div>

                {showSave && (
                  <div id="save-input">
                    <h2>{t('game.saveTitle')}</h2>
                    <label htmlFor="save-name">{t('game.saveName')}</label>
                    <input
                      id="save-name"
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder={t('game.savePlaceholder')}
                    />
                    <button id="save-button" type="button" onClick={handleSave}>{t('game.saveScore')}</button>
                  </div>
                )}

                <div id="game-output">
                  <h2 id="train-name">{trainName || t('game.waiting')}</h2>
                  <div className="stats-grid">
                    <p id="score">{scoreText}</p>
                    <p id="time">{timeText}</p>
                  </div>
                  <p id="result">{resultText}</p>
                  <ul id="stop-list" className="stop-list">
                    {guessedStops.map((stop, index) => (
                      <li key={`${stop}-${index}`}>{stop}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
        <Leaderboard t={t} />
      </div>
      <Feedback t={t} />
      <UpdateModal t={t} />
      <SessionModal
        t={t}
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSessionCreated={(name) => {
          alert(t('session.created', { name }));
          setSessionModalOpen(false);
        }}
      />
    </>
  );
}

function SessionHistoryPage({ t }) {
  const [sessions, setSessions] = useState(getSessions());
  const [selected, setSelected] = useState(getCurrentSessionId() || '');
  const [games, setGames] = useState([]);
  const [info, setInfo] = useState(t('history.pick'));

  useEffect(() => {
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
  }, [selected, t]);

  return (
    <div className="content-wrapper">
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
            <p className="session-info">{info}</p>
          </div>
        </div>
      </div>

      <div className="game-container">
        <h2>{t('history.pastGames')}</h2>
        {games.length === 0 ? (
          <p className="empty-state">{t('history.noneForSession')}</p>
        ) : (
          <ul className="session-games-list">
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
      <div className="game-container shared-result">
        <div className="shared-header">
          <div>
            <h1>{t('game.title')}</h1>
            <h2>{t('shared.subtitle')}</h2>
          </div>
        </div>
        <div className="shared-metrics">
          <div className="metric-card">
            <span>{t('shared.train')}</span>
            <strong>{game?.train?.trainName || t('shared.unknownTrain')}</strong>
          </div>
          <div className="metric-card">
            <span>{t('shared.country')}</span>
            <strong>{country}</strong>
          </div>
          <div className="metric-card">
            <span>{t('shared.difficulty')}</span>
            <strong>{difficulty}</strong>
          </div>
          <div className="metric-card">
            <span>{t('shared.score')}</span>
            <strong>{t('shared.scoreDetail', { score, undeduced })}</strong>
          </div>
          <div className="metric-card">
            <span>{t('shared.time')}</span>
            <strong>{formatDuration(game?.time)}</strong>
          </div>
          <div className="metric-card">
            <span>{t('shared.accuracy')}</span>
            <strong>{`${correctGuesses}/${totalGuesses}`}</strong>
          </div>
        </div>
        <div className="shared-lists">
          <div>
            <h3>{t('shared.guesses')}</h3>
            <ul className="stop-list">
              {data.guesses?.filter(Boolean).map((guess, index) => (
                <li key={`${guess}-${index}`} className={game?.train?.stops?.includes(guess) ? 'correct' : ''}>
                  {guess}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t('shared.correct')}</h3>
            <ul className="stop-list">
              {data.correctGuesses?.map((guess, index) => (
                <li key={`${guess}-${index}`} className="correct">{guess}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t('shared.stops')}</h3>
            <ul className="stop-list">
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

export default function App() {
  const [locale, setLocaleState] = useState(getLocale());
  const t = useMemo(() => {
    return (key, params) => translate(locale, key, params);
  }, [locale]);
  const updateLocale = (next) => {
    const normalized = setLocale(next);
    setLocaleState(normalized);
  };

  return (
    <HashRouter>
      <Header locale={locale} onLocaleChange={updateLocale} t={t} />
      <Routes>
        <Route path="/" element={<GamePage t={t} />} />
        <Route path="/sessions" element={<SessionHistoryPage t={t} />} />
        <Route path="/shared" element={<SharedResultPage t={t} />} />
      </Routes>
      <Feedback t={t} />
      <UpdateModal t={t} />
    </HashRouter>
  );
}
