const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HVAC = sequelize.define('HVAC', {
    hvac_id: {
        type: DataTypes.STRING,
        primaryKey: true
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
        unique: true
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
    hvac_room_ids: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        // defaultValue: []
    },
    hvac_connectivity: {
        type: DataTypes.STRING
    },
    hvac_control_method: {
        type: DataTypes.STRING
    },
    hvac_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    hvac_operation_mode: {
        type: DataTypes.STRING
    },
    hvac_temperature: {
        type: DataTypes.FLOAT
    },
    hvac_fan_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hvac_fan_speed: {
        type: DataTypes.STRING
    },
    hvac_lossnay_fan_speed: {
        type: DataTypes.STRING
    },
    hvac_air_direction: {
        type: DataTypes.STRING
    },
    hvac_ventillation_mode: {
        type: DataTypes.STRING
    },
    hvac_power_source: {
        type: DataTypes.STRING
    },
    hvac_energy_consumption_data: {
        type: DataTypes.JSON
    },
    hvac_schedule_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hvac_schedule_settings: {
        type: DataTypes.JSON
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
    tableName: 'HVACs'
});

module.exports = HVAC;