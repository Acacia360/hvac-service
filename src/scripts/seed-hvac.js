/**
 * seed-hvac.js
 * Bulk-creates one HVAC row per group/room across all configured AE-200E controllers.
 * Connects live to each controller, reads current group list + unit state, and inserts
 * any room not already present (matched by controller IP + group id).
 */

const sequelize = require('../config/database');
const HVAC = require('../models/HVAC');
const { AE200Client } = require('../services/ae200-client');
const { getKnownControllerIps } = require('../services/deviceRegistry.service');
const { stateToHvacFields } = require('../services/hvacSync.service');

const AE200_USER  = process.env.AE200_USER || 'administrator';
const AE200_PASS  = process.env.AE200_PASS || 'admin';
const PROPERTY_ID = '1';
const LOCATION    = 'Fitzrovia';

async function fetchControllerRecords(ip) {
    const client = new AE200Client(ip, AE200_USER, AE200_PASS);
    await client.connect();

    const groups     = client.getGroups();
    const systemInfo = client.getSystemInfo();
    const records    = [];

    for (const g of groups) {
        const state  = await client.readGroup(g.group);
        const roomId = /^\d+$/.test(g.name) ? parseInt(g.name, 10) : null;

        records.push({
            hvac_name:                  `${LOCATION} HVAC AE-200E - ${g.name}`,
            hvac_brand:                 'Mitsubishi',
            hvac_model:                 'AE-200E',
            hvac_type:                  'HVAC Controller',
            hvac_serial_number:         systemInfo?.serial || null,
            hvac_installation_location: LOCATION,
            hvac_property_id:           PROPERTY_ID,
            hvac_room_id:               roomId,
            hvac_group_id:              Number(g.group),
            hvac_connectivity:          'websocket',
            hvac_control_method:        'websocket',
            hvac_power_source:          'main',
            hvac_controller_ip:         ip,
            ...stateToHvacFields(state),
        });
    }

    client.disconnect();
    return records;
}

async function main() {
    await sequelize.authenticate();

    const existing = await HVAC.findAll({ attributes: ['hvac_id', 'hvac_controller_ip', 'hvac_group_id'] });
    const seen   = new Set(existing.map(r => `${r.hvac_controller_ip}:${r.hvac_group_id}`));
    const maxNum = existing.reduce((max, r) => {
        const m = /^HVAC(\d+)$/.exec(r.hvac_id);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);

    const controllers = await getKnownControllerIps();
    if (controllers.length === 0) {
        console.log('[seed] No controller IPs found in the HVACs table — nothing to seed.');
        process.exit(0);
    }

    let allRecords = [];
    for (const ip of controllers) {
        console.log(`[seed] Reading groups from ${ip}...`);
        const records = await fetchControllerRecords(ip);
        console.log(`[seed] ${ip} → ${records.length} groups`);
        allRecords = allRecords.concat(records);
    }

    const toInsert = allRecords.filter(r => !seen.has(`${r.hvac_controller_ip}:${r.hvac_group_id}`));
    const toUpdate = allRecords.filter(r => seen.has(`${r.hvac_controller_ip}:${r.hvac_group_id}`));
    toInsert.forEach((r, i) => {
        r.hvac_id = `HVAC${String(maxNum + i + 1).padStart(4, '0')}`;
    });

    if (toInsert.length === 0) {
        console.log('[seed] Nothing to insert — all rooms already exist.');
    } else {
        await HVAC.bulkCreate(toInsert);
        console.log(`[seed] ✅ Inserted ${toInsert.length} rooms.`);
    }

    for (const r of toUpdate) {
        await HVAC.update({
            hvac_status:            r.hvac_status,
            hvac_operation_mode:    r.hvac_operation_mode,
            hvac_temperature:       r.hvac_temperature,
            hvac_fan_speed:         r.hvac_fan_speed,
            hvac_air_direction:     r.hvac_air_direction,
            hvac_inlet_temperature: r.hvac_inlet_temperature,
            update_at:              r.update_at,
        }, { where: { hvac_controller_ip: r.hvac_controller_ip, hvac_group_id: r.hvac_group_id } });
    }
    if (toUpdate.length > 0) {
        console.log(`[seed] ✅ Refreshed live state + update_at for ${toUpdate.length} existing rooms.`);
    }

    process.exit(0);
}

main().catch(err => {
    console.error('[seed] ❌ Failed:', err);
    process.exit(1);
});
