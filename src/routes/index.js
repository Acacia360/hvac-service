const express = require('express');
const { getHealth } = require('../controllers/health.controller');
const deviceRoutes = require('./device.routes');
const controlRoutes = require('./control.routes');
const hvacRoutes = require('./hvac.routes');

const router = express.Router();

router.get('/health', getHealth);
router.use(deviceRoutes);
router.use(controlRoutes);
router.use(hvacRoutes);

module.exports = router;
