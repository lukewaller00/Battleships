const mongoose = require('mongoose');


const gameStatistcsSchema = new mongoose.Schema({
    shotsTaken:{
        type: Number,
        min: 0,
        required: true
    },
    shotsHit: {
        type: Number,
        min: 0,
        required: true
    },
    turnsTaken: {
        type: Number,
        min: 0,
        required: true
    }

})


const multiplayerGameSchema = new mongoose.Schema({
    gameID:{
        type: Number,
        required: true
    },
    winner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    winnerStats:[gameStatistcsSchema],
    loserStats:[gameStatistcsSchema],
})

module.exports = mongoose.model('MultiplayerGame', multiplayerGameSchema)