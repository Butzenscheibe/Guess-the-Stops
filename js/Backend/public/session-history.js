import { sessionManager } from './session-manager.js';
import { t, applyI18n, getLocale, setLocale } from './i18n.js';

function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

function initCustomSelects() {
    const selects = document.querySelectorAll('select');

    selects.forEach(select => {
        if (select.parentElement.classList.contains('custom-select')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        const styled = document.createElement('div');
        styled.className = 'select-styled';
        styled.textContent = select.options[select.selectedIndex]?.text || '';
        wrapper.appendChild(styled);

        const optionsList = document.createElement('ul');
        optionsList.className = 'select-options';

        Array.from(select.options).forEach((option, index) => {
            const li = document.createElement('li');
            li.textContent = option.text;
            li.setAttribute('data-value', option.value);
            if (index === select.selectedIndex) {
                li.classList.add('selected');
            }
            optionsList.appendChild(li);
        });

        wrapper.appendChild(optionsList);

        styled.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.select-styled.active').forEach(other => {
                if (other !== styled) {
                    other.classList.remove('active');
                    other.nextElementSibling.classList.remove('active');
                }
            });
            styled.classList.toggle('active');
            optionsList.classList.toggle('active');
        });

        optionsList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = this.getAttribute('data-value');
                const text = this.textContent;

                select.value = value;
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);

                styled.textContent = text;
                optionsList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
                this.classList.add('selected');

                styled.classList.remove('active');
                optionsList.classList.remove('active');
            });
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.select-styled.active').forEach(styled => {
            styled.classList.remove('active');
            styled.nextElementSibling.classList.remove('active');
        });
    });
}

function updateCustomSelect(selectElement) {
    const wrapper = selectElement.parentElement;
    if (!wrapper || !wrapper.classList.contains('custom-select')) {
        initCustomSelects();
        return;
    }

    const styled = wrapper.querySelector('.select-styled');
    const optionsList = wrapper.querySelector('.select-options');

    if (!styled || !optionsList) return;

    styled.textContent = selectElement.options[selectElement.selectedIndex]?.text || '';
    optionsList.innerHTML = '';

    Array.from(selectElement.options).forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option.text;
        li.setAttribute('data-value', option.value);
        if (index === selectElement.selectedIndex) {
            li.classList.add('selected');
        }
        li.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.getAttribute('data-value');
            const text = this.textContent;

            selectElement.value = value;
            const event = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(event);

            styled.textContent = text;
            optionsList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
            this.classList.add('selected');

            styled.classList.remove('active');
            optionsList.classList.remove('active');
        });
        optionsList.appendChild(li);
    });

    styled.classList.remove('active');
    optionsList.classList.remove('active');
}

function initLanguageSelector() {
    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) return;

    languageSelect.value = getLocale();

    languageSelect.addEventListener('change', (event) => {
        setLocale(event.target.value);
        applyI18n();
        populateSessionSelect();
        renderGames(lastGames);
        updateCustomSelect(languageSelect);
        updateCustomSelect(document.getElementById('session-history-select'));
        updateSessionInfo(currentSessionId);
    });

    updateCustomSelect(languageSelect);
}

