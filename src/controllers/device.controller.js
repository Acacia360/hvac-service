const { ok } = require('../utils/response');
const { getAllClients } = require('../services/deviceRegistry.service');
const HVAC = require('../models/HVAC');

/** GET /api/devices — lists all currently known/connected devices */
async function listDevices(req, res) {
    const rows = await HVAC.findAll({
        attributes: ['hvac_controller_ip', 'hvac_property_id'],
        group: ['hvac_controller_ip', 'hvac_property_id'],
        raw: true,
    });
    const propertyIdByIp = {};
    for (const row of rows) propertyIdByIp[row.hvac_controller_ip] = row.hvac_property_id;

    const devices = {};
    for (const [ip, client] of Object.entries(getAllClients())) {
        devices[ip] = {
            ip,
            connected:       client.isConnected(),
            systemInfo:      client.getSystemInfo(),
            groupCount:      client.getGroups().length,
            hvac_property_id: propertyIdByIp[ip] ?? null,
        };
    }
    ok(res, { devices });
}

/** GET /api/devices/:ip/groups */
function getGroups(req, res) {
    ok(res, { ip: req.ip_, groups: req.client.getGroups() });
}

/** GET /api/devices/:ip/units */
function getUnits(req, res) {
    ok(res, { ip: req.ip_, units: req.client.getCachedStates() });
}

/** GET /api/devices/:ip/units/:group */
async function getUnit(req, res) {
    const state = await req.client.readGroup(req.params.group);
    ok(res, { ip: req.ip_, unit: state });
}

module.exports = { listDevices, getGroups, getUnits, getUnit };
