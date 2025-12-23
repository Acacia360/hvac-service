const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HVAC = sequelize.define('HVAC', {
    hvac_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },

    hvac_air_direction: {
        type: DataTypes.STRING
    },
    hvac_brand: {
        type: DataTypes.STRING
    },
    hvac_connectivity: {
        type: DataTypes.STRING
    },
    hvac_control_method: {
        type: DataTypes.STRING
    },
    hvac_energy_consumption_data: {
        type: DataTypes.JSON
    },
    hvac_fan_speed: {
        type: DataTypes.STRING
    },
    hvac_fan_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hvac_installation_date: {
        type: DataTypes.STRING
    },
    hvac_installation_location: {
        type: DataTypes.STRING
    },
    hvac_last_maintenance_date: {
        type: DataTypes.STRING
    },
    hvac_lossnay_fan_speed: {
        type: DataTypes.STRING
    },
    hvac_maintenance_logs: {
        type: DataTypes.TEXT
    },
    hvac_manufacture_date: {
        type: DataTypes.STRING
    },
    hvac_model: {
        type: DataTypes.STRING
    },
    hvac_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hvac_notes: {
        type: DataTypes.TEXT
    },
    hvac_notification_settings: {
        type: DataTypes.JSON
    },
    hvac_operation_mode: {
        type: DataTypes.STRING
    },
    hvac_power_source: {
        type: DataTypes.STRING
    },
    hvac_property_id: {
        type: DataTypes.STRING
        },
    hvac_room_ids: {
        type: DataTypes.STRING
    },
    hvac_schedule_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hvac_schedule_settings: {
        type: DataTypes.JSON
    },
    hvac_serial_number: {
        type: DataTypes.STRING,
        unique: true
    },
    hvac_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    hvac_temperature: {
        type: DataTypes.FLOAT
    },
    hvac_type: {
        type: DataTypes.STRING
    },
    hvac_ventillation_mode: {
        type: DataTypes.STRING
    },
    hvac_warranty_expiration: {
        type: DataTypes.STRING
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
    tableName: 'HVACs',
    timestamps: false
});

module.exports = HVAC;
