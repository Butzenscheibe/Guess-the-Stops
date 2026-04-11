import React from 'react';
import { getCurrentSessionId, getSessionDisplayNameById } from '../sessionManager';

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

export default SessionWidget;
