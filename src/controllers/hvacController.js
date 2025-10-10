const { HVAC, HVACData } = require("../models");
const { Op } = require('sequelize');

// GET all hvacs
exports.getAllHVACs = async (req, res) => {
  try {
    const hvacs = await HVAC.findAll();
    res.json(hvacs);
  } catch (err) {
    console.error("Failed to fetch hvacs:", err.message);
    res.status(500).json({ error: "Failed to retrieve hvacs" });
  }
};

// GET hvac by ID
exports.getHVACById = async (req, res) => {
  const id = req.params.id;
  try {
    const hvac = await HVAC.findByPk(id);
    if (!hvac) {
      return res.status(404).json({ message: "HVAC not found" });
    }
    res.json(hvac);
  } catch (err) {
    console.error("Failed to fetch hvac:", err.message);
    res.status(500).json({ error: "Failed to retrieve hvac" });
  }
};

// POST create new hvac
exports.createHVAC = async (req, res) => {
  const data = req.body;
  const requiredFields = [
    "hvac_id", "hvac_name", "hvac_room_ids", "hvac_type", "hvac_brand", "hvac_model", "hvac_serial_number",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  try {
    const result = await HVAC.create(data);
    res.status(201).json(result);
  } catch (err) {
    console.error("Failed to insert hvac:", err.message);
    res.status(500).json({ error: "Failed to create hvac" });
  }
};

// PUT update hvac by ID
exports.updateHVAC = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const [updated] = await HVAC.update(data, {
      where: { hvac_id: id },
    });
    if (updated === 0) {
      return res.status(404).json({ message: "HVAC not found" });
    }
    res.json({ message: "HVAC updated" });
  } catch (err) {
    console.error("Failed to update hvac:", err.message);
    res.status(500).json({ error: "Failed to update hvac" });
  }
};

// DELETE hvac by ID
exports.deleteHVAC = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await HVAC.destroy({
      where: { hvac_id: id },
    });
    if (deleted === 0) {
      return res.status(404).json({ message: "HVAC not found" });
    }
    res.json({ message: "HVAC deleted" });
  } catch (err) {
    console.error("Failed to delete hvac:", err.message);
    res.status(500).json({ error: "Failed to delete hvac" });
  }
};

// POST control hvac status
exports.controlHVAC = async (req, res) => {

};

const fetchHVACRealtimeData = async (Model, idField, timeField, req, res, hvacName) => {
    const { startDate, endDate, limit } = req.query;
    const identifierValue = req.params[idField];

    try {
        const whereCondition = {
            [idField]: identifierValue,
        };

        if (startDate && endDate) {
            whereCondition[timeField] = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const options = {
            where: whereCondition,
            order: [[timeField, 'DESC']],
            limit: limit ? parseInt(limit, 10) : undefined,
        };

        const data = await Model.findAll(options);
        return res.json(data);
    } catch (err) {
        console.error(`Failed to fetch ${hvacName} data for ${idField} ${identifierValue}:`, err.message);
        return res.status(500).json({ error: `Failed to retrieve ${hvacName} real-time data` });
    }
};

exports.getMitsubishiElectricHVACRealtimeData = async (req, res) => {
    return fetchHVACRealtimeData(
        HVACData, 
        'hvac_id', 
        'timestamp', 
        req, 
        res, 
        'Mitsubishi Electric HVAC',
    );
};

module.exports = {
  ...exports
};