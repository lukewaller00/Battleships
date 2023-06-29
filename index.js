const express =  require('express') 
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcrypt'); 
const User = require('./schema/User')
const methodOverride = require('method-override')
const Puzzle = require('./schema/Puzzle')
const flash = require('express-flash')
const MultiplayerGame = require('./schema/MultiplayerGame')

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });



require('dotenv').config();

const initializePassport = require('./passportConfig');
const { name } = require('ejs');
initializePassport(passport, 
        email => User.find({email: email}),
        id => User.findById(id)
    )


//DB Setup
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DBSTRING,{})



//Middleware
app.use(cors());
app.set('view engine', 'ejs')
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}))
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(flash())
app.use(methodOverride('_method'))

//allows for the serving of static files like css and images
app.use(express.static(__dirname + '/public'));

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

//checks if user is currently logged in 
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) return next()
    res.redirect("/login")
}

app.get('/', isLoggedIn, (req, res)=>{
    const user = req.user
    res.render('index.ejs', {user});
})

//Login Routing
app.get("/login", (req, res) =>{
    if (req.isAuthenticated()){
        console.log("user already logged in")
        res.redirect('/')
    }
    else{
        console.log("user not authenticated")
        res.render('login.ejs', {user: null})
    }   
})

app.post("/login", passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    res.redirect('/')
})

//Registration Routing
app.get("/registration", (req, res) =>{
    res.render('register.ejs', {user: null})
})

app.post("/registration", async (req, res) =>{
    console.log("registration")
    console.log(req.body)
    const checkUser = await User.exists({email: req.body.email})
    console.log(checkUser)
    const usernameCheck = await User.exists({username: req.body.username})
    console.log(usernameCheck)
    if (checkUser && usernameCheck){
        res.redirect("/registration")
    }
    if(!checkUser && !usernameCheck){
        try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        user.save();
        console.log("User Saved")
        res.redirect("/login")
    }
    catch{
        res.redirect("/registration")
    }
}
}
)


//logout user function
const logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
};

//User Logout
app.get("/logout", logout)



//CreatePuzzle
app.get("/createPuzzle",isLoggedIn ,(req, res) =>{
    const user = req.user
    res.render("CreatePuzzle.ejs", {user})
})


//save puzzle to mongodb
app.post("/createPuzzle",(req, res) =>{
    console.log(req.user)
    let puzzle = new Puzzle({
        puzzleName : req.body.puzzleName,
        username : req.user.username,
        ships : [],
        difficulty : req.body.puzzleDifficulty,
        size: req.body.puzzleSize,
        userId: req.user._id,
        timesPlayed: 0
    })
    Array.from(req.body.saveShipArray).forEach(savedShip =>puzzle.ships.push({
        shipName : savedShip.shipName,
        rotation : savedShip.rotation,
        startSquare : savedShip.startingSquare
    }))
    puzzle.save()
    console.log("puzzle saved")
    res.redirect("/")
})


//Puzzle Select Route
app.get("/puzzleSelect", isLoggedIn, (req, res) =>{
    const user = req.user
    res.render("SelectPuzzle.ejs", {user} )
})
//get list of all puzzles may need to be changed later if too many puzzles added
app.get("/puzzleList", isLoggedIn, async (req, res)=>{
    const puzzlesList = await Puzzle.find()
    res.json({puzzlesList})
})



let currentPuzzle
//Play Puzzle Route
app.get("/playPuzzle/:puzzleId", isLoggedIn, async(req, res) => {
    currentPuzzle = req.params['puzzleId']
    const user = req.user
    res.render("SPPlayScreen.ejs", {user})
})

app.get("/getPuzzle/", isLoggedIn, async(req, res) =>{
    const puzzle = await Puzzle.findById(currentPuzzle)
    res.json(puzzle)
})




