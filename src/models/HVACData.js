const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HVACData = sequelize.define('HVACData', {
  data_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  hvac_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'HVAC',
      key: 'hvac_id',
    },
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'HVAC_Data',
});

module.exports = HVACData;