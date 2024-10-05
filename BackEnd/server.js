const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Origine du client React
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Middleware CORS pour Express
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));

// Liste pour stocker les joueurs
let players = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Ajout d'un joueur
  socket.on('addPlayer', (playerName) => {
    if (playerName) {
      const newPlayer = { id: socket.id, name: playerName, role: '' };
      players.push(newPlayer);
      console.log(`Player added: ${playerName}`);

      // Mise à jour de la liste des joueurs pour tous les clients
      io.emit('updatePlayers', players);
    }
  });

  // Assigner des rôles aux joueurs
  socket.on('assignRoles', () => {
    const roles = ['Warrior', 'Mage', 'Healer', 'Rogue']; // Liste des rôles
    players = players.map((player, index) => ({
      ...player,
      role: roles[index % roles.length] // Assigner les rôles cycliquement
    }));

    console.log('Roles assigned:', players);

    // Envoyer la liste des joueurs avec les rôles assignés à tous les clients
    io.emit('rolesAssigned', players);
  });

  // Quand un client se déconnecte
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Retirer le joueur de la liste
    players = players.filter(player => player.id !== socket.id);

    // Mise à jour de la liste des joueurs pour tous les clients
    io.emit('updatePlayers', players);
  });
});

// Démarrage du serveur
server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
