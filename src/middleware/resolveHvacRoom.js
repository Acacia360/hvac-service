const { fail } = require('../utils/response');
const HVAC = require('../models/HVAC');

/** Middleware — resolve :hvacId param to an HVAC row */
function resolveHvacRoom(req, res, next) {
    HVAC.findOne({ where: { hvac_id: req.params.hvacId } })
        .then(room => {
            if (!room) return fail(res, `No HVAC room found with id ${req.params.hvacId}`, 404);
            req.room = room;
            next();
        })
        .catch(err => fail(res, err.message));
}

module.exports = resolveHvacRoom;
