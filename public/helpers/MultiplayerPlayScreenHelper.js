
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
    console.log("all squares")
    console.log(allSquares)
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
    console.log("ship length")
    console.log(shipLength)

    console.log("ship rotation")
    console.log(rotation)
    console.log("vertical")
    console.log(isVertical)
    
    for (let i =0; i < parseInt(shipLength); i++){
        console.log("addShipSquare")
        console.log("isVertical")
        console.log(isVertical)
        if (isVertical === false){
            console.log("allSquares")
            console.log(allSquares[Number(startSquare) + i])
            shipSquares.push(allSquares[Number(startSquare) + i])

        }
        else{
            console.log("allSquares")
            console.log(allSquares[Number(startSquare) + i* boardWidth])
            shipSquares.push(allSquares[Number(startSquare) + i* boardWidth])
        }
    }
    //incriment through the ships occupied squares and mark them as taken
    console.log(shipName)
    console.log(shipSquares)
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
        console.log(responseData)
        responseData.currentGamePuzzles.forEach(puzzle => {
            let playerNum = 2
            if (responseData.username ===  Object.keys(puzzle)[0]){
                playerNum = 1
            }

            Object.values(puzzle).forEach(shipList => {
                shipList.forEach(ship => {
                    addIndividualShip(ship, ship.rotation, ship.startSquare, ship.shipName, playerNum)
                })
            })
        })

    })
}




socket.on('gameFull', () => {

    console.log("game is full")
    window.location.href = 'http://localhost:3000/multiplayer';
})

socket.on('bothPlayersConnected', async () => {
    createBoard(boardWidth);
    await getAndLoadShipInformation();
})