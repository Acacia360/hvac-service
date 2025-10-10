const express = require("express");
const router = express.Router();
const { getAllLogs } = require("../controllers/logController");

router.get("/", getAllLogs);

module.exports = router;