//Submit puzzle to User Statistics
app.post("/puzzleSubmit", isLoggedIn, async (req, res)=>{
    console.log("userid")
    console.log(req.user._id)
    //find user and update stats
    User.updateOne({_id: req.user._id}, {
        $inc: { 
            OverallshotsTaken: req.body.shotsTaken, 
            OverallshotsHit: req.body.shotsHit,
            OverallTimeSpentPlaying: req.body.time,
            OverallTurnsTaken: req.body.turnsTaken
        },
        $push: { 
            completedPuzzles: {
                puzzleId : req.body.puzzleId,
                shotsTaken : req.body.shotsTaken,
                shotsHit: req.body.shotsHit,
                timeToComplete: req.body.time,
                turnsTaken: req.body.turnsTaken
            }
        } 
    }).then(result => {
        console.log("values updated")
        
    }).catch(error =>{
        console.log(error)
    })
    
    const ObjectId = mongoose.Types.ObjectId;
    const puzzleObjectId = new ObjectId(req.body.puzzleId);
    console.log("puzzleID")
    console.log(puzzleObjectId)
    //find puzzle and update timesPlayed by 1
    const puzzle = await Puzzle.findByIdAndUpdate(puzzleObjectId, {
        $inc: {
          timesPlayed: 1
        }
      }, { new: true });    
    console.log("puzzle")
    console.log(puzzle)
    res.redirect("/PuzzleComplete")
})

app.get("/PuzzleComplete", isLoggedIn, async(req, res) => {
    //get the last completed puzzle from the user's list
    let lastCompletedPuzzleList =  await User.findOne({}).sort('-completedPuzzles.createdAt').select('completedPuzzles').limit(1).exec();
    const lastCompletedPuzzleStats = lastCompletedPuzzleList.completedPuzzles.pop(); // gets the last element of the array
    const lastCompletedPuzzleInfo = await Puzzle.findById(lastCompletedPuzzleStats.puzzleId)
    
    //fomrmat information to JSON format to be rendered in ejs file
    const completedPuzzleRequestInfo = {
        user : req.user.username,
        lastCompletedPuzzle : lastCompletedPuzzleStats,
        puzzleName : lastCompletedPuzzleInfo.puzzleName,
        rating: lastCompletedPuzzleInfo.rating,
        puzzleId : lastCompletedPuzzleStats.puzzleId
    }
    res.render('PuzzleComplete.ejs', {completedPuzzleRequestInfo})
})



app.get("/account/:id", isLoggedIn, async (req, res) =>{
    const user = req.user
    const viewedAccount = await User.findById(req.params['id'])
    
    res.render('Account.ejs', {user, viewedAccount})
})

app.get("/getAccount/:id", isLoggedIn, async(req, res)=>{
    const currentAccount = await User.findById(req.params['id'])
    res.json({currentAccount})
})

