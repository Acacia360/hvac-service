const cron = require("node-cron");
const { HVAC } = require("../models");
const bacnet = require("../services/bacnetService");
const map = require("../services/mitsubishiAE200Map");

const MODE_MAP = {
  1: "Cool",
  2: "Heat",
  3: "Dry",
  4: "Fan",
};

const FAN_MAP = {
  1: "Auto",
  2: "Low",
  3: "Medium",
  4: "High",
};

const DIRECTION_MAP = {
  1: "Auto",
  2: "Swing",
  3: "Left",
  4: "Center",
  5: "Right",
};

async function pollHVAC(hvac) {
  const ip = hvac.hvac_bacnet_ip;
  const unit = hvac.hvac_bacnet_unit_number;

  try {
    const power = await bacnet.readProperty({
      ip,
      ...map.power(unit),
    });

    const mode = await bacnet.readProperty({
      ip,
      ...map.mode(unit),
    });

    const temperature = await bacnet.readProperty({
      ip,
      ...map.temperature(unit),
    });

    const fanSpeed = await bacnet.readProperty({
      ip,
      ...map.fanSpeed(unit),
    });

    const airDirection = await bacnet.readProperty({
      ip,
      ...map.airDirection(unit),
    });

    await HVAC.update(
      {
        hvac_status: power === 1,
        hvac_operation_mode: MODE_MAP[mode],
        hvac_temperature: temperature,
        hvac_fan_speed: FAN_MAP[fanSpeed],
        hvac_air_direction: DIRECTION_MAP[airDirection],
      },
      { where: { hvac_id: hvac.hvac_id } },
    );

    console.log(`HVAC ${hvac.hvac_id} synced`);
  } catch (err) {
    console.error(`HVAC ${hvac.hvac_id} offline`);

    await HVAC.update(
      { hvac_status: false },
      { where: { hvac_id: hvac.hvac_id } },
    );
  }
}

async function runHVACLogger() {
  const hvacs = await HVAC.findAll({
    where: { hvac_control_method: "Central Controller" },
    attributes: ["hvac_id", "hvac_bacnet_ip", "hvac_bacnet_unit_number"],
    group: ["hvac_id", "hvac_bacnet_ip", "hvac_bacnet_unit_number"],
  });

  for (const hvac of hvacs) {
    await pollHVAC(hvac);
  }
}

const startHVACDataLoggerCron = () => {
  cron.schedule("*/1 * * * *", runHVACLogger);
};

module.exports = {
  startHVACDataLoggerCron,
};
