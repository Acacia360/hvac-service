const { HVAC } = require("../models");

const generateHvacId = () => {
  const prefix = "HVAC";
  const randomLetters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomLetters}${randomNum}`;
};

// GET all hvacs
exports.getAllHVACs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const { count, rows } = await HVAC.findAndCountAll({
      order: [['hvac_id', 'ASC']],
      limit,
      offset
    });

    res.json({
      message: 'HVACs retrieved successfully',
      totalRecords: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      pageSize: limit,
      data: rows
    });
  } catch (err) {
    console.error('Failed to fetch HVACs:', err.message);
    res.status(500).json({ error: err.message });
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

  try {
    const allowed = [
      "hvac_name",
      "hvac_brand",
      "hvac_model",
      "hvac_type",
      "hvac_serial_number",
      "hvac_manufacture_date",
      "hvac_installation_date",
      "hvac_installation_location",
      "hvac_property_id",
      "hvac_room_ids",
      "hvac_connectivity",
      "hvac_control_method",
      "hvac_status",
      "hvac_operation_mode",
      "hvac_temperature",
      "hvac_fan_status",
      "hvac_fan_speed",
      "hvac_lossnay_fan_speed",
      "hvac_air_direction",
      "hvac_ventillation_mode",
      "hvac_power_source",
      "hvac_energy_consumption_data",
      "hvac_schedule_status",
      "hvac_schedule_settings",
      "hvac_notification_settings",
      "hvac_maintenance_logs",
      "hvac_last_maintenance_date",
      "hvac_warranty_expiration",
      "hvac_notes"
    ];

    const payload = {};
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        payload[key] = data[key];
      }
    });

    // Ensure hvac_room_ids is an array of integers
    if (payload.hvac_room_ids !== undefined) {
      if (Array.isArray(payload.hvac_room_ids)) {
        payload.hvac_room_ids = payload.hvac_room_ids.map(id => parseInt(id, 10));
      } else if (typeof payload.hvac_room_ids === 'string') {
        payload.hvac_room_ids = payload.hvac_room_ids.split(',').map(id => parseInt(id.trim(), 10));
      } else {
        payload.hvac_room_ids = [parseInt(payload.hvac_room_ids, 10)];
      }
    }

    const hvac_id = generateHvacId();

    if (!hvac_id) {
      return res.status(500).json({ error: "validation error" });
    }

    payload.created_by = "admin";
    payload.created_at = new Date();

    const newHVAC = await HVAC.create({
      ...payload,
      hvac_id
    });

    res.status(201).json({
      message: "HVAC created successfully",
      data: newHVAC
    });
  } catch (err) {
    console.error("Failed to insert HVAC:", err.message);
    res.status(500).json({ error: "Failed to create HVAC" });
  }
};

exports.updateHVAC = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "validation error" });
  }

  const data = req.body;

  try {
    const [updated] = await HVAC.update(data, {
      where: { hvac_id: id }
    });

    if (updated === 0) {
      return res.status(404).json({ message: "HVAC not found" });
    }

    const updatedHVAC = await HVAC.findOne({
      where: { hvac_id: id }
    });

    res.json({
      message: "HVAC updated successfully",
      data: updatedHVAC
    });
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

module.exports = {
  ...exports
};