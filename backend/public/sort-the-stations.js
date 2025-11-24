let gameId = null;
window.onload = function() {
    fetch('http://localhost:3000/sts/start-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            country: 'de'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        gameId = data.gameId;
        console.log(gameId);
        fetch('http://localhost:3000/sts/get-shuffled-stops', {
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
            console.log(data);
            let stopList = document.querySelector('.stations');
            stopList.innerHTML = '';
            let stop = data.result[0];
            let stopElement = document.createElement('div');
            stopElement.classList.add('stop');
            stopElement.innerHTML = stop;
            stopList.appendChild(stopElement);
            for(let i = 1; i < data.result.length -1; i++){
                let stop = data.result[i];
                let stopElement = document.createElement('div');
                stopElement.classList.add('stop-style');
                stopElement.classList.add('stop');
                stopElement.classList.add('stop-movable');
                stopElement.classList.add('larger');
                stopElement.draggable = true;
                stopElement.innerHTML = stop;
                stopList.appendChild(stopElement);
            }
            let stopElement2 = document.createElement('div');
            stopElement2.innerHTML = data.result[data.result.length - 1];
            stopElement2.classList.add('stop');
            stopList.appendChild(stopElement2);
            window.addEventListener('load', adjustColumnCount);
            window.addEventListener('resize', adjustColumnCount);
            function adjustColumnCount() {
                const stopLists = document.getElementById('stop-lists');
                const maxHeight = 500; // Setzen Sie dies auf den gewünschten Wert
                const itemHeight = stopLists.firstElementChild.offsetHeight; // Höhe eines einzelnen Elements
                const columnCount = Math.ceil(stopLists.childElementCount * itemHeight / maxHeight);
                stopLists.style.columnCount = columnCount;
            }
            enableDragAndDrop();
        });
        fetch('http://localhost:3000/sts/get-trainname', {
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
            console.log(data);
        });
    });
    document.getElementById('submit').addEventListener('click', function() {
        let stops = document.querySelectorAll('.stations .stop');
        let stopNames = [];
        stops.forEach(stop => {
            stopNames.push(stop.innerHTML);
        });
        fetch('http://localhost:3000/sts/check-solution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameId,
                solution: stopNames
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.result) {
                alert('Correct!');
            }
            else {
                alert('Incorrect!');
            }
        });
    });
}

function enableDragAndDrop() {
    
    var dragSrcEl = null;
    
    function handleDragStart(e) {
      this.style.opacity = '0.4';
      
      dragSrcEl = this;
  
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
    }
  
    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
  
      e.dataTransfer.dropEffect = 'move';
      
      return false;
    }
  
    function handleDragEnter(e) {
      this.classList.add('over');
    }
  
    function handleDragLeave(e) {
      this.classList.remove('over');
    }
  
    function handleDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      
      if (dragSrcEl != this) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
      }
      
      return false;
    }
  
    function handleDragEnd(e) {
      this.style.opacity = '1';
      
      items.forEach(function (item) {
        item.classList.remove('over');
      });
    }
    
    
    let items = document.querySelectorAll('.stations .stop-movable');
    items.forEach(function(item) {
        console.log(item);
      item.addEventListener('dragstart', handleDragStart, false);
      item.addEventListener('dragenter', handleDragEnter, false);
      item.addEventListener('dragover', handleDragOver, false);
      item.addEventListener('dragleave', handleDragLeave, false);
      item.addEventListener('drop', handleDrop, false);
      item.addEventListener('dragend', handleDragEnd, false);
    });
    
}