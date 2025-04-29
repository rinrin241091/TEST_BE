const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  pin: {
    type: String,
    required: true,
    unique: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  players: [{
    playerId: String,
    name: String,
    score: {
      type: Number,
      default: 0
    },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      answer: String,
      timeSpent: Number,
      isCorrect: Boolean,
      score: Number
    }]
  }],
  currentQuestion: {
    type: Number,
    default: 0
  },
  isStarted: {
    type: Boolean,
    default: false
  },
  isFinished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema); 