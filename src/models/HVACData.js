const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HVACData = sequelize.define('HVACData', {
    hvac_data_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    hvac_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hvac_property_id: {
        type: DataTypes.STRING
    },
    hvac_room_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    hvac_status: {
        type: DataTypes.STRING,
        defaultValue: 'OFF',
        allowNull: false
    },
    hvac_operation_mode: {
        type: DataTypes.STRING
    },
    hvac_temperature: {
        type: DataTypes.STRING
    },
    hvac_fan_speed: {
        type: DataTypes.STRING
    },
    hvac_air_direction: {
        type: DataTypes.STRING
    },
    hvac_inlet_temperature: {
        type: DataTypes.STRING
    },
    hvac_controller_ip: {
        type: DataTypes.STRING
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },

}, {
    timestamps: false,
    tableName: 'HVAC_Data',
});

module.exports = HVACData;