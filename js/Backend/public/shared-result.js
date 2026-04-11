import { t, applyI18n, getLocale, setLocale } from './i18n.js';

let lastResult = null;

window.onload = function() {
    applyI18n();
    initLanguageSelector();
    initNavButtons();
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    if (!gameId) {
        renderEmptyState(t('shared.missingId'));
        return;
    }
    fetch('/game-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId: gameId
        })
    })
        .then(response => response.json())
        .then(data => {
            if (!data || !data.result) {
                renderEmptyState(t('shared.notFound'));
                return;
            }
            const result = data.result;
            const game = result.game;
            if (!game || !game.train) {
                renderEmptyState(t('shared.incomplete'));
                return;
            }

            lastResult = result;
            updateMeta(game, result);
            updateStationLists(result, game.train.stops || []);
        })
        .catch(() => {
            renderEmptyState(t('shared.loadFailed'));
        });
};

function initNavButtons() {
    document.querySelectorAll('[data-href]').forEach(button => {
        button.addEventListener('click', () => {
            const href = button.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        });
    });
}

function initLanguageSelector() {
    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) return;

    languageSelect.value = getLocale();

    languageSelect.addEventListener('change', (event) => {
        setLocale(event.target.value);
        applyI18n();
        if (lastResult && lastResult.game && lastResult.game.train) {
            updateMeta(lastResult.game, lastResult);
            updateStationLists(lastResult, lastResult.game.train.stops || []);
        }
    });
}

function renderEmptyState(message) {
    const container = document.getElementById('game-container');
    if (!container) return;
    container.innerHTML = '<h1>Guess the Stations</h1><p class="empty-state">' + message + '</p>';
}

function updateMeta(game, result) {
    const trainName = game.train.trainName || t('shared.unknownTrain');
    const countryKey = `country.${game.country || 'unknown'}`;
    const country = t(countryKey);
    const difficultyKey = `difficulty.${game.difficulty || 'unknown'}`;
    const difficulty = t(difficultyKey);
    const score = typeof game.score === 'number' ? game.score : 0;
    const undeduced = typeof game.unDeducedScore === 'number' ? game.unDeducedScore : score;
    const totalGuesses = Array.isArray(result.guesses) ? result.guesses.filter(Boolean).length : 0;
    const correctGuesses = Array.isArray(result.correctGuesses) ? result.correctGuesses.length : 0;

    document.getElementById('train-name').innerText = trainName;
    document.getElementById('country').innerText = country;
    document.getElementById('difficulty').innerText = difficulty;
    document.getElementById('score').innerText = t('shared.scoreDetail', {
        score: score,
        undeduced: undeduced
    });
    document.getElementById('time').innerText = formatDuration(game.time || 0);
    document.getElementById('accuracy').innerText = `${correctGuesses}/${totalGuesses}`;
}

function updateStationLists(result, stops) {
    const guesses = Array.isArray(result.guesses) ? result.guesses.filter(Boolean) : [];
    const correctGuesses = Array.isArray(result.correctGuesses) ? result.correctGuesses : [];

    const stopList = document.getElementById('stop-list');
    const correctList = document.getElementById('correct-list');
    const allStopsList = document.getElementById('all-stops-list');

    if (stopList) {
        stopList.innerHTML = '';
        guesses.forEach(guess => {
            const li = document.createElement('li');
            if (stops.includes(guess)) {
                li.classList.add('correct');
            }
            li.innerText = guess;
            stopList.appendChild(li);
        });
    }

    if (correctList) {
        correctList.innerHTML = '';
        correctGuesses.forEach(guess => {
            const li = document.createElement('li');
            li.classList.add('correct');
            li.innerText = guess;
            correctList.appendChild(li);
        });
    }

    if (allStopsList) {
        allStopsList.innerHTML = '';
        stops.forEach(stop => {
            const li = document.createElement('li');
            li.innerText = stop;
            allStopsList.appendChild(li);
        });
    }
}

function formatDuration(ms) {
    if (!ms || ms <= 0) {
        return '00:00:00';
    }
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

