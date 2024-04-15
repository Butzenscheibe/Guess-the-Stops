let gameId;
let country;

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

    let difficulty = document.getElementById('difficulty-select').value;
    fetch('http://localhost:3000/start-game', {
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

        fetch('http://localhost:3000/get-train-name', {
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
        fetch('http://localhost:3000/get-guessed-stops', {
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
    fetch('http://localhost:3000/cancel-game', {
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
});

function submit() {
    var userInput = document.getElementById('user-input').value;
    fetch('http://localhost:3000/check-station', {
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
    fetch('http://localhost:3000/get-guessed-stops', {
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
    fetch('http://localhost:3000/check-win', {
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
            }
        });
}
document.getElementById('restart-button').addEventListener('click', function() {
    location.reload();
});
window.addEventListener('beforeunload', function (event) {
    if(gameId) {
        fetch('http://localhost:3000/delete-game', {
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
function afterGame() {
    document.getElementById('user-input').classList.add('hidden');
    document.getElementById('submit-button').classList.add('hidden');
    document.getElementById('cancel-button').classList.add('hidden');
    document.getElementById('restart-button').classList.remove('hidden');
    document.getElementById('share').classList.remove('hidden');
    fetch('http://localhost:3000/archive-train', {
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
function updateScore(score) {
    fetch('http://localhost:3000/get-score', {
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
            document.getElementById('score').innerText = "Score: " + data.result;
        });
}
