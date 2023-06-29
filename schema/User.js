const mongoose = require('mongoose');

const completedPuzzleStats = new mongoose.Schema({
  puzzleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle'
  },
  shotsTaken: {
    type: Number,
    min: 0,
    required: true
  },
  shotsHit: {
    type: Number,
    min: 0,
    required: true
  },
  timeToComplete: {
    type: Number,
    min: 0,
    required: true
  },
  turnsTaken: {
    type: Number,
    min: 0,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  OverallshotsTaken: {
    type: Number,
    min: 0,
    default: 0,
    required: true
  },
  OverallshotsHit: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  OverallTimeSpentPlaying: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  OverallTurnsTaken: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  MPshotsTaken: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  MPshotsHit: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  MPturnsTaken: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  MPWins: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  MPLosses: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  completedPuzzles: [completedPuzzleStats],
  multiplayerBattles: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MultiplayerGame',
        required: true
    }
    
  ]
});

module.exports = mongoose.model('User', userSchema);
