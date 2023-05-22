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
    },
    timeTaken:{
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
    player1:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player2:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player1Stats:[gameStatistcsSchema],
    player2Stats:[gameStatistcsSchema],
    winner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})


module.exports = mongoose.model('MultiplayerGame', multiplayerGameSchema)