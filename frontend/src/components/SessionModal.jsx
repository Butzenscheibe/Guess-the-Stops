import React, { useEffect, useState } from 'react';
import { getCurrentSessionId, getSessions, sessionNameExists, createSession, setCurrentSessionId } from '../sessionManager';
import { initCustomSelects, updateCustomSelect } from '../helpers/customSelect';

const SESSION_WORDS = [
  'ash', 'oak', 'elm', 'ivy', 'reed', 'fern', 'moss', 'pine',
  'sun', 'sky', 'fog', 'rain', 'snow', 'wind', 'hail', 'ice',
  'red', 'blue', 'grey', 'gold', 'cyan', 'teal', 'lime', 'amber',
  'rock', 'sand', 'soil', 'clay', 'dust', 'salt', 'iron', 'coal',
  'wolf', 'bear', 'fox', 'hawk', 'owl', 'crow', 'ant', 'bee',
  'bit', 'byte', 'node', 'loop', 'link', 'path', 'flow', 'sync',
  'echo', 'ping', 'wave', 'tone', 'beat', 'hum', 'buzz', 'snap',
  'edge', 'core', 'root', 'leaf', 'seed', 'bud', 'stem', 'bark',
  'mark', 'flag', 'sign', 'tag', 'key', 'lock', 'code', 'hash',
  'run', 'step', 'jump', 'turn', 'roll', 'drift', 'slide', 'hold',
  'calm', 'bold', 'soft', 'sharp', 'fast', 'slow', 'light', 'dark'
];

function SessionModal({ t, open, onClose, onSessionCreated }) {
  const [nameInput, setNameInput] = useState('');
  const [sessionId, setSessionId] = useState(getCurrentSessionId() || '');
  const sessions = getSessions();

  useEffect(() => {
    const current = getCurrentSessionId() || '';
    if (!current && sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      setCurrentSessionId(lastSession.id);
      setSessionId(lastSession.id);
    } else {
      setSessionId(current);
    }
    if (open) {
      initCustomSelects();
      updateCustomSelect(document.getElementById('session-select'));
    }
  }, [open, sessions.length]);

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
    <div
      className="modal show"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
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

export default SessionModal;
