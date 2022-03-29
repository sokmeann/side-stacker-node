const { Sequelize } = require('@sequelize/core');

const db = new Sequelize("side_stacker",process.env.USER,process.env.PASSWORD, {
  host : "localhost",
  dialect: "postgres",
  pool: {
    max: 9,
    min: 0,
    idle: 10000
  }
});

module.exports = db;