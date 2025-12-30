const express = require('express');
const router = express.Router();
const hvacController = require('../controllers/hvacControllerData');

router.get('/:hvac_id/mitsubishi-electric-hvac-data', hvacController.getMitsubishiElectricHVACRealtimeData);

module.exports = router;