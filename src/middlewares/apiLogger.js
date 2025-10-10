const { APILogs } = require("../models");

function standardAPILogger() {
    return (req, res, next) => {
        let responseBody;
        const originalJson = res.json;
        const originalSend = res.send;

        res.json = function (body) {
            responseBody = body;
            return originalJson.call(this, body);
        };

        res.send = function (body) {
            responseBody = body;
            return originalSend.call(this, body);
        };

        res.on("finish", async () => {
            if (res.statusCode < 400) {
                try {
                    await APILogs.create({
                        method: req.method,
                        endpoint: req.originalUrl,
                        status_code: res.statusCode,
                        triggered_by_email: req.user?.user_email || "anonymous",
                        triggered_by_role: req.user?.user_role || "guest",
                        message: `Response successful: ${req.method} ${req.originalUrl}`,
                        status_type: 'SUCCESS'
                    });
                } catch (err) {
                    console.error("Failed to save success log:", err.message);
                }
            }
        });
        next();
    };
}

async function errorAPILogger(err, req, res, next) {
    console.log("Error occurred::: error", err);
    if (!res.headersSent) {
        if (!res.statusCode || res.statusCode < 400) {
            res.statusCode = 500;
        }
        try {
            await APILogs.create({
                method: req.method,
                endpoint: req.originalUrl,
                status_code: res.statusCode,
                triggered_by_email: req.user?.user_email || "anonymous",
                triggered_by_role: req.user?.user_role || "guest",
                message: err.message || "Unknown error",
                status_type: 'ERROR'
            });
        } catch (e) {
            console.error("Failed to save error log:", e);
        }
        res.status(res.statusCode).json({ message: err.message });
    } else {
        console.warn("Response already sent, skipping duplicate error log.");
        next(err);
    }
}

module.exports = {
    standardAPILogger,
    errorAPILogger
};