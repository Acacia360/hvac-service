/**
 * hvacHistory.service.js
 * Writes an HVAC_Data history row whenever a person issues a control action.
 * Kept separate from hvacSync.service.js, which only handles device polling.
 */

const HVACData = require('../models/HVACData');

/** Records one control-action history row for a known HVAC row */
async function recordAction(hvacRow, state) {
    return HVACData.create({
        hvac_id:                hvacRow.id,
        hvac_property_id:       hvacRow.hvac_property_id,
        hvac_room_id:           hvacRow.hvac_room_id,
        hvac_status:            state.drive,
        hvac_operation_mode:    state.mode,
        hvac_temperature:       state.setTemp != null ? parseFloat(state.setTemp) : null,
        hvac_fan_speed:         state.fanSpeed,
        hvac_air_direction:     state.airDirection,
        hvac_inlet_temperature: state.inletTemp,
        hvac_controller_ip:     hvacRow.hvac_controller_ip,
        timestamp:              state.updatedAt,
    });
}

module.exports = { recordAction };
