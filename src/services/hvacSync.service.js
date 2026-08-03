/**
 * hvacSync.service.js
 * Maps a live AE200Client unit state onto HVAC row fields and persists it.
 */

const HVAC = require('../models/HVAC');

function stateToHvacFields(state) {
    return {
        hvac_status:            state.drive,
        hvac_operation_mode:    state.mode,
        hvac_temperature:       state.setTemp != null ? parseFloat(state.setTemp) : null,
        hvac_fan_speed:         state.fanSpeed,
        hvac_air_direction:     state.airDirection,
        hvac_inlet_temperature: state.inletTemp,
        update_at:              state.updatedAt,
    };
}

/** Persists live states (as returned by AE200Client#getCachedStates) into the matching HVAC rows for one controller */
async function syncStatesToDb(ip, states) {
    const updated    = [];
    const untracked  = [];

    for (const [group, state] of Object.entries(states)) {
        const [count] = await HVAC.update(stateToHvacFields(state), {
            where: { hvac_controller_ip: ip, hvac_group_id: Number(group) },
        });
        if (count > 0) updated.push(Number(group));
        else untracked.push(Number(group));
    }

    return { updated, untracked };
}

module.exports = { stateToHvacFields, syncStatesToDb };
