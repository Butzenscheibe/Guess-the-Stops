import { sessionManager } from './session-manager.js';
import { t, applyI18n, getLocale, setLocale } from './i18n.js';

let gameId;
let country;
let hintAmount = 0;
let frontendTimer = null;
let gameStartTime = null;

const SESSION_WORDS = [
  "ash", "oak", "elm", "ivy", "reed", "fern", "moss", "pine",
  "sun", "sky", "fog", "rain", "snow", "wind", "hail", "ice",
  "red", "blue", "grey", "gold", "cyan", "teal", "lime", "amber",
  "rock", "sand", "soil", "clay", "dust", "salt", "iron", "coal",
  "wolf", "bear", "fox", "hawk", "owl", "crow", "ant", "bee",
  "bit", "byte", "node", "loop", "link", "path", "flow", "sync",
  "echo", "ping", "wave", "tone", "beat", "hum", "buzz", "snap",
  "edge", "core", "root", "leaf", "seed", "bud", "stem", "bark",
  "mark", "flag", "sign", "tag", "key", "lock", "code", "hash",
  "run", "step", "jump", "turn", "roll", "drift", "slide", "hold",
  "calm", "bold", "soft", "sharp", "fast", "slow", "light", "dark"
];


// Custom Dropdown Component
function initCustomSelects() {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        // Skip if already converted
        if (select.parentElement.classList.contains('custom-select')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        
        const styled = document.createElement('div');
        styled.className = 'select-styled';
        styled.textContent = select.options[select.selectedIndex].text;
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
        
        // Toggle dropdown
        styled.addEventListener('click', function(e) {
            e.stopPropagation();
            // Close all other dropdowns
            document.querySelectorAll('.select-styled.active').forEach(other => {
                if (other !== styled) {
                    other.classList.remove('active');
                    other.nextElementSibling.classList.remove('active');
                }
            });
            styled.classList.toggle('active');
            optionsList.classList.toggle('active');
        });
        
        // Select option
        optionsList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = this.getAttribute('data-value');
                const text = this.textContent;
                
                // Update native select
                select.value = value;
                
                // Trigger change event on native select
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
                
                // Update styled select
                styled.textContent = text;
                
                // Update selected class
                optionsList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
                this.classList.add('selected');
                
                // Close dropdown
                styled.classList.remove('active');
                optionsList.classList.remove('active');
            });
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.select-styled.active').forEach(styled => {
            styled.classList.remove('active');
            styled.nextElementSibling.classList.remove('active');
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
        relocalizeSelectOptions();
        applyDynamicDefaults();
        refreshCurrentSessionInfo();
        document.querySelectorAll('select').forEach(select => {
            updateCustomSelect(select);
        });
    });

    updateCustomSelect(languageSelect);
}

function relocalizeSelectOptions() {
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        Array.from(countrySelect.options).forEach(option => {
            if (option.value) {
                const translated = t(`country.${option.value}`);
                option.textContent = translated.startsWith('country.') ? option.value : translated;
            }
        });
    }

    const difficultySelect = document.getElementById('difficulty-select');
    if (difficultySelect) {
        Array.from(difficultySelect.options).forEach(option => {
            if (option.value) {
                const translated = t(`difficulty.${option.value}`);
                option.textContent = translated.startsWith('difficulty.') ? option.value : translated;
            }
        });
    }

    const trainingCountrySelect = document.getElementById('training-country-select');
    if (trainingCountrySelect) {
        Array.from(trainingCountrySelect.options).forEach(option => {
            if (option.value) {
                const translated = t(`country.${option.value}`);
                option.textContent = translated.startsWith('country.') ? option.value : translated;
            }
        });
    }
}

function applyDynamicDefaults() {
    if (!gameId) {
        const scoreEl = document.getElementById('score');
        const timeEl = document.getElementById('time');
        const resultEl = document.getElementById('result');
        if (scoreEl) {
            scoreEl.innerText = t('game.scoreLabel', { score: '--' });
        }
        if (timeEl) {
            timeEl.innerText = t('game.timeLabel', { time: '--:--:--' });
        }
        if (resultEl) {
            resultEl.innerText = t('game.waiting');
        }
    }
}

