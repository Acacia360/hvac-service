const express = require('express');
const router = express.Router();
const hvacController = require('../controllers/hvacController');

router.get('/', hvacController.getAllHVACs);
router.get('/:id', hvacController.getHVACById);
router.post('/', hvacController.createHVAC);
router.put('/:id', hvacController.updateHVAC);
router.delete('/:id', hvacController.deleteHVAC);
router.post("/:id/control", hvacController.controlHVAC);

module.exports = router;