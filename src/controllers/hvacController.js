const { HVAC } = require("../models");

const generateHVACId = () => {
  const prefix = "HVC";
  const randomLetters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomLetters}${randomNum}`;
};

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


exports.getHVACById = async (req, res) => {
  const id = req.params.hvac_id;
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

exports.createHVAC = async (req, res) => {
  const data = req.body;

  try {
    const allowed = [
      "hvac_air_direction",
      "hvac_brand",
      "hvac_connectivity",
      "hvac_control_method",
      "hvac_energy_consumption_data",
      "hvac_fan_speed",
      "hvac_fan_status",
      "hvac_installation_date",
      "hvac_installation_location",
      "hvac_last_maintenance_date",
      "hvac_lossnay_fan_speed",
      "hvac_maintenance_logs",
      "hvac_manufacture_date",
      "hvac_model",
      "hvac_name",
      "hvac_notes",
      "hvac_notification_settings",
      "hvac_operation_mode",
      "hvac_power_source",
      "hvac_property_id",
      "hvac_room_ids",
      "hvac_schedule_status",
      "hvac_schedule_settings",
      "hvac_serial_number",
      "hvac_status",
      "hvac_temperature",
      "hvac_type",
      "hvac_ventillation_mode",
      "hvac_warranty_expiration",
    ];

    const payload = {};
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        payload[key] = data[key];
      }
    });

    const hvac_id = generateHVACId();

    payload.created_by = 'admin';
    payload.created_at = new Date();

    if (!hvac_id) {
      return res.status(500).json({
        error: "validation error",
      });
    }

    const newHVAC = await HVAC.create({
      ...payload,
      hvac_id,
    });

    res.status(201).json({
      message: "HVAC created successfully",
      data: newHVAC,
    });
  } catch (err) {
    console.error("Failed to create HVAC:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.updateHVAC = async (req, res) => {
  const { hvac_id } = req.params;

  if (!hvac_id) {
    return res.status(400).json({ error: "validation error" });
  }

  const data = req.body;

  try {
    const [updated] = await HVAC.update(data, {
      where: { hvac_id }
    });

    if (updated === 0) {
      return res.status(404).json({ message: "HVAC not found" });
    }

    const updatedHVAC = await HVAC.findOne({
      where: { hvac_id }
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

exports.deleteHVAC = async (req, res) => {
  const id = req.params.hvac_id;
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

