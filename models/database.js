const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('vendors', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
