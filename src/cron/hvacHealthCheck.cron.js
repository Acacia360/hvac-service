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

const MAX_LISTED_GROUPS = 10;

/** "3/47 group(s) could not be read: Room 101 [5] (Timeout: Mnet), ..." */
function describeFailedGroups(failed, total) {
    const listed = failed
        .slice(0, MAX_LISTED_GROUPS)
        .map(f => `${f.name} [${f.group}] (${f.error})`)
        .join(', ');
    const more = failed.length > MAX_LISTED_GROUPS ? `, +${failed.length - MAX_LISTED_GROUPS} more` : '';
    return `${failed.length}/${total} group(s) could not be read: ${listed}${more}`;
}

async function processController(ip) {
    // 1. Client must exist — first-ever connect may fail here.
    let client;
    try {
        client = await getOrCreateClient(ip);
    } catch (err) {
        console.error(`[HealthCheck] [${ip}] Device unreachable:`, err.message);
        await reportControllerFailure(ip, err.message, 'unreachable');
        return;
    }

    // 2. Client must be connected — same flag GET /api/devices shows as "connected".
    //    The client keeps reconnecting in the background on its own every 5s.
    if (!client.isConnected()) {
        const msg = 'Controller session is not connected (connected=false)';
        console.error(`[HealthCheck] [${ip}] ${msg}`);
        await reportControllerFailure(ip, msg, 'unreachable');
        return;
    }

    // 3. Live-read every group.
    let result;
    try {
        result = await client.refreshAll();
    } catch (err) {
        console.error(`[HealthCheck] [${ip}] Live read failed:`, err.message);
        await reportControllerFailure(ip, err.message, 'unreachable');
        return;
    }
    if (result.skipped) {
        console.warn(`[HealthCheck] [${ip}] Poll already in progress — skipping this cycle.`);
        return;
    }

    const total = client.getGroups().length;
    if (total === 0) {
        const msg = 'Controller is connected but reported no groups';
        console.error(`[HealthCheck] [${ip}] ${msg}`);
        await reportControllerFailure(ip, msg, 'group_read_error');
        return;
    }

    // 4. Persist only the groups read fresh this cycle (never stale cached values).
    try {
        await syncStatesToDb(ip, result.states);
    } catch (err) {
        console.error(`[HealthCheck] [${ip}] DB write failed:`, err.message);
        await reportControllerFailure(ip, err.message, 'db_write_error');
        return;
    }

    // 5. Connected, but some rooms/groups could not be read.
    if (result.failed.length > 0) {
        const msg = describeFailedGroups(result.failed, total);
        console.error(`[HealthCheck] [${ip}] ${msg}`);
        await reportControllerFailure(ip, msg, 'group_read_error');
        return;
    }

    await reportControllerRecovered(ip);
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
