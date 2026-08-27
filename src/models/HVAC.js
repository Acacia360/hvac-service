const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HVAC = sequelize.define('HVAC', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    hvac_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hvac_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hvac_brand: {
        type: DataTypes.STRING
    },
    hvac_model: {
        type: DataTypes.STRING
    },
    hvac_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hvac_serial_number: {
        type: DataTypes.STRING,
        unique: false
    },
    hvac_manufacture_date: {
        type: DataTypes.STRING
    },
    hvac_installation_date: {
        type: DataTypes.STRING
    },
    hvac_installation_location: {
        type: DataTypes.STRING
    },
    hvac_property_id: {
        type: DataTypes.STRING
        },
    hvac_room_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    hvac_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    hvac_connectivity: {
        type: DataTypes.STRING
    },
    hvac_control_method: {
        type: DataTypes.STRING
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
    hvac_temperature_cool: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    hvac_temperature_heat: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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
    hvac_power_source: {
        type: DataTypes.STRING
    },
      
    hvac_notification_settings: {
        type: DataTypes.JSON
    },
    hvac_maintenance_logs: {
        type: DataTypes.TEXT
    },
    hvac_last_maintenance_date: {
        type: DataTypes.STRING
    },
    hvac_warranty_expiration: {
        type: DataTypes.STRING
    },
    hvac_notes: {
        type: DataTypes.TEXT
    },
    hvac_controller_ip: {
        type: DataTypes.STRING
    },
    update_at:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    created_by: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'HVACs',
    indexes: [{ fields: ['hvac_id'] }, { fields: ['hvac_room_id'] }, { unique: true, fields: ['hvac_id', 'hvac_room_id'] }]
});

module.exports = HVAC;