// Update an existing custom select after its options have been changed
function updateCustomSelect(selectElement) {
    const wrapper = selectElement.parentElement;
    
    // If not wrapped yet, initialize it
    if (!wrapper || !wrapper.classList.contains('custom-select')) {
        initCustomSelects();
        return;
    }
    
    // Find the styled div and options list
    const styled = wrapper.querySelector('.select-styled');
    const optionsList = wrapper.querySelector('.select-options');
    
    if (!styled || !optionsList) return;
    
    // Update styled text to show current selection
    styled.textContent = selectElement.options[selectElement.selectedIndex]
        ? selectElement.options[selectElement.selectedIndex].text
        : '';
    
    // Clear and rebuild the options list
    optionsList.innerHTML = '';
    
    Array.from(selectElement.options).forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option.text;
        li.setAttribute('data-value', option.value);
        if (index === selectElement.selectedIndex) {
            li.classList.add('selected');
        }
        
        // Add click event to the new li
        li.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.getAttribute('data-value');
            const text = this.textContent;
            
            // Update native select
            selectElement.value = value;
            
            // Trigger change event on native select
            const event = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(event);
            
            // Update styled select
            styled.textContent = text;
            
            // Update selected class
            optionsList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
            this.classList.add('selected');
            
            // Close dropdown
            styled.classList.remove('active');
            optionsList.classList.remove('active');
        });
        
        optionsList.appendChild(li);
    });
    
    // Close dropdown if it was open
    styled.classList.remove('active');
    optionsList.classList.remove('active');
}

// Dark mode functionality
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

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applyI18n();
        initDarkMode();
        initCustomSelects();
        relocalizeSelectOptions();
        initLanguageSelector();
        initSessionUI();
        initSessionModal();
        initNavButtons();
        applyDynamicDefaults();
    });
} else {
    applyI18n();
    initDarkMode();
    initCustomSelects();
    relocalizeSelectOptions();
    initLanguageSelector();
    initSessionUI();
    initSessionModal();
    initNavButtons();
    applyDynamicDefaults();
}

function startFrontendTimer() {
    gameStartTime = Date.now();
    frontendTimer = setInterval(() => {
        const elapsed = Date.now() - gameStartTime;
        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('time').innerText = t('game.timeLabel', { time: timeStr });
    }, 1000);
}

function stopFrontendTimer() {
    if (frontendTimer) {
        clearInterval(frontendTimer);
        frontendTimer = null;
    }
}

// Training mode variables
let trainingCountry = null;
let trainingRegion = null;
let trainingMode = null;

// Training mode: Load available countries
async function loadTrainingCountries() {
    try {
        const response = await fetch('/training/countries');
        const data = await response.json();
        const select = document.getElementById('training-country-select');
        select.innerHTML = '';
        
        if (data.countries && data.countries.length > 0) {
            data.countries.forEach(countryCode => {
                const option = document.createElement('option');
                option.value = countryCode;
                // Map country codes to full names
                const countryNames = {
                    'ch': t('country.ch'),
                    'de': t('country.de'),
                    'at': t('country.at'),
                    'nsw': t('country.nsw')
                };
                option.textContent = countryNames[countryCode] || countryCode;
                select.appendChild(option);
            });
            // Update the custom select wrapper with new options
            updateCustomSelect(select);
        } else {
            select.innerHTML = `<option value="">${t('game.noCountries')}</option>`;
            updateCustomSelect(select);
        }
    } catch (error) {
        console.error('Error loading training countries:', error);
        const select = document.getElementById('training-country-select');
        select.innerHTML = `<option value="">${t('game.errorCountries')}</option>`;
        updateCustomSelect(select);
    }
}

// Training mode: Load available regions for a country
async function loadTrainingRegions(countryCode) {
    try {
        const response = await fetch(`/training/${encodeURIComponent(countryCode)}/regions`);
        const data = await response.json();
        const select = document.getElementById('training-region-select');
        select.innerHTML = '';
        
        if (data.regions && data.regions.length > 0) {
            data.regions.forEach(regionName => {
                const option = document.createElement('option');
                option.value = regionName;
                option.textContent = regionName;
                select.appendChild(option);
            });
            // Update the custom select wrapper with new options
            updateCustomSelect(select);
        } else {
            select.innerHTML = `<option value="">${t('game.noRegions')}</option>`;
            updateCustomSelect(select);
            alert(t('game.alertNoTrainingRegions'));
        }
    } catch (error) {
        console.error('Error loading training regions:', error);
        const select = document.getElementById('training-region-select');
        select.innerHTML = `<option value="">${t('game.errorRegions')}</option>`;
        updateCustomSelect(select);
    }
}

