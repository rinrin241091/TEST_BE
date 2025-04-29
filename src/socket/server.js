const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const Game = require('../models/game.model');

const activeGames = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create game room
    socket.on('create-game', async ({ hostId, questions }) => {
      try {
        const gamePin = generateGamePin();
        const gameId = uuidv4();
        
        const gameData = {
          id: gameId,
          pin: gamePin,
          hostId,
          questions,
          players: [],
          currentQuestion: 0,
          isStarted: false,
          answers: new Map()
        };
        
        activeGames.set(gamePin, gameData);
        socket.join(gamePin);
        
        socket.emit('game-created', { gamePin, gameId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to create game' });
      }
    });

    // Join game
    socket.on('join-game', async ({ gamePin, playerName }) => {
      try {
        const game = activeGames.get(gamePin);
        
        if (!game) {
          return socket.emit('error', { message: 'Game not found' });
        }

        if (game.isStarted) {
          return socket.emit('error', { message: 'Game already started' });
        }

        const playerId = uuidv4();
        const playerData = {
          id: playerId,
          name: playerName,
          score: 0
        };

        game.players.push(playerData);
        socket.join(gamePin);
        
        socket.emit('game-joined', { playerId });
        io.to(gamePin).emit('player-joined', { players: game.players });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Start game
    socket.on('start-game', async ({ gamePin }) => {
      try {
        const game = activeGames.get(gamePin);
        
        if (!game) {
          return socket.emit('error', { message: 'Game not found' });
        }

        game.isStarted = true;
        const currentQuestion = game.questions[game.currentQuestion];
        
        io.to(gamePin).emit('game-started', { 
          question: currentQuestion,
          totalQuestions: game.questions.length 
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Submit answer
    socket.on('submit-answer', async ({ gamePin, playerId, answer, timeSpent }) => {
      try {
        const game = activeGames.get(gamePin);
        
        if (!game) {
          return socket.emit('error', { message: 'Game not found' });
        }

        const currentQuestion = game.questions[game.currentQuestion];
        const isCorrect = currentQuestion.correctAnswer === answer;
        const score = calculateScore(timeSpent, isCorrect);

        const player = game.players.find(p => p.id === playerId);
        if (player) {
          player.score += score;
        }

        game.answers.set(playerId, { answer, timeSpent, isCorrect, score });
        
        io.to(gamePin).emit('answer-submitted', { 
          playerId,
          isCorrect,
          score,
          totalAnswers: game.answers.size,
          totalPlayers: game.players.length
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Next question
    socket.on('next-question', async ({ gamePin }) => {
      try {
        const game = activeGames.get(gamePin);
        
        if (!game) {
          return socket.emit('error', { message: 'Game not found' });
        }

        game.currentQuestion++;
        game.answers.clear();

        if (game.currentQuestion >= game.questions.length) {
          // Game finished
          const results = game.players.sort((a, b) => b.score - a.score);
          io.to(gamePin).emit('game-finished', { results });
          activeGames.delete(gamePin);
        } else {
          // Next question
          const currentQuestion = game.questions[game.currentQuestion];
          io.to(gamePin).emit('question-changed', { 
            question: currentQuestion,
            currentQuestion: game.currentQuestion + 1,
            totalQuestions: game.questions.length
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to change question' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

// Helper functions
const generateGamePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const calculateScore = (timeSpent, isCorrect) => {
  if (!isCorrect) return 0;
  return Math.max(0, 1000 - timeSpent);
};

module.exports = { initializeSocket }; 