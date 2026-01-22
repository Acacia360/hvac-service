const { HVAC } = require("../models");
const bacnet = require("../services/bacnetService");
const map = require("../services/mitsubishiAE200Map");

const generateHvacId = () => {
  const prefix = "HVAC";
  const randomLetters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomLetters}${randomNum}`;
};

const syncHvacData = async (hvac) => {
  const ip = hvac.hvac_bacnet_ip;
  const roomId = hvac.hvac_room_id;

  try {
    const [pwr, md, temp, fan, dir] = await Promise.all([
      bacnet.readProperty({ ip, ...map.power(roomId) }),
      bacnet.readProperty({ ip, ...map.mode(roomId) }),
      bacnet.readProperty({ ip, ...map.temperature(roomId) }),
      bacnet.readProperty({ ip, ...map.fanSpeed(roomId) }),
      bacnet.readProperty({ ip, ...map.airDirection(roomId) }),
    ]);

    const modeRev = { 1: "Heat", 2: "Cool", 3: "Dry", 4: "Fan" };
    const fanRev = { 1: "Auto", 2: "Low", 3: "Medium", 4: "High" };
    const dirRev = { 1: "Auto", 2: "Swing", 3: "Left", 4: "Center", 5: "Right" };

    const updatePayload = {
      hvac_status: pwr === 1,
      hvac_operation_mode: modeRev[md] || hvac.hvac_operation_mode,
      hvac_temperature: parseFloat(temp.toFixed(1)),
      hvac_fan_speed: fanRev[fan] || hvac.hvac_fan_speed,
      hvac_air_direction: dirRev[dir] || hvac.hvac_air_direction,
    };

    await hvac.update(updatePayload);
    return updatePayload;
  } catch (err) {
    console.warn(`Sync failed for Room ${roomId}: Simulator might be offline.`);
    return null;
  }
};

// GET all hvacs
exports.getAllHVACs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const { count, rows } = await HVAC.findAndCountAll({
      order: [["hvac_id", "ASC"]],
      limit,
      offset,
    });

    await Promise.all(rows.map(hvac => syncHvacData(hvac)));

    res.json({
      message: "HVACs retrieved and synced successfully",
      totalRecords: count,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET hvac by ID - Syncs specific unit
exports.getHVACById = async (req, res) => {
  const id = req.params.id;
  try {
    const hvac = await HVAC.findByPk(id);
    if (!hvac) return res.status(404).json({ message: "HVAC not found" });

    const liveData = await syncHvacData(hvac);

    res.json({
      ...hvac.toJSON(),
      live_sync: liveData ? "success" : "cached",
      lastSync: new Date(),
    });
  } catch (err) {
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
      "hvac_notes",
    ];

    const payload = {};
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        payload[key] = data[key];
      }
    });

    if (payload.hvac_room_ids !== undefined) {
      if (Array.isArray(payload.hvac_room_ids)) {
        payload.hvac_room_ids = payload.hvac_room_ids.map((id) =>
          parseInt(id, 10),
        );
      } else if (typeof payload.hvac_room_ids === "string") {
        payload.hvac_room_ids = payload.hvac_room_ids
          .split(",")
          .map((id) => parseInt(id.trim(), 10));
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
      hvac_id,
    });

    res.status(201).json({
      message: "HVAC created successfully",
      data: newHVAC,
    });
  } catch (err) {
    console.error("Failed to insert HVAC:", err.message);
    res.status(500).json({ error: "Failed to create HVAC" });
  }
};

// UPDATE hvac
exports.updateHVAC = async (req, res) => {
  const { id } = req.params;

  try {
    const [updated] = await HVAC.update(req.body, {
      where: { id },
    });

    if (updated === 0)
      return res.status(404).json({ message: "Record not found" });

    const updatedHVAC = await HVAC.findByPk(id);
    res.json({ message: "HVAC updated successfully", data: updatedHVAC });
  } catch (err) {
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

// GET specific room control for an HVAC
exports.getHVACRoomControl = async (req, res) => {
  const { hvac_id, room_id } = req.params;
  try {
    const hvac = await HVAC.findOne({
      where: { hvac_id, hvac_room_id: room_id },
    });
    if (!hvac) return res.status(404).json({ message: "HVAC not found" });

    await syncHvacData(hvac);

    res.json({
      ...hvac.toJSON(),
      lastSync: new Date(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve hvac" });
  }
};

// POST control hvac status for a SPECIFIC room record
exports.controlHVAC = async (req, res) => {
  const { id } = req.params;
  const { power, mode, temperature, fanSpeed, airDirection } = req.body || {};

  try {
    const hvac = await HVAC.findByPk(id);
    if (!hvac) return res.status(404).json({ error: "HVAC record not found" });

    const ip = hvac.hvac_bacnet_ip;
    const roomId = hvac.hvac_room_id; 

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const commands = [];

    if (power !== undefined) {
      commands.push(() =>
        bacnet.writeProperty({ ip, ...map.power(roomId), value: power ? 1 : 0 }),
      );
    }
    if (mode) {
      const modeMap = { Heat: 1, Cool: 2, Dry: 3, Fan: 4 };
      commands.push(() =>
        bacnet.writeProperty({
          ip,
          ...map.mode(roomId),
          value: modeMap[mode] || 1,
        }),
      );
    }
    if (temperature !== undefined) {
      commands.push(() =>
        bacnet.writeProperty({
          ip,
          ...map.temperature(roomId),
          value: temperature,
        }),
      );
    }
    if (fanSpeed) {
      const fanSpeedMap = { Auto: 1, Low: 2, Medium: 3, High: 4 };
      commands.push(() =>
        bacnet.writeProperty({
          ip,
          ...map.fanSpeed(roomId),
          value: fanSpeedMap[fanSpeed] || 1,
        }),
      );
    }
    if (airDirection) {
      const airDirectionMap = { Auto: 1, Swing: 2, Left: 3, Center: 4, Right: 5 };
      commands.push(() =>
        bacnet.writeProperty({
          ip,
          ...map.airDirection(roomId),
          value: airDirectionMap[airDirection] || 1,
        }),
      );
    }

    for (const command of commands) {
      try {
        await command();
        await hvac.update({
          hvac_status: power,
          hvac_operation_mode: mode,
          hvac_temperature: temperature,
          hvac_fan_speed: fanSpeed,
          hvac_air_direction: airDirection,
        });
      } catch (cmdErr) {
        console.error(`Command failed for Room ${roomId}:`, cmdErr.message);
      }
      await delay(500);
    }

    res.json({ message: "Commands synced to Room " + roomId, data: hvac });
  } catch (err) {
    res.status(500).json({ error: "Control failed", details: err.message });
  }
};

module.exports = {
  ...exports,
};