// Training mode: Load available modes for a region
async function loadTrainingModes(countryCode, regionName) {
    try {
        const response = await fetch(`/training/${encodeURIComponent(countryCode)}/${encodeURIComponent(regionName)}/modes`);
        const data = await response.json();
        const select = document.getElementById('training-mode-select');
        select.innerHTML = '';
        
        if (data.modes && data.modes.length > 0) {
            data.modes.forEach(modeName => {
                const option = document.createElement('option');
                option.value = modeName;
                option.textContent = modeName;
                select.appendChild(option);
            });
            // Update the custom select wrapper with new options
            updateCustomSelect(select);
        } else {
            select.innerHTML = `<option value="">${t('game.noModes')}</option>`;
            updateCustomSelect(select);
            alert(t('game.alertNoTrainingModes'));
        }
    } catch (error) {
        console.error('Error loading training modes:', error);
        const select = document.getElementById('training-mode-select');
        select.innerHTML = `<option value="">${t('game.errorModes')}</option>`;
        updateCustomSelect(select);
    }
}

// Training button: Show training setup
document.getElementById('training-button').addEventListener('click', function() {
    document.getElementById('game-setup-1').classList.add('hidden');
    document.getElementById('training-setup').classList.remove('hidden');
    loadTrainingCountries();
});

// Training country button: Show region selection
document.getElementById('training-country-button').addEventListener('click', function() {
    trainingCountry = document.getElementById('training-country-select').value;
    if (!trainingCountry || trainingCountry === '') {
        alert(t('game.alertSelectCountry'));
        return;
    }
    document.getElementById('training-setup').classList.add('hidden');
    document.getElementById('training-region-setup').classList.remove('hidden');
    loadTrainingRegions(trainingCountry);
});

// Training region button: Show mode selection
document.getElementById('training-region-button').addEventListener('click', function() {
    trainingRegion = document.getElementById('training-region-select').value;
    if (!trainingRegion || trainingRegion === '') {
        alert(t('game.alertSelectRegion'));
        return;
    }
    document.getElementById('training-region-setup').classList.add('hidden');
    document.getElementById('training-mode-setup').classList.remove('hidden');
    loadTrainingModes(trainingCountry, trainingRegion);
});

// Training mode button: Start the training game
document.getElementById('training-mode-button').addEventListener('click', function() {
    trainingMode = document.getElementById('training-mode-select').value;
    if (!trainingMode || trainingMode === '') {
        alert(t('game.alertSelectMode'));
        return;
    }
    
    document.getElementById('training-mode-setup').classList.add('hidden');
    document.getElementById('game-input').classList.remove('hidden');
    document.getElementById('game-output').classList.remove('hidden');
    document.getElementById('share').classList.add('hidden');
    document.getElementById('save').classList.add('hidden');

    // Start the frontend timer
    startFrontendTimer();
    const sessionID = sessionManager.getCurrentSessionId();
    // Start training game with region path format: country_region_mode
    const regionPath = `${trainingCountry}_${trainingRegion}_${trainingMode}`;
    fetch('/start-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            country: regionPath,
            difficulty: 'training',
            sessionId: sessionID
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.gameId) {
            throw new Error('Failed to start game');
        }
        gameId = data.gameId;
        document.getElementById('game-input').classList.remove('hidden');
        document.getElementById('game-output').classList.remove('hidden');
        document.getElementById('share').classList.add('hidden');
        document.getElementById('save').classList.add('hidden');
        fetch('/get-train-name', {
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
            document.getElementById('train-name').innerText = data.result;
        });
        fetch('/get-guessed-stops', {
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
            let guessedStops = data.result;
            updateStationList(guessedStops);
        });
    })
    .catch(error => {
        console.error('Error starting training game:', error);
        alert(t('game.alertTrainingStartFailed'));
        // Reset to initial state
        document.getElementById('training-mode-setup').classList.remove('hidden');
        document.getElementById('game-input').classList.add('hidden');
        document.getElementById('game-output').classList.add('hidden');
        stopFrontendTimer();
    });
});

