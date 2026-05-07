import React, { useEffect, useState } from 'react';

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

export default UpdateModal;
