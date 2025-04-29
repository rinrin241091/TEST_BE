const Game = require('../models/game.model');
const Question = require('../models/question.model');

// Generate a random 6-digit PIN
const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a new game
exports.createGame = async (req, res) => {
  try {
    const { hostId, questionIds } = req.body;
    
    // Generate unique PIN
    let pin;
    let isUnique = false;
    while (!isUnique) {
      pin = generatePin();
      const existingGame = await Game.findOne({ pin });
      if (!existingGame) isUnique = true;
    }

    const game = new Game({
      pin,
      host: hostId,
      questions: questionIds
    });

    await game.save();
    res.status(201).json({ game });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get game by PIN
exports.getGameByPin = async (req, res) => {
  try {
    const { pin } = req.params;
    const game = await Game.findOne({ pin })
      .populate('questions')
      .populate('host', 'username');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add player to game
exports.addPlayer = async (req, res) => {
  try {
    const { pin } = req.params;
    const { playerId, name } = req.body;

    const game = await Game.findOne({ pin });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.isStarted) {
      return res.status(400).json({ message: 'Game has already started' });
    }

    // Check if player already exists
    const existingPlayer = game.players.find(p => p.playerId === playerId);
    if (existingPlayer) {
      return res.status(400).json({ message: 'Player already in game' });
    }

    game.players.push({
      playerId,
      name,
      score: 0,
      answers: []
    });

    await game.save();
    res.json({ game });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit answer
exports.submitAnswer = async (req, res) => {
  try {
    const { pin } = req.params;
    const { playerId, questionId, answer, timeSpent } = req.body;

    const game = await Game.findOne({ pin });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const player = game.players.find(p => p.playerId === playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === answer;
    const score = isCorrect ? Math.max(0, 1000 - timeSpent) : 0;

    player.answers.push({
      questionId,
      answer,
      timeSpent,
      isCorrect,
      score
    });

    player.score += score;
    await game.save();

    res.json({ isCorrect, score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get game results
exports.getResults = async (req, res) => {
  try {
    const { pin } = req.params;
    const game = await Game.findOne({ pin })
      .populate('questions')
      .populate('host', 'username');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (!game.isFinished) {
      return res.status(400).json({ message: 'Game is not finished yet' });
    }

    // Sort players by score
    const results = game.players
      .sort((a, b) => b.score - a.score)
      .map(player => ({
        name: player.name,
        score: player.score,
        answers: player.answers
      }));

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 