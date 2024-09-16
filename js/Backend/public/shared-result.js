window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
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
            data = data.result;
            console.log(data);
            updateStationList(data.guesses, data.game.train.stops);
            updateScore(data.game.score);
            updateName(data.game.train.trainName);
        });
};
function updateScore(score){
    document.getElementById('score').innerText = score + ' Punkte';
}
function updateName(trainName){
    document.getElementById('name').innerText = trainName;
}
function updateStationList(guesses, stops){
    let stopList = document.getElementById('stop-list');
    let correctList = document.getElementById('correct-list');
    stopList.innerHTML = '';
    correctList.innerHTML = '';
    for(let i = 0; i < guesses.length; i++){
       if(stops.includes(guesses[i])){
           stopList.innerHTML += '<li class="correct">' + guesses[i] + '</li>';
       }
       else{
           stopList.innerHTML += '<li>' + guesses[i] + '</li>';
       }
    }
    stops.forEach(stop => {
        correctList.innerHTML += '<li>' + stop + '</li>';
    });
}

