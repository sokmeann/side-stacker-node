const { DataTypes, Model } = require("sequelize");
const db = require("../db");

const createBoard = (numRows, numColumns) => {
  const row = Array.apply(null, Array(numColumns)).map((e) => 0);
  const board = Array.apply(null, Array(numRows)).map(
    () => row
  );
  return board;
}

const Game = db.define("games", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true 
  },
  status: {
    type: DataTypes.ENUM('created', 'in_progress', 'draw', 'completed'),
    defaultValue: 'created',
  },
  winner: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  board: {
    type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER)),
    defaultValue: createBoard(7,7)
  },
  currentTurn: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  player_1: {
    type: DataTypes.UUID,
    defaultValue: null,
    allowNull: true
  },
  player_2: {
    type: DataTypes.UUID,
    defaultValue: null,
    allowNull: true
  }
});

module.exports = Game;