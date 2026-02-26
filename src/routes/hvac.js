const express = require('express');
const router = express.Router();
const hvacController = require('../controllers/hvacController');
const authorize = require('../middlewares/authorize');

router.get('/', hvacController.getAllHVACs);
router.get('/:id', hvacController.getHVACById);
router.post('/',  authorize('Administrator','Portfolio Manager','Property Manager'), hvacController.createHVAC);
router.put('/:id',  authorize('Administrator','Portfolio Manager','Property Manager'),  hvacController.updateHVAC);
router.delete('/:id',  authorize('Administrator','Portfolio Manager','Property Manager'),  hvacController.deleteHVAC);
router.post("/:id/control",  authorize('Administrator','Portfolio Manager','Property Manager'),hvacController.controlHVAC);

module.exports = router;