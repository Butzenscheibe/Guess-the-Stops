let gameId;
let country;
let hintAmount = 0;
let frontendTimer = null;
let gameStartTime = null;

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

// Initialize dark mode on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
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
        document.getElementById('time').innerText = `Time: ${timeStr}`;
    }, 1000);
}

function stopFrontendTimer() {
    if (frontendTimer) {
        clearInterval(frontendTimer);
        frontendTimer = null;
    }
}

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

    let difficulty = document.getElementById('difficulty-select').value;
    fetch('/start-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            country: country,
            difficulty: difficulty
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
    let url = window.location.href + 'shared-result.html?id=' + gameId;
    navigator.clipboard.writeText(url);
    alert('Link kopiert!');
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
            document.getElementById('result').innerText = 'Spiel abgebrochen';
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
                document.getElementById('time').innerText = hours + ':' + minutes + ':' + seconds;
            }
        });
}

function submit() {
    var userInput = document.getElementById('user-input').value;
    document.getElementById('user-input').value = '';
        fetch('/check-station', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId: gameId,
            station: userInput
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.result) {
                document.getElementById('result').innerText = 'Richtig!';
            } else {
                document.getElementById('result').innerText = 'Falsch!';
            }
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
    fetch('/check-win', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId: gameId
        })
    }).then(response => response.json())
        .then(data => {
            if (data.result) {
                updateScore();
                document.getElementById('result').innerText = 'Gewonnen!';
                afterGame();
                updateTime();
            }
        });
}
document.getElementById('restart-button').addEventListener('click', function() {
    location.reload();
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
                document.getElementById('result').innerText = 'Spiel abgebrochen';
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
        alert('Bitte geben Sie einen Namen ein!');
        return;
    }
    document.getElementById('save-button').classList.add('hidden');
    document.getElementById('save-input').classList.add('hidden');
    document.getElementById('game-input').classList.remove('hidden');
    document.getElementById('game-output').classList.remove('hidden');
    document.getElementById('restart-button').classList.remove('hidden');
    document.getElementById('share').classList.remove('hidden');
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
            document.getElementById('score').innerText = score + ' Punkte (' + unDeducedScore + ' Punkte ohne Abzüge)';
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
                let url = window.location.href + 'shared-result.html?id=' + entry.id;
                li.innerHTML = '<a href="' + url + '">' + entry.name + ' - ' + entry.score + ' Punkte</a>';
                leaderboard.appendChild(li);
            });
        });
}
document.getElementById('sts-btn').addEventListener('click', function() {
    window.location.href = 'sort-the-stations.html';
});
