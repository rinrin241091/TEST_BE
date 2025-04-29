const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');

// Create a new game
router.post('/', gameController.createGame);

// Get game by PIN
router.get('/:pin', gameController.getGameByPin);

// Add player to game
router.post('/:pin/players', gameController.addPlayer);

// Submit answer
router.post('/:pin/answers', gameController.submitAnswer);

// Get game results
router.get('/:pin/results', gameController.getResults);

module.exports = router; 