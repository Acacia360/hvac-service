const { fail } = require('../utils/response');

function validateControlBody(req, res, next) {
    const validKeys = ['drive', 'mode', 'setTemp', 'setTempCool', 'setTempHeat', 'fanSpeed', 'airDirection'];
    const provided  = validKeys.filter(k => req.body[k] != null);
    if (provided.length === 0) {
        return fail(res, `Provide at least one of: ${validKeys.join(', ')}`, 400);
    }
    if (req.body.drive && !['ON', 'OFF'].includes(req.body.drive)) {
        return fail(res, 'drive must be "ON" or "OFF"', 400);
    }
    const validModes = ['COOL', 'HEAT', 'FAN', 'AUTO', 'DRY', 'AUTOCOOL'];
    if (req.body.mode && !validModes.includes(req.body.mode)) {
        return fail(res, `mode must be one of: ${validModes.join(', ')}`, 400);
    }
    next();
}

module.exports = validateControlBody;
