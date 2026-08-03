const { ok, fail } = require('../utils/response');
const HVAC = require('../models/HVAC');
const { getOrCreateClient } = require('../services/deviceRegistry.service');
const { syncStatesToDb, stateToHvacFields } = require('../services/hvacSync.service');
const { recordAction } = require('../services/hvacHistory.service');

/** GET /api/hvac/:ip — live-refreshes every group on the controller, persists it, then returns HVAC rooms for it */
async function getRoomsByController(req, res) {
    const ip = req.params.ip;

    try {
        const client = await getOrCreateClient(ip);
        await client.refreshAll();
        await syncStatesToDb(ip, client.getCachedStates());
    } catch (err) {
        console.error(`[${ip}] Live refresh failed, serving last known DB state:`, err.message);
    }

    const rooms = await HVAC.findAll({ where: { hvac_controller_ip: ip }, order: [['hvac_group_id', 'ASC']] });
    if (rooms.length === 0) return fail(res, `No HVAC rooms found for controller ${ip}`, 404);
    ok(res, { ip, count: rooms.length, rooms });
}

/** GET /api/hvac/:ip/sync — fetch live unit states from the device and persist them into HVAC rows */
async function syncRoomsFromDevice(req, res) {
    const ip     = req.ip_;
    const states = req.client.getCachedStates();

    if (Object.keys(states).length === 0) {
        return fail(res, `No live unit data available yet for ${ip}`, 409);
    }

    const { updated, untracked } = await syncStatesToDb(ip, states);
    const rooms = await HVAC.findAll({ where: { hvac_controller_ip: ip }, order: [['hvac_group_id', 'ASC']] });

    ok(res, {
        ip,
        updatedCount: updated.length,
        untrackedGroups: untracked,
        count: rooms.length,
        rooms,
    });
}

/** POST /api/hvac/:hvacId/control — send a command to a room's unit and persist the resulting state */
async function controlRoom(req, res) {
    const room   = req.room;
    const client = await getOrCreateClient(room.hvac_controller_ip);
    const state  = await client.controlGroup(room.hvac_group_id, req.body);

    await room.update(stateToHvacFields(state));
    await recordAction(room, state);

    ok(res, { message: `Room ${room.hvac_id} updated`, room });
}

module.exports = { getRoomsByController, syncRoomsFromDevice, controlRoom };
