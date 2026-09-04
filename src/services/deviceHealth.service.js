/**
 * deviceHealth.service.js
 * Tracks per-controller offline state so a "recovered" notification only fires
 * once, on the offline -> online transition — mirrors electrical-meter-service's
 * meterOfflineState pattern.
 */

const HVAC = require('../models/HVAC');
const { createDeviceErrorNotification, createDeviceRecoveredNotification } = require('./notificationClient');

const offlineState = new Map(); // controllerIp -> boolean

async function getPropertyIdForController(ip) {
    const row = await HVAC.findOne({
        where: { hvac_controller_ip: ip },
        attributes: ['hvac_property_id'],
        raw: true,
    });
    return row?.hvac_property_id || undefined;
}

async function reportControllerFailure(ip, errorMessage, errorType) {
    offlineState.set(ip, true);
    const propertyId = await getPropertyIdForController(ip);
    await createDeviceErrorNotification({ controllerIp: ip, propertyId, errorMessage, errorType });
}

async function reportControllerRecovered(ip) {
    if (!offlineState.get(ip)) return;
    offlineState.set(ip, false);
    const propertyId = await getPropertyIdForController(ip);
    await createDeviceRecoveredNotification({ controllerIp: ip, propertyId });
}

module.exports = { reportControllerFailure, reportControllerRecovered };
