const puzzleCardContainer = document.querySelector(".puzzleCard-container")




async function loadPuzzlesList(){
    await fetch("http://localhost:3000/puzzleList", {
        method: 'GET'
    })
    .then(response => {
       return response.json()
    }
    ).then(responseData => {
        console.log(Array.from(responseData.puzzlesList))
        Array.from(responseData.puzzlesList).forEach(puzzle => {
            //create Puzzle Card element
            const card = document.createElement('div')
            card.classList.add("card")
            card.classList.add("puzzleCard")
           
            const cardBody = document.createElement('div')
            cardBody.classList.add('card-body')
          
            const cardTitle = document.createElement('h4')
            cardTitle.classList.add('card-title')
            cardTitle.textContent = "Puzzle Name:  " + puzzle.puzzleName


            const cardDifficulty= document.createElement('p')
            cardDifficulty.classList.add('card-text')
            cardDifficulty.textContent = "Difficulty:  " + puzzle.difficulty
            
            const cardRating = document.createElement('div')
            cardRating.classList.add('card-rating')
            cardRating.textContent = "Rating:  "
            for (let i = 1; i <= Math.floor(parseInt(puzzle.rating)/parseInt(puzzle.ratingsCount)); i++) {
              const starIcon = document.createElement('span')
              starIcon.classList.add('fa', 'fa-star', 'star-icon')
              starIcon.setAttribute('data-rating', i)
              cardRating.appendChild(starIcon)
            }

            const cardUsername= document.createElement('p')
            cardUsername.classList.add('card-text')
            cardUsername.textContent = "Created By:  " + puzzle.username
            
            const cardButton = document.createElement('a')
            cardButton.classList.add('btn-primary')
            cardButton.textContent = "Play"
            cardButton.href = "/playPuzzle/"+puzzle._id

            cardBody.appendChild(cardTitle)
            cardBody.appendChild(cardUsername)
            cardBody.appendChild(cardDifficulty)
            cardBody.appendChild(cardRating)
            cardBody.appendChild(cardButton)
            card.appendChild(cardBody)

            puzzleCardContainer.appendChild(card)
        })
    })
}

const puzzlesList = loadPuzzlesList()



//console.log(typeof(Array.from(puzzleList)))