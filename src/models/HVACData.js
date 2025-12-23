const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HVACData = sequelize.define('HVACData', {
  data_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hvac_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'HVACs',
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