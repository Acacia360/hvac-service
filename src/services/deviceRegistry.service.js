/**
 * deviceRegistry.service.js
 * Owns the pool of connected AE200Client instances and device-level operations.
 */

const { AE200Client } = require('./ae200-client');
const HVAC = require('../models/HVAC');

const AE200_USER    = process.env.AE200_USER     || 'administrator';
const AE200_PASS    = process.env.AE200_PASS     || 'admin';
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL || 30);

// clients map: ip → AE200Client instance
const clients = {};

function isValidIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

/** Distinct controller IPs already known from the HVACs table */
async function getKnownControllerIps() {
    const rows = await HVAC.findAll({
        attributes: ['hvac_controller_ip'],
        group: ['hvac_controller_ip'],
        raw: true,
    });
    return rows.map(r => r.hvac_controller_ip).filter(Boolean);
}

async function getOrCreateClient(ip) {
    if (clients[ip]) return clients[ip];

    if (!isValidIP(ip)) throw new Error(`Invalid IP address: "${ip}"`);

    console.log(`[API] New device requested: ${ip} — connecting...`);
    const client = new AE200Client(ip, AE200_USER, AE200_PASS);
    clients[ip] = client;

    await client.connect();
    client.startPolling(POLL_INTERVAL);
    client.onStateUpdate = (states) =>
        console.log(`[${ip}] State refreshed — ${Object.keys(states).length} units`);

    console.log(`[${ip}] ✅ Connected and ready`);
    return client;
}

function getAllClients() {
    return clients;
}

async function controlAll(client, params) {
    const results = [];
    for (const g of client.getGroups()) {
        try {
            const state = await client.controlGroup(g.group, params);
            results.push({ group: g.group, name: g.name, success: true, unit: state });
        } catch (err) {
            results.push({ group: g.group, name: g.name, success: false, error: err.message });
        }
    }
    return results;
}

function disconnectAll() {
    Object.values(clients).forEach(c => c.disconnect());
}

module.exports = {
    isValidIP,
    getOrCreateClient,
    getAllClients,
    getKnownControllerIps,
    controlAll,
    disconnectAll,
};