app.get("/accountPuzzles/:id", isLoggedIn, async(req, res)=>{
    const account = await User.findById(req.params['id'])
    console.log(account)
    const completedPuzzlesArray = Object.values(account.completedPuzzles)    
    const limit = 10 //10 items per page
    const page = parseInt(req.query.page) || 1; // Get the current page or default to 1
    const totalPages = Math.ceil(completedPuzzlesArray.length/limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const currentPageResults = completedPuzzlesArray.slice(startIndex, endIndex)
    const reqResult = {
        user: {
            _id: req.user._id,
            username : req.user.username},
        totalPages : totalPages,
        currentPage : page,
        currentPageResults : currentPageResults
    }
    res.render('CompletedPuzzlesList.ejs', {reqResult, account})
})


app.get("/accountCreatedPuzzles/:id", isLoggedIn, async(req, res)=>{
    const puzzles = await Puzzle.find({userId: req.params['id']})
    const account = await User.findById(req.params['id'])
    const createdPuzzlesArray = Array.from(puzzles)
    const limit = 10 //10 items per page
    const page = parseInt(req.query.page) || 1;// Get the current page or default to 1
    const totalPages = Math.ceil(createdPuzzlesArray.length/limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const currentPageResults = createdPuzzlesArray.slice(startIndex, endIndex)
    const reqResult = {
        user: {
            _id: req.user._id,
            username: req.user.username},
        totalPages : totalPages,
        currentPage : page,
        currentPageResults : currentPageResults
    }
    console.log("req result")
    console.log(reqResult)
    res.render('CreatedPuzzleList.ejs', {reqResult, account})
})



app.post("/ratePuzzle", isLoggedIn, async (req, res) =>{
    console.log(parseInt(req.body.rating))
    try{    const puzzle = await Puzzle.findByIdAndUpdate(req.query.puzzleId, {
            $inc:{
                rating: parseInt(req.body.rating), 
                ratingsCount: 1
            }},
            {
                new: true
            }) 
        console.log("puzzle updated" , puzzle)
        res.redirect("/puzzleSelect")
        }
    catch(error){
        console.log("error updating puzzle: ", error)
        res.status(500).send("Error updating puzzle rating")
    }
})



app.get("/leaderboards", isLoggedIn, async (req, res) =>{
    const user = req.user
    const allUsers = await User.find()
    const allUsersArray = Array.from(allUsers)
    //format user data to be displayed in leaderboards
    let usersData = []
    allUsersArray.forEach(user =>{
        console.log(parseInt(user.completedPuzzles.length))
        usersData.push({
            username : user.username,
            OverallshotsTaken: user.OverallshotsTaken,
            OverallshotsHit: user.OverallshotsHit,
            OverallTimeSpentPlaying: user.OverallTimeSpentPlaying,
            OverallTurnsTaken: user.OverallTurnsTaken,
            CompletedPuzzlesAmount: user.completedPuzzles.length,
            userId: user._id
        })
    })
    res.render('Leaderboards.ejs', {usersData, user})
})


//Mulitplayer Implementation

app.get("/multiplayer", isLoggedIn, async(req, res) =>{
    const user = req.user
    console.log("user information") 
    console.log(user.username)
    console.log(user._id)
    res.render('MPCreatePuzzle.ejs', {user})
})

app.get("/multiplayerLobby", isLoggedIn, async (req, res) => {
    try {
        let latestGame = await MultiplayerGame.findOne().sort("-gameID");
        latestGame = latestGame.gameID + 1
        if (!latestGame) {
            // no game found in the database
            res.status(404).send("No multiplayer game found");
            return;
        }
        console.log("The latest game is:" + latestGame);
        res.status(200).send(latestGame.toString());
        } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        }
  });

let player1 = null;
let player2 = null;

const multiplayerGamesInProgress = {}

app.post("/multiplayerGame/:gameID", isLoggedIn, (req, res) =>{
    /**if (player1 == null){
        player1 = req.body
    }
    else if (player2 == null && player1 != null){
        player2 = req.body
    }
    else{
        res.status(400).send("Game is full")
    }*/



    const user = req.user
    req.session.puzzleData = req.body
    const gameID = parseInt(req.params.gameID)
    const currentUser = user.username

    //create list for player puzzles to be pushed to 
    if (!multiplayerGamesInProgress[gameID]) {
        multiplayerGamesInProgress[gameID] = [];
    }
    
    multiplayerGamesInProgress[gameID].push({[currentUser] : req.body})
    console.log("multiplayerGamesInProgress")
    console.log(multiplayerGamesInProgress)

    res.redirect("/multiplayerGame/" + gameID)
})  

app.get("/multiplayerGame/:gameID", isLoggedIn, (req, res) => {
    const user = req.user;
    const gameID = req.params.gameID
    res.render("MPPlayScreen.ejs", { user, gameID});
  });

app.get("/multiplayerGamePuzzles/:gameID", isLoggedIn, (req, res) => {
    const username = req.user.username 
    const currentGamePuzzles = multiplayerGamesInProgress[req.params.gameID]
    res.json({currentGamePuzzles, username})
})

//stores the final scores of games submitted by the server by players multiplayerGameFinalScores[gameID]
let multiplayerGameFinalScores = {}
io.on('connection', (socket) => {

    console.log('a user connected');
    
    socket.on('joinGameRoom', (gameID) => {
        
        const room = io.sockets.adapter.rooms.get(gameID);
        if (room){
            if (Array.from(room).length == 1){
                socket.join(gameID)
                //send message to all users in room
                io.to(gameID).emit('bothPlayersConnected')
                socket.emit('playerNumber', '2')
                usernames = {
                    1:Object.keys(multiplayerGamesInProgress[gameID][0]),
                    2: Object.keys(multiplayerGamesInProgress[gameID][1])
                }
                io.to(gameID).emit('usernames', usernames)
            }            

            if (Array.from(room).length == 2){
                //tells the client the game is full if 2 users are in the room
            }
        }else{
            socket.join(gameID)
            socket.emit('playerNumber', '1')

            
        }      
        console.log('user: ' + socket.id + ' joined room ' + gameID);
    
    })
    socket.on("playerShot", (gameID, squareId, currentPlayer) =>{
        socket.broadcast.to(gameID).emit('playerShot', squareId, currentPlayer)
        console.log('player shot')
    })

    socket.on('turnComplete', (gameID, currentPlayer) =>{
        if( currentPlayer === 1){
            console.log('player 1 turn complete')
            io.to(gameID).emit("turnComplete", 2) //sends the playerNum for the next player's turn
        }
        else{
            console.log('player 2 turn complete')
            io.to(gameID).emit("turnComplete", 1) //sends the playerNum for the next player's turn
        }}
    )

    socket.on("submitScore", async(gameID, finalScore, winner) =>{
        if (!multiplayerGameFinalScores[gameID]) {
            multiplayerGameFinalScores[gameID] = [];
        }
        // if (!gameSubmissionStatus[gameID]) {
        //     gameSubmissionStatus[gameID] = {
        //         scoresSubmitted: 0
        //     };
        // }

        if (winner === true){
        multiplayerGameFinalScores[gameID].push({w : finalScore})}
        else{
            multiplayerGameFinalScores[gameID].push({l : finalScore})
        }

        if(Object.keys(multiplayerGameFinalScores[gameID]).length === 2){
            console.log(multiplayerGameFinalScores)
            //submit scores to mongoDB
            const winnerUser = await User.findOne({username : multiplayerGameFinalScores[gameID][0].w.username }) 
            const loserUser = await User.findOne({username : multiplayerGameFinalScores[gameID][1].l.username })
            const player1Stats = {
                shotsTaken : multiplayerGameFinalScores[gameID][0].w.shotsTaken,
                shotsHit : multiplayerGameFinalScores[gameID][0].w.shotsHit,
                turnsTaken : multiplayerGameFinalScores[gameID][0].w.playerTurns
            }
            //check for user and update stats in DB
            if(winnerUser){
                winnerUser.MPshotsHit += player1Stats.shotsHit
                winnerUser.MPshotsTaken += player1Stats.shotsTaken
                winnerUser.MPturnsTaken += player1Stats.turnsTaken
                winnerUser.MPWins += 1
            }
            const player2Stats = {
                shotsTaken : multiplayerGameFinalScores[gameID][1].l.shotsTaken,
                shotsHit : multiplayerGameFinalScores[gameID][1].l.shotsHit,
                turnsTaken : multiplayerGameFinalScores[gameID][1].l.playerTurns
            }
            if (loserUser){
                loserUser.MPshotsHit += player2Stats.shotsHit
                loserUser.MPshotsTaken += player2Stats.shotsTaken
                loserUser.MPturnsTaken += player2Stats.turnsTaken
                loserUser.MPLosses += 1
            }
            let game = new MultiplayerGame({
                 gameID : gameID,
                 winner : winnerUser,
                 loser : loserUser,
                 winnerStats : player1Stats,
                 loserStats : player2Stats
             })
            //Save game to DB and await result in order to add ID to player's MP stats
            await game.save()
            loserUser.multiplayerBattles.push(game._id)
            winnerUser.multiplayerBattles.push(game._id)
            loserUser.save()
            winnerUser.save()
            console.log("game stats saved to DB")
            
            io.emit('gameFinished', gameID)
            multiplayerGameFinalScores[gameID] = []
        }
    })

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  
    
})


httpServer.listen(process.env.PORT, () =>{
    console.log('Listening on Port: ' + process.env.PORT);
})