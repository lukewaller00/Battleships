const rotateButton = document.querySelector('#rotate')
const randomizeButton = document.querySelector('#randomize')
const shipContainer = document.querySelector('.shipArray-container')
const gameBoardContainer = document.querySelector('#gameBoard-container')
const clearPuzzleButton = document.querySelector('#clearPuzzle')
const searchGameButton = document.querySelector('#searchButton')



let rotation = 0
function rotateShips() {
    //vertical rotation = 1
    if (rotation === 0 ){
        
        shipContainer.style.height = '180px'
        Array.from(shipContainer.children).forEach(ship =>{
            ship.style.transform = 'rotate(90deg)'
        })
        rotation = 1
        console.log(rotation)
    }
    //horizontal rotation = 0 
    else{
        shipContainer.style.height = '70px'
        Array.from(shipContainer.children).forEach(ship =>{
            ship.style.transform = 'rotate(0deg)'
        })
        rotation = 0
        console.log(rotation)
    }
}

//if rotateButton is clicked then call rotateShips() 
rotateButton.addEventListener('click', rotateShips)

let boardWidth = 10

//create div of .square
function createBoard(boardWidth){

    //create and style gameBoard <div>
    const gameBoard = document.createElement('div')
    gameBoard.classList.add("gameBoard")
    gameBoard.style.backgroundColor = 'aqua'
    

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

    const allSquares = document.querySelectorAll(".gameBoard div")
    allSquares.forEach(square=> {
        square.addEventListener('dragover', dragOver)
        square.addEventListener('drop', dropShip)
    })
}

createBoard(boardWidth)

//Represent each ship as a class
class Ship {
    constructor(name, length){
        this.name = name
        this.length = length
    }

}

const destroyer = new Ship("destroyer", 1)
const submarine = new Ship("submarine", 2)
const crusier = new Ship("crusier", 3)
const battleship = new Ship("battleship", 4)
const carier = new Ship("carier", 5)

const ships = [destroyer, submarine, crusier, battleship, carier]

//lets system know if the ship has been dropped correctly
let notDropped

// Ship information {shipName, rotation, startingSquare} to be saved 
let saveShipArray = []

//saves a ship to the saveShip Array, priming it to be saved to the DB
function saveShip(shipName, rotation, startingSquare){
    const ship = {
        shipName : shipName,
        rotation : rotation, 
        startingSquare : startingSquare
    }
    console.log("The current ship is")
    saveShipArray.push(ship)
    console.log("The saveShip is ")
    console.log(saveShipArray)
}

//handle validation of piece placement
function shipPlacementValidation(allSquares, isVertical, startSquare, ship){
    let validStart = !isVertical ? startSquare <= boardWidth * boardWidth - ship.length ? startSquare :
            boardWidth * boardWidth - ship.length :
        //vertical
        startSquare <= boardWidth * boardWidth - boardWidth * ship.length ? startSquare :
            startSquare - ship.length * boardWidth + boardWidth

    let shipSquares = []
    for (let i =0; i < ship.length; i++){
        if (isVertical === false){

            shipSquares.push(allSquares[Number(validStart) + i])

        }
        else{
            shipSquares.push(allSquares[Number(validStart) + i* boardWidth])
        }
    }
    //prevent ships overlapping rows returns valid as true
    let validPosition 
    //horizontal
    if (!isVertical){
        shipSquares.every((_shipSquare, index) => {
            //get coordinate of each square through id
            validPosition = shipSquares[0].id % boardWidth <= boardWidth - shipSquares.length + index
        })
    }
    //vertical
    else{
        shipSquares.every((_shipSquare, index) =>{
            validPosition = shipSquares[0].id < (boardWidth*boardWidth-boardWidth) +(boardWidth * index + 1)
            console.log(ship.name + " " + shipSquares[0].id + " vertical " + validPosition + " " + index)
        })
    }
    //returns true if all ship squares are not taken by any other ships
    const sqauresNotTaken = shipSquares.every(shipSquare => !shipSquare.classList.contains('taken'))
    return {shipSquares, validPosition, sqauresNotTaken }
}

