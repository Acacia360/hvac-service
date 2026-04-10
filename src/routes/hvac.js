const express = require('express');
const router = express.Router();
const hvacController = require('../controllers/hvacController');
const authorize = require('../middlewares/authorize');

router.get('/', hvacController.getAllHVACs);
router.get('/:hvac_id', hvacController.getHVACById);
router.post('/',  authorize('Administrator','Portfolio Manager','Property Manager'), hvacController.createHVAC);
router.put('/:hvac_id',  authorize('Administrator','Portfolio Manager','Property Manager'),  hvacController.updateHVAC);
router.delete('/:hvac_id',  authorize('Administrator','Portfolio Manager','Property Manager'),  hvacController.deleteHVAC);
router.post("/:hvac_id/control",  authorize('Administrator','Portfolio Manager','Property Manager'),hvacController.controlHVAC);

module.exports = router;