document.getElementById('country-button').addEventListener('click', function() {
    document.getElementById('game-setup-1').classList.add('hidden');
    document.getElementById('game-setup-2').classList.remove('hidden');
    country = document.getElementById('country-select').value;
});

document.getElementById('difficulty-button').addEventListener('click', function() {
    document.getElementById('game-setup-2').classList.add('hidden');
    document.getElementById('game-input').classList.remove('hidden');
    document.getElementById('game-output').classList.remove('hidden');
    document.getElementById('share').classList.add('hidden');
    document.getElementById('save').classList.add('hidden');

    // Start the frontend timer
    startFrontendTimer();
    const sessionID = sessionManager.getCurrentSessionId();
    let difficulty = document.getElementById('difficulty-select').value;
    fetch('/start-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            country: country,
            difficulty: difficulty,
            sessionId: sessionID
        })
    })
    .then(response => response.json())
    .then(data => {
        gameId = data.gameId;
        document.getElementById('game-setup-2').classList.add('hidden');
        document.getElementById('game-input').classList.remove('hidden');
        document.getElementById('game-output').classList.remove('hidden');
        document.getElementById('share').classList.add('hidden');
        document.getElementById('save').classList.add('hidden');
        fetch('/get-train-name', {
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
            document.getElementById('train-name').innerText = data.result;
        });
        fetch('/get-guessed-stops', {
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
            let guessedStops = data.result;
            updateStationList(guessedStops);
        });
    });
});

document.getElementById('submit-button').addEventListener('click', function() {
    submit();
});
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submit();
    }
});
document.getElementById('share').addEventListener('click', function() {
    const url = new URL('/shared-result.html', window.location.origin);
    url.searchParams.set('id', gameId);
    navigator.clipboard.writeText(url.toString());
    alert(t('game.linkCopied'));
});
document.getElementById('cancel-button').addEventListener('click', function() {
    fetch('/cancel-game', {
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
        if (data.result) {
            updateScore();
            document.getElementById('result').innerText = t('game.resultCancelled');
            updateStationList(data.result);
            updateTime();
            afterGame();
        }
    });
});
function updateTime(){
    fetch('/get-time', {
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
            if (data.result) {
                let time = data.result;
                let totalSeconds = Math.floor(time / 1000)
                let hours = Math.floor(totalSeconds / 3600)
                totalSeconds %= 3600;
                let minutes = Math.floor(totalSeconds / 60)
                let seconds = totalSeconds % 60;
                if(hours < 10){
                    hours = "0" + hours;
                }
                if(minutes < 10){
                    minutes = "0" + minutes;
                }
                if(seconds < 10){
                    seconds = "0" + seconds;
                }
                const timeStr = hours + ':' + minutes + ':' + seconds;
                document.getElementById('time').innerText = t('game.timeLabel', { time: timeStr });
            }
        });
}

async function submit() {
    const userInput = document.getElementById('user-input').value;
    document.getElementById('user-input').value = '';

    try {
        const checkResponse = await fetch('/check-station', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameId,
                station: userInput
            })
        });
        const checkData = await checkResponse.json();
        if (checkData.result) {
            document.getElementById('result').innerText = t('game.resultCorrect');
        } else {
            document.getElementById('result').innerText = t('game.resultWrong');
        }

        const guessedResponse = await fetch('/get-guessed-stops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameId
            })
        });
        const guessedData = await guessedResponse.json();
        updateStationList(guessedData.result || []);

        const winResponse = await fetch('/check-win', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameId
            })
        });
        const winData = await winResponse.json();
        if (winData.result) {
            updateScore();
            document.getElementById('result').innerText = t('game.resultWon');
            afterGame();
            updateTime();
        }
    } catch (error) {
        console.error('Error submitting station:', error);
    }
}
function generateRandomName(length = 2) {
    let name = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * SESSION_WORDS.length);
        name += SESSION_WORDS[randomIndex];
        if (i < length - 1) {
            name += '-';
        }
    }
    return name;
}
function getUniqueSessionName(preferredName) {
    let sessionName = (preferredName || '').trim();
    if (!sessionName) {
        sessionName = generateRandomName(2);
    }
    while (sessionManager.sessionNameExists(sessionName)) {
        sessionName = generateRandomName(2);
    }
    return sessionName;
}