function formatDuration(ms) {
    if (typeof ms !== 'number' || Number.isNaN(ms) || ms <= 0) {
        return '—';
    }
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

let lastGames = [];
let currentSessionId = '';

function renderGames(games) {
    const list = document.getElementById('session-games-list');
    const emptyState = document.getElementById('session-empty-state');
    list.innerHTML = '';
    lastGames = games || [];

    if (!games || games.length === 0) {
        emptyState.textContent = t('history.noneForSession');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    games.forEach(game => {
        const gameId = game.gameId || game.game?.gameId;
        const trainName = game.game?.train?.trainName || t('history.unknownTrain');
        const score = game.game?.score ?? 0;
        const difficultyKey = `difficulty.${game.game?.difficulty || 'unknown'}`;
        const difficulty = t(difficultyKey);
        const countryKey = `country.${game.game?.country || 'unknown'}`;
        const country = t(countryKey);
        const duration = formatDuration(game.game?.time);
        const guesses = game.guesses?.length ?? 0;
        const correctGuesses = game.correctGuesses?.length ?? 0;

        const li = document.createElement('li');
        li.className = 'game-card';

        const title = document.createElement('h3');
        title.textContent = trainName;

        const meta = document.createElement('div');
        meta.className = 'game-meta';
        meta.innerHTML = `
            <div><strong>${t('history.meta.score')}:</strong> ${score}</div>
            <div><strong>${t('history.meta.difficulty')}:</strong> ${difficulty}</div>
            <div><strong>${t('history.meta.country')}:</strong> ${country}</div>
            <div><strong>${t('history.meta.duration')}:</strong> ${duration}</div>
            <div><strong>${t('history.meta.guesses')}:</strong> ${guesses}</div>
            <div><strong>${t('history.meta.correct')}:</strong> ${correctGuesses}</div>
        `;

        const link = document.createElement('button');
        link.className = 'nav-button nav-button--list';
        link.type = 'button';
        link.setAttribute('data-href', gameId ? `/shared-result.html?id=${encodeURIComponent(gameId)}` : '');
        link.textContent = t('history.viewResult');

        li.appendChild(title);
        li.appendChild(meta);
        li.appendChild(link);
        list.appendChild(li);
    });
}

async function loadGamesForSession(sessionId) {
    const info = document.getElementById('session-history-info');
    currentSessionId = sessionId || '';

    if (!sessionId) {
        info.textContent = t('history.pick');
        renderGames([]);
        return;
    }

    info.textContent = `${sessionManager.getSessionDisplayNameById(sessionId)} (${sessionManager.formatSessionIdShort(sessionId)})`;

    try {
        const response = await fetch(`/sessions/games?sessionId=${encodeURIComponent(sessionId)}`);
        if (!response.ok) {
            throw new Error('Failed to load session games');
        }
        const data = await response.json();
        renderGames(data.games || []);
    } catch (error) {
        console.error('Failed to load session games:', error);
        renderGames([]);
    }
}

function populateSessionSelect() {
    const select = document.getElementById('session-history-select');
    const sessions = sessionManager.getSessions();
    const activeSessionId = sessionManager.getCurrentSessionId();

    select.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = sessions.length ? t('history.selectPlaceholder') : t('history.none');
    select.appendChild(emptyOption);

    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = sessionManager.getSessionDisplayName(session);
        select.appendChild(option);
    });

    if (activeSessionId && sessions.some(s => s.id === activeSessionId)) {
        select.value = activeSessionId;
    } else if (!activeSessionId && sessions.length > 0) {
        select.value = sessions[sessions.length - 1].id;
        sessionManager.setCurrentSessionId(select.value);
    } else {
        select.value = '';
    }

    updateCustomSelect(select);
    loadGamesForSession(select.value);
}

function updateSessionInfo(sessionId) {
    const info = document.getElementById('session-history-info');
    if (!sessionId) {
        info.textContent = t('history.pick');
        return;
    }
    info.textContent = `${sessionManager.getSessionDisplayNameById(sessionId)} (${sessionManager.formatSessionIdShort(sessionId)})`;
}

function initSessionHistory() {
    const select = document.getElementById('session-history-select');
    populateSessionSelect();

    select.addEventListener('change', (event) => {
        const sessionId = event.target.value;
        sessionManager.setCurrentSessionId(sessionId);
        loadGamesForSession(sessionId);
    });
}

function initPage() {
    applyI18n();
    initDarkMode();
    initCustomSelects();
    initLanguageSelector();
    initSessionHistory();
    updateSessionInfo(sessionManager.getCurrentSessionId());
    initNavButtons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPage();
    });
} else {
    initPage();
}

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
