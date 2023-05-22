const mongoose = require('mongoose');


const shipSchema = new mongoose.Schema({
    shipName : {
        type : String,
        required : true
    },
    rotation : {
        type : Number,
        min: 0,
        max: 1
    },
    startSquare : {
        type : Number,
        min: 0
    }
})
//embedded schema https://mongoosejs.com/docs/subdocs.html
const puzzleSchema = new mongoose.Schema({
    puzzleName:{
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true},
    ships: [shipSchema],
    rating:{
        type: Number,
        min: 0,
        default: 0,
        required: true
    },
    ratingsCount:{
        type: Number,
        min: 0,
        default: 0,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    size:{
        type: Number,
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timesPlayed:{
        type: Number,
        min: 0,
        default: 0,
        required: true
    }
})


module.exports = mongoose.model('Puzzle', puzzleSchema)