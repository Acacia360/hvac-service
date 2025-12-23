const express = require('express');
const router = express.Router();
const hvacController = require('../controllers/hvacController');

router.post('/', hvacController.createHVAC);
router.get('/', hvacController.getAllHVACs);
router.get('/:hvac_id', hvacController.getHVACById);
router.put('/:hvac_id', hvacController.updateHVAC);
router.delete('/:hvac_id', hvacController.deleteHVAC);

module.exports = router;