const { APILogs } = require("../models");

async function getAllLogs(req, res) {
  try {
    const logs = await APILogs.findAll({
      order: [["timestamp", "DESC"]],
    });
    res.json(logs);
  } catch (err) {
    console.error("Failed to fetch logs:", err.message);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
}

module.exports = { getAllLogs };