//add ships to board
function addIndividualShip(ship, rotation, startSquare, dragged){
    //get all <div> inside gameboard
    const allSquares = document.querySelectorAll(".gameBoard div")
    
    //set rotation of ship piece
    let isVertical = true
    if (rotation<0.5){
        console.log("change to horizontal")
        isVertical = false
    }
    const  {shipSquares, validPosition, sqauresNotTaken } = shipPlacementValidation(allSquares, isVertical, startSquare, ship)

    //keep track of each square position in the ship
    let squarePos = 0
    if (validPosition && sqauresNotTaken){
        //change attributes of squares containing a ship
        shipSquares.forEach(square =>{
        square.classList.add(ship.name)
        square.classList.add('taken')
        square.classList.add(squarePos)
        squarePos = squarePos + 1   
    })
        if(dragged===false){saveShip(ship.name, rotation, Number(shipSquares[0].id))}
        //add each addition to the request body for a randomise
    }else{
        if(dragged === false){
            addIndividualShip(ship, Math.random(), Math.floor(Math.random()*boardWidth*boardWidth), false) 
        }
        else{
            console.log("move not valid")
            notDropped = true
        }
        }
}
    
//randomize ship event listener
randomizeButton.addEventListener('click', ()=>{
    ships.forEach((ship, index) => {
        //remove currnet ship from 
        ships.splice(index, 0)
        addIndividualShip(ship, Math.random(), Math.floor(Math.random()*boardWidth*boardWidth), false)
        
    });
    

  
})

//drag 
Array.from(shipContainer.children).forEach(ship => ship.addEventListener('dragstart', dragStart))
let draggedShip


function dragStart(e){
    notDropped = false
    draggedShip = e.target
}

function dragOver(e) {
    e.preventDefault()
    hightlightSquares(e.target.id, ships[draggedShip.id])
}

function  dropShip(e) {
    const startSquare = Number(e.target.id)
    console.log(draggedShip)
    const ship = ships[draggedShip.id]
    console.log(ship)
    addIndividualShip(ship, rotation, startSquare, true)
    if (!notDropped){
        draggedShip.remove()
        saveShip(ship.name, rotation, startSquare)
    }
}

//highlight hovered area
function hightlightSquares(startSquare, ship){
    const allSquares = document.querySelectorAll(".gameBoard div")
    let isVertical = rotation === 1
    const {shipSquares, validPosition, sqauresNotTaken }  = shipPlacementValidation(allSquares, isVertical, startSquare, ship)

    //only shpw hover on valid locations
    if(validPosition && sqauresNotTaken){
        shipSquares.forEach(square =>{
            square.classList.add('hover')
            setTimeout(()=> square.classList.remove('hover'), 400)
        })
    }
}

//add ships to container after clearing puzzle
function addShipToContainer(shipType){
    const IndividualshipContainer = document.createElement('div');
    IndividualshipContainer.classList.add('col');
    IndividualshipContainer.classList.add(shipType+'-container');
    const ship = document.createElement('div');
    ship.classList.add(shipType);
    switch (shipType) {
        case "destroyer":
            ship.setAttribute('id', '0')
            break;

        case "submarine":
            ship.setAttribute('id', '1')
            break;
        case "crusier":
            ship.setAttribute('id', '2')
            break;
        case "battleship":
            ship.setAttribute('id', '3')
            break;
        case "carier":
            ship.setAttribute('id', '4')
            break;
    }
    ship.setAttribute('draggable', 'true')
    ship.addEventListener('dragstart', dragStart)
    IndividualshipContainer.appendChild(ship);
    shipContainer.appendChild(IndividualshipContainer);
}


//clear unwanted puzzle 
clearPuzzleButton.addEventListener('click', ()=>{
    const allSquares = document.querySelectorAll(".gameBoard div")
    allSquares.forEach(square => {
        square.classList.remove("submarine", "destroyer", "crusier", "battleship", "carier")
        saveShipArray = []
    })
    //also reset the ships in the ship container
    shipContainer.innerHTML =''
    addShipToContainer("destroyer")
    addShipToContainer("submarine")
    addShipToContainer("crusier")
    addShipToContainer("battleship")
    addShipToContainer("carier")
    if (rotation === 1){
        rotateShips()
    }
})

searchGameButton.addEventListener("click", async () => {
    const response = await fetch("http://localhost:3000/multiplayerLobby", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });
    //if a correct gameID is returned send puzzle to be saved and redirect to game lobby
    if (response.ok) {
        //get gameID and increment to create a new game with +1 gameID
        const gameID = await response.text();
        console.log("Latest game ID:", gameID);
        console.log(saveShipArray)
        console.log("http://localhost:3000//multiplayerGame/"+ gameID)
        //POST request to send ship positions to server and create game lobby
        const submitPuzzleToLobby = await fetch("http://localhost:3000/multiplayerGame/"+ gameID, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(saveShipArray),
        })
        //redirects user to game lobby
        window.location.href = "http://localhost:3000/multiplayerGame/" + gameID;
        
    } else {
        console.error("Failed to get latest game ID:", response.status);
        // TODO: handle error
    }
  });
