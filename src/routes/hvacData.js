const express = require('express');
const router = express.Router();
const { getMitsubishiElectricHVACRealtimeData } = require('../controllers/hvacDataController');

router.get('/:hvac_id/realtime', getMitsubishiElectricHVACRealtimeData);

module.exports = router;