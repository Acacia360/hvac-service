const express = require('express');
const router = express.Router();
const hvacController = require('../controllers/hvacController');
const authorize = require('../middlewares/authorize');

router.get('/', hvacController.getAllHVACs);
router.get('/:hvac_id', hvacController.getHVACById);
router.post('/',  hvacController.createHVAC);
router.put('/:hvac_id',   hvacController.updateHVAC);
router.delete('/:hvac_id',   hvacController.deleteHVAC);
router.post("/:hvac_id/control", hvacController.controlHVAC);

module.exports = router;