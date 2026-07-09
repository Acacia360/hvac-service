const express = require('express');
const resolveDevice = require('../middleware/resolveDevice');
const { asyncRoute } = require('../utils/response');
const { listDevices, getGroups, getUnits, getUnit } = require('../controllers/device.controller');

const router = express.Router();

router.get('/devices', asyncRoute(listDevices));
router.get('/devices/:ip/groups', resolveDevice, getGroups);
router.get('/devices/:ip/units', resolveDevice, getUnits);
router.get('/devices/:ip/units/:group', resolveDevice, asyncRoute(getUnit));

module.exports = router;
