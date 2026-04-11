import React, { useEffect, useMemo, useRef, useState } from 'react';
import SessionWidget from './SessionWidget';
import Leaderboard from './Leaderboard';
import SessionModal from './SessionModal';
import { getCurrentSessionId } from '../sessionManager';
import { initCustomSelects, updateCustomSelect } from '../helpers/customSelect';

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
  const [trainingCountriesState, setTrainingCountriesState] = useState('loading');
  const [trainingRegionsState, setTrainingRegionsState] = useState('loading');
  const [trainingModesState, setTrainingModesState] = useState('loading');
  const [step, setStep] = useState('setup1');
  const [resultKey, setResultKey] = useState('game.waiting');
  const [scoreData, setScoreData] = useState({ mode: 'label', score: '--', undeduced: '--' });
  const [timeValue, setTimeValue] = useState('--:--:--');
  const [trainName, setTrainName] = useState(t('game.loading'));
  const [guessedStops, setGuessedStops] = useState([]);
  const [hintAmount, setHintAmount] = useState(0);
  const [saveName, setSaveName] = useState('');
  const [hasSaved, setHasSaved] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const scoreText = useMemo(() => {
    if (scoreData.mode === 'detail') {
      return t('game.scoreDetail', { score: scoreData.score, undeduced: scoreData.undeduced });
    }
    return t('game.scoreLabel', { score: scoreData.score });
  }, [scoreData, t]);

  const timeText = useMemo(() => t('game.timeLabel', { time: timeValue }), [t, timeValue]);
  const resultText = useMemo(() => t(resultKey), [t, resultKey]);

  const isPlaying = step === 'playing';
  const isEnded = step === 'ended';
  const isSaving = step === 'saving';

  useEffect(() => {
    initCustomSelects();
    updateCustomSelect(document.getElementById('country-select'));
    updateCustomSelect(document.getElementById('difficulty-select'));
    updateCustomSelect(document.getElementById('training-country-select'));
    updateCustomSelect(document.getElementById('training-region-select'));
    updateCustomSelect(document.getElementById('training-mode-select'));
  }, [step, country, difficulty, trainingCountry, trainingRegion, trainingMode, trainingCountries, trainingRegions, trainingModes, t]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

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
      if (!gameId) return;
      fetch('/cancel-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result) {
            updateScore();
            setResultKey('game.resultCancelled');
            setGuessedStops(data.result);
            afterGame();
          }
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameId]);

  const startFrontendTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const totalSeconds = Math.floor(elapsed / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
      setTimeValue(timeStr);
    }, 1000);
  };

  const stopFrontendTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const loadTrainingCountries = async () => {
    try {
      const response = await fetch('/training/countries');
      const data = await response.json();
      const countries = data.countries || [];
      setTrainingCountries(countries);
      setTrainingCountriesState(countries.length > 0 ? 'ready' : 'empty');
      if (countries.length === 0) {
        alert(t('game.noCountries'));
      }
    } catch (error) {
      console.error('Error loading training countries:', error);
      setTrainingCountries([]);
      setTrainingCountriesState('error');
    }
  };

  const loadTrainingRegions = async (code) => {
    try {
      const response = await fetch(`/training/${encodeURIComponent(code)}/regions`);
      const data = await response.json();
      const regions = data.regions || [];
      setTrainingRegions(regions);
      setTrainingRegionsState(regions.length > 0 ? 'ready' : 'empty');
      if (regions.length === 0) {
        alert(t('game.alertNoTrainingRegions'));
      }
    } catch (error) {
      console.error('Error loading training regions:', error);
      setTrainingRegions([]);
      setTrainingRegionsState('error');
    }
  };

  const loadTrainingModes = async (code, region) => {
    try {
      const response = await fetch(`/training/${encodeURIComponent(code)}/${encodeURIComponent(region)}/modes`);
      const data = await response.json();
      const modes = data.modes || [];
      setTrainingModes(modes);
      setTrainingModesState(modes.length > 0 ? 'ready' : 'empty');
      if (modes.length === 0) {
        alert(t('game.alertNoTrainingModes'));
      }
    } catch (error) {
      console.error('Error loading training modes:', error);
      setTrainingModes([]);
      setTrainingModesState('error');
    }
  };

  const startGame = async (payload) => {
    startFrontendTimer();
    const response = await fetch('/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!data.gameId) throw new Error('Failed to start game');
    setGameId(data.gameId);

    const trainResponse = await fetch('/get-train-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: data.gameId })
    });
    const trainData = await trainResponse.json();
    setTrainName(trainData.result || t('game.loading'));

    const guessedResponse = await fetch('/get-guessed-stops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: data.gameId })
    });
    const guessedData = await guessedResponse.json();
    setGuessedStops(guessedData.result || []);
  };

  const submit = async () => {
    const input = document.getElementById('user-input');
    const value = input ? input.value : '';
    if (input) input.value = '';

    try {
      const checkResponse = await fetch('/check-station', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, station: value })
      });
      const checkData = await checkResponse.json();
      setResultKey(checkData.result ? 'game.resultCorrect' : 'game.resultWrong');

      const guessedResponse = await fetch('/get-guessed-stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });
      const guessedData = await guessedResponse.json();
      setGuessedStops(guessedData.result || []);

      const winResponse = await fetch('/check-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });
      const winData = await winResponse.json();
      if (winData.result) {
        updateScore();
        setResultKey('game.resultWon');
        afterGame();
        updateTime();
      }
    } catch (error) {
      console.error('Error submitting station:', error);
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
    const undeduced = data.result?.unDeducedScore ?? score;
    setScoreData({ mode: 'detail', score, undeduced });
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
    let hours = Math.floor(totalSeconds / 3600);
    let remaining = totalSeconds % 3600;
    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
    setTimeValue(timeStr);
  };

  const afterGame = () => {
    stopFrontendTimer();
    setStep('ended');
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
      updateScore();
      setResultKey('game.resultCancelled');
      setGuessedStops(data.result);
      updateTime();
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
    setHasSaved(true);
    setStep('ended');
  };

  const startClassicGame = async () => {
    setHintAmount(0);
    setHasSaved(false);
    setResultKey('game.waiting');
    setScoreData({ mode: 'label', score: '--', undeduced: '--' });
    setTimeValue('--:--:--');
    setGuessedStops([]);
    setTrainName(t('game.loading'));
    setStep('playing');
    await startGame({
      country,
      difficulty,
      sessionId: getCurrentSessionId()
    });
  };

  const startTrainingGame = async () => {
    if (!trainingCountry) {
      alert(t('game.alertSelectCountry'));
      return;
    }
    if (!trainingRegion) {
      alert(t('game.alertSelectRegion'));
      return;
    }
    if (!trainingMode) {
      alert(t('game.alertSelectMode'));
      return;
    }

    setHintAmount(0);
    setHasSaved(false);
    setResultKey('game.waiting');
    setScoreData({ mode: 'label', score: '--', undeduced: '--' });
    setTimeValue('--:--:--');
    setGuessedStops([]);
    setTrainName(t('game.loading'));
    setStep('playing');
    const regionPath = `${trainingCountry}_${trainingRegion}_${trainingMode}`;
    try {
      await startGame({
        country: regionPath,
        difficulty: 'training',
        sessionId: getCurrentSessionId()
      });
    } catch (error) {
      alert(t('game.alertTrainingStartFailed'));
      setStep('training-mode');
      stopFrontendTimer();
    }
  };

  const share = () => {
    if (!gameId) return;
    const url = `${window.location.origin}/#/shared?id=${gameId}`;
    navigator.clipboard.writeText(url);
    alert(t('game.linkCopied'));
  };

  useEffect(() => {
    if (step === 'training-setup') {
      setTrainingCountry('');
      setTrainingRegion('');
      setTrainingMode('');
      setTrainingRegions([]);
      setTrainingModes([]);
      setTrainingCountriesState('loading');
      setTrainingRegionsState('loading');
      setTrainingModesState('loading');
      loadTrainingCountries();
    }
  }, [step]);

  return (
    <>
      <div className="content-wrapper">
        <div className="game-container">
          <div className="page-header">
            <h1>{t('game.title')}</h1>
          </div>

          <div className="game-stack">
            <SessionWidget t={t} onOpen={() => setSessionModalOpen(true)} />

            <div className="main-game" id="main-game">
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
                    onChange={(e) => setTrainingCountry(e.target.value)}
                  >
                    {trainingCountriesState === 'loading' && (
                      <option value="">{t('game.loading')}</option>
                    )}
                    {trainingCountriesState === 'empty' && (
                      <option value="">{t('game.noCountries')}</option>
                    )}
                    {trainingCountriesState === 'error' && (
                      <option value="">{t('game.errorCountries')}</option>
                    )}
                    {trainingCountriesState === 'ready' && trainingCountries.map((code) => (
                      <option key={code} value={code}>
                        {t(`country.${code}`)}
                      </option>
                    ))}
                  </select>
                  <button
                    id="training-country-button"
                    type="button"
                    onClick={() => {
                      if (!trainingCountry) {
                        alert(t('game.alertSelectCountry'));
                        return;
                      }
                      setStep('training-region');
                      loadTrainingRegions(trainingCountry);
                    }}
                  >
                    {t('game.continue')}
                  </button>
                </div>
              )}

              {step === 'training-region' && (
                <div id="training-region-setup">
                  <label htmlFor="training-region-select">{t('game.selectTrainingRegion')}</label>
                  <select
                    id="training-region-select"
                    value={trainingRegion}
                    onChange={(e) => setTrainingRegion(e.target.value)}
                  >
                    {trainingRegionsState === 'loading' && (
                      <option value="">{t('game.loading')}</option>
                    )}
                    {trainingRegionsState === 'empty' && (
                      <option value="">{t('game.noRegions')}</option>
                    )}
                    {trainingRegionsState === 'error' && (
                      <option value="">{t('game.errorRegions')}</option>
                    )}
                    {trainingRegionsState === 'ready' && trainingRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <button
                    id="training-region-button"
                    type="button"
                    onClick={() => {
                      if (!trainingRegion) {
                        alert(t('game.alertSelectRegion'));
                        return;
                      }
                      setStep('training-mode');
                      loadTrainingModes(trainingCountry, trainingRegion);
                    }}
                  >
                    {t('game.continue')}
                  </button>
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
                    {trainingModesState === 'loading' && (
                      <option value="">{t('game.loading')}</option>
                    )}
                    {trainingModesState === 'empty' && (
                      <option value="">{t('game.noModes')}</option>
                    )}
                    {trainingModesState === 'error' && (
                      <option value="">{t('game.errorModes')}</option>
                    )}
                    {trainingModesState === 'ready' && trainingModes.map((mode) => (
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

              {(isPlaying || isEnded) && (
                <div id="game-input">
                  <label htmlFor="user-input" id="user-input-label" className={!isPlaying ? 'hidden' : ''}>
                    {t('game.enterStation')}
                  </label>
                  <input
                    id="user-input"
                    type="text"
                    placeholder={t('game.stationPlaceholder')}
                    className={!isPlaying ? 'hidden' : ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        submit();
                      }
                    }}
                  />
                  <div className="button-grid">
                    {isPlaying && (
                      <button id="submit-button" type="button" onClick={submit}>
                        {t('game.submit')}
                      </button>
                    )}
                    {isPlaying && (
                      <button id="hint" type="button" onClick={handleHint}>
                        {t('game.hint')}
                      </button>
                    )}
                    {isPlaying && (
                      <button id="cancel-button" type="button" onClick={handleCancel}>
                        {t('game.cancel')}
                      </button>
                    )}
                    <button id="restart-button" type="button" onClick={() => window.location.reload()}>
                      {t('game.restart')}
                    </button>
                    {isEnded && (
                      <button id="share" type="button" onClick={share}>
                        {t('game.share')}
                      </button>
                    )}
                    {isEnded && !hasSaved && (
                      <button id="save" type="button" onClick={() => setStep('saving')}>
                        {t('game.saveResult')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isSaving && (
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
                  <button id="save-button" type="button" onClick={handleSave}>
                    {t('game.saveScore')}
                  </button>
                </div>
              )}

              {(isPlaying || isEnded) && (
                <div id="game-output">
                  <h2 id="train-name">{trainName || t('game.loading')}</h2>
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
              )}
            </div>
          </div>
        </div>
        <Leaderboard t={t} />
      </div>
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

export default GamePage;
