const express = require('express');
const authenticate = require('../middleware/authenticate');
const resolveDevice = require('../middleware/resolveDevice');
const validateControlBody = require('../middleware/validateControlBody');
const { asyncRoute } = require('../utils/response');
const { controlAllOnDevice, controlUnit, controlMaster } = require('../controllers/control.controller');

const router = express.Router();

router.post('/devices/:ip/units/all/control', authenticate, resolveDevice, validateControlBody, asyncRoute(controlAllOnDevice));
router.post('/devices/:ip/units/:group/control', authenticate, resolveDevice, validateControlBody, asyncRoute(controlUnit));
router.post('/units/all/control', authenticate, validateControlBody, asyncRoute(controlMaster));

module.exports = router;
