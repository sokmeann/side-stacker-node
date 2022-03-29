const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Game, db } = require("./db");
require("dotenv").config();

const port = process.env.PORT || 8080;

const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://side-stacker-react.herokuapp.com",
    methods: ["GET", "POST"]
  }
});

db.sync().then((response) => {
  if (response) {
    console.log(`Connected to ${response?.config?.database} on port ${response?.config?.port}`)
  }
}).catch(err => console.error(err));
  
io.on("connection", (socket) => {
  socket.on("game-init", ({ uuid, gameId }) => {
    if (gameId && gameId !== "undefined") {
      Game.findByPk(Number(gameId))
      .then((response) => {
        const current_game = response.dataValues;
        socket.emit("game-data", { current_game });
      })
      .catch(err => console.error(err))
    } else {
      const game_init = {
        status: 'created',
        player_1: uuid,
      }
      Game.create(game_init)
      .then((response) => {
        const newGame = response.dataValues;
        socket.emit("game-data", { current_game: newGame });
      })
      .catch(err => console.error(err));
    }
  })

  socket.on("request-join-game", async ({ uuid, gameId }) => { 
    await Game.update({ player_2: uuid }, { where: { id: Number(gameId) }})
    await Game.findByPk(Number(gameId))
      .then((response) => {
        const current_game = response.dataValues;
        socket.emit("game-data", { current_game });
        socket.broadcast.emit("player-connect", { new_player: uuid, current_game });
      })
      .catch(err => console.error(err))
  })

  socket.on("player_move", async ({ move, gameData }) => { 
    const gameId = Number(gameData?.id)
    await Game.update({ ...gameData }, { where: { id: gameId }})
    await Game.findByPk(gameId)
      .then((response) => {
        const current_game = response.dataValues;
        socket.broadcast.emit("updated-game-data", current_game);
      })
      .catch(err => console.error(err))
  })

  socket.on("request_reset", (uuid) => { 
    const game_init = {
      status: 'created',
      player_1: uuid,
    }
    Game.create(game_init)
    .then((response) => {
      const newGame = response.dataValues;
      socket.emit("game-data", { current_game: newGame });
    })
    .catch(err => console.error(err));
  })
});

io.engine.on("connection_error", (err) => {
  console.log(err.req);
  console.log(err.code);
  console.log(err.message);
  console.log(err.context);
});

app.use("/", (req, res, next) => {
  res.json("Side-Stacker-Node")
})

server.listen(port, () => console.log(`Listening on port ${port}`));
