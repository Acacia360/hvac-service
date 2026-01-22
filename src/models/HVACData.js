const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HVACData = sequelize.define('HVACData', {
  data_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hvac_instance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'HVACs',
      key: 'id',
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