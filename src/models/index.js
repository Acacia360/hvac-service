const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const HVAC = require('./HVAC');
// const HVACData = require('./HVACData');
const APILogs = require('./apiLog')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  HVAC,
  // HVACData,
  APILogs
};

// HVAC.hasMany(HVACData, {
//   foreignKey: 'hvac_instance_id',
//   sourceKey: 'id'
// });
// HVACData.belongsTo(HVAC, {
//   foreignKey: 'hvac_instance_id',
//   targetKey: 'id'
// });

module.exports = db;