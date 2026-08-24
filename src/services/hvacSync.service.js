/**
 * hvacSync.service.js
 * Maps a live AE200Client unit state onto HVAC row fields and persists it.
 */

const HVAC = require('../models/HVAC');

/** Only includes columns the state actually carries — a partial (notify-sourced) state must not null out fields it has no data for. */
function stateToHvacFields(state) {
    const fields = { update_at: state.updatedAt };
    if (state.drive        !== undefined) fields.hvac_status            = state.drive;
    if (state.mode         !== undefined) fields.hvac_operation_mode    = state.mode;
    if (state.setTemp      !== undefined) fields.hvac_temperature       = state.setTemp != null ? parseFloat(state.setTemp) : null;
    if (state.fanSpeed     !== undefined) fields.hvac_fan_speed         = state.fanSpeed;
    if (state.airDirection !== undefined) fields.hvac_air_direction     = state.airDirection;
    if (state.inletTemp    !== undefined) fields.hvac_inlet_temperature = state.inletTemp;
    return fields;
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
