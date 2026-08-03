const sequelize = require('../config/database');
require('../models/HVAC');

sequelize.sync()
    .then(() => {
        console.log('✅ Tables synced');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    });
