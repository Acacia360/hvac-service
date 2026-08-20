const express = require('express');
const authenticate = require('../middleware/authenticate');
const resolveDevice = require('../middleware/resolveDevice');
const resolveHvacRoom = require('../middleware/resolveHvacRoom');
const validateControlBody = require('../middleware/validateControlBody');
const { asyncRoute } = require('../utils/response');
const { getRoomsByController, syncRoomsFromDevice, controlRoom } = require('../controllers/hvac.controller');

const router = express.Router();

router.get('/hvac/:ip', asyncRoute(getRoomsByController));
router.get('/hvac/:ip/sync', resolveDevice, asyncRoute(syncRoomsFromDevice));
router.post('/hvac/:hvacId/control',resolveHvacRoom, validateControlBody, asyncRoute(controlRoom));

module.exports = router;
 