
const player1Gameboard = document.querySelector('.player1-gameBoard-container');
const player2Gameboard = document.querySelector('.player2-gameBoard-container');

const socket = io('http://localhost:3000');

const url = 'http://localhost:3000/multiplayerGame/1';
const parts = url.split('/');
const gameID = parts[parts.length - 1];

socket.emit('joinGameRoom', gameID)
const boardWidth = 10
let loadedBoards = false

function createBoard(boardWidth){

    if(loadedBoards ==false){
        //create and style gameBoard <div>
        const gameBoard1 = document.createElement('div')
        gameBoard1.classList.add("gameBoard")
        gameBoard1.classList.add("player1")
        gameBoard1.style.backgroundColor = 'grey'
        
        const gameBoard2 = document.createElement('div')
        gameBoard2.classList.add("gameBoard")
        gameBoard2.classList.add("player2")
        gameBoard2.style.backgroundColor = 'grey'

        //create each sqaure of the gameBoard
        for(let i = 0; i <= boardWidth*boardWidth -1; i++){
            const square1 = document.createElement('div')
            square1.classList.add("square")
            square1.id = i
            gameBoard1.append(square1)


        //create each sqaure of the gameBoard

            const square2 = document.createElement('div')
            square2.classList.add("square")
            square2.id = i
            gameBoard2.append(square2)

        }

        player1Gameboard.append(gameBoard1)
        player2Gameboard.append(gameBoard2)

        //set gameBoard size
        const gameboards = document.querySelectorAll('.gameBoard')
        gameboards.forEach(gameboard => {
            gameboard.style.width = (boardWidth * 30)+ "px"
        })
        console.log("board created")
        loadedBoards = true
    }
}
function addIndividualShip(ship, rotation, startSquare, shipName, player ){
    //get all <div> inside gameboard
    let allSquares;
    if (player ===1){
        const gameBoard = document.querySelector('.gameBoard.player1');
        allSquares = gameBoard.children
    }else{
        const gameBoard = document.querySelector('.gameBoard.player2');
        allSquares = gameBoard.children
    }
    //select correct gameboard to add ships to

    //set rotation of ship piece
    let isVertical = true
    if (rotation<0.5){
        isVertical = false
    }

    //get ship Length
    let shipLength 
    switch (shipName.split("-")[0]) {
        case "destroyer":
            shipLength = 1
            break;
        case "submarine":
            shipLength = 2
            break;
        case "crusier":
            shipLength = 3
            break;
        case "battleship":
            shipLength = 4
            break;
        case "carier":
            shipLength = 5    
            break;
    }

    let shipSquareNumnber = 0
    let shipSquares = []
    
    for (let i =0; i < parseInt(shipLength); i++){
        
        if (isVertical === false){
            shipSquares.push(allSquares[Number(startSquare) + i])

        }
        else{
            shipSquares.push(allSquares[Number(startSquare) + i* boardWidth])
        }
    }
    //incriment through the ships occupied squares and mark them as taken
    shipSquares.forEach(square =>{
        square.classList.add(shipSquareNumnber)
        square.classList.add(ship.shipName)
        square.classList.add('taken')
        shipSquareNumnber += 1 
    })

}

async function getAndLoadShipInformation(){
    await fetch('http://localhost:3000/multiplayerGamePuzzles/'+ gameID, {
        method: 'GET',
    }).then(response => response.json())
    .then(responseData => {
        responseData.currentGamePuzzles.forEach(puzzle => {
            let playerNum = 2
            if (responseData.username ===  Object.keys(puzzle)[0]){
                playerNum = 1
            }

            Object.values(puzzle).forEach(shipList => {
                shipList.forEach(ship => {
                    addIndividualShip(ship, ship.rotation, ship.startingSquare, ship.shipName, playerNum)
                })
            })
        })

    })
}
let gameOver = false

let currentPlayer = 1 //currentPlayer  is 1 or 2, will be changed by socket

function handleClick(e){
    if(!gameOver){

        if(currentPlayer === playerNumber){
            console.log("not your turn")
        }

        if(e.target.classList.contains('shipHit') || e.target.classList.contains('waterHit')){
                console.log("dont toucn score")
        }
        else{
            if (e.target.classList.contains('taken')){
                //check which square of the ship has been hit
                let shipSquareNumber = null;
                const classList = e.target.classList
                //the number of the ship will always be the second entry in the Class List
                shipSquareNumber = parseInt(classList[1])
                //check what type of ship is clicked, make visible and add to hitShips array 
                if (e.target.classList.contains('destroyer')) {
                    e.target.classList.add('shipHit')
                    hitShips.destroyer += 1
                } else if (e.target.classList.contains('submarine')) {
                    e.target.classList.add('shipHit')
                    hitShips.submarine += 1       
                } else if (e.target.classList.contains('crusier')) {
                    e.target.classList.add('shipHit')
                    hitShips.crusier += 1         
                }else if (e.target.classList.contains('battleship')) {
                    e.target.classList.add('shipHit')
                    hitShips.battleship += 1         
                }
                else{
                    e.target.classList.add('shipHit')
                    hitShips.carier += 1         
                }
                shotsHit += 1
                document.getElementById('shotsHit').innerHTML = shotsHit
                sunkenShips =  checkForSunkenShip(hitShips)
            }
            else{
                e.target.classList.add('waterHit')
                playerTurns += 1
            }
            shotsTaken += 1
            document.getElementById('shotsTaken').innerHTML = shotsTaken
            document.getElementById('shotPercentage').innerHTML = (shotsHit /shotsTaken) * 100
            document.getElementById('playerTurns').innerHTML = playerTurns
            let gamePercentage = 0

            for( ship in sunkenShips){

                //calculate the percentage added for each ship sunk
                gamePercentage += 1/Object.values(amountOfShips).reduce((acc, val) => acc + val, 0) * 100
                //creates an array of the amountOfShips, reduce is used to calculate the total amount of ships
            }
            //declare the game to be over if all ships were sunk with the click
            if (Math.ceil(gamePercentage) === 100){
                gameOver = true
                console.log(gameOver)
                clearInterval(intervalId)
                puzzleScores = {
                    shotsTaken: shotsTaken,
                    shotsHit: shotsHit,
                    time: parseInt(document.getElementById('timer').innerHTML),
                    turnsTaken: playerTurns
                }
                submitPuzzleScores(puzzleScores)
                
            }
            document.getElementsByClassName("progress-bar").item(0).setAttribute('aria-valuenow', gamePercentage)
            document.getElementsByClassName("progress-bar").item(0).setAttribute('style', "width: "+ gamePercentage+"%")
            document.getElementById("gamePercentage").innerHTML = Math.ceil(gamePercentage) + "%"
        }
    }
}

function startGame(){
    const allSquares = document.querySelectorAll("#player2 .gameBoard div")
    allSquares.forEach(square => square.addEventListener('click', handleClick))
}

let playerNumber;

socket.on('gameFull', () => {

    console.log("game is full")
    window.location.href = 'http://localhost:3000/multiplayer';
})

socket.on('bothPlayersConnected', async () => {
    createBoard(boardWidth);
    await getAndLoadShipInformation();
    startGame();

})

socket.on('playerNumber', (number) => {
    playerNumber = parseInt(number);
    console.log(playerNumber)
})

