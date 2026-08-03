<<<<<<< HEAD
const express = require("express");
const cors = require("cors");

const hvacRoutes = require("./routes/hvac");
const logRoutes = require('./routes/logRoutes');
const hvacDataRoutes = require("./routes/hvacData");

const { startHVACDataLoggerCron } = require("./cron/HVACDataLogger.cron");

const { standardAPILogger, errorAPILogger } = require("./middlewares/apiLogger");

require("dotenv").config();

const db = require("./models");

const app = express();

=======
/**
 * app.js
 * REST API for Mitsubishi AE-200E — dynamic IP routing
 *
 *   GET  /api/devices                                → list all known devices
 *   GET  /api/devices/:ip/groups                     → groups on that device
 *   GET  /api/devices/:ip/units                      → cached unit states
 *   GET  /api/devices/:ip/units/:group                → live single unit
 *   POST /api/devices/:ip/units/:group/control        → control one unit
 *   POST /api/devices/:ip/units/all/control           → control all on device
 *   POST /api/units/all/control                       → master — all devices
 *   GET  /api/hvac/:ip                                → HVAC room records for one controller (DB)
 *   GET  /api/hvac/:ip/sync                           → pull live states + persist into HVAC rows
 *   POST /api/hvac/:hvacId/control                    → control one room by HVAC id, persist result
 *   GET  /api/health                                  → health check
 *
 * Example:
 *   GET  /api/devices/10.0.1.50/units
 *   GET  /api/devices/10.0.1.51/units/1
 *   POST /api/devices/10.0.1.50/units/1/control
 */

const express = require('express');
const cors    = require('cors');
const routes  = require('./routes');
const logRoutes = require('./routes/logRoutes');
const sequelize = require('./config/database');
require('./models/HVAC');
const { getOrCreateClient, getKnownControllerIps, disconnectAll } = require('./services/deviceRegistry.service');
const { standardAPILogger, errorAPILogger } = require('./middleware/apiLogger');

const API_PORT = process.env.PORT || 3099;

const app = express();
>>>>>>> main
app.use(cors());
app.use(express.json());
app.use(standardAPILogger());

<<<<<<< HEAD
app.use("/api/hvac", hvacRoutes);
app.use("/api/hvacData", hvacDataRoutes);
app.use('/api/hvacLogs', logRoutes);

app.get("/health", (req, res) => res.status(200).send("OK"));

app.use(errorAPILogger);

module.exports = app;

const PORT = process.env.PORT || 3029;

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables synced successfully!");
    app.listen(PORT, () => {
      console.log(`HVAC service listening on port ${PORT}`);
      startHVACDataLoggerCron();
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
=======
app.use('/api', routes);
app.use('/api/hvacLogs', logRoutes);
app.get("/health", (req, res) => res.status(200).send("OK"));
/** 404 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        routes: [
            'GET  /api/devices',
            'GET  /api/devices/:ip/groups',
            'GET  /api/devices/:ip/units',
            'GET  /api/devices/:ip/units/:group',
            'POST /api/devices/:ip/units/:group/control',
            'POST /api/devices/:ip/units/all/control',
            'POST /api/units/all/control  ← master, all devices',
            'GET  /api/hvac/:ip  ← HVAC room records for one controller',
            'GET  /api/hvac/:ip/sync  ← pull live states + persist into HVAC rows',
            'POST /api/hvac/:hvacId/control  ← control one room by HVAC id, persist result',
        ]
    });
});
app.use(errorAPILogger);

async function start() {
    console.log('[DB] Syncing database schema...');
    await sequelize.sync({alter:true});
    console.log('[DB] ✅ Schema synced');

    const startupIps = await getKnownControllerIps();
    console.log(`[API] Connecting to ${startupIps.length} known device(s) from database...\n`);
    await Promise.allSettled(
        startupIps.map(ip => getOrCreateClient(ip).catch(err =>
            console.error(`[${ip}] ❌ Failed on startup: ${err.message}`)
        ))
    );

    app.listen(API_PORT, () => {
        console.log(`\n✅ AE-200E REST API running on http://localhost:${API_PORT}`);
        console.log(`\n📋 Example endpoints:`);
        console.log(`   GET  http://localhost:${API_PORT}/api/devices`);
        console.log(`   GET  http://localhost:${API_PORT}/api/devices/10.0.1.50/units`);
        console.log(`   GET  http://localhost:${API_PORT}/api/devices/10.0.1.51/units`);
        console.log(`   GET  http://localhost:${API_PORT}/api/devices/10.0.1.50/units/1`);
        console.log(`   POST http://localhost:${API_PORT}/api/devices/10.0.1.50/units/1/control`);
        console.log(`   POST http://localhost:${API_PORT}/api/devices/10.0.1.50/units/all/control`);
        console.log(`   POST http://localhost:${API_PORT}/api/units/all/control  ← MASTER\n`);
    });
}

process.on('SIGINT',  () => { disconnectAll(); process.exit(0); });
process.on('SIGTERM', () => { disconnectAll(); process.exit(0); });

start();
>>>>>>> main
