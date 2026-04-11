import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { getLocale, setLocale, t as translate } from './i18n';
import Header from './components/Header';
import GamePage from './components/GamePage';
import SessionHistoryPage from './components/SessionHistoryPage';
import SharedResultPage from './components/SharedResultPage';
import Feedback from './components/Feedback';
import UpdateModal from './components/UpdateModal';
import { initCustomSelects, updateCustomSelect } from './helpers/customSelect';

export default function AppRoot() {
  const [locale, setLocaleState] = useState(getLocale());
  const t = useMemo(() => {
    return (key, params) => translate(locale, key, params);
  }, [locale]);

  const updateLocale = (next) => {
    const normalized = setLocale(next);
    setLocaleState(normalized);
  };

  useEffect(() => {
    initCustomSelects();
    updateCustomSelect(document.getElementById('language-select'));
  }, [locale]);

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