function populateSessionSelect() {
    const select = document.getElementById('session-select');
    if (!select) return;

    const sessions = sessionManager.getSessions();
    const currentSessionId = sessionManager.getCurrentSessionId();

    select.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = t('session.none');
    select.appendChild(emptyOption);

    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = sessionManager.getSessionDisplayName(session);
        select.appendChild(option);
    });

    if (currentSessionId && sessions.some(s => s.id === currentSessionId)) {
        select.value = currentSessionId;
    } else if (!currentSessionId && sessions.length > 0) {
        const lastSession = sessions[sessions.length - 1];
        select.value = lastSession.id;
        sessionManager.setCurrentSessionId(lastSession.id);
    } else {
        select.value = '';
    }

    updateCustomSelect(select);
    refreshCurrentSessionInfo();
}

function refreshCurrentSessionInfo() {
    const info = document.getElementById('current-session-info');
    if (!info) return;
    const currentSessionId = sessionManager.getCurrentSessionId();
    if (!currentSessionId) {
        info.textContent = t('session.none');
        return;
    }
    const name = sessionManager.getSessionDisplayNameById(currentSessionId);
    info.textContent = name;
}

function setActiveSession(sessionId) {
    if (!sessionId) {
        sessionManager.setCurrentSessionId('');
        refreshCurrentSessionInfo();
        return;
    }
    sessionManager.setCurrentSessionId(sessionId);
    refreshCurrentSessionInfo();
}

async function createSession() {
    const input = document.getElementById('session-name-input');
    const preferredName = input ? input.value : '';
    const sessionName = getUniqueSessionName(preferredName);

    try {
        await sessionManager.createSession(sessionName);
        if (input) {
            input.value = '';
        }
        populateSessionSelect();
        alert(t('session.created', { name: sessionName }));
    } catch (error) {
        console.error('Failed to create session:', error);
        alert(t('session.createFailed'));
    }
}

function initSessionUI() {
    const select = document.getElementById('session-select');
    if (!select) return;

    populateSessionSelect();

    select.addEventListener('change', (event) => {
        setActiveSession(event.target.value);
    });
}

function initSessionModal() {
    const modal = document.getElementById('session-modal');
    const openBtn = document.getElementById('open-session-modal');
    const closeBtn = document.getElementById('session-modal-close');

    if (!modal || !openBtn || !closeBtn) return;

    openBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
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
document.getElementById('restart-button').addEventListener('click', function() {
    location.reload();
});
document.getElementById('create-session-button').addEventListener('click', function() {
    createSession();
});
document.getElementById('hint').addEventListener('click', function() {
    fetch('/hint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId: gameId,
            hintAmount: hintAmount
        })
    })
        .then(response => response.json())
        .then(data => {
            updateStationList(data.result);
            hintAmount++;
        });
});

window.addEventListener('beforeunload', function (event) {
    if(gameId) {
        fetch('/delete-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameId
            })
        });
    }
});
window.onblur = function() {
    if(gameId){
        fetch('/cancel-game', {
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
            if (data.result) {
                updateScore();
                document.getElementById('result').innerText = t('game.resultCancelled');
                updateStationList(data.result);
                afterGame();
            }
        });
    } 
}
document.getElementById('save').addEventListener('click', function() {
    document.getElementById('save').classList.add('hidden');
    document.getElementById('game-input').classList.add('hidden');
    document.getElementById('game-output').classList.add('hidden');
    document.getElementById('share').classList.add('hidden');
    document.getElementById('save-input').classList.remove('hidden');
});
document.getElementById('save-button').addEventListener('click', function() {

    let name = document.getElementById('save-name').value;
    if (name === '') {
        alert(t('game.alertNameRequired'));
        return;
    }
    document.getElementById('save-button').classList.add('hidden');
    document.getElementById('save-input').classList.add('hidden');
    document.getElementById('game-input').classList.remove('hidden');
    document.getElementById('game-output').classList.remove('hidden');
    document.getElementById('restart-button').classList.remove('hidden');
    document.getElementById('share').classList.remove('hidden');
    document.getElementById('user-input-label').classList.add('hidden');
    document.getElementById('user-input').classList.add('hidden');
    fetch('/save-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId: gameId,
            name: name
        })
    });

});
function afterGame() {
    stopFrontendTimer();
    document.getElementById('user-input-label').classList.add('hidden');
    document.getElementById('user-input').classList.add('hidden');
    document.getElementById('submit-button').classList.add('hidden');
    document.getElementById('cancel-button').classList.add('hidden');
    document.getElementById('hint').classList.add('hidden');
    document.getElementById('restart-button').classList.remove('hidden');
    document.getElementById('share').classList.remove('hidden');
    document.getElementById('save').classList.remove('hidden');
    fetch('/archive-train', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId: gameId
        })
    });
}
function updateStationList(stations) {
    let guessedStopsList = document.getElementById('stop-list');
    guessedStopsList.innerHTML = '';
    stations.forEach(stop => {
        let li = document.createElement('li');
        li.innerText = stop;
        guessedStopsList.appendChild(li);
    });
}
function updateScore() {
    fetch('/get-score', {
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
            let score = data.result.score;
            let unDeducedScore = data.result.unDeducedScore;
            document.getElementById('score').innerText = t('game.scoreDetail', {
                score: score,
                undeduced: unDeducedScore
            });
        });
}
window.onload = function() {
    updateLeaderboard();
    setInterval(async () => {
        updateLeaderboard();
    }, 10000);
};

