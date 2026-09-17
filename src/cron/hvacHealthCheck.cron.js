/**
 * hvacHealthCheck.cron.js
 * Every 30 minutes, live-reads and persists every known HVAC controller, and
 * notifies (via notifications-service) when a controller is unreachable or a
 * DB write fails — mirrors electrical-meter-service's data-logger cron.
 */

const cron = require('node-cron');
const { getKnownControllerIps, getOrCreateClient } = require('../services/deviceRegistry.service');
const { syncStatesToDb } = require('../services/hvacSync.service');
const { reportControllerFailure, reportControllerRecovered } = require('../services/deviceHealth.service');

async function processController(ip) {
    let client;
    try {
        client = await getOrCreateClient(ip);
        await client.refreshAll();
    } catch (err) {
        console.error(`[HealthCheck] [${ip}] Device unreachable:`, err.message);
        await reportControllerFailure(ip, err.message, 'unreachable');
        return;
    }

    try {
        await syncStatesToDb(ip, client.getCachedStates());
        await reportControllerRecovered(ip);
    } catch (err) {
        console.error(`[HealthCheck] [${ip}] DB write failed:`, err.message);
        await reportControllerFailure(ip, err.message, 'db_write_error');
    }
}

async function runHealthCheck() {
    const startTime = new Date();
    console.log(`[HealthCheck] [${startTime.toISOString()}] Starting HVAC health check...`);

    const ips = await getKnownControllerIps();
    console.log(`[HealthCheck] Checking ${ips.length} known controller(s)...`);

    for (const ip of ips) {
        await processController(ip);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[HealthCheck] Finished in ${elapsed}s.`);
}

const CRON_SCHEDULE = '*/30 * * * *';

function startHvacHealthCheckCron() {
    cron.schedule(CRON_SCHEDULE, runHealthCheck);
    console.log(`[HealthCheck] HVAC health-check cron scheduled (${CRON_SCHEDULE}).`);
}

module.exports = { startHvacHealthCheckCron };
