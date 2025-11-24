import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuessTheStopsPage from './pages/GuessTheStopsPage';
import SortTheStationsPage from './pages/SortTheStationsPage';
import SharedResultPage from './pages/SharedResultPage';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Router>
      <div className="App">
        <button 
          id="dark-mode-toggle" 
          className="dark-mode-toggle" 
          aria-label="Toggle dark mode"
          onClick={toggleDarkMode}
        >
          <svg className={darkMode ? 'sun-icon hidden' : 'sun-icon'} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
          </svg>
          <svg className={darkMode ? 'moon-icon' : 'moon-icon hidden'} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
        </button>
        
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<GuessTheStopsPage />} />
            <Route path="/sort-the-stations" element={<SortTheStationsPage />} />
            <Route path="/shared-result" element={<SharedResultPage />} />
          </Routes>
        </div>

        <footer className="app-footer">
          <p><a href="https://diebutzenscheibe.dev" target="_blank" rel="noopener noreferrer">© 2025 DieButzenscheibe</a></p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
