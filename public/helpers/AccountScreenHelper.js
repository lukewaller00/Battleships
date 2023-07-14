const accountStatisticsContainer = document.querySelector(".accountStatistics")
const accountId = window.location.pathname.split('/')[2];


const shotsTakenElement = document.getElementById("shotsTaken");
const shotsHitElement = document.getElementById("shotsHit");
const TimePlayedElement = document.getElementById("TimePlayed");
const turnsTakenElement = document.getElementById("TurnsTaken");

let puzzleList = [];
let labels = [];

async function loadAccountStatistics(accountId){
    await fetch("http://localhost:3000/getAccount/"+accountId)
    .then(response => response.json())
    .then(responseData =>{
        //get account of account id
        
        shotsTakenElement.innerHTML = responseData.currentAccount.OverallshotsTaken
        shotsHitElement.innerHTML = responseData.currentAccount.OverallshotsHit
        TimePlayedElement.innerHTML = responseData.currentAccount.OverallTimeSpentPlaying
        turnsTakenElement.innerHTML = responseData.currentAccount.OverallTurnsTaken
        Array.from(responseData.currentAccount.completedPuzzles).forEach(puzzle => {
            puzzleList.push(puzzle)
            console.log(puzzle)
            labels.push(puzzle.puzzleId)
        }); 
        defaultLineGraph(puzzleList)
        console.log(responseData)
        console.log(labels)
    })
    
}

loadAccountStatistics(accountId)
console.log(puzzleList)




puzzleList.forEach(puzzle => {

    console.log(puzzle)

})


let lineGraph;


//create list of puzzle id labels for line graph

console.log(labels)
//create a default line graph that appears on page load
function defaultLineGraph(puzzleList){
    let lineGraphConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets:[{
                label: "timePlayed",
                data: getTimeSpentPlaying(puzzleList),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
                }
            ]
        }
    }
    lineGraph = new Chart(document.getElementById("statsChart"), lineGraphConfig)
}




function createLineGraph(puzzleList, type){
    //remove previous chart to load new one
    let lineGraphConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets:[{
                label: type,
                data: [],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
                }
            ]
        }
    }
    let results = []
    

    switch (type) {
        case "timePlayed":
            results = getTimeSpentPlaying(puzzleList)
            console.log(results)
            lineGraphConfig.data.datasets[0].data = results
            lineGraph.destroy()
            lineGraph = new Chart(document.getElementById("statsChart"), lineGraphConfig)
            break;
        case "shotPercentage":
            results = getAverageShotPercentage(puzzleList)
            console.log(results)
            lineGraphConfig.data.datasets[0].data = results
            lineGraph.destroy()
            lineGraph = new Chart(document.getElementById("statsChart"), lineGraphConfig)
            break;
        case "turnsTaken":
            results = getTurnsTaken(puzzleList)
            console.log(results)
            lineGraphConfig.data.datasets[0].data = results
            lineGraph.destroy()
            lineGraph = new Chart(document.getElementById("statsChart"), lineGraphConfig)
            break;

    }

    console.log(lineGraph)
}


function getAverageShotPercentage(puzzleList){
    let AverageShotPercentageDataset = []
    Array.from(puzzleList).forEach(puzzle => {
        AverageShotPercentageDataset.push(parseInt(puzzle.shotsHit)/parseInt(puzzle.shotsTaken))
    });
    return AverageShotPercentageDataset
}


function getTimeSpentPlaying(puzzleList){
    let TimeSpentPlayingDataset = []
    Array.from(puzzleList).forEach(puzzle => {
        TimeSpentPlayingDataset.push(parseInt(puzzle.timeToComplete))
    });
    return TimeSpentPlayingDataset
}

function getTurnsTaken(puzzleList){
    let TurnsTakenDataset = []
    Array.from(puzzleList).forEach(puzzle => {
        TurnsTakenDataset.push(parseInt(puzzle.turnsTaken))
    });
    return TurnsTakenDataset
}




const statisticsDropdownItems = document.querySelectorAll('#statistics-dropdown-item')
console.log(statisticsDropdownItems)
statisticsDropdownItems.forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('#statisticsDropdown').textContent = item.textContent;
        console.log(item.getAttribute('data-statistic'))
        console.log(puzzleList)
        createLineGraph(puzzleList ,item.getAttribute('data-statistic'))
    })
})

