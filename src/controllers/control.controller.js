const { ok } = require('../utils/response');
const { getAllClients, controlAll } = require('../services/deviceRegistry.service');

/** POST /api/devices/:ip/units/all/control — control ALL units on one device */
async function controlAllOnDevice(req, res) {
    const results = await controlAll(req.client, req.body);
    const failed  = results.filter(r => !r.success).length;
    ok(res, {
        ip:      req.ip_,
        message: `Controlled ${results.length - failed}/${results.length} units`,
        results
    });
}

/** POST /api/devices/:ip/units/:group/control — control a single unit */
async function controlUnit(req, res) {
    const state = await req.client.controlGroup(req.params.group, req.body);
    ok(res, { ip: req.ip_, unit: state, message: `Group ${req.params.group} updated` });
}

/** POST /api/units/all/control — master control, same command to ALL known devices */
async function controlMaster(req, res) {
    const allResults = {};

    for (const [ip, client] of Object.entries(getAllClients())) {
        const results = await controlAll(client, req.body);
        const failed  = results.filter(r => !r.success).length;
        allResults[ip] = {
            message: `Controlled ${results.length - failed}/${results.length} units`,
            results
        };
    }

    ok(res, { message: 'Master control applied to all devices', devices: allResults });
}

module.exports = { controlAllOnDevice, controlUnit, controlMaster };
