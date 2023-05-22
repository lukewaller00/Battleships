const gameBoardContainer = document.querySelector(".gameBoard-container")
const puzzleNameContainer = document.querySelector(".puzzleName-container")
const startGameButton = document.querySelector("#startGame")
const shotsTakenContainer = document.querySelector("#shotsTaken")
const shotsHitContainer = document.querySelector("#shotsHit")

let boardWidth = 10


function createBoard(boardWidth){

    //create and style gameBoard <div>
    const gameBoard = document.createElement('div')
    gameBoard.classList.add("gameBoard")
    gameBoard.style.backgroundColor = 'grey'
    

    //create each sqaure of the gameBoard
    for(let i = 0; i <= boardWidth*boardWidth -1; i++){
        const square = document.createElement('div')
        square.classList.add("square")
        square.id = i
        gameBoard.append(square)
    }

    gameBoardContainer.append(gameBoard)
    document.querySelector('.gameBoard').style.width = (boardWidth * 30)+ "px"
    document.querySelector('.gameBoard').style.height = (boardWidth * 30) + "px"
    console.log("board created")
}

function addIndividualShip(ship, rotation, startSquare, shipName){
    //get all <div> inside gameboard
    const allSquares = document.querySelectorAll(".gameBoard div")

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
    for (let i =0; i < shipLength; i++){
        if (isVertical === false){
            shipSquares.push(allSquares[Number(startSquare) + i])

        }
        else{
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
//count amount of ships added to the board
let amountOfShips = {
    destroyer : 0,
    submarine : 0,
    crusier : 0,
    battleship : 0,
    carier : 0
}

async function loadShips(){
    await fetch("http://localhost:3000/getPuzzle/", {
        method: 'GET'
    })
    .then(response => {
       return response.json()
    }
    ).then(responseData => {
        console.log(responseData.ships) 
        boardWidth = responseData.size
        console.log(boardWidth)
        createBoard(boardWidth)
        Array.from(responseData.ships).forEach(ship =>{
           
            amountOfShips[ship.shipName] += 1 
            let shipName = ship.shipName + "-" + amountOfShips[ship.shipName]
            addIndividualShip(ship, ship.rotation, ship.startSquare, shipName)
            
        })
        const puzzleName = document.createElement('h4')
        puzzleName.textContent = responseData.puzzleName
        puzzleNameContainer.append(puzzleName)
         
    })
}
loadShips()
/**
const shipList = loadShips()


function loadBoard(shipList){
    console.log(typeof Array.from(shipList))
    console.log(Array.from(shipList))
    Array.from(shipList).forEach(ship =>{
        console.log(ship)
        amountOfShips[ship.shipName] += 1 
        let shipName = ship.shipName + "-" + amountOfShips[ship.shipName]
        addIndividualShip(ship, ship.rotation, ship.startSquare, shipName)
    })
}   
loadBoard(shipList)
 */
//GAME LOGIC 

let gameOver = true

function startGame(){
    const allSquares = document.querySelectorAll(".gameBoard div")
    allSquares.forEach(square => square.addEventListener('click', handleClick))
}

let timer = 0 
let intervalId;
const timerElement = document.getElementById("timer") 

startGameButton.addEventListener('click', ()=>{
    gameOver = false
    startGame()
    intervalId = setInterval(() => {
            timer++
            timerElement.innerText = timer
        },1000)
    })

//keep track of shots recieved for each ship type
let hitShips = {
    carier: 0,
    battleship: 0,
    crusier: 0,
    submarine: 0,
    destroyer: 0
}
let sunkenShips = []

let shotsTaken = 0 
let shotsHit = 0 
let playerTurns = 1


function checkForSunkenShip(hitShips){
    let sunkShips = []
    sunkShips = sunkShips.concat(Array(Math.floor(hitShips.carier/5)).fill("carier"))
    sunkShips = sunkShips.concat(Array(Math.floor(hitShips.battleship/4)).fill("battleship"))
    sunkShips = sunkShips.concat(Array(Math.floor(hitShips.crusier/3)).fill("crusier"))
    sunkShips = sunkShips.concat(Array(Math.floor(hitShips.submarine/2)).fill("submarine"))
    sunkShips = sunkShips.concat(Array(Math.floor(hitShips.destroyer/1)).fill("destroyer"))
    console.log(sunkShips)
    return sunkShips
}



//sends POST request to server to add final score of puzzle to user statistics
//POST Request will redirect application to an end game screen with confirmation of this addition
async function submitPuzzleScores(puzzleScores){
    const id =  window.location.href.split('/').pop();
    puzzleScores.puzzleId = id;
    let JsonScores = JSON.stringify(puzzleScores)
    await fetch("http://localhost:3000/puzzleSubmit",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:JsonScores
    })
    .then(res => {
            console.log("redirect the browser to complete puzzle page")
            window.location.href = "/PuzzleComplete"
}).catch(e => {
  // handle error
});
}

function handleClick(e){
    if(!gameOver){
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