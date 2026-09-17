const axios = require('axios');

const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005';

/** Create a device error notification in notifications-service. errorType e.g. "unreachable" | "db_write_error". */
async function createDeviceErrorNotification({ controllerIp, propertyId, errorMessage, errorType = 'unreachable' }) {
    try {
        const payload = {
            notifications_scope: 'property',
            ...(propertyId ? { notifications_property_id: propertyId } : {}),
            notifications_source_service: 'hvac-control-service',
            notifications_dedup_key: `hvac-device-error:${controllerIp}:${errorType}`,
            notifications_status: 'critical',
            notifications_category: 'device_alert',
            notifications_text: `HVAC controller "${controllerIp}" is not responding and needs attention.`,
            notifications_value: `${errorType} Error: ${errorMessage} (IP: ${controllerIp})`,
            notifications_metric: 'controller_ip',
            notifications_email_requested: true,
        };

        const res = await axios.post(`${NOTIFICATIONS_SERVICE_URL}/api/notifications`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
        });

        console.log(`Notification created for controller ${controllerIp}:`, res.data.notifications_id);
        return res.data;
    } catch (error) {
        console.error(`Failed to create notification for controller ${controllerIp}:`, error.message);
        return null;
    }
}

/** Create a device recovered notification in notifications-service. */
async function createDeviceRecoveredNotification({ controllerIp, propertyId }) {
    try {
        const payload = {
            notifications_scope: 'property',
            ...(propertyId ? { notifications_property_id: propertyId } : {}),
            notifications_source_service: 'hvac-control-service',
            notifications_dedup_key: `hvac-device-recovered:${controllerIp}`,
            notifications_status: 'info',
            notifications_category: 'device_alert',
            notifications_text: `HVAC controller "${controllerIp}" has recovered and is reporting data again.`,
            notifications_value: controllerIp,
            notifications_metric: 'controller_ip',
            notifications_email_requested: false,
        };

        const res = await axios.post(`${NOTIFICATIONS_SERVICE_URL}/api/notifications`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
        });

        console.log(`Recovery notification created for controller ${controllerIp}:`, res.data.notifications_id);
        return res.data;
    } catch (error) {
        console.error(`Failed to create recovery notification for controller ${controllerIp}:`, error.message);
        return null;
    }
}

module.exports = { createDeviceErrorNotification, createDeviceRecoveredNotification };
