const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const HVAC = require('./HVAC');
const HVACData = require('./HVACData');
const APILogs = require('./apiLog')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  HVAC,
  HVACData,
  APILogs
};

HVAC.hasMany(HVACData, {
  foreignKey: 'hvac_id',
});
HVACData.belongsTo(HVAC, {
  foreignKey: 'hvac_id',
});

module.exports = db;