function updateLeaderboard(){
    fetch('/get-top?amount=10')
        .then(response => response.json())
        .then(data => {
            let top = data.result;
            let leaderboard = document.getElementById('leaderboard');
            leaderboard.innerHTML = '';
            top.forEach((entry, index) => {
                let li = document.createElement('li');
                const url = new URL('/shared-result.html', window.location.origin);
                url.searchParams.set('id', entry.id);
                const pointsText = t('leaderboard.points', { score: entry.score });
                const button = document.createElement('button');
                button.className = 'nav-button nav-button--list';
                button.type = 'button';
                button.setAttribute('data-href', url.toString());
                button.textContent = `${entry.name} - ${pointsText}`;
                li.appendChild(button);
                leaderboard.appendChild(li);
            });
        });
}
// Optional STS button handler
const stsBtn = document.getElementById('sts-btn');
if (stsBtn) {
    stsBtn.addEventListener('click', function() {
        window.location.href = 'sort-the-stations.html';
    });
}

// Modal functionality
function initModal() {
    const modal = document.getElementById('update-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const dontShowCheckbox = document.getElementById('dont-show-again');
    
    // Guard: check if modal elements exist
    if (!modal || !closeBtn || !dontShowCheckbox) {
        return;
    }
    
    // Check if modal should be shown
    const modalShown = localStorage.getItem('update-modal-shown');
    
    if (!modalShown) {
        setTimeout(() => {
            modal.classList.add('show');
        }, 500); // Show modal after 500ms delay
    }
    
    // Close modal function
    const closeModal = () => {
        if (dontShowCheckbox.checked) {
            localStorage.setItem('update-modal-shown', 'true');
        }
        modal.classList.remove('show');
    };
    
    // Close modal on button click
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

// Feedback form functionality
function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    const statusDiv = document.getElementById('feedbackStatus');
    
    // Guard: check if form elements exist
    if (!form || !statusDiv) {
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const nameInput = document.getElementById('feedback-name');
        const feedbackInput = document.getElementById('feedback-text');
        
        // Validate trimmed values
        const name = nameInput.value.trim();
        const feedback = feedbackInput.value.trim();
        
        if (!name || !feedback) {
            statusDiv.className = 'feedback-status error';
            statusDiv.textContent = '✗ Please fill in all fields.';
            return;
        }
        
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        statusDiv.className = 'feedback-status';
        
        const formData = {
            name: name,
            feedback: feedback,
            subject: 'GTS'
        };
        
        try {
            const response = await fetch('https://feedback.diebutzenscheibe.dev/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                statusDiv.className = 'feedback-status success';
                statusDiv.textContent = '✓ Thank you! Your feedback has been submitted successfully.';
                form.reset();
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    statusDiv.className = 'feedback-status';
                }, 5000);
            } else {
                throw new Error('Failed to submit feedback');
            }
        } catch (error) {
            statusDiv.className = 'feedback-status error';
            statusDiv.textContent = '✗ Failed to submit feedback. Please try again later.';
            console.error('Feedback submission error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Feedback';
        }
    });
}

// Initialize modal and feedback on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initModal();
        initFeedbackForm();
    });
} else {
    initModal();
    initFeedbackForm();
}
