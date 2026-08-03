const { fail } = require('../utils/response');
const { getOrCreateClient } = require('../services/deviceRegistry.service');

/** Middleware — resolve :ip param, connect if needed */
function resolveDevice(req, res, next) {
    const ip = req.params.ip;
    getOrCreateClient(ip)
        .then(client => { req.client = client; req.ip_ = ip; next(); })
        .catch(err  => fail(res, `Could not connect to ${ip}: ${err.message}`));
}

module.exports = resolveDevice;
