const express = require('express');
const router = express.Router();
const hvacController = require('../controllers/hvacController');
const authenticate = require('../middlewares/authenticate');

router.get('/', hvacController.getAllHVACs);
router.get('/:id', hvacController.getHVACById);
router.post('/', hvacController.createHVAC);
router.put('/:id', hvacController.updateHVAC);
router.delete('/:id', hvacController.deleteHVAC);
router.post("/:hvac_id/control", hvacController.controlHVAC);

// Realtime data
router.get('/:hvac_id/mitsubishi-electric-hvac-data', hvacController.getMitsubishiElectricHVACRealtimeData);

module.exports